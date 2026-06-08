import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const login = request.nextUrl.searchParams.get("login");
  const token = request.headers.get("x-github-token") || undefined;

  if (!login) return NextResponse.json({ error: "login required" }, { status: 400 });

  try {
    const octokit = createOctokit(token);
    const [{ data: user }, { data: repos }] = await Promise.all([
      octokit.users.getByUsername({ username: login }),
      octokit.repos.listForUser({ username: login, sort: "updated", per_page: 6, type: "owner" }),
    ]);
    return NextResponse.json({ user, repos });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500;
    const message = (error as { message?: string }).message ?? "GitHub API error";
    return NextResponse.json({ error: message }, { status });
  }
}
