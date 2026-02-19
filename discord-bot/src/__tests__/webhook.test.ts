import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockIssueThreadMap = new Map<number, string>();
const mockGetDiscordClient = vi.fn();

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
    const res = await request(app).post("/webhook").send({ issue_number: 1 });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("rejects requests with wrong secret", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "wrong-secret")
      .send({ issue_number: 1 });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 404 when issue thread is not found", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/webhook")
      .set("x-webhook-secret", "test-secret")
      .send({ issue_number: 999 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Thread not found for issue" });
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

  it("sends failure message to Discord thread", async () => {
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
        message: "Build failed",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining("Build failed")
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
});
