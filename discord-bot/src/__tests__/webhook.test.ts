import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockIssueThreadMap = new Map<number, string>();
const mockGetDiscordClient = vi.fn();
const mockGetGitHubIssueBody = vi.fn();

vi.mock("../config.js", () => ({
  config: {
    webhookSecret: "test-secret",
    channelId: "channel-123",
  },
}));

vi.mock("../state.js", () => ({
  issueThreadMap: mockIssueThreadMap,
  getDiscordClient: mockGetDiscordClient,
}));

vi.mock("../github.js", () => ({
  getGitHubIssueBody: (...args: unknown[]) => mockGetGitHubIssueBody(...args),
}));

const { handleWebhook } = await import("../webhook.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/webhook", handleWebhook);
  return app;
}

describe("handleWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIssueThreadMap.clear();
  });

  it("rejects requests with missing secret", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .send({ issue_number: 1, status: "success" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with wrong secret", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "wrong-secret")
      .send({ issue_number: 1, status: "success" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with invalid body (missing issue_number)", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ status: "success" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request body" });
  });

  it("rejects requests with invalid body (bad status value)", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 1, status: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request body" });
  });

  it("returns 503 when Discord client is not initialized", async () => {
    mockIssueThreadMap.set(1, "thread-123");
    mockGetDiscordClient.mockImplementation(() => {
      throw new Error("Discord client not initialized");
    });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 1, status: "success" });

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: "Discord client not ready" });
  });

  it("returns 404 when issue thread is not in map and not in issue body", async () => {
    mockGetGitHubIssueBody.mockResolvedValue("No thread URL here");

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 999, status: "success" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Thread not found for issue" });
  });

  it("falls back to GitHub issue body when thread not in map", async () => {
    mockGetGitHubIssueBody.mockResolvedValue(
      "Bug report\n\n---\n_Discord thread: https://discord.com/channels/100200300400/999888777666555_"
    );

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["999888777666555", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 42, status: "success", commit_sha: "abc123" });

    expect(res.status).toBe(200);
    expect(mockGetGitHubIssueBody).toHaveBeenCalledWith(42);
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockIssueThreadMap.get(42)).toBe("999888777666555");
  });

  it("sends success message to Discord thread", async () => {
    mockIssueThreadMap.set(42, "thread-abc");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["thread-abc", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 42,
        status: "success",
        commit_sha: "abc1234",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith("channel-123");
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining("abc1234")
    );
  });

  it("sends success message with PR URLs when provided", async () => {
    mockIssueThreadMap.set(42, "thread-abc");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["thread-abc", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 42,
        status: "success",
        pr_urls: "- storefront: https://github.com/tanvirc/sidedecked-storefront/pull/5\n- backend: https://github.com/tanvirc/sidedecked-backend/pull/3",
      });

    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining("sidedecked-storefront/pull/5")
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining("sidedecked-backend/pull/3")
    );
  });

  it("still supports legacy commit_sha success format", async () => {
    mockIssueThreadMap.set(42, "thread-abc");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["thread-abc", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 42,
        status: "success",
        commit_sha: "abc1234",
      });

    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining("abc1234")
    );
  });

  it("sends custom failure message when provided", async () => {
    mockIssueThreadMap.set(42, "thread-abc");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["thread-abc", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 42,
        status: "failure",
        message: "Reviewed — no code changes needed. See the GitHub issue for details.",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      "Reviewed — no code changes needed. See the GitHub issue for details."
    );
  });

  it("sends default failure message when no message provided", async () => {
    mockIssueThreadMap.set(7, "thread-xyz");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const mockThreadsCache = new Map([["thread-xyz", mockThread]]);
    const mockChannel = { threads: { cache: mockThreadsCache } };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 7,
        status: "failure",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      "Could not auto-fix this bug. A developer will look into it."
    );
  });

  it("fetches thread from API when not in cache", async () => {
    mockIssueThreadMap.set(10, "thread-fetched");

    const mockSend = vi.fn().mockResolvedValue(undefined);
    const mockThread = { send: mockSend };
    const emptyCache = new Map();
    const mockThreadsFetch = vi.fn().mockResolvedValue(mockThread);
    const mockChannel = {
      threads: { cache: emptyCache, fetch: mockThreadsFetch },
    };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 10,
        status: "success",
        commit_sha: "def5678",
      });

    expect(res.status).toBe(200);
    expect(mockThreadsFetch).toHaveBeenCalledWith("thread-fetched");
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("returns 404 when thread fetch returns null", async () => {
    mockIssueThreadMap.set(11, "thread-gone");

    const emptyCache = new Map();
    const mockThreadsFetch = vi.fn().mockResolvedValue(null);
    const mockChannel = {
      threads: { cache: emptyCache, fetch: mockThreadsFetch },
    };
    const mockFetch = vi.fn().mockResolvedValue(mockChannel);

    mockGetDiscordClient.mockReturnValue({ channels: { fetch: mockFetch } });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 11,
        status: "success",
        commit_sha: "ghi9012",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Thread not found" });
  });

  it("returns 500 on internal error", async () => {
    mockIssueThreadMap.set(50, "thread-err");

    mockGetDiscordClient.mockReturnValue({
      channels: {
        fetch: vi.fn().mockRejectedValue(new Error("Discord API down")),
      },
    });

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({
        issue_number: 50,
        status: "success",
        commit_sha: "jkl3456",
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal error" });
  });

  it("handles GitHub API failure during fallback gracefully", async () => {
    mockGetGitHubIssueBody.mockRejectedValue(new Error("GitHub API error"));

    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 99, status: "success" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Thread not found for issue" });
  });
});
