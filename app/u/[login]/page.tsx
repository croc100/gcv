"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF",
  PHP: "#4F5D95", Shell: "#89e051", Dart: "#00B4AB", Vue: "#41b883",
  CSS: "#563d7c", HTML: "#e34c26",
};

type User = {
  login: string; name: string | null; avatar_url: string; bio: string | null;
  html_url: string; followers: number; following: number; public_repos: number;
  location: string | null; company: string | null; blog: string | null; created_at: string;
};
type ActiveRepo = { name: string; full_name: string; pushes: number; prs: number; issues: number; lastActive: string };
type WeeklyActivity = { week: string; commits: number };
type LangStat = { lang: string; count: number };

export default function UserProfilePage() {
  const params = useParams();
  const login = params.login as string;

  const [user, setUser] = useState<User | null>(null);
  const [activeRepos, setActiveRepos] = useState<ActiveRepo[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [languages, setLanguages] = useState<LangStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("github_token") ?? "";
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;
      const res = await fetch(`/api/github/profile?login=${login}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load profile");
      setUser(data.user);
      setActiveRepos(data.activeRepos);
      setWeeklyActivity(data.weeklyActivity);
      setLanguages(data.languages);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const totalCommits = weeklyActivity.reduce((s, w) => s + w.commits, 0);
  const maxWeekCommits = Math.max(...weeklyActivity.map((w) => w.commits), 1);
  const totalLangs = languages.reduce((s, l) => s + l.count, 0);

  const memberSince = user ? new Date(user.created_at).getFullYear() : null;

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <p className="text-sm text-[#484f58]">Contributor profile</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#7d8590]">Loading profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm">{error}</div>
        )}

        {!loading && !error && user && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">

            {/* Left sidebar — profile */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={80}
                    height={80}
                    className="rounded-full ring-2 ring-[#30363d]"
                  />
                  <div>
                    {user.name && <p className="font-bold text-[#e6edf3] text-lg leading-tight">{user.name}</p>}
                    <p className="text-sm text-[#7d8590]">@{user.login}</p>
                  </div>
                  {user.bio && <p className="text-xs text-[#7d8590] leading-relaxed">{user.bio}</p>}
                  <div className="flex gap-2 w-full">
                    <Link
                      href={`/wrapped/${user.login}`}
                      className="flex-1 py-1.5 text-xs text-center border border-[#9e6a03] rounded-lg text-[#d29922] hover:bg-[#9e6a0320] transition-colors"
                    >
                      🎁 Wrapped
                    </Link>
                    <a
                      href={user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 text-xs text-center border border-[#30363d] rounded-lg text-[#7d8590] hover:border-[#388bfd] hover:text-[#e6edf3] transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#21262d] flex flex-col gap-2">
                  {user.location && (
                    <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {user.location}
                    </div>
                  )}
                  {user.company && (
                    <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {user.company}
                    </div>
                  )}
                  {memberSince && (
                    <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Member since {memberSince}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#21262d] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-semibold text-[#e6edf3]">{user.followers.toLocaleString()}</p>
                    <p className="text-[10px] text-[#484f58]">followers</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e6edf3]">{user.following.toLocaleString()}</p>
                    <p className="text-[10px] text-[#484f58]">following</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e6edf3]">{user.public_repos.toLocaleString()}</p>
                    <p className="text-[10px] text-[#484f58]">repos</p>
                  </div>
                </div>
              </div>

              {/* Language breakdown */}
              {languages.length > 0 && (
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                  <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-3">Top languages</p>
                  {/* Stacked bar */}
                  <div className="flex h-2 rounded-full overflow-hidden mb-3 gap-px">
                    {languages.map(({ lang, count }) => (
                      <div
                        key={lang}
                        style={{ width: `${(count / totalLangs) * 100}%`, background: LANG_COLORS[lang] ?? "#7d8590" }}
                        title={lang}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {languages.map(({ lang, count }) => (
                      <div key={lang} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: LANG_COLORS[lang] ?? "#7d8590" }} />
                        <span className="text-xs text-[#7d8590] flex-1">{lang}</span>
                        <span className="text-[10px] text-[#484f58]">{Math.round((count / totalLangs) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — activity */}
            <div className="flex flex-col gap-4">

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] px-4 py-3">
                  <p className="text-xs text-[#7d8590]">Commits (90d)</p>
                  <p className="text-2xl font-bold text-[#e6edf3] tabular-nums">{totalCommits.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] px-4 py-3">
                  <p className="text-xs text-[#7d8590]">Active repos</p>
                  <p className="text-2xl font-bold text-[#e6edf3] tabular-nums">{activeRepos.length}</p>
                </div>
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] px-4 py-3">
                  <p className="text-xs text-[#7d8590]">PRs opened</p>
                  <p className="text-2xl font-bold text-[#e6edf3] tabular-nums">
                    {activeRepos.reduce((s, r) => s + r.prs, 0)}
                  </p>
                </div>
              </div>

              {/* Weekly activity sparkline */}
              {weeklyActivity.length > 0 && (
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                  <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-3">
                    Commit activity — last 90 days
                  </p>
                  <div className="flex items-end gap-1 h-16">
                    {weeklyActivity.map(({ week, commits }) => (
                      <div
                        key={week}
                        className="flex-1 rounded-sm min-w-[4px] transition-all"
                        style={{
                          height: `${(commits / maxWeekCommits) * 100}%`,
                          background: commits > 0 ? "#388bfd" : "#21262d",
                          minHeight: commits > 0 ? 3 : 2,
                        }}
                        title={`${week}: ${commits} commits`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active repos */}
              {activeRepos.length > 0 && (
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                  <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-3">
                    Recently active repos
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {activeRepos.map((r) => (
                      <Link
                        key={r.full_name}
                        href={`/${r.full_name}`}
                        className="group flex items-center gap-3 p-2.5 rounded-lg border border-[#21262d] hover:border-[#388bfd] hover:bg-[#1c2128] transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
                            {r.full_name}
                          </p>
                          <p className="text-[10px] text-[#484f58] mt-0.5">
                            {new Date(r.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#484f58]">
                          {r.pushes > 0 && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="#57ab5a">
                                <path d="M1.643 3.143L.427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z" />
                              </svg>
                              {r.pushes}
                            </span>
                          )}
                          {r.prs > 0 && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="#388bfd">
                                <path d="M7.177 3.073L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
                              </svg>
                              {r.prs} PR
                            </span>
                          )}
                          {r.issues > 0 && (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="#da3633">
                                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                              </svg>
                              {r.issues}
                            </span>
                          )}
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#30363d] group-hover:text-[#484f58]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
