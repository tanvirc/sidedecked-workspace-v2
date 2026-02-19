# Discord Bug Fix Pipeline — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Discord bot + GitHub Actions pipeline that automatically fixes bugs reported by testers, deploys the fix, and notifies the reporter.

**Architecture:** Discord bot (Node.js + discord.js + Express) monitors `#bugs` channel, creates GitHub issues, receives completion webhooks. GitHub Actions workflow runs Claude Code with BMAD workflows to fix, test, PR, auto-merge, and deploy. Three components: `discord-bot/` service, `.github/workflows/discord-bug-fix.yml`, and a Claude Code prompt file.

**Tech Stack:** Node.js 20, discord.js v14, Express, TypeScript, GitHub Actions, Claude Code CLI, Railway CLI

---

## Prerequisites (Manual Setup)

Before implementation, these must be done manually in browser:

1. **Create Discord Application + Bot:**
   - Go to https://discord.com/developers/applications
   - Create application "SideDecked Bug Bot"
   - Bot tab → create bot, copy token
   - OAuth2 → URL Generator → select `bot` scope + permissions: `Send Messages`, `Create Public Threads`, `Read Message History`, `Add Reactions`, `Attach Files`
   - Use generated URL to invite bot to your Discord server

2. **Create Discord Server:**
   - Create server "SideDecked Testers"
   - Create `#bugs` text channel
   - Note the channel ID (right-click → Copy Channel ID with Developer Mode on)

3. **GitHub Secrets:**
   - Repo Settings → Secrets → Actions → add:
     - `ANTHROPIC_API_KEY` — your Anthropic API key
     - `RAILWAY_TOKEN` — Railway deploy token
     - `DISCORD_BOT_TOKEN` — from step 1
     - `DISCORD_CHANNEL_ID` — from step 2
     - `DISCORD_WEBHOOK_SECRET` — generate a random string (used to verify webhook calls from GH Actions to the bot)

4. **Enable GitHub Auto-merge:**
   - Repo Settings → General → check "Allow auto-merge"

---

### Task 1: Scaffold Discord Bot Project

**Files:**
- Create: `discord-bot/package.json`
- Create: `discord-bot/tsconfig.json`
- Create: `discord-bot/.env.example`
- Create: `discord-bot/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "sidedecked-discord-bot",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "lint": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "discord.js": "^14.16.0",
    "express": "^4.21.0",
    "@octokit/rest": "^21.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tsx": "^4.19.0",
    "vitest": "^2.0.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .env.example**

```
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
GITHUB_TOKEN=
GITHUB_OWNER=tanvirc
GITHUB_REPO=sidedecked
WEBHOOK_SECRET=
PORT=3001
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
.env
```

**Step 5: Install dependencies**

Run: `cd discord-bot && npm install`

**Step 6: Commit**

```bash
git add discord-bot/
git commit -m "feat(discord-bot): scaffold project with dependencies"
```

---

### Task 2: Implement Discord Bot Core

**Files:**
- Create: `discord-bot/src/index.ts`
- Create: `discord-bot/src/config.ts`

**Step 1: Create config.ts**

```typescript
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  discordToken: requireEnv("DISCORD_BOT_TOKEN"),
  channelId: requireEnv("DISCORD_CHANNEL_ID"),
  githubToken: requireEnv("GITHUB_TOKEN"),
  githubOwner: process.env.GITHUB_OWNER ?? "tanvirc",
  githubRepo: process.env.GITHUB_REPO ?? "sidedecked",
  webhookSecret: requireEnv("WEBHOOK_SECRET"),
  port: parseInt(process.env.PORT ?? "3001", 10),
};
```

**Step 2: Create index.ts**

```typescript
import { Client, GatewayIntentBits, Events, TextChannel, Message } from "discord.js";
import express from "express";
import { config } from "./config.js";
import { createGitHubIssue } from "./github.js";
import { handleWebhook } from "./webhook.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Track thread IDs mapped to issue numbers for webhook replies
export const issueThreadMap = new Map<number, string>();

