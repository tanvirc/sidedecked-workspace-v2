import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Message, TextChannel, Attachment } from "discord.js";
import { Collection } from "discord.js";

const mockIssueThreadMap = new Map<number, string>();

vi.mock("../config.js", () => ({
  config: {
    channelId: "bugs-channel-123",
  },
}));

vi.mock("../github.js", () => ({
  createGitHubIssue: vi.fn(),
}));

vi.mock("../state.js", () => ({
  issueThreadMap: mockIssueThreadMap,
}));

const { handleBugReport } = await import("../handler.js");
const { createGitHubIssue } = await import("../github.js");
const mockCreateGitHubIssue = vi.mocked(createGitHubIssue);

function createMockAttachments(
  items: Array<{ contentType: string | null; url: string }>
): Collection<string, Attachment> {
  const col = new Collection<string, Attachment>();
  items.forEach((item, i) => {
    col.set(`att-${i}`, item as unknown as Attachment);
  });
  return col;
}

function createMockMessage(overrides: Partial<{
  bot: boolean;
  channelId: string;
  content: string;
  attachments: Array<{ contentType: string | null; url: string }>;
}>): Message {
  const threadSend = vi.fn().mockResolvedValue(undefined);
  const mockThread = {
    send: threadSend,
    id: "111222333444555666",
    url: "https://discord.com/channels/100200300400/111222333444555666",
  };

  const threadsCreate = vi.fn().mockResolvedValue(mockThread);

  return {
    author: { bot: overrides.bot ?? false },
    channelId: overrides.channelId ?? "bugs-channel-123",
    content: overrides.content ?? "Login button is broken",
    channel: {
      threads: { create: threadsCreate },
    } as unknown as TextChannel,
    react: vi.fn().mockResolvedValue(undefined),
    attachments: createMockAttachments(overrides.attachments ?? []),
  } as unknown as Message;
}

describe("handleBugReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIssueThreadMap.clear();
    mockCreateGitHubIssue.mockResolvedValue({
      number: 42,
      html_url: "https://github.com/test/issues/42",
    } as ReturnType<typeof createGitHubIssue> extends Promise<infer T> ? T : never);
  });

  it("skips messages from bots", async () => {
    const msg = createMockMessage({ bot: true });
    await handleBugReport(msg);
    expect(msg.react).not.toHaveBeenCalled();
  });

  it("skips messages from wrong channel", async () => {
    const msg = createMockMessage({ channelId: "other-channel" });
    await handleBugReport(msg);
    expect(msg.react).not.toHaveBeenCalled();
  });

  it("reacts with magnifying glass emoji", async () => {
    const msg = createMockMessage({});
    await handleBugReport(msg);
    expect(msg.react).toHaveBeenCalledWith("\uD83D\uDD0D");
  });

  it("creates a thread with truncated bug report name", async () => {
    const longContent = "A".repeat(100);
    const msg = createMockMessage({ content: longContent });
    await handleBugReport(msg);

    const threadsCreate = (msg.channel as TextChannel).threads.create;
    expect(threadsCreate).toHaveBeenCalledWith({
      name: `Bug Report — ${longContent.slice(0, 50)}`,
      startMessage: msg,
    });
  });

  it("creates GitHub issue with message content and thread URL", async () => {
    const msg = createMockMessage({ content: "Cart page crashes" });
    await handleBugReport(msg);

    expect(mockCreateGitHubIssue).toHaveBeenCalledOnce();
    const body = mockCreateGitHubIssue.mock.calls[0][0];
    expect(body).toContain("Cart page crashes");
    expect(body).toContain("discord.com/channels/100200300400/111222333444555666");
  });

  it("includes image attachments in issue body", async () => {
    const msg = createMockMessage({
      content: "Bug with screenshot",
      attachments: [
        { contentType: "image/png", url: "https://cdn.discord.com/img1.png" },
        { contentType: "image/jpeg", url: "https://cdn.discord.com/img2.jpg" },
      ],
    });
    await handleBugReport(msg);

    const body = mockCreateGitHubIssue.mock.calls[0][0];
    expect(body).toContain("**Screenshots:**");
    expect(body).toContain("![screenshot-1](https://cdn.discord.com/img1.png)");
    expect(body).toContain("![screenshot-2](https://cdn.discord.com/img2.jpg)");
  });

  it("excludes non-image attachments", async () => {
    const msg = createMockMessage({
      content: "Bug with file",
      attachments: [
        { contentType: "application/pdf", url: "https://cdn.discord.com/doc.pdf" },
      ],
    });
    await handleBugReport(msg);

    const body = mockCreateGitHubIssue.mock.calls[0][0];
    expect(body).not.toContain("**Screenshots:**");
    expect(body).not.toContain("doc.pdf");
  });

  it("stores issue-to-thread mapping in state", async () => {
    const msg = createMockMessage({});
    await handleBugReport(msg);
    expect(mockIssueThreadMap.get(42)).toBe("111222333444555666");
  });

  it("sends confirmation message with issue link", async () => {
    const msg = createMockMessage({});
    await handleBugReport(msg);

    // The thread.send is called twice: investigating + confirmation
    const thread = await (msg.channel as TextChannel).threads.create({} as never);
    expect(thread.send).toHaveBeenCalledTimes(2);
    expect(thread.send).toHaveBeenLastCalledWith(
      expect.stringContaining("Issue #42")
    );
  });
});
