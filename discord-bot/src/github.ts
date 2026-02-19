import { Octokit } from "@octokit/rest";
import { config } from "./config.js";

const octokit = new Octokit({ auth: config.githubToken });

export async function createGitHubIssue(body: string) {
  const { data } = await octokit.issues.create({
    owner: config.githubOwner,
    repo: config.githubRepo,
    title: `[Discord Bug] ${body.slice(0, 80).replace(/\n/g, " ")}`,
    body,
    labels: ["discord-bug"],
  });
  return data;
}

export async function getGitHubIssueBody(
  issueNumber: number
): Promise<string> {
  const { data } = await octokit.issues.get({
    owner: config.githubOwner,
    repo: config.githubRepo,
    issue_number: issueNumber,
  });
  return data.body ?? "";
}
