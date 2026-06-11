import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const token = request.headers.get("x-github-token") || undefined;

  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  }

  try {
    const octokit = createOctokit(token);
    const contributors: unknown[] = [];
    let page = 1;

    while (true) {
      const { data } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100,
        page,
      });
      if (!Array.isArray(data) || data.length === 0) break;
      contributors.push(...data);
      if (data.length < 100) break;
      page++;
    }

    return NextResponse.json(contributors, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
