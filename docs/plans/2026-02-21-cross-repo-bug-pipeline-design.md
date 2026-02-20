# Cross-Repo Discord Bug Pipeline Design

**Date:** 2026-02-21
**Status:** Approved

## Problem

The Discord bug pipeline currently runs in `sidedecked-workspace-v2` as a monorepo. The four services (storefront, vendorpanel, backend, customer-backend) now live in separate GitHub repos. The pipeline needs to fix bugs that may span multiple repos in a single run and create PRs in each affected repo.

## Architecture: Multi-Checkout (Approach A)

The GH Actions workflow in `workspace-v2` checks out all 4 service repos side-by-side, runs Claude Code once with access to all codebases, then detects which repos were modified and creates PRs in each.

### Repo Layout

| Repo | Service |
|---|---|
| `tanvirc/sidedecked-workspace-v2` | Orchestrator (discord bot, workflow, prompt, docs) |
| `tanvirc/sidedecked-storefront` | Next.js 14 frontend |
| `tanvirc/sidedecked-vendorpanel` | React 18 + Vite vendor panel |
| `tanvirc/sidedecked-backend` | MedusaJS v2 commerce (orders, payments, vendors) |
| `tanvirc/sidedecked-customer-backend` | Node.js + TypeORM (cards, decks, community, pricing) |

### Runner Directory Layout

```
$GITHUB_WORKSPACE/
├── workspace/            # workspace-v2 (prompt template, CLAUDE.md, docs)
└── repos/
    ├── storefront/       # sidedecked-storefront
    ├── vendorpanel/      # sidedecked-vendorpanel
    ├── backend/          # sidedecked-backend
    └── customer-backend/ # sidedecked-customer-backend
```

## Workflow Changes

### 1. Multi-Repo Checkout

Replace the single `actions/checkout@v4` with 5 checkouts:

- `workspace-v2` into `./workspace/` (for prompt template, CLAUDE.md, docs)
- Each service repo into `./repos/<service>/` using `CROSS_REPO_TOKEN`

```yaml
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

# ... same pattern for vendorpanel, backend, customer-backend
```

### 2. Superpowers Plugin

Install the `obra/superpowers` Claude Code plugin on the runner before the fix step. This gives Claude access to `systematic-debugging`, `test-driven-development`, and `verification-before-completion` skills, removing the need for detailed methodology instructions in the prompt.

```yaml
- name: Install superpowers plugin
  run: claude plugins install superpowers
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### 3. Image Handling

Discord bug reports include screenshots as Markdown image links (`![screenshot-N](url)`). Claude Code's `-p` mode receives these as plain text — it cannot see the images.

**Solution:** Download images to `./screenshots/` in a pre-step. Claude uses the `Read` tool (which is multimodal) to view them.

```yaml
- name: Download bug report images
  run: |
    mkdir -p screenshots
    URLS=$(echo "$ISSUE_BODY" | grep -oP '!\[.*?\]\(\K[^)]+' || true)
    if [ -n "$URLS" ]; then
      i=1
      while IFS= read -r url; do
        curl -sL "$url" -o "screenshots/screenshot-${i}.png"
        i=$((i + 1))
      done <<< "$URLS"
    fi
```

The prompt template includes a conditional `${IMAGE_SECTION}` that tells Claude where to find the screenshots.

### 4. Simplified Claude Prompt

With superpowers skills handling methodology, the prompt focuses on context and constraints:

```markdown
You are an autonomous bug-fixing agent for the SideDecked project.
A beta tester reported this bug:

---
${ISSUE_BODY}
---

## Workspace Layout

Each service is a separate git repo checked out under `./repos/`:

- `repos/storefront/`         - Next.js 14 frontend
- `repos/vendorpanel/`        - React 18 + Vite vendor panel
- `repos/backend/`            - MedusaJS v2 commerce (orders, payments, vendors)
- `repos/customer-backend/`   - Node.js + TypeORM (cards, decks, community, pricing)

Project docs are in `./workspace/docs/`.
${IMAGE_SECTION}

