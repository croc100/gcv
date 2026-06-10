"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SponsoredRepos from "@/components/SponsoredRepos";

const LANGS = ["", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Ruby", "Swift"];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", Ruby: "#701516", Swift: "#F05138",
};

type Repo = {
  id: number; full_name: string; description: string | null;
  stars: number; language: string | null; open_issues: number;
  pushed_at: string | null; html_url: string; topics: string[];
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ExplorePage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [lang, setLang] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRepos = useCallback(async (l: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("github_token") ?? "";
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;
      const res = await fetch(`/api/github/explore?lang=${encodeURIComponent(l)}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRepos(data.repos);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRepos(lang); }, [lang, fetchRepos]);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-[#e6edf3]">Find repos to contribute</h1>
            <p className="text-[10px] text-[#484f58]">Active repos with good first issues — updated in the last 30 days</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a4731] border border-[#238636] text-xs text-[#3fb950] mb-5 mt-3">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Repos are filtered for <strong className="mx-1">good-first-issues &gt; 3</strong> and active pushes — great starting points for first-time contributors.
        </div>

        {/* Language filter */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                lang === l
                  ? "border-[#3fb950] text-[#3fb950] bg-[#3fb95011]"
                  : "border-[#30363d] text-[#484f58] hover:border-[#484f58]"
              }`}
            >
              {l || "All"}
            </button>
          ))}
        </div>

        <SponsoredRepos />

        {error && (
          <div className="p-3 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-[#3fb950] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {repos.map((r, i) => (
              <div key={r.id} className="rounded-xl border border-[#21262d] bg-[#161b22] p-4 hover:border-[#238636] transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-[#484f58] w-6 text-right shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/${r.full_name}`}
                        className="text-sm font-semibold text-[#e6edf3] hover:text-[#58a6ff] transition-colors"
                      >
                        {r.full_name}
                      </Link>
                      {r.language && (
                        <span className="flex items-center gap-1 text-[10px] text-[#7d8590]">
                          <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#7d8590" }} />
                          {r.language}
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-xs text-[#7d8590] mt-1 line-clamp-2">{r.description}</p>
                    )}
                    {r.topics.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {r.topics.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#3fb95015] text-[#3fb950] border border-[#3fb95030]">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3 text-xs text-[#7d8590]">
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                        </svg>
                        {r.stars.toLocaleString()}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#3fb95015] text-[#3fb950] border border-[#3fb95030]">
                      <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>
                      </svg>
                      good first issues
                    </span>
                    <span className="text-[10px] text-[#484f58]">{timeAgo(r.pushed_at)}</span>
                    <Link
                      href={`/${r.full_name}`}
                      className="text-[10px] px-2.5 py-1 rounded-md border border-[#238636] text-[#3fb950] hover:bg-[#238636] hover:text-white transition-colors"
                    >
                      View contributors →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
