# Cross-Repo Discord Bug Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the Discord bug pipeline to fix bugs across 4 separate service repos (storefront, vendorpanel, backend, customer-backend), creating PRs in each affected repo.

**Architecture:** The GH Actions workflow in workspace-v2 checks out all 4 service repos side-by-side under `repos/`, installs the superpowers Claude Code plugin, downloads bug report screenshots, runs Claude Code once with access to all codebases, then creates PRs in each repo that has changes.

**Tech Stack:** GitHub Actions, Claude Code CLI + superpowers plugin, discord.js, Express, Vitest

**Design doc:** `docs/plans/2026-02-21-cross-repo-bug-pipeline-design.md`

---

### Task 1: Update webhook handler to support PR URLs

The webhook currently expects `commit_sha` for success. The new workflow sends a list of PR URLs instead (one per affected repo). Update the handler to support both formats for backward compatibility.

**Files:**
- Modify: `discord-bot/src/webhook.ts:15-19` (WebhookBody interface)
- Modify: `discord-bot/src/webhook.ts:89-92` (success message formatting)
- Test: `discord-bot/src/__tests__/webhook.test.ts`

**Step 1: Write failing tests for new webhook payload**

Add two new test cases to `discord-bot/src/__tests__/webhook.test.ts` after the existing "sends success message" test (line 165):

```typescript
it("sends success message with PR URLs when provided", async () => {
  mockIssueThreadMap.set(42, "thread-abc");

  const mockSend = vi.fn().mockResolvedValue(undefined);
  const mockThread = { send: mockSend };
  const mockThreadsCache = new Map([["thread-abc", mockThread]]);
  const mockChannel = { threads: { cache: mockThreadsCache } };
  const mockFetch = vi.fn().mockResolvedValue(mockChannel);

  mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

  const app = createApp();
  const res = await request(app)
    .post("/webhook")
    .set("x-webhook-secret", "test-secret")
    .send({
      issue_number: 42,
      status: "success",
      pr_urls: "- storefront: https://github.com/tanvirc/sidedecked-storefront/pull/5\n- backend: https://github.com/tanvirc/sidedecked-backend/pull/3",
    });

  expect(res.status).toBe(200);
  expect(mockSend).toHaveBeenCalledOnce();
  expect(mockSend).toHaveBeenCalledWith(
    expect.stringContaining("sidedecked-storefront/pull/5")
  );
  expect(mockSend).toHaveBeenCalledWith(
    expect.stringContaining("sidedecked-backend/pull/3")
  );
});

it("still supports legacy commit_sha success format", async () => {
  mockIssueThreadMap.set(42, "thread-abc");

  const mockSend = vi.fn().mockResolvedValue(undefined);
  const mockThread = { send: mockSend };
  const mockThreadsCache = new Map([["thread-abc", mockThread]]);
  const mockChannel = { threads: { cache: mockThreadsCache } };
  const mockFetch = vi.fn().mockResolvedValue(mockChannel);

  mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

  const app = createApp();
  const res = await request(app)
    .post("/webhook")
    .set("x-webhook-secret", "test-secret")
    .send({
      issue_number: 42,
      status: "success",
      commit_sha: "abc1234",
    });

  expect(res.status).toBe(200);
  expect(mockSend).toHaveBeenCalledWith(
    expect.stringContaining("abc1234")
  );
});
```

**Step 2: Run tests to verify they fail**

Run: `cd discord-bot && npx vitest run src/__tests__/webhook.test.ts`
Expected: FAIL — the PR URLs test should fail because the handler doesn't format PR URLs yet.

**Step 3: Update WebhookBody interface and success handler**

In `discord-bot/src/webhook.ts`, update the interface (line 15) to add `pr_urls`:

```typescript
interface WebhookBody {
  issue_number: number;
  status: "success" | "failure";
  message?: string;
  commit_sha?: string;
  pr_urls?: string;
}
```

