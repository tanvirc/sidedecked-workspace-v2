# Discord Bug Fix Pipeline

Automated bug triage and fix system for SideDecked beta testers. Testers post bug reports in a Discord `#bugs` channel, and an AI agent automatically fixes, tests, and deploys the fix.

## How It Works

```
Tester posts in #bugs (text + screenshots)
    |
    v
Discord Bot (Railway)
    |- Acknowledges with reaction
    |- Creates thread for status updates
    |- Creates GitHub Issue (label: discord-bug)
    |
    v
GitHub Actions (triggers on issue creation)
    |- Runs Claude Code with BMAD workflows
    |- Writes failing test, implements fix
    |- Runs quality gate (lint, typecheck, build, test)
    |- Creates PR, auto-merges after tests pass
    |- Deploys to production via Railway CLI
    |
    v
Discord Bot receives webhook
    |- Notifies tester: "Fix deployed. Please retest."
```

## Architecture

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

### Step 4: Add GitHub Repository Secrets

Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these secrets:

| Secret Name | Value | Source |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | https://console.anthropic.com |
| `RAILWAY_TOKEN` | Railway deploy token | Railway dashboard → Account → Tokens |
| `DISCORD_BOT_TOKEN` | Bot token | Step 1 |
| `DISCORD_CHANNEL_ID` | Channel ID | Step 2 |
| `DISCORD_WEBHOOK_SECRET` | Random string | Step 3 |
| `DISCORD_WEBHOOK_URL` | Bot's Railway URL | Step 5 (add after deploying) |

### Step 5: Enable Auto-Merge

1. Go to your repository → **Settings** → **General**
2. Scroll to **Pull Requests**
3. Check **Allow auto-merge**

This allows the GitHub Action to auto-merge PRs after tests pass.

### Step 6: Deploy Discord Bot to Railway

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

**Go back to GitHub Secrets** (Step 4) and add:
- `DISCORD_WEBHOOK_URL` = the Railway URL (without trailing slash, no `/webhook` suffix)

### Step 7: Verify Deployment

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
   - GitHub issue appears with `discord-bug` label
   - GitHub Actions workflow triggers
   - PR is created, tests run, auto-merges
   - Bot replies in thread: "Fix deployed to production. Please retest."

## Failure Handling

| Scenario | What Happens |
|---|---|
| Claude Code can't fix the bug | Issue labeled `needs-human`, bot notifies: "Could not auto-fix. A developer will look into it." |
| Tests fail after fix attempt | Same as above |
| Deploy fails | Issue labeled `deploy-failed`, bot notifies with error |
| Workflow times out (45 min) | Same as `needs-human` |

Issues labeled `needs-human` require a developer to investigate manually.

## Monitoring

**Discord:** All status updates appear as threaded replies under the original bug report.

**GitHub:** Each bug creates an issue. Fixed bugs have a linked, merged PR. Unfixed bugs are labeled `needs-human`.

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
| `RAILWAY_TOKEN` | Railway CLI deploy token |
| `DISCORD_WEBHOOK_URL` | Bot's Railway URL for completion notifications |
| `DISCORD_WEBHOOK_SECRET` | Must match bot's `WEBHOOK_SECRET` |

### Claude Code Prompt

The bug-fixing prompt template is at `.github/claude-bug-fix-prompt.md`. It instructs Claude Code to:

1. Analyze the bug report and identify the affected service
2. Search the codebase for relevant code
3. Write a failing test (TDD)
4. Implement the minimal fix
5. Run the quality gate
6. Commit the fix

Edit this file to adjust the AI agent's behavior.

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

**Claude Code fails to fix the bug:**
- Check the GitHub Actions run log for details
- The issue will be labeled `needs-human`
- Review the Claude Code output in the Actions log for diagnostic info

**Webhook not reaching the bot:**
- Verify `DISCORD_WEBHOOK_URL` secret matches the Railway URL
- Verify `DISCORD_WEBHOOK_SECRET` matches the bot's `WEBHOOK_SECRET`
- Check the bot's `/health` endpoint is responding

**Auto-merge not working:**
- Ensure auto-merge is enabled in repository settings
- Ensure no branch protection rules require manual review
