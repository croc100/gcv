"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  Ruby: "#701516", Swift: "#F05138", Dart: "#00B4AB", Vue: "#41b883",
};

type ProfileData = {
  user: {
    login: string; name: string | null; avatar_url: string; bio: string | null;
    html_url: string; followers: number; public_repos: number; created_at: string;
  };
  activeRepos: { full_name: string; pushes: number; prs: number; issues: number }[];
  weeklyActivity: { week: string; commits: number }[];
  languages: { lang: string; count: number }[];
};

export default function WrappedPage() {
  const params = useParams();
  const login = params.login as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("github_token") ?? "";
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;
      const res = await fetch(`/api/github/profile?login=${login}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setData(json);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/wrapped/${login}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#7d8590]">Building your Wrapped…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
      <p className="text-sm text-[#f85149]">{error || "Not found"}</p>
    </div>
  );

  const { user, activeRepos, weeklyActivity, languages } = data;
  const totalCommits = weeklyActivity.reduce((s, w) => s + w.commits, 0);
  const totalPRs = activeRepos.reduce((s, r) => s + r.prs, 0);
  const topRepo = activeRepos[0]?.full_name ?? "—";
  const topLang = languages[0]?.lang ?? "—";
  const maxWeek = Math.max(...weeklyActivity.map((w) => w.commits), 1);
  const year = new Date().getFullYear();
  const langTotal = languages.reduce((s, l) => s + l.count, 0);

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "#0d1117" }}>
      <div className="max-w-lg mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/u/${login}`} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors flex items-center gap-2 text-xs">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Profile
          </Link>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:border-[#388bfd] hover:text-[#388bfd] transition-colors"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          className="rounded-2xl border border-[#21262d] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)" }}
        >
          {/* Header gradient */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #388bfd, #3fb950, #9e6a03, #f85149)" }} />

          <div className="p-6">
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] text-[#484f58] uppercase tracking-widest">GitHub Wrapped</p>
                <p className="text-2xl font-black text-[#e6edf3]">{year}</p>
              </div>
              <div className="text-[10px] text-[#484f58] font-mono">gcv-five.vercel.app</div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-[#21262d] bg-[#0d1117]">
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-[#30363d]"
              />
              <div>
                {user.name && <p className="font-bold text-[#e6edf3]">{user.name}</p>}
                <p className="text-sm text-[#7d8590]">@{user.login}</p>
                <p className="text-[10px] text-[#484f58]">{user.followers.toLocaleString()} followers · {user.public_repos} repos</p>
              </div>
            </div>

            {/* Big stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <p className="text-3xl font-black tabular-nums" style={{ color: "#388bfd" }}>{totalCommits.toLocaleString()}</p>
                <p className="text-xs text-[#7d8590] mt-0.5">commits (90d)</p>
              </div>
              <div className="p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <p className="text-3xl font-black tabular-nums" style={{ color: "#3fb950" }}>{activeRepos.length}</p>
                <p className="text-xs text-[#7d8590] mt-0.5">active repos</p>
              </div>
              <div className="p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <p className="text-3xl font-black tabular-nums" style={{ color: "#9e6a03" }}>{totalPRs}</p>
                <p className="text-xs text-[#7d8590] mt-0.5">PRs opened</p>
              </div>
              <div className="p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {topLang !== "—" && (
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[topLang] ?? "#7d8590" }} />
                  )}
                  <p className="text-lg font-black text-[#e6edf3] truncate">{topLang}</p>
                </div>
                <p className="text-xs text-[#7d8590]">top language</p>
              </div>
            </div>

            {/* Sparkline */}
            {weeklyActivity.length > 0 && (
              <div className="mb-5 p-4 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <p className="text-[10px] text-[#484f58] uppercase tracking-widest mb-3">Commit activity</p>
                <div className="flex items-end gap-0.5 h-12">
                  {weeklyActivity.map(({ week, commits }) => (
                    <div
                      key={week}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${(commits / maxWeek) * 100}%`,
                        background: commits > 0 ? "#388bfd" : "#21262d",
                        minHeight: commits > 0 ? 2 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Top repo + language bar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#21262d] bg-[#0d1117]">
                <div>
                  <p className="text-[10px] text-[#484f58] uppercase tracking-widest">Most active repo</p>
                  <p className="text-sm font-semibold text-[#e6edf3] mt-0.5">{topRepo}</p>
                </div>
                <Link href={`/${topRepo}`} className="text-[10px] text-[#388bfd] hover:underline">
                  View →
                </Link>
              </div>

              {languages.length > 0 && langTotal > 0 && (
                <div className="p-3 rounded-xl border border-[#21262d] bg-[#0d1117]">
                  <p className="text-[10px] text-[#484f58] uppercase tracking-widest mb-2">Languages</p>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px mb-2">
                    {languages.map(({ lang, count }) => (
                      <div
                        key={lang}
                        style={{ width: `${(count / langTotal) * 100}%`, background: LANG_COLORS[lang] ?? "#7d8590" }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {languages.map(({ lang, count }) => (
                      <span key={lang} className="flex items-center gap-1 text-[10px] text-[#7d8590]">
                        <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[lang] ?? "#7d8590" }} />
                        {lang} {Math.round((count / langTotal) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#484f58] mb-2">Share your Wrapped</p>
          <div className="flex gap-2 justify-center">
            <button onClick={copyLink} className="px-4 py-2 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:border-[#388bfd] hover:text-[#388bfd] transition-colors">
              {copied ? "✓ Copied" : "Copy link"}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=My GitHub Wrapped ${year} — check out my open source contributions!&url=${encodeURIComponent(`https://gcv-five.vercel.app/wrapped/${login}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:border-[#1d9bf0] hover:text-[#1d9bf0] transition-colors"
            >
              Share on X
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
