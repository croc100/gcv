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

    // GitHub may return 202 while computing stats — retry up to 3 times
    let data;
    for (let i = 0; i < 3; i++) {
      const res = await octokit.repos.getContributorsStats({ owner, repo });
      if (res.status === 200) {
        data = res.data;
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Stats not ready, try again" }, { status: 503 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
