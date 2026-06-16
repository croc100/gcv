"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const LANGS = ["", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++", "Ruby", "Swift"];
const LANG_LABELS: Record<string, string> = { "": "All", "C++": "C++" };

type Repo = {
  id: number; full_name: string; description: string | null;
  stars: number; forks: number; language: string | null;
  open_issues: number; pushed_at: string | null; html_url: string;
  topics: string[];
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  Ruby: "#701516", Swift: "#F05138",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TrendingPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [lang, setLang] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrending = useCallback(async (l: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("github_token") ?? "";
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;
      const res = await fetch(`/api/github/trending?lang=${encodeURIComponent(l)}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRepos(data.repos);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrending(lang); }, [lang, fetchTrending]);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-[#e6edf3]">Trending repos</h1>
            <p className="text-[10px] text-[#484f58]">Most starred repos pushed this week</p>
          </div>
        </div>

        {/* Language filter */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                lang === l
                  ? "border-[#388bfd] text-[#388bfd] bg-[#388bfd11]"
                  : "border-[#30363d] text-[#484f58] hover:border-[#484f58]"
              }`}
            >
              {LANG_LABELS[l] ?? l}
            </button>
          ))}
        </div>


        {error && (
          <div className="p-3 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {repos.map((r, i) => (
              <div key={r.id} className="group rounded-xl border border-[#21262d] bg-[#161b22] p-4 hover:border-[#30363d] transition-colors">
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
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#388bfd15] text-[#388bfd] border border-[#388bfd30]">{t}</span>
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
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
                        </svg>
                        {r.forks.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#484f58]">{timeAgo(r.pushed_at)}</span>
                    <Link
                      href={`/${r.full_name}`}
                      className="text-[10px] px-2.5 py-1 rounded-md border border-[#30363d] text-[#7d8590] hover:border-[#388bfd] hover:text-[#388bfd] transition-colors"
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