Then update the success branch (line 89) to handle both formats:

```typescript
if (status === "success") {
  if (pr_urls) {
    await thread.send(
      `Fix PRs created. Please review and approve:\n${pr_urls}`
    );
  } else {
    await thread.send(
      `Fix deployed to production (commit: \`${commit_sha}\`). Please retest and confirm.`
    );
  }
}
```

Update the destructuring (line 48) to include `pr_urls`:

```typescript
const { issue_number, status, message, commit_sha, pr_urls } = req.body;
```

**Step 4: Run tests to verify they pass**

Run: `cd discord-bot && npx vitest run src/__tests__/webhook.test.ts`
Expected: All tests PASS (including existing tests — backward compatible).

**Step 5: Run full quality gate**

Run: `cd discord-bot && npm run lint && npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add discord-bot/src/webhook.ts discord-bot/src/__tests__/webhook.test.ts
git commit -m "feat(discord-bot): support PR URLs in webhook success payload"
```

---

### Task 2: Update the Claude bug-fix prompt template

Replace the existing TDD-heavy prompt with the simplified version that delegates to superpowers skills.

**Files:**
- Modify: `.github/claude-bug-fix-prompt.md`

**Step 1: Replace prompt template**

Replace the entire contents of `.github/claude-bug-fix-prompt.md` with:

```markdown
You are an autonomous bug-fixing agent for the SideDecked project.
A beta tester reported this bug:

---
${ISSUE_BODY}
---

## Workspace Layout

Each service is a separate git repo checked out under `./repos/`:

- `repos/storefront/`         — Next.js 14 frontend
- `repos/vendorpanel/`        — React 18 + Vite vendor panel
- `repos/backend/`            — MedusaJS v2 commerce (orders, payments, vendors)
- `repos/customer-backend/`   — Node.js + TypeORM (cards, decks, community, pricing)

Project docs are in `./workspace/docs/`.
${IMAGE_SECTION}

## Instructions

Use the systematic-debugging skill to investigate. Use the test-driven-development
skill when implementing fixes. Use the verification-before-completion skill before
committing.

A bug may span multiple services. Fix each affected repo independently — commit
separately in each.

Quality gate per service:
```
cd repos/<service> && npm run lint && npm run typecheck && npm run build && npm test
```

Rules:
- Never mix mercur-db (backend/) and sidedecked-db (customer-backend/)
- Cross-database communication is API-only
- Never add TODO comments or AI references in code/commits
```

**Step 2: Commit**

```bash
git add .github/claude-bug-fix-prompt.md
git commit -m "feat(pipeline): simplify Claude prompt for multi-repo + superpowers"
```

---

### Task 3: Rewrite the GitHub Actions workflow

This is the largest change. Replace the single-repo workflow with multi-checkout, superpowers plugin install, image download, per-repo PR creation, and updated notifications.

**Files:**
- Modify: `.github/workflows/discord-bug-fix.yml`

**Step 1: Write the new workflow**

Replace the entire contents of `.github/workflows/discord-bug-fix.yml` with the following. Key changes from the current workflow:
- 5 repo checkouts (workspace-v2 + 4 services)
- Superpowers plugin install step
- Image download step
- Claude runs from `repos/` directory (not repo root)
- Per-repo change detection + branch creation + PR creation loop
- Railway deploy steps removed
- Webhook payload sends `pr_urls` instead of `commit_sha`

```yaml
name: Discord Bug Fix

on:
  issues:
    types: [opened]

