# Discord Bug Fix Pipeline — Design Document

**Date:** 2026-02-19
**Status:** Approved

## Problem

SideDecked needs a way for beta testers to report bugs and have them automatically triaged, fixed, tested, and deployed — with minimal human intervention.

## Solution

A three-component pipeline: Discord Bot + GitHub Actions + Claude Code.

Testers post free-form bug reports (text + screenshots) in a Discord `#bugs` channel. A bot creates a GitHub issue, which triggers a GitHub Actions workflow that runs Claude Code with BMAD workflows to fix the bug, create a PR (auto-merged after tests pass), deploy to production, and notify the tester on Discord.

## Architecture

```
Tester posts in #bugs (free-form text + screenshots)
    |
    v
Discord Bot (Node.js + discord.js, hosted on Railway)
    |- Reacts with magnifying glass emoji to acknowledge
    |- Creates thread under the message
    |- Posts "Investigating..."
    |- Creates GitHub Issue (label: discord-bug, body: raw message + image URLs)
    |- Posts "Issue #N created, fix in progress..."
    |
    v
GitHub Actions (triggers on issues.opened with discord-bug label)
    |- Checks out repo
    |- Installs dependencies + Claude Code CLI
    |- Runs: claude -p "Fix this bug: {issue body}"
    |   |- BMAD quick-spec: scope the fix
    |   |- TDD: write failing test -> implement fix -> verify
    |   |- Quality gate: lint + typecheck + build + test
    |- Creates PR with the fix
    |- Tests pass -> auto-merge
    |- Deploys affected service(s) via Railway CLI
    |- Comments on GitHub issue: "Deployed"
    |- Sends webhook to Discord bot
    |
    v
Discord Bot receives webhook
    |- Posts in thread: "Fix deployed to production. Please retest."
```

## Components

| Component | Tech | Hosted On | Purpose |
|---|---|---|---|
| Discord Bot | Node.js + discord.js + Express | Railway (new service) | Monitor #bugs, create issues, receive webhooks |
| GitHub Action | `.github/workflows/discord-bug-fix.yml` | GitHub (free tier) | Run Claude Code, create PR, deploy |
| Webhook endpoint | Express route in Discord bot | Same Railway service | Receive deploy notifications from GH Actions |

## Discord Server Structure

- **Server name:** SideDecked Testers
- **Single channel:** `#bugs` — testers post here, all updates happen in threads under original messages
- Bot creates a thread per bug report for status updates

## GitHub Actions Workflow

**Trigger:** `issues.opened` with label `discord-bug`

**Environment:**
- Ubuntu runner
- Node.js 20
- Claude Code CLI (installed via npm)
- Railway CLI (installed via npm)

**Secrets required:**
- `ANTHROPIC_API_KEY` — Claude Code authentication
- `RAILWAY_TOKEN` — production deployment
- `DISCORD_WEBHOOK_URL` — notify bot of completion
- `GITHUB_TOKEN` — automatic (used for PR creation + auto-merge)

**Claude Code prompt template:**
```
You are fixing a bug reported by a tester. Here is their report:

{issue_body}

Instructions:
1. Analyze the bug report and any screenshots
2. Identify which service is affected (backend, customer-backend, storefront, vendorpanel)
3. Search the codebase for the relevant code
4. Write a failing test that reproduces the bug
5. Implement the minimal fix
6. Run the quality gate: npm run lint && npm run typecheck && npm run build && npm test
7. If the gate passes, commit with message: fix(scope): description
8. If the gate fails, retry once. If it still fails, report failure.
```

**Timeout:** 30 minutes

**Auto-merge:** PR created with `--auto` flag, merges when status checks pass.

## Failure Handling

| Failure | Action |
|---|---|
| Claude Code can't identify the bug | Label issue `needs-human`, notify Discord |
| Tests fail after fix attempt | Retry once, then label `needs-human`, notify Discord |
| Deploy fails | Label issue `deploy-failed`, notify Discord with error |
| Timeout (30 min) | Label issue `needs-human`, notify Discord |

Discord notification for failures: "Could not auto-fix this bug. A developer will look into it."

## Security Considerations

- Discord bot token stored as Railway env var (never in code)
- Anthropic API key as GitHub secret
- Railway token as GitHub secret (scoped to deploy only)
- Claude Code runs with restricted tool permissions (no destructive git ops)
- Webhook endpoint validates shared secret header (`X-Webhook-Secret`) on incoming requests
- Bot only monitors one specific channel (not all server messages)

## Cost Estimates

- **Discord Bot hosting:** ~$5/month on Railway (minimal resource usage)
- **Claude Code API:** ~$0.50-$2.00 per bug fix (depends on complexity)
- **GitHub Actions:** Free tier (2,000 min/month)
- **Railway deploy:** Already included in existing plan

## Future Enhancements (not in scope)

- Structured `/bug` slash command with modal form
- Duplicate bug detection
- Priority classification (P0-P3)
- Tester can confirm/reject the fix via Discord reactions
- Metrics dashboard (mean time to fix, success rate)