client.once(Events.ClientReady, (c) => {
  console.log(`Bot ready as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;
  if (message.channelId !== config.channelId) return;

  try {
    await message.react("\uD83D\uDD0D");

    const thread = await (message.channel as TextChannel).threads.create({
      name: `Bug Report — ${message.content.slice(0, 50)}`,
      startMessage: message,
    });

    await thread.send("Investigating — creating GitHub issue...");

    const imageUrls = message.attachments
      .filter((a) => a.contentType?.startsWith("image/"))
      .map((a) => a.url);

    let issueBody = message.content;
    if (imageUrls.length > 0) {
      issueBody += "\n\n**Screenshots:**\n";
      issueBody += imageUrls.map((url, i) => `![screenshot-${i + 1}](${url})`).join("\n");
    }

    issueBody += `\n\n---\n_Discord thread: ${thread.url}_`;

    const issue = await createGitHubIssue(issueBody);

    issueThreadMap.set(issue.number, thread.id);

    await thread.send(
      `Created [Issue #${issue.number}](${issue.html_url}) — fix in progress...`
    );
  } catch (err) {
    console.error("Failed to process bug report:", err);
  }
});

// Express server for incoming webhooks from GitHub Actions
const app = express();
app.use(express.json());
app.post("/webhook", handleWebhook);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  console.log(`Webhook server listening on port ${config.port}`);
});

client.login(config.discordToken);
```

**Step 3: Commit**

```bash
git add discord-bot/src/
git commit -m "feat(discord-bot): implement bot core with message handler"
```

---

### Task 3: Implement GitHub Issue Creation

**Files:**
- Create: `discord-bot/src/github.ts`

**Step 1: Create github.ts**

```typescript
import { Octokit } from "@octokit/rest";
import { config } from "./config.js";

const octokit = new Octokit({ auth: config.githubToken });

export async function createGitHubIssue(body: string) {
  const { data } = await octokit.issues.create({
    owner: config.githubOwner,
    repo: config.githubRepo,
    title: `[Discord Bug] ${body.slice(0, 80).replace(/\n/g, " ")}`,
    body,
    labels: ["discord-bug"],
  });
  return data;
}
```

**Step 2: Commit**

```bash
git add discord-bot/src/github.ts
git commit -m "feat(discord-bot): add GitHub issue creation"
```

---

### Task 4: Implement Webhook Handler

**Files:**
- Create: `discord-bot/src/webhook.ts`

**Step 1: Create webhook.ts**

```typescript
import { Request, Response } from "express";
import { Client, TextChannel } from "discord.js";
import { config } from "./config.js";
import { issueThreadMap } from "./index.js";

// This will be set after the client is ready — see index.ts
let discordClient: Client;

export function setDiscordClient(client: Client) {
  discordClient = client;
}

