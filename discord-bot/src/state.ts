import { Client } from "discord.js";

// Track thread IDs mapped to issue numbers for webhook replies
export const issueThreadMap = new Map<number, string>();

let discordClient: Client;

export function setDiscordClient(client: Client) {
  discordClient = client;
}

export function getDiscordClient(): Client {
  return discordClient;
}
