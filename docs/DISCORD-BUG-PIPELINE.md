# Discord Bug Fix Pipeline

Automated bug triage and fix system for SideDecked beta testers. Testers post bug reports in a Discord `#bugs` channel, and an AI agent automatically investigates, fixes, and creates PRs across the affected service repos.

## How It Works

```
Tester posts in #bugs (text + screenshots)
    |
    v
Discord Bot (Railway)
    |- Acknowledges with reaction
    |- Creates thread for status updates
    |- Creates GitHub Issue in workspace-v2 (label: discord-bug)
    |
    v
GitHub Actions (triggers on issue creation in workspace-v2)
    |- Checks out all 4 service repos side-by-side
    |- Downloads bug report screenshots
    |- Installs Claude Code + superpowers plugin
    |- Runs Claude Code once with access to all codebases
    |- Detects which repos were modified
    |- Creates a PR in each affected service repo
    |
    v
Discord Bot receives webhook
    |- Notifies tester with PR links: "Fix PRs created. Please review and approve."
```

## Architecture

### Repo Layout

| Repo | Role | Service |
|---|---|---|
| `tanvirc/sidedecked-workspace-v2` | Orchestrator | Discord bot, workflow, prompt, docs |
| `tanvirc/sidedecked-storefront` | Service | Next.js 14 frontend |
| `tanvirc/sidedecked-vendorpanel` | Service | React 18 + Vite vendor panel |
| `tanvirc/sidedecked-backend` | Service | MedusaJS v2 commerce (orders, payments, vendors) |
| `tanvirc/sidedecked-customer-backend` | Service | Node.js + TypeORM (cards, decks, community, pricing) |

### Runner Directory Layout

The GitHub Actions runner checks out all repos side-by-side:

```
$GITHUB_WORKSPACE/
├── workspace/            # workspace-v2 (prompt template, docs)
├── repos/
│   ├── storefront/       # sidedecked-storefront
│   ├── vendorpanel/      # sidedecked-vendorpanel
│   ├── backend/          # sidedecked-backend
│   └── customer-backend/ # sidedecked-customer-backend
└── screenshots/          # Downloaded bug report images (if any)
```

### Components

| Component | Tech | Location | Hosted On |
|---|---|---|---|
| Discord Bot | Node.js + discord.js + Express | `discord-bot/` | Railway |
| GitHub Action | YAML workflow | `.github/workflows/discord-bug-fix.yml` | GitHub Actions |
| Claude Prompt | Markdown template | `.github/claude-bug-fix-prompt.md` | Repo |

## Setup Guide

### Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application**, name it "SideDecked Bug Bot"
3. Go to the **Bot** tab:
   - Click **Reset Token** and copy the token — save it as `DISCORD_BOT_TOKEN`
   - Under **Privileged Gateway Intents**, enable:
     - **Message Content Intent** (required to read bug report text)
4. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Create Public Threads`, `Read Message History`, `Add Reactions`, `Attach Files`
   - Copy the generated URL

### Step 2: Create Discord Server

1. Create a new Discord server named "SideDecked Testers"
2. Create a text channel named `#bugs`
3. Open the OAuth2 URL from Step 1 to invite the bot to this server
4. Enable **Developer Mode** in Discord (User Settings → Advanced → Developer Mode)
5. Right-click the `#bugs` channel → **Copy Channel ID** — save it as `DISCORD_CHANNEL_ID`

### Step 3: Generate Webhook Secret

Generate a random string to authenticate webhooks between GitHub Actions and the bot:

```bash
openssl rand -hex 32
```

Save this as `DISCORD_WEBHOOK_SECRET`.

### Step 4: Create Cross-Repo Token

The workflow needs access to all 4 service repos. Create a Fine-Grained Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Configure:
   - Token name: `sidedecked-cross-repo-pipeline`
   - Resource owner: `tanvirc`
   - Repository access: Select repositories: `sidedecked-storefront`, `sidedecked-vendorpanel`, `sidedecked-backend`, `sidedecked-customer-backend`
   - Permissions:
     - Contents: Read and Write
     - Pull requests: Read and Write
     - Metadata: Read

Save this as `CROSS_REPO_TOKEN`.

### Step 5: Add GitHub Repository Secrets

Go to `tanvirc/sidedecked-workspace-v2` → **Settings** → **Secrets and variables** → **Actions**.

Add these secrets:

| Secret Name | Value | Source |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | https://console.anthropic.com |
| `CROSS_REPO_TOKEN` | Fine-Grained PAT | Step 4 |
| `DISCORD_BOT_TOKEN` | Bot token | Step 1 |
| `DISCORD_CHANNEL_ID` | Channel ID | Step 2 |
| `DISCORD_WEBHOOK_SECRET` | Random string | Step 3 |
| `DISCORD_WEBHOOK_URL` | Bot's Railway URL | Step 7 (add after deploying) |

### Step 6: Configure Repository Variable

Go to `tanvirc/sidedecked-workspace-v2` → **Settings** → **Secrets and variables** → **Actions** → **Variables**.

| Variable Name | Value | Description |
|---|---|---|
| `DISCORD_BOT_GITHUB_USER` | GitHub username of the PAT owner | Safety gate — only issues created by this user trigger the workflow |

### Step 7: Deploy Discord Bot to Railway

```bash
cd discord-bot

# Initialize Railway project
railway init

# Deploy
railway up
```

Set environment variables in the Railway dashboard for the discord-bot service:

| Variable | Value |
|---|---|
| `DISCORD_BOT_TOKEN` | Bot token from Step 1 |
| `DISCORD_CHANNEL_ID` | Channel ID from Step 2 |
| `GITHUB_TOKEN` | A GitHub personal access token with `repo` scope |
| `GITHUB_OWNER` | `tanvirc` |
| `GITHUB_REPO` | `sidedecked` |
| `WEBHOOK_SECRET` | Same value as `DISCORD_WEBHOOK_SECRET` from Step 3 |
| `PORT` | `3001` |

After deployment, Railway will give you a public URL (e.g., `https://sidedecked-discord-bot-production.up.railway.app`).

**Go back to GitHub Secrets** (Step 5) and add:
- `DISCORD_WEBHOOK_URL` = the Railway URL (without trailing slash, no `/webhook` suffix)

### Step 8: Verify Deployment

1. Check the bot is online:
   ```bash
   curl https://<your-railway-url>/health
   ```
   Expected: `{"status":"ok"}`

2. Check the bot appears online in your Discord server

3. Post a test message in `#bugs`:
   ```
   The add to cart button doesn't respond when clicked on mobile Safari
   ```

4. Verify the pipeline:
   - Bot reacts with magnifying glass
   - Bot creates a thread
   - GitHub issue appears in workspace-v2 with `discord-bug` label
   - GitHub Actions workflow triggers
   - All 4 service repos are checked out
   - Claude Code runs with superpowers skills
   - PRs created in affected service repo(s)
   - Bot replies in thread with PR links: "Fix PRs created. Please review and approve."

## Failure Handling

| Scenario | What Happens |
|---|---|
| Claude Code can't fix the bug | Issue labeled `needs-human`, bot notifies: "Could not auto-fix. A developer will look into it." |
| Tests fail after fix attempt | Same as above |
| No repos modified | Same as above |
| Workflow times out (45 min) | Same as `needs-human` |

Issues labeled `needs-human` require a developer to investigate manually.

Deployment is no longer handled by the orchestrator workflow. Each service repo's own CI/CD pipeline handles deployment after PR merge.

## Monitoring

**Discord:** All status updates appear as threaded replies under the original bug report.

**GitHub:** Each bug creates an issue in workspace-v2. Fixed bugs have linked PRs in the affected service repos. Unfixed bugs are labeled `needs-human`.

**Railway:** The bot service has a `/health` endpoint and is configured with restart-on-failure (max 3 retries).

## Configuration

### Discord Bot Environment Variables

Defined in `discord-bot/.env.example`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_BOT_TOKEN` | Yes | — | Discord bot authentication token |
| `DISCORD_CHANNEL_ID` | Yes | — | ID of the `#bugs` channel to monitor |
| `GITHUB_TOKEN` | Yes | — | GitHub PAT with `repo` scope |
| `GITHUB_OWNER` | No | `tanvirc` | GitHub repository owner |
| `GITHUB_REPO` | No | `sidedecked` | GitHub repository name |
| `WEBHOOK_SECRET` | Yes | — | Shared secret for webhook authentication |
| `PORT` | No | `3001` | Express server port |

### GitHub Actions Secrets

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Code API authentication |
| `CROSS_REPO_TOKEN` | Fine-Grained PAT for cross-repo checkout, push, and PR creation |
| `DISCORD_WEBHOOK_URL` | Bot's Railway URL for completion notifications |
| `DISCORD_WEBHOOK_SECRET` | Must match bot's `WEBHOOK_SECRET` |

### Claude Code Prompt

The bug-fixing prompt template is at `.github/claude-bug-fix-prompt.md`. It tells Claude Code to:

1. Use `systematic-debugging` skill to investigate the bug across all service repos
2. Use `test-driven-development` skill when implementing fixes
3. Use `verification-before-completion` skill before committing
4. Run quality gate per affected service
5. Commit separately in each affected repo

Edit this file to adjust the agent's behavior.

## Cost

| Component | Cost |
|---|---|
| Discord Bot (Railway) | ~$5/month |
| Claude Code API | ~$0.50–$2.00 per bug fix |
| GitHub Actions | Free tier (2,000 min/month) |

## Troubleshooting

**Bot doesn't react to messages:**
- Verify `DISCORD_CHANNEL_ID` matches the `#bugs` channel
- Check that Message Content Intent is enabled in the Discord developer portal
- Check Railway logs: `railway logs`

**GitHub issue not created:**
- Verify `GITHUB_TOKEN` has `repo` scope
- Check Railway logs for Octokit errors

**GitHub Actions workflow doesn't trigger:**
- Verify the issue has the `discord-bug` label
- Check that the workflow file exists on the `main` branch (merge the PR first)

**Cross-repo checkout fails:**
- Verify `CROSS_REPO_TOKEN` has access to all 4 service repos
- Verify the PAT has Contents (Read and Write) and Metadata (Read) permissions
- Check that the repository names match: `sidedecked-storefront`, `sidedecked-vendorpanel`, `sidedecked-backend`, `sidedecked-customer-backend`

**PRs not created in service repos:**
- Verify `CROSS_REPO_TOKEN` has Pull requests (Read and Write) permission
- Check the Actions log for the "Create PRs for changed repos" step
- Ensure Claude Code actually committed changes (check the Claude output log)

**Claude Code fails to fix the bug:**
- Check the GitHub Actions run log for details
- The issue will be labeled `needs-human`
- Review the Claude Code output in the Actions log for diagnostic info

**Webhook not reaching the bot:**
- Verify `DISCORD_WEBHOOK_URL` secret matches the Railway URL
- Verify `DISCORD_WEBHOOK_SECRET` matches the bot's `WEBHOOK_SECRET`
- Check the bot's `/health` endpoint is responding

**Issue author verification fails:**
- The `DISCORD_BOT_GITHUB_USER` variable must match the GitHub user that owns the PAT used by the Discord bot to create issues
- Check the Actions log for the actual vs expected author
