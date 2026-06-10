"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const COLOR_A = "#388bfd";
const COLOR_B = "#3fb950";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  Ruby: "#701516", Swift: "#F05138", Dart: "#00B4AB", Vue: "#41b883",
};

type UserProfile = {
  user: {
    login: string; name: string | null; avatar_url: string; bio: string | null;
    html_url: string; followers: number; following: number; public_repos: number;
    location: string | null; company: string | null; blog: string | null; created_at: string;
  };
  activeRepos: { full_name: string; pushes: number; prs: number; issues: number }[];
  weeklyActivity: { week: string; commits: number }[];
  languages: { lang: string; count: number }[];
  totalEvents: number;
};

function StatBar({ labelA, labelB, a, b, colorA = COLOR_A, colorB = COLOR_B }: {
  labelA: string; labelB: string; a: number; b: number; colorA?: string; colorB?: string;
}) {
  const total = a + b || 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span style={{ color: colorA }} className="font-mono truncate max-w-[40%]">{labelA}</span>
        <span style={{ color: colorB }} className="font-mono truncate max-w-[40%] text-right">{labelB}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-[#21262d]">
        <div className="transition-all duration-700" style={{ width: `${(a / total) * 100}%`, background: colorA }} />
        <div className="transition-all duration-700" style={{ width: `${(b / total) * 100}%`, background: colorB }} />
      </div>
    </div>
  );
}

function StatCard({ label, a, b, format = (v: number) => v.toLocaleString() }: {
  label: string; a: number; b: number; format?: (v: number) => string;
}) {
  const winnerA = a > b;
  const winnerB = b > a;
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
      <p className="text-[10px] text-[#484f58] uppercase tracking-widest">{label}</p>
      <div className="flex items-end justify-between gap-1">
        <span className={`text-xl font-bold tabular-nums ${winnerA ? "text-[#e6edf3]" : "text-[#484f58]"}`} style={winnerA ? { color: COLOR_A } : {}}>
          {format(a)}
        </span>
        <span className={`text-xl font-bold tabular-nums ${winnerB ? "text-[#e6edf3]" : "text-[#484f58]"}`} style={winnerB ? { color: COLOR_B } : {}}>
          {format(b)}
        </span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden bg-[#21262d]">
        <div style={{ width: `${(a / (a + b || 1)) * 100}%`, background: COLOR_A }} />
        <div style={{ width: `${(b / (a + b || 1)) * 100}%`, background: COLOR_B }} />
      </div>
    </div>
  );
}

