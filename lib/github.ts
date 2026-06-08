import { Octokit } from "@octokit/rest";

export function createOctokit(token?: string) {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
}

export type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export type WeeklyStats = {
  week: number;
  author: string;
  total: number;
};
