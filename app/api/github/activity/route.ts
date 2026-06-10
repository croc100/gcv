import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const login = searchParams.get("login");
  const token = request.headers.get("x-github-token") || undefined;

  if (!owner || !repo || !login) {
    return NextResponse.json({ error: "owner, repo, login required" }, { status: 400 });
  }

  try {
    const octokit = createOctokit(token);
    const q = `repo:${owner}/${repo} author:${login}`;

    const [prsRes, issuesRes] = await Promise.all([
      octokit.search.issuesAndPullRequests({ q: `${q} is:pr`, per_page: 1 }),
      octokit.search.issuesAndPullRequests({ q: `${q} is:issue`, per_page: 1 }),
    ]);

    return NextResponse.json({
      prs: prsRes.data.total_count,
      issues: issuesRes.data.total_count,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
