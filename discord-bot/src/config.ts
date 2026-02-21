function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  discordToken: requireEnv("DISCORD_BOT_TOKEN"),
  channelId: requireEnv("DISCORD_CHANNEL_ID"),
  githubToken: requireEnv("CROSS_REPO_TOKEN"),
  githubOwner: process.env.GITHUB_OWNER ?? "tanvirc",
  githubRepo: process.env.GITHUB_REPO ?? "sidedecked",
  webhookSecret: requireEnv("WEBHOOK_SECRET"),
  port: parseInt(process.env.PORT ?? "3001", 10),
};
