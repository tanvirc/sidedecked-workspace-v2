import { Client } from "discord.js";

// Track thread IDs mapped to issue numbers for webhook replies
export const issueThreadMap = new Map<number, string>();

let discordClient: Client | null = null;

export function setDiscordClient(client: Client) {
  discordClient = client;
}

export function getDiscordClient(): Client {
  if (!discordClient) {
    throw new Error("Discord client not initialized — bot is still starting up");
  }
  return discordClient;
}
