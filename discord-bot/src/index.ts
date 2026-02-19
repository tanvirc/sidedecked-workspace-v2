import {
  Client,
  GatewayIntentBits,
  Events,
  Message,
} from "discord.js";
import express from "express";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { handleWebhook } from "./webhook.js";
import { handleBugReport } from "./handler.js";
import { setDiscordClient } from "./state.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot ready as ${c.user.tag}`);
  setDiscordClient(c);
});

client.on(Events.MessageCreate, async (message: Message) => {
  try {
    await handleBugReport(message);
  } catch (err) {
    console.error("Failed to process bug report:", err);
  }
});

// Express server for incoming webhooks from GitHub Actions
const app = express();
app.use(express.json());

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.post("/webhook", webhookLimiter, handleWebhook);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  console.log(`Webhook server listening on port ${config.port}`);
});

client.login(config.discordToken);
