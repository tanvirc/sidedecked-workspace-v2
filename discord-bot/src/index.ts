import {
  Client,
  GatewayIntentBits,
  Events,
  TextChannel,
  Message,
} from "discord.js";
import express from "express";
import { config } from "./config.js";
import { createGitHubIssue } from "./github.js";
import { handleWebhook, setDiscordClient } from "./webhook.js";

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
  setDiscordClient(c);
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
      issueBody += imageUrls
        .map((url, i) => `![screenshot-${i + 1}](${url})`)
        .join("\n");
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
