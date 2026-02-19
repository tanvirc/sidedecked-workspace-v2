import { Request, Response } from "express";
import { Client, TextChannel } from "discord.js";
import { config } from "./config.js";
import { issueThreadMap } from "./index.js";

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

  const { issue_number, status, message, commit_sha } = req.body;

  const threadId = issueThreadMap.get(issue_number);
  if (!threadId) {
    res.status(404).json({ error: "Thread not found for issue" });
    return;
  }

  try {
    const channel = (await discordClient.channels.fetch(
      config.channelId
    )) as TextChannel;
    const thread =
      channel.threads.cache.get(threadId) ??
      (await channel.threads.fetch(threadId).then((t) => t));

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
