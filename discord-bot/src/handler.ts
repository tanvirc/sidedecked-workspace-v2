import { Message, TextChannel } from "discord.js";
import { config } from "./config.js";
import { createGitHubIssue } from "./github.js";
import { issueThreadMap } from "./state.js";

export async function handleBugReport(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (message.channelId !== config.channelId) return;

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
}
