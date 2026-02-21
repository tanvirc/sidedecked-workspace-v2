import { timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";
import { TextChannel } from "discord.js";
import { config } from "./config.js";
import { getGitHubIssueBody } from "./github.js";
import { issueThreadMap, getDiscordClient } from "./state.js";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

interface WebhookBody {
  issue_number: number;
  status: "success" | "failure";
  message?: string;
  commit_sha?: string;
  pr_urls?: string;
}

function isValidWebhookBody(body: unknown): body is WebhookBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.issue_number === "number" &&
    (b.status === "success" || b.status === "failure")
  );
}

function extractThreadIdFromIssueBody(body: string): string | undefined {
  const match = body.match(/discord\.com\/channels\/\d+\/(\d+)/);
  return match?.[1];
}

export async function handleWebhook(req: Request, res: Response) {
  const secret = req.headers["x-webhook-secret"];
  if (typeof secret !== "string" || !safeCompare(secret, config.webhookSecret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isValidWebhookBody(req.body)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { issue_number, status, message, commit_sha, pr_urls } = req.body;

  let threadId = issueThreadMap.get(issue_number);
  if (!threadId) {
    try {
      const issueBody = await getGitHubIssueBody(issue_number);
      threadId = extractThreadIdFromIssueBody(issueBody);
      if (threadId) {
        issueThreadMap.set(issue_number, threadId);
      }
    } catch {
      // GitHub API failure — fall through to 404
    }
  }

  if (!threadId) {
    res.status(404).json({ error: "Thread not found for issue" });
    return;
  }

  let discordClient: ReturnType<typeof getDiscordClient>;
  try {
    discordClient = getDiscordClient();
  } catch {
    res.status(503).json({ error: "Discord client not ready" });
    return;
  }

  try {
    const channel = (await discordClient.channels.fetch(
      config.channelId
    )) as TextChannel;
    const thread =
      channel.threads.cache.get(threadId) ??
      (await channel.threads.fetch(threadId));

    if (!thread || !("send" in thread)) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

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
    } else {
      await thread.send(
        message || "Could not auto-fix this bug. A developer will look into it."
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