## Instructions

Use the systematic-debugging skill to investigate. Use the test-driven-development
skill when implementing fixes. Use the verification-before-completion skill before
committing.

A bug may span multiple services. Fix each affected repo independently -- commit
separately in each.

Quality gate per service:
cd repos/<service> && npm run lint && npm run typecheck && npm run build && npm test

Rules:
- Never mix mercur-db (backend/) and sidedecked-db (customer-backend/)
- Cross-database communication is API-only
- Never add TODO comments or AI references in code/commits
```

### 5. Per-Repo PR Creation

After Claude commits, detect which repos have changes and create PRs in each:

```yaml
- name: Create PRs for changed repos
  env:
    GH_TOKEN: ${{ secrets.CROSS_REPO_TOKEN }}
    ISSUE_NUM: ${{ github.event.issue.number }}
  run: |
    for SERVICE in storefront vendorpanel backend customer-backend; do
      REPO_DIR="repos/${SERVICE}"
      cd "$REPO_DIR"

      # Stage any uncommitted changes
      if ! git diff --quiet || ! git diff --cached --quiet; then
        git add -A
        git commit -m "fix: discord bug #${ISSUE_NUM} (auto-staged)"
      fi

      COMMITS=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
      if [ "$COMMITS" -gt 0 ]; then
        BRANCH="fix/discord-bug-${ISSUE_NUM}"
        git checkout -b "$BRANCH" 2>/dev/null || true
        git push origin "$BRANCH"

        gh pr create \
          --repo "tanvirc/sidedecked-${SERVICE}" \
          --title "fix: discord bug #${ISSUE_NUM}" \
          --body "Automated fix for workspace-v2 issue #${ISSUE_NUM}" \
          --head "$BRANCH" \
          --base main
      fi

      cd "$GITHUB_WORKSPACE"
    done
```

### 6. Updated Discord Notifications

The webhook payload now includes a list of PR URLs (one per affected repo) instead of a single commit SHA. The Discord bot's webhook handler displays PR links in the thread.

### 7. Railway Deploy Removed

Deployment is no longer handled by the orchestrator workflow. Each service repo's own CI/CD pipeline handles deployment after PR merge.

## Security & Tokens

| Secret | Scope | Purpose |
|---|---|---|
| `CROSS_REPO_TOKEN` | Fine-Grained PAT with `repo` scope on all 4 service repos | Checkout + push + create PRs |
| `ANTHROPIC_API_KEY` | Claude API | Run Claude Code |
| `DISCORD_WEBHOOK_URL` | Bot Railway endpoint | Notify Discord |
| `DISCORD_WEBHOOK_SECRET` | Shared secret | Webhook auth |

The default `GITHUB_TOKEN` only has access to `workspace-v2`. A Fine-Grained PAT (or GitHub App) with access to all 4 service repos is required for cross-repo operations.

## Changes Summary

| Component | Current | New |
|---|---|---|
| Checkout | Single repo (workspace-v2) | 5 repos (workspace-v2 + 4 services) |
| Claude prompt | Detailed TDD instructions | Simplified -- delegates to superpowers skills |
| Images | URLs as text in prompt | Downloaded to `./screenshots/`, Claude reads them |
| Claude run | Single cwd | cwd = `repos/`, commits per-repo |
| PR creation | 1 PR in workspace-v2 | 1 PR per affected service repo |
| Deployment | Railway deploy from workflow | Removed -- each repo's CI handles deploy |
| Discord notify | Single commit SHA | List of PR URLs per repo |
| Auth | `GITHUB_TOKEN` | `CROSS_REPO_TOKEN` (PAT for cross-repo) |

## Discord Bot Changes

The webhook handler needs a minor update:

- Accept `message` field with PR links (in addition to existing `commit_sha`)
- Display PR links in the Discord thread instead of just a commit SHA
- Success message: "Fix PRs created: [list of links]. Please review and approve."
- Failure message unchanged: "Could not auto-fix. A developer will look into it."
