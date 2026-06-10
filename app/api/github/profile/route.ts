import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const login = searchParams.get("login");
  const token = request.headers.get("x-github-token") || undefined;

  if (!login) return NextResponse.json({ error: "login required" }, { status: 400 });

  try {
    const octokit = createOctokit(token);

    // Fetch user profile + events in parallel
    const [userRes, eventsRes] = await Promise.all([
      octokit.users.getByUsername({ username: login }),
      octokit.activity.listPublicEventsForUser({ username: login, per_page: 100 }),
    ]);

    const user = userRes.data;

    // Aggregate repo activity from events
    const repoMap = new Map<string, {
      name: string;
      full_name: string;
      pushes: number;
      prs: number;
      issues: number;
      lastActive: string;
    }>();

    for (const event of eventsRes.data) {
      const repoName = event.repo.name;
      if (!repoMap.has(repoName)) {
        repoMap.set(repoName, {
          name: repoName.split("/")[1],
          full_name: repoName,
          pushes: 0,
          prs: 0,
          issues: 0,
          lastActive: event.created_at ?? "",
        });
      }
      const entry = repoMap.get(repoName)!;
      if (event.type === "PushEvent") entry.pushes++;
      else if (event.type === "PullRequestEvent") entry.prs++;
      else if (event.type === "IssuesEvent") entry.issues++;
      if ((event.created_at ?? "") > entry.lastActive) entry.lastActive = event.created_at ?? "";
    }

    // Weekly activity from push events
    const weeklyMap = new Map<string, number>();
    for (const event of eventsRes.data) {
      if (event.type !== "PushEvent") continue;
      const d = new Date(event.created_at ?? "");
      // Round to start of week (Sunday)
      d.setUTCDate(d.getUTCDate() - d.getUTCDay());
      const key = d.toISOString().slice(0, 10);
      // Use payload.size for actual commit count — commits array is capped at 20 by GitHub
      const commits = (event.payload as { size?: number; commits?: unknown[] }).size ?? 1;
      weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + commits);
    }

    const weeklyActivity = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, commits]) => ({ week, commits }));

    // Language breakdown from own repos
    const reposRes = await octokit.repos.listForUser({
      username: login,
      sort: "pushed",
      per_page: 50,
      type: "owner",
    });

    const langMap = new Map<string, number>();
    for (const r of reposRes.data) {
      if (r.language) langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1);
    }
    const languages = Array.from(langMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([lang, count]) => ({ lang, count }));

    const activeRepos = Array.from(repoMap.values())
      .sort((a, b) => b.pushes + b.prs + b.issues - (a.pushes + a.prs + a.issues))
      .slice(0, 20);

    return NextResponse.json({
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        html_url: user.html_url,
        followers: user.followers,
        following: user.following,
        public_repos: user.public_repos,
        location: user.location,
        company: user.company,
        blog: user.blog,
        created_at: user.created_at,
      },
      activeRepos,
      weeklyActivity,
      languages,
      totalEvents: eventsRes.data.length,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
