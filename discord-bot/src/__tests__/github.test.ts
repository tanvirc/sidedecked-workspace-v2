import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockGet = vi.fn();

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    issues: { create: mockCreate, get: mockGet },
  })),
}));

vi.mock("../config.js", () => ({
  config: {
    githubToken: "fake-token",
    githubOwner: "test-owner",
    githubRepo: "test-repo",
  },
}));

const { createGitHubIssue, getGitHubIssueBody } = await import("../github.js");

describe("createGitHubIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls octokit.issues.create with correct parameters", async () => {
    const fakeIssue = { number: 42, html_url: "https://github.com/test/42" };
    mockCreate.mockResolvedValue({ data: fakeIssue });

    const body = "Something is broken in the login flow";
    const result = await createGitHubIssue(body);

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      title: `[Discord Bug] ${body.slice(0, 80)}`,
      body,
      labels: ["discord-bug"],
    });
    expect(result).toEqual(fakeIssue);
  });

  it("truncates title to 80 characters and replaces newlines", async () => {
    const longBody = "Line one\nLine two " + "x".repeat(100);
    const fakeIssue = { number: 1, html_url: "https://github.com/test/1" };
    mockCreate.mockResolvedValue({ data: fakeIssue });

    await createGitHubIssue(longBody);

    const call = mockCreate.mock.calls[0][0];
    const expectedTitle = `[Discord Bug] ${longBody.slice(0, 80).replace(/\n/g, " ")}`;
    expect(call.title).toBe(expectedTitle);
    expect(call.title).not.toContain("\n");
  });

  it("returns issue data from the API response", async () => {
    const fakeIssue = {
      number: 99,
      html_url: "https://github.com/test-owner/test-repo/issues/99",
      title: "[Discord Bug] test",
    };
    mockCreate.mockResolvedValue({ data: fakeIssue });

    const result = await createGitHubIssue("test");
    expect(result).toBe(fakeIssue);
  });

  it("propagates errors from Octokit", async () => {
    mockCreate.mockRejectedValue(new Error("GitHub API error"));

    await expect(createGitHubIssue("fail")).rejects.toThrow("GitHub API error");
  });
});

describe("getGitHubIssueBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the issue body from GitHub API", async () => {
    mockGet.mockResolvedValue({
      data: { body: "Bug report content here" },
    });

    const result = await getGitHubIssueBody(42);

    expect(mockGet).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      issue_number: 42,
    });
    expect(result).toBe("Bug report content here");
  });

  it("returns empty string when issue body is null", async () => {
    mockGet.mockResolvedValue({
      data: { body: null },
    });

    const result = await getGitHubIssueBody(1);
    expect(result).toBe("");
  });

  it("propagates errors from Octokit", async () => {
    mockGet.mockRejectedValue(new Error("Not found"));

    await expect(getGitHubIssueBody(999)).rejects.toThrow("Not found");
  });
});
