import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const org = searchParams.get("org");
  const token = request.headers.get("x-github-token") || undefined;

  if (!org) return NextResponse.json({ error: "org required" }, { status: 400 });

  try {
    const octokit = createOctokit(token);

    // Fetch top 30 repos by stars
    const reposRes = await octokit.repos.listForOrg({
      org,
      type: "public",
      sort: "pushed",
      direction: "desc",
      per_page: 30,
    });

    const repos = reposRes.data.map((r) => ({
      name: r.name,
      full_name: r.full_name,
      stars: r.stargazers_count,
      description: r.description,
      language: r.language,
    }));

    // Fetch contributors for each repo in parallel (top 100 per repo)
    const results = await Promise.allSettled(
      repos.map((r) =>
        octokit.repos.listContributors({
          owner: org,
          repo: r.name,
          per_page: 100,
          anon: "false",
        }).then((res) => ({ repo: r.name, contributors: res.data }))
      )
    );

    // Aggregate across all repos
    const totals = new Map<string, { commits: number; repos: Set<string>; avatar_url: string; html_url: string }>();

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { repo, contributors } = result.value;
      for (const c of contributors) {
        if (!c.login || c.type === "Anonymous") continue;
        const existing = totals.get(c.login);
        if (existing) {
          existing.commits += c.contributions;
          existing.repos.add(repo);
        } else {
          totals.set(c.login, {
            commits: c.contributions,
            repos: new Set([repo]),
            avatar_url: c.avatar_url ?? "",
            html_url: c.html_url ?? `https://github.com/${c.login}`,
          });
        }
      }
    }

    const contributors = Array.from(totals.entries())
      .map(([login, data]) => ({
        login,
        commits: data.commits,
        repos: data.repos.size,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
      }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 100);

    return NextResponse.json({ repos, contributors, repoCount: repos.length });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
