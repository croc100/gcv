import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export const revalidate = 3600; // cache 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lang = searchParams.get("lang") ?? "";
  const token = request.headers.get("x-github-token") || undefined;

  try {
    const octokit = createOctokit(token);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const q = [`pushed:>${since}`, "stars:>100", lang ? `language:${lang}` : ""].filter(Boolean).join(" ");

    const res = await octokit.search.repos({ q, sort: "stars", order: "desc", per_page: 30 });

    const repos = res.data.items.map((r) => ({
      id: r.id,
      full_name: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      open_issues: r.open_issues_count,
      pushed_at: r.pushed_at,
      html_url: r.html_url,
      topics: r.topics?.slice(0, 3) ?? [],
    }));

    return NextResponse.json({ repos });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