jobs:
  fix-bug:
    if: contains(github.event.issue.labels.*.name, 'discord-bug')
    runs-on: ubuntu-latest
    timeout-minutes: 45
    permissions:
      contents: write
      pull-requests: write
      issues: write

    steps:
      # --- Checkout all repos ---

      - name: Checkout workspace-v2
        uses: actions/checkout@v4
        with:
          path: workspace

      - name: Checkout storefront
        uses: actions/checkout@v4
        with:
          repository: tanvirc/sidedecked-storefront
          token: ${{ secrets.CROSS_REPO_TOKEN }}
          path: repos/storefront

      - name: Checkout vendorpanel
        uses: actions/checkout@v4
        with:
          repository: tanvirc/sidedecked-vendorpanel
          token: ${{ secrets.CROSS_REPO_TOKEN }}
          path: repos/vendorpanel

      - name: Checkout backend
        uses: actions/checkout@v4
        with:
          repository: tanvirc/sidedecked-backend
          token: ${{ secrets.CROSS_REPO_TOKEN }}
          path: repos/backend

      - name: Checkout customer-backend
        uses: actions/checkout@v4
        with:
          repository: tanvirc/sidedecked-customer-backend
          token: ${{ secrets.CROSS_REPO_TOKEN }}
          path: repos/customer-backend

      # --- Setup tools ---

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Install superpowers plugin
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: claude plugins install superpowers

      # --- Safety gate ---

      - name: Verify issue author
        env:
          EXPECTED_BOT: ${{ vars.DISCORD_BOT_GITHUB_USER || 'tanvirc' }}
        run: |
          AUTHOR="${{ github.event.issue.user.login }}"
          if [ "$AUTHOR" != "$EXPECTED_BOT" ]; then
            echo "::error::Issue #${{ github.event.issue.number }} created by '$AUTHOR', expected '$EXPECTED_BOT'. Skipping."
            exit 1
          fi

      # --- Configure git in each repo ---

      - name: Configure git identity
        run: |
          for SERVICE in storefront vendorpanel backend customer-backend; do
            cd "repos/${SERVICE}"
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            cd "$GITHUB_WORKSPACE"
          done

      # --- Download screenshots ---

      - name: Download bug report images
        id: images
        env:
          ISSUE_BODY: ${{ github.event.issue.body }}
        run: |
          mkdir -p screenshots
          IMAGE_SECTION=""
          URLS=$(echo "$ISSUE_BODY" | grep -oP '!\[.*?\]\(\K[^)]+' || true)
          if [ -n "$URLS" ]; then
            i=1
            while IFS= read -r url; do
              FILE="screenshots/screenshot-${i}.png"
              curl -sL "$url" -o "$FILE" && echo "Downloaded: $FILE"
              i=$((i + 1))
            done <<< "$URLS"
            IMAGE_SECTION="## Screenshots\nBug report screenshots have been downloaded to ./screenshots/. Use the Read tool to view them."
          fi
          EOF_MARKER=$(openssl rand -hex 16)
          echo "image_section<<${EOF_MARKER}" >> $GITHUB_OUTPUT
          echo -e "$IMAGE_SECTION" >> $GITHUB_OUTPUT
          echo "${EOF_MARKER}" >> $GITHUB_OUTPUT

      # --- Build prompt ---

      - name: Build prompt from template
        id: prompt
        env:
          ISSUE_BODY: ${{ github.event.issue.body }}
          IMAGE_SECTION: ${{ steps.images.outputs.image_section }}
        run: |
          python3 -c "
          import os
          template = open('workspace/.github/claude-bug-fix-prompt.md').read()
          body = os.environ['ISSUE_BODY']
          images = os.environ.get('IMAGE_SECTION', '')
          result = template.replace('\${ISSUE_BODY}', body).replace('\${IMAGE_SECTION}', images)
          print(result)
          " > /tmp/claude-prompt.txt
          EOF_MARKER=$(openssl rand -hex 16)
          echo "prompt<<${EOF_MARKER}" >> $GITHUB_OUTPUT
          cat /tmp/claude-prompt.txt >> $GITHUB_OUTPUT
          echo "${EOF_MARKER}" >> $GITHUB_OUTPUT

      # --- Run Claude Code ---

      - name: Run Claude Code
        id: claude
        working-directory: ${{ github.workspace }}
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          CLAUDE_PROMPT: ${{ steps.prompt.outputs.prompt }}
        run: |
          set +e
          claude -p "$CLAUDE_PROMPT" \
            --allowedTools "Bash,Read,Write,Edit,Glob,Grep" \
            --output-format json > claude-output.json 2> claude-stderr.log
          EXIT_CODE=$?
          echo "exit_code=$EXIT_CODE" >> $GITHUB_OUTPUT
          if [ "$EXIT_CODE" -ne 0 ]; then
            echo "::warning::Claude Code exited with code $EXIT_CODE"
            cat claude-stderr.log
          fi

      # --- Create PRs per repo ---

      - name: Create PRs for changed repos
        id: prs
        if: steps.claude.outputs.exit_code == '0'
        env:
          GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
          ISSUE_NUM: ${{ github.event.issue.number }}
        run: |
          PR_URLS=""
          HAS_CHANGES=false

          for SERVICE in storefront vendorpanel backend customer-backend; do
            REPO_DIR="repos/${SERVICE}"
            if [ ! -d "$REPO_DIR" ]; then continue; fi

            cd "$REPO_DIR"

            # Stage any uncommitted changes
            if ! git diff --quiet || ! git diff --cached --quiet; then
              git add -A
              git commit -m "fix: discord bug #${ISSUE_NUM}"
            fi

            # Check for commits ahead of origin/main
            COMMITS=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
            if [ "$COMMITS" -gt 0 ]; then
              HAS_CHANGES=true
              BRANCH="fix/discord-bug-${ISSUE_NUM}"

              # Create branch from current HEAD (which has the commits)
              CURRENT=$(git rev-parse HEAD)
              git checkout -b "$BRANCH"
              git push origin "$BRANCH"

              PR_URL=$(gh pr create \
                --repo "tanvirc/sidedecked-${SERVICE}" \
                --title "fix: discord bug #${ISSUE_NUM}" \
                --body "Automated fix for sidedecked-workspace-v2#${ISSUE_NUM}" \
                --head "$BRANCH" \
                --base main)

              PR_URLS="${PR_URLS}- ${SERVICE}: ${PR_URL}\n"
              echo "Created PR in sidedecked-${SERVICE}: ${PR_URL}"
            fi

            cd "$GITHUB_WORKSPACE"
          done

          echo "has_changes=$HAS_CHANGES" >> $GITHUB_OUTPUT
          EOF_MARKER=$(openssl rand -hex 16)
          echo "pr_urls<<${EOF_MARKER}" >> $GITHUB_OUTPUT
          echo -e "$PR_URLS" >> $GITHUB_OUTPUT
          echo "${EOF_MARKER}" >> $GITHUB_OUTPUT

      # --- Notifications ---

      - name: Notify success
        if: steps.prs.outputs.has_changes == 'true'
        env:
          GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
          DISCORD_WEBHOOK_SECRET: ${{ secrets.DISCORD_WEBHOOK_SECRET }}
          ISSUE_NUM: ${{ github.event.issue.number }}
          PR_URLS: ${{ steps.prs.outputs.pr_urls }}
        run: |
          ESCAPED_URLS=$(echo "$PR_URLS" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" | sed 's/^"//;s/"$//')
          curl -s -X POST "${DISCORD_WEBHOOK_URL}/webhook" \
            -H "Content-Type: application/json" \
            -H "X-Webhook-Secret: ${DISCORD_WEBHOOK_SECRET}" \
            -d "{\"issue_number\": ${ISSUE_NUM}, \"status\": \"success\", \"pr_urls\": \"${ESCAPED_URLS}\"}"
          gh issue comment "${ISSUE_NUM}" \
            --repo tanvirc/sidedecked-workspace-v2 \
            --body "Fix PRs created:
          ${PR_URLS}"

      - name: Notify failure
        if: steps.prs.outputs.has_changes != 'true' || failure()
        env:
          GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
          DISCORD_WEBHOOK_SECRET: ${{ secrets.DISCORD_WEBHOOK_SECRET }}
          ISSUE_NUM: ${{ github.event.issue.number }}
        run: |
          gh issue edit "${ISSUE_NUM}" \
            --repo tanvirc/sidedecked-workspace-v2 \
            --add-label "needs-human" 2>/dev/null || true
          curl -s -X POST "${DISCORD_WEBHOOK_URL}/webhook" \
            -H "Content-Type: application/json" \
            -H "X-Webhook-Secret: ${DISCORD_WEBHOOK_SECRET}" \
            -d "{\"issue_number\": ${ISSUE_NUM}, \"status\": \"failure\", \"message\": \"Could not auto-fix. Needs developer attention.\"}" || true
          gh issue comment "${ISSUE_NUM}" \
            --repo tanvirc/sidedecked-workspace-v2 \
            --body "Auto-fix failed. Needs manual investigation." || true
```

**Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/discord-bug-fix.yml'))"`
Expected: No errors (valid YAML).

**Step 3: Commit**

```bash
git add .github/workflows/discord-bug-fix.yml
git commit -m "feat(pipeline): rewrite workflow for cross-repo multi-checkout"
```

---

### Task 4: Create the CROSS_REPO_TOKEN secret

This is a manual step. The workflow requires a Fine-Grained Personal Access Token with `repo` scope on all 4 service repos.

**Step 1: Create GitHub Fine-Grained PAT**

Go to GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens:
- Token name: `sidedecked-cross-repo-pipeline`
- Resource owner: `tanvirc`
- Repository access: Select repositories: `sidedecked-storefront`, `sidedecked-vendorpanel`, `sidedecked-backend`, `sidedecked-customer-backend`
- Permissions:
  - Contents: Read and Write
  - Pull requests: Read and Write
  - Metadata: Read

**Step 2: Add as GitHub Secret**

In `tanvirc/sidedecked-workspace-v2` > Settings > Secrets and variables > Actions:
- Name: `CROSS_REPO_TOKEN`
- Value: the PAT from step 1

**Step 3: Verify existing secrets are still configured**

Confirm these secrets still exist in the workspace-v2 repo:
- `ANTHROPIC_API_KEY`
- `DISCORD_WEBHOOK_URL`
- `DISCORD_WEBHOOK_SECRET`

---

### Task 5: Update pipeline documentation

**Files:**
- Modify: `docs/DISCORD-BUG-PIPELINE.md`

**Step 1: Update the pipeline doc**

Read the existing `docs/DISCORD-BUG-PIPELINE.md` and update:
- Architecture section: describe multi-repo checkout layout
- Secrets section: add `CROSS_REPO_TOKEN`, remove `RAILWAY_TOKEN`
- Data flow diagram: update to show per-repo PRs instead of single deploy
- Troubleshooting: add cross-repo failure scenarios

**Step 2: Commit**

```bash
git add docs/DISCORD-BUG-PIPELINE.md
git commit -m "docs: update pipeline docs for cross-repo architecture"
```

---

### Task 6: End-to-end smoke test

**Step 1: Verify workflow YAML is valid**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/discord-bug-fix.yml'))"`
Expected: No errors.

**Step 2: Run discord-bot quality gate**

Run: `cd discord-bot && npm run lint && npm test`
Expected: All tests pass, no lint errors.

**Step 3: Verify the prompt template has both placeholders**

Run: `grep -c '\${ISSUE_BODY}\|{IMAGE_SECTION}' .github/claude-bug-fix-prompt.md`
Expected: 2 (both placeholders present).

**Step 4: Push and test with a real Discord bug report**

Push to main, then post a test bug report in the Discord #bugs channel. Verify:
- Issue created in workspace-v2
- Workflow triggers
- All 4 repos checked out
- Claude Code runs with superpowers
- PRs created in affected repo(s)
- Discord thread receives PR links