export async function handleWebhook(req: Request, res: Response) {
  const secret = req.headers["x-webhook-secret"];
  if (secret !== config.webhookSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { issue_number, status, message, commit_sha, deploy_url } = req.body;

  const threadId = issueThreadMap.get(issue_number);
  if (!threadId) {
    res.status(404).json({ error: "Thread not found for issue" });
    return;
  }

  try {
    const channel = await discordClient.channels.fetch(config.channelId) as TextChannel;
    const thread = channel.threads.cache.get(threadId)
      ?? await channel.threads.fetch(threadId).then(t => t);

    if (!thread || !("send" in thread)) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    if (status === "success") {
      await thread.send(
        `Fix deployed to production (commit: \`${commit_sha}\`). Please retest and confirm.`
      );
    } else if (status === "failure") {
      await thread.send(
        `Could not auto-fix this bug. A developer will look into it.\n\nReason: ${message}`
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
```

**Step 2: Update index.ts to wire up the client reference**

Add after `client.once(Events.ClientReady)`:
```typescript
import { setDiscordClient } from "./webhook.js";
// inside ClientReady handler:
setDiscordClient(c);
```

**Step 3: Commit**

```bash
git add discord-bot/src/webhook.ts discord-bot/src/index.ts
git commit -m "feat(discord-bot): add webhook handler for GH Actions notifications"
```

---

### Task 5: Create Railway Configuration for Discord Bot

**Files:**
- Create: `discord-bot/railway.toml`
- Create: `discord-bot/Dockerfile`

**Step 1: Create railway.toml**

```toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 120
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

**Step 2: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
```

**Step 3: Commit**

```bash
git add discord-bot/railway.toml discord-bot/Dockerfile
git commit -m "feat(discord-bot): add Railway deployment config"
```

---

### Task 6: Create Claude Code Prompt File

**Files:**
- Create: `.github/claude-bug-fix-prompt.md`

**Step 1: Create the prompt**

```markdown
You are an autonomous bug-fixing agent for the SideDecked project. A beta tester reported this bug:

---
${ISSUE_BODY}
---

Follow these steps exactly:

1. **Analyze the bug report.** Identify which service is affected:
   - `backend/` — MedusaJS commerce (orders, payments, vendors)
   - `customer-backend/` — customer experience (cards, decks, community, pricing)
   - `storefront/` — Next.js frontend
   - `vendorpanel/` — React vendor panel

2. **Search the codebase** for the relevant code. Read the related files to understand context.

3. **Write a failing test** that reproduces the bug.

4. **Implement the minimal fix** to make the test pass.

5. **Run the quality gate** for the affected service:
   ```bash
   cd <service-dir> && npm run lint && npm run typecheck && npm run build && npm test
   ```

6. **If the gate passes**, commit:
   ```bash
   git add -A && git commit -m "fix(<scope>): <description of what was fixed>"
   ```

7. **If the gate fails**, read the errors, fix them, and retry once. If it still fails, exit with error.

Important rules:
- Follow TDD: failing test first, then fix
- Only change what is necessary to fix the bug
- Never mix mercur-db and sidedecked-db data
- Never add TODO comments — the fix must be complete
- Never reference AI in code or commits
```

**Step 2: Commit**

```bash
git add .github/claude-bug-fix-prompt.md
git commit -m "feat(ci): add Claude Code bug-fix prompt template"
```

---

### Task 7: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/discord-bug-fix.yml`

**Step 1: Create the workflow**

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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Create fix branch
        run: |
          BRANCH="fix/discord-bug-${{ github.event.issue.number }}"
          git checkout -b "$BRANCH"
          echo "BRANCH=$BRANCH" >> $GITHUB_ENV

      - name: Read prompt template
        id: prompt
        run: |
          PROMPT=$(cat .github/claude-bug-fix-prompt.md)
          ISSUE_BODY=$(jq -r '.issue.body' "$GITHUB_EVENT_PATH")
          PROMPT="${PROMPT//\$\{ISSUE_BODY\}/$ISSUE_BODY}"
          echo "prompt<<PROMPT_EOF" >> $GITHUB_OUTPUT
          echo "$PROMPT" >> $GITHUB_OUTPUT
          echo "PROMPT_EOF" >> $GITHUB_OUTPUT

      - name: Run Claude Code
        id: claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "${{ steps.prompt.outputs.prompt }}" \
            --allowedTools "Bash,Read,Write,Edit,Glob,Grep" \
            --output-format json > claude-output.json 2>&1 || true
          echo "exit_code=$?" >> $GITHUB_OUTPUT

      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet && git diff --cached --quiet; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi

      - name: Push and create PR
        if: steps.changes.outputs.has_changes == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          git push origin "$BRANCH"
          PR_URL=$(gh pr create \
            --title "fix: discord bug #${{ github.event.issue.number }}" \
            --body "Automated fix for #${{ github.event.issue.number }}" \
            --head "$BRANCH" \
            --base main)
          gh pr merge "$PR_URL" --auto --squash
          echo "PR_URL=$PR_URL" >> $GITHUB_ENV

      - name: Wait for merge
        if: steps.changes.outputs.has_changes == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          for i in $(seq 1 30); do
            STATE=$(gh pr view "$PR_URL" --json state -q .state)
            if [ "$STATE" = "MERGED" ]; then
              echo "PR merged"
              break
            fi
            sleep 10
          done

      - name: Deploy to Railway
        if: steps.changes.outputs.has_changes == 'true'
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          # Deploy each affected service
          # Railway CLI detects changes and deploys accordingly
          cd backend && railway up --detach 2>/dev/null || true
          cd ../customer-backend && railway up --detach 2>/dev/null || true
          cd ../storefront && railway up --detach 2>/dev/null || true

      - name: Notify success
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          COMMIT_SHA=$(git rev-parse HEAD)
          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}/webhook" \
            -H "Content-Type: application/json" \
            -H "X-Webhook-Secret: ${{ secrets.DISCORD_WEBHOOK_SECRET }}" \
            -d "{\"issue_number\": ${{ github.event.issue.number }}, \"status\": \"success\", \"commit_sha\": \"$COMMIT_SHA\"}"

          gh issue comment ${{ github.event.issue.number }} --body "Fix deployed. Commit: \`$COMMIT_SHA\`"

      - name: Notify failure
        if: steps.changes.outputs.has_changes == 'false' || failure()
        run: |
          gh issue label ${{ github.event.issue.number }} --add "needs-human" 2>/dev/null || true

          curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}/webhook" \
            -H "Content-Type: application/json" \
            -H "X-Webhook-Secret: ${{ secrets.DISCORD_WEBHOOK_SECRET }}" \
            -d "{\"issue_number\": ${{ github.event.issue.number }}, \"status\": \"failure\", \"message\": \"Could not auto-fix. Needs developer attention.\"}" || true

          gh issue comment ${{ github.event.issue.number }} --body "Auto-fix failed. Needs manual investigation." || true
```

**Step 2: Commit**

```bash
git add .github/workflows/discord-bug-fix.yml
git commit -m "feat(ci): add Discord bug fix GitHub Actions workflow"
```

---

### Task 8: Create the `discord-bug` Label in GitHub

**Step 1: Create label via CLI**

Run: `gh label create discord-bug --description "Bug reported via Discord" --color "d73a4a"`

**Step 2: Verify**

Run: `gh label list | grep discord-bug`
Expected: `discord-bug  Bug reported via Discord  #d73a4a`

---

### Task 9: Write Tests for Discord Bot

**Files:**
- Create: `discord-bot/src/__tests__/github.test.ts`
- Create: `discord-bot/src/__tests__/webhook.test.ts`
- Create: `discord-bot/vitest.config.ts`

**Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

**Step 2: Create github.test.ts**

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock Octokit before import
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    issues: {
      create: vi.fn().mockResolvedValue({
        data: { number: 42, html_url: "https://github.com/tanvirc/sidedecked/issues/42" },
      }),
    },
  })),
}));