export default function UserComparePage() {
  const params = useParams();
  const loginA = decodeURIComponent(params.a as string);
  const loginB = decodeURIComponent(params.b as string);

  const [dataA, setDataA] = useState<UserProfile | null>(null);
  const [dataB, setDataB] = useState<UserProfile | null>(null);
  const [loadingA, setLoadingA] = useState(true);
  const [loadingB, setLoadingB] = useState(true);
  const [errorA, setErrorA] = useState("");
  const [errorB, setErrorB] = useState("");

  const fetchProfile = useCallback(async (login: string, token: string) => {
    const headers: Record<string, string> = {};
    if (token) headers["x-github-token"] = token;
    const res = await fetch(`/api/github/profile?login=${login}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed");
    return json as UserProfile;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("github_token") ?? "";

    fetchProfile(loginA, token)
      .then((d) => setDataA(d))
      .catch((e) => setErrorA(e.message))
      .finally(() => setLoadingA(false));

    fetchProfile(loginB, token)
      .then((d) => setDataB(d))
      .catch((e) => setErrorB(e.message))
      .finally(() => setLoadingB(false));
  }, [loginA, loginB, fetchProfile]);

  const doneLoading = !loadingA && !loadingB;

  // Compute overlap stats
  const reposA = new Set(dataA?.activeRepos.map((r) => r.full_name) ?? []);
  const reposB = new Set(dataB?.activeRepos.map((r) => r.full_name) ?? []);
  const sharedRepos = Array.from(reposA).filter((r) => reposB.has(r));

  const langsA = new Set(dataA?.languages.map((l) => l.lang) ?? []);
  const langsB = new Set(dataB?.languages.map((l) => l.lang) ?? []);
  const sharedLangs = Array.from(langsA).filter((l) => langsB.has(l));

  const totalCommitsA = dataA?.weeklyActivity.reduce((s, w) => s + w.commits, 0) ?? 0;
  const totalCommitsB = dataB?.weeklyActivity.reduce((s, w) => s + w.commits, 0) ?? 0;
  const totalPRsA = dataA?.activeRepos.reduce((s, r) => s + r.prs, 0) ?? 0;
  const totalPRsB = dataB?.activeRepos.reduce((s, r) => s + r.prs, 0) ?? 0;

  // Merge weekly activity for sparkline
  const allWeeks = Array.from(
    new Set([
      ...(dataA?.weeklyActivity.map((w) => w.week) ?? []),
      ...(dataB?.weeklyActivity.map((w) => w.week) ?? []),
    ])
  ).sort();

  const maxWeekCommits = Math.max(
    ...(dataA?.weeklyActivity.map((w) => w.commits) ?? [0]),
    ...(dataB?.weeklyActivity.map((w) => w.commits) ?? [0]),
    1
  );

  const weekMapA = new Map(dataA?.weeklyActivity.map((w) => [w.week, w.commits]) ?? []);
  const weekMapB = new Map(dataB?.weeklyActivity.map((w) => [w.week, w.commits]) ?? []);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/compare" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-[#e6edf3]">Compare contributors</h1>
        </div>

        {/* Profile cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { login: loginA, data: dataA, loading: loadingA, error: errorA, color: COLOR_A },
            { login: loginB, data: dataB, loading: loadingB, error: errorB, color: COLOR_B },
          ].map(({ login, data, loading, error, color }) => (
            <div key={login} className="rounded-xl border bg-[#161b22] p-4" style={{ borderColor: color + "44" }}>
              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: color + " transparent transparent transparent" }} />
                  <span className="text-xs text-[#484f58]">Loading…</span>
                </div>
              ) : error ? (
                <p className="text-xs text-[#f85149] py-2">{error}</p>
              ) : data ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={data.user.avatar_url}
                      alt={data.user.login}
                      width={40}
                      height={40}
                      className="rounded-full ring-2"
                      style={{ ringColor: color } as React.CSSProperties}
                    />
                    <div className="min-w-0">
                      {data.user.name && <p className="text-sm font-semibold text-[#e6edf3] truncate">{data.user.name}</p>}
                      <a href={data.user.html_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                        @{data.user.login}
                      </a>
                    </div>
                  </div>
                  {data.user.bio && (
                    <p className="text-[11px] text-[#7d8590] line-clamp-2">{data.user.bio}</p>
                  )}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="text-[#484f58]">
                      <span className="text-[#e6edf3] font-semibold">{data.user.followers.toLocaleString()}</span> followers
                    </div>
                    <div className="text-[#484f58]">
                      <span className="text-[#e6edf3] font-semibold">{data.user.public_repos}</span> repos
                    </div>
                  </div>
                  {data.user.location && (
                    <p className="text-[10px] text-[#484f58] flex items-center gap-1">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      {data.user.location}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {doneLoading && dataA && dataB && (
          <>
            {/* Head-to-head stats */}
            <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">Head-to-head</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span style={{ color: COLOR_A }}>@{loginA}</span>
                  <span className="text-[#30363d]">vs</span>
                  <span style={{ color: COLOR_B }}>@{loginB}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Followers" a={dataA.user.followers} b={dataB.user.followers} />
                <StatCard label="Public repos" a={dataA.user.public_repos} b={dataB.user.public_repos} />
                <StatCard label="Following" a={dataA.user.following} b={dataB.user.following} />
                <StatCard label="Recent commits" a={totalCommitsA} b={totalCommitsB} />
                <StatCard label="Recent PRs" a={totalPRsA} b={totalPRsB} />
                <StatCard label="Active repos" a={dataA.activeRepos.length} b={dataB.activeRepos.length} />
              </div>
            </div>

            {/* Weekly activity sparklines */}
            {allWeeks.length > 0 && (
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-4">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Recent activity</p>
                <div className="flex items-end gap-px h-16">
                  {allWeeks.map((week) => {
                    const ca = weekMapA.get(week) ?? 0;
                    const cb = weekMapB.get(week) ?? 0;
                    const ha = (ca / maxWeekCommits) * 100;
                    const hb = (cb / maxWeekCommits) * 100;
                    return (
                      <div key={week} className="flex-1 flex flex-col justify-end gap-px" title={week}>
                        <div
                          className="rounded-sm opacity-70"
                          style={{ height: `${ha}%`, background: COLOR_A, minHeight: ca > 0 ? 2 : 0 }}
                        />
                        <div
                          className="rounded-sm opacity-70"
                          style={{ height: `${hb}%`, background: COLOR_B, minHeight: cb > 0 ? 2 : 0 }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-[#7d8590]">
                    <span className="w-2 h-2 rounded-sm" style={{ background: COLOR_A }} />
                    @{loginA}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#7d8590]">
                    <span className="w-2 h-2 rounded-sm" style={{ background: COLOR_B }} />
                    @{loginB}
                  </span>
                </div>
              </div>
            )}

            {/* Languages */}
            {(dataA.languages.length > 0 || dataB.languages.length > 0) && (
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">Languages</p>
                  {sharedLangs.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#3fb95040] text-[#3fb950] bg-[#3fb95010]">
                      {sharedLangs.length} in common
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { langs: dataA.languages, color: COLOR_A, login: loginA },
                    { langs: dataB.languages, color: COLOR_B, login: loginB },
                  ].map(({ langs, color, login }) => {
                    const total = langs.reduce((s, l) => s + l.count, 0) || 1;
                    return (
                      <div key={login}>
                        <p className="text-[10px] font-mono mb-2 truncate" style={{ color }}>@{login}</p>
                        <div className="flex h-1.5 rounded-full overflow-hidden mb-2">
                          {langs.map(({ lang, count }) => (
                            <div
                              key={lang}
                              style={{ width: `${(count / total) * 100}%`, background: LANG_COLORS[lang] ?? "#7d8590" }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          {langs.map(({ lang, count }) => (
                            <div key={lang} className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANG_COLORS[lang] ?? "#7d8590" }} />
                              <span className="text-[10px] text-[#7d8590] flex-1 truncate">
                                {lang}
                                {sharedLangs.includes(lang) && (
                                  <span className="ml-1 text-[#3fb950] opacity-60">●</span>
                                )}
                              </span>
                              <span className="text-[10px] text-[#484f58]">{Math.round((count / total) * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shared repos */}
            {sharedRepos.length > 0 && (
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-4">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-3">
                  Shared active repos
                  <span className="ml-2 text-[#3fb950]">{sharedRepos.length}</span>
                </p>
                <div className="flex flex-col gap-1">
                  {sharedRepos.slice(0, 8).map((full_name) => (
                    <Link
                      key={full_name}
                      href={`/${full_name}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-[#30363d] hover:bg-[#1c2128] transition-colors group"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#484f58] shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-xs font-mono text-[#7d8590] group-hover:text-[#e6edf3] transition-colors">{full_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Account ages */}
            <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
              <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-3">Account age</p>
              <StatBar
                labelA={`@${loginA} — joined ${new Date(dataA.user.created_at).getFullYear()}`}
                labelB={`@${loginB} — joined ${new Date(dataB.user.created_at).getFullYear()}`}
                a={Date.now() - new Date(dataA.user.created_at).getTime()}
                b={Date.now() - new Date(dataB.user.created_at).getTime()}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}
