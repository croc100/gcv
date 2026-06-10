"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type OrgContributor = {
  login: string;
  commits: number;
  repos: number;
  avatar_url: string;
  html_url: string;
};

type OrgRepo = {
  name: string;
  full_name: string;
  stars: number;
  description: string | null;
  language: string | null;
};

export default function OrgPage() {
  const params = useParams();
  const org = params.org as string;

  const [contributors, setContributors] = useState<OrgContributor[]>([]);
  const [repos, setRepos] = useState<OrgRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [authed, setAuthed] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("github_token") ?? "";
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;

      // Check OAuth
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();
      if (me.user) setAuthed(true);

      const res = await fetch(`/api/github/org?org=${org}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load org");
      setContributors(data.contributors);
      setRepos(data.repos);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [org]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const displayed = contributors.filter(
    (c) => !search || c.login.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommits = contributors.reduce((s, c) => s + c.commits, 0);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-1.5">
              <svg className="text-[#7d8590]" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM6.5 3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-3-3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
              </svg>
              <h1 className="text-sm font-semibold text-[#e6edf3]">{org}</h1>
              <span className="text-[10px] text-[#484f58] border border-[#21262d] rounded px-2 py-0.5">org</span>
            </div>
          </div>
        </div>

        {/* Rate limit warning */}
        {!authed && !loading && (
          <div className="mb-4 p-3 rounded-lg border border-[#9e6a03] bg-[#9e6a0311] text-xs text-[#d29922] flex items-center justify-between gap-3">
            <span>Org dashboard uses many API calls. Sign in with GitHub for 5,000 req/h to avoid hitting the limit.</span>
            <a
              href={`/api/auth/login?returnTo=${encodeURIComponent(`/org/${org}`)}`}
              className="shrink-0 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
            >
              Sign in
            </a>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#7d8590]">Loading top 30 repos across <strong className="text-[#e6edf3]">{org}</strong>…</p>
            <p className="text-xs text-[#484f58]">This may take a moment</p>
          </div>
        ) : !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col gap-0.5 px-5 py-3 rounded-lg border border-[#21262d] bg-[#161b22]">
                <span className="text-xs text-[#7d8590]">Repos analyzed</span>
                <span className="text-xl font-semibold text-[#e6edf3]">{repos.length}</span>
              </div>
              <div className="flex flex-col gap-0.5 px-5 py-3 rounded-lg border border-[#21262d] bg-[#161b22]">
                <span className="text-xs text-[#7d8590]">Unique contributors</span>
                <span className="text-xl font-semibold text-[#e6edf3]">{contributors.length.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-0.5 px-5 py-3 rounded-lg border border-[#21262d] bg-[#161b22]">
                <span className="text-xs text-[#7d8590]">Total commits</span>
                <span className="text-xl font-semibold text-[#e6edf3]">{totalCommits.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Top contributors */}
              <div className="lg:col-span-2 rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">
                    Top contributors
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#7d8590] text-[10px] font-normal">
                      {displayed.length}
                    </span>
                  </p>
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] w-36"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {displayed.slice(0, 50).map((c, i) => {
                    const pct = totalCommits > 0 ? (c.commits / totalCommits) * 100 : 0;
                    const topCommits = displayed[0]?.commits ?? 1;
                    const barPct = (c.commits / topCommits) * 100;
                    return (
                      <a
                        key={c.login}
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-2.5 rounded-lg border border-[#21262d] hover:border-[#388bfd] transition-colors"
                      >
                        <span className="w-6 text-xs text-right text-[#484f58] shrink-0">
                          {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                        </span>
                        <Image
                          src={c.avatar_url}
                          alt={c.login}
                          width={28}
                          height={28}
                          className="rounded-full ring-1 ring-[#30363d] group-hover:ring-[#388bfd] transition-all shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium text-[#e6edf3] truncate">{c.login}</span>
                            <div className="flex items-center gap-3 shrink-0 text-xs text-[#7d8590]">
                              <span className="tabular-nums font-semibold text-[#e6edf3]">{c.commits.toLocaleString()}</span>
                              <span className="text-[10px]">{c.repos} repo{c.repos !== 1 ? "s" : ""}</span>
                              <span className="text-[10px] text-[#484f58]">{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="h-1 rounded-full bg-[#21262d] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#388bfd] transition-all"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                  {displayed.length > 50 && (
                    <p className="text-xs text-[#484f58] text-center py-2">
                      Showing top 50 of {displayed.length} contributors
                    </p>
                  )}
                </div>
              </div>

              {/* Repos sidebar */}
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">
                  Repos analyzed
                </p>
                <div className="flex flex-col gap-2">
                  {repos.map((r) => (
                    <Link
                      key={r.name}
                      href={`/${r.full_name}`}
                      className="group p-3 rounded-lg border border-[#21262d] hover:border-[#388bfd] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#e6edf3] truncate group-hover:text-[#58a6ff] transition-colors">{r.name}</span>
                        <span className="flex items-center gap-1 text-[10px] text-[#7d8590] shrink-0">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                          </svg>
                          {r.stars.toLocaleString()}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-[10px] text-[#484f58] mt-1 line-clamp-1">{r.description}</p>
                      )}
                      {r.language && (
                        <span className="mt-1 inline-block text-[10px] text-[#7d8590]">{r.language}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