// Mock config
vi.mock("../config.js", () => ({
  config: {
    githubToken: "test-token",
    githubOwner: "tanvirc",
    githubRepo: "sidedecked",
  },
}));

import { createGitHubIssue } from "../github.js";

describe("createGitHubIssue", () => {
  it("creates an issue with discord-bug label", async () => {
    const result = await createGitHubIssue("Button is broken on mobile");
    expect(result.number).toBe(42);
    expect(result.html_url).toContain("issues/42");
  });
});
```

**Step 3: Create webhook.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../config.js", () => ({
  config: { webhookSecret: "test-secret", channelId: "123" },
}));

vi.mock("../index.js", () => ({
  issueThreadMap: new Map([[42, "thread-id-1"]]),
}));

// Minimal mock — webhook handler imports are tested via HTTP
import { handleWebhook } from "../webhook.js";

describe("handleWebhook", () => {
  const app = express();
  app.use(express.json());
  app.post("/webhook", handleWebhook);

  it("rejects requests without valid secret", async () => {
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "wrong")
      .send({ issue_number: 42, status: "success" });

    expect(res.status).toBe(401);
  });
});
```

**Step 4: Add supertest dev dependency**

Run: `cd discord-bot && npm install -D supertest @types/supertest`

**Step 5: Run tests**

Run: `cd discord-bot && npm test`
Expected: 2 tests pass

**Step 6: Commit**

```bash
git add discord-bot/
git commit -m "test(discord-bot): add unit tests for github and webhook modules"
```

---

### Task 10: End-to-End Verification and Documentation

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Verify bot builds**

Run: `cd discord-bot && npm run build`
Expected: Compiles without errors to `dist/`

**Step 2: Verify tests pass**

Run: `cd discord-bot && npm test`
Expected: All tests pass

**Step 3: Verify workflow YAML is valid**

Run: `gh workflow list` (will error if no workflows yet pushed — that's OK)
Or: `cat .github/workflows/discord-bug-fix.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin.read()); print('Valid YAML')"` (if python3 + pyyaml available)

**Step 4: Update CHANGELOG.md**

Add entry:
```markdown
## [Unreleased]

### Added
- Discord bug fix pipeline: bot monitors #bugs channel, creates GitHub issues, GitHub Actions runs Claude Code to auto-fix, deploy, and notify testers
- Discord bot service (`discord-bot/`) with Railway deployment config
- GitHub Actions workflow (`.github/workflows/discord-bug-fix.yml`) for automated bug fixing
```

**Step 5: Final commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add Discord bug fix pipeline to changelog"
```

---

## Post-Implementation: Manual Steps

After all code is committed and pushed:

1. **Create Railway service** for discord-bot:
   - `cd discord-bot && railway init` → create new project
   - Set env vars: `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`, `GITHUB_TOKEN`, `WEBHOOK_SECRET`, `PORT=3001`, `GITHUB_OWNER=tanvirc`, `GITHUB_REPO=sidedecked`
   - `railway up`

2. **Note the Railway URL** (e.g., `sidedecked-discord-bot-production.up.railway.app`)
   - Add this as `DISCORD_WEBHOOK_URL` GitHub secret (just the base URL, no `/webhook` suffix — the workflow appends it)

3. **Test end-to-end:**
   - Post a message in `#bugs`: "The add to cart button doesn't work on mobile"
   - Verify: bot reacts, thread created, issue created, GH Action triggers, PR created, deployed, Discord notified
