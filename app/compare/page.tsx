"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Contributor } from "@/lib/types";

type RepoData = {
  contributors: Contributor[];
  loading: boolean;
  error: string;
};

function RepoInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
    />
  );
}

async function fetchContributors(repoStr: string, token: string): Promise<Contributor[]> {
  const [owner, repo] = repoStr.split("/");
  if (!owner || !repo) return [];
  const headers: Record<string, string> = {};
  if (token) headers["x-github-token"] = token;
  const res = await fetch(`/api/github/contributors?owner=${owner}&repo=${repo}`, { headers });
  if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function ComparePage() {
  const [repoA, setRepoA] = useState("");
  const [repoB, setRepoB] = useState("");
  const [dataA, setDataA] = useState<RepoData>({ contributors: [], loading: false, error: "" });
  const [dataB, setDataB] = useState<RepoData>({ contributors: [], loading: false, error: "" });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a") ?? "";
    const b = params.get("b") ?? "";
    if (a) setRepoA(a);
    if (b) setRepoB(b);
    if (a && b) compare(a, b);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function compare(a = repoA, b = repoB) {
    const token = localStorage.getItem("github_token") ?? "";
    const url = new URL(window.location.href);
    url.searchParams.set("a", a);
    url.searchParams.set("b", b);
    window.history.replaceState({}, "", url.toString());

    setDataA({ contributors: [], loading: true, error: "" });
    setDataB({ contributors: [], loading: true, error: "" });

    fetchContributors(a, token)
      .then((c) => setDataA({ contributors: c, loading: false, error: "" }))
      .catch((e) => setDataA({ contributors: [], loading: false, error: e.message }));

    fetchContributors(b, token)
      .then((c) => setDataB({ contributors: c, loading: false, error: "" }))
      .catch((e) => setDataB({ contributors: [], loading: false, error: e.message }));
  }

  const totalA = dataA.contributors.reduce((s, c) => s + c.contributions, 0);
  const totalB = dataB.contributors.reduce((s, c) => s + c.contributions, 0);
  const maxCommits = Math.max(totalA, totalB, 1);

  const sharedLogins = new Set(
    dataA.contributors.map((c) => c.login).filter((l) =>
      dataB.contributors.some((c) => c.login === l)
    )
  );

  const top = 10;
  const topA = dataA.contributors.slice(0, top);
  const topB = dataB.contributors.slice(0, top);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-[#e6edf3]">Compare repositories</h1>
        </div>

        {/* Repo inputs */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <RepoInput value={repoA} onChange={setRepoA} placeholder="owner/repo" />
          <span className="text-[#484f58] text-sm font-medium">vs</span>
          <RepoInput value={repoB} onChange={setRepoB} placeholder="owner/repo" />
          <button
            onClick={() => compare()}
            disabled={!repoA || !repoB}
            className="px-5 py-2.5 text-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white rounded-lg transition-colors"
          >
            Compare
          </button>
        </div>

        {(dataA.loading || dataB.loading || dataA.contributors.length > 0) && (
          <>
            {/* Stats comparison */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div />
              {[
                { label: repoA || "Repo A", data: dataA, total: totalA },
                { label: repoB || "Repo B", data: dataB, total: totalB },
              ].map(({ label, data, total }) => (
                <div key={label} className="rounded-xl border border-[#21262d] bg-[#161b22] p-4 text-center">
                  <p className="text-xs font-mono text-[#7d8590] truncate mb-3">{label}</p>
                  {data.loading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : data.error ? (
                    <p className="text-xs text-[#f85149]">{data.error}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-2xl font-bold text-[#e6edf3]">{data.contributors.length.toLocaleString()}</p>
                        <p className="text-[10px] text-[#484f58]">contributors</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#e6edf3]">{total.toLocaleString()}</p>
                        <p className="text-[10px] text-[#484f58]">total commits</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Commit bar comparison */}
            {!dataA.loading && !dataB.loading && (
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-6">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Total commits</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: repoA, total: totalA, color: "#388bfd" },
                    { label: repoB, total: totalB, color: "#3fb950" },
                  ].map(({ label, total, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#7d8590] w-36 truncate shrink-0">{label}</span>
                      <div className="flex-1 bg-[#21262d] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(total / maxCommits) * 100}%`, background: color }}
                        />
                      </div>
                      <span className="text-xs text-[#7d8590] tabular-nums w-16 text-right">{total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top contributors side by side */}
            {!dataA.loading && !dataB.loading && topA.length > 0 && (
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">Top {top} contributors</p>
                  {sharedLogins.size > 0 && (
                    <span className="text-[10px] text-[#3fb950] bg-[#3fb95015] border border-[#3fb95030] px-2 py-0.5 rounded-full">
                      {sharedLogins.size} shared
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { list: topA, color: "#388bfd" },
                    { list: topB, color: "#3fb950" },
                  ].map(({ list, color }, si) => (
                    <div key={si} className="flex flex-col gap-1.5">
                      {list.map((c) => (
                        <a
                          key={c.login}
                          href={c.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:bg-[#1c2128] ${sharedLogins.has(c.login) ? "border-[#3fb95030]" : "border-[#21262d]"}`}
                        >
                          <Image src={c.avatar_url} alt={c.login} width={24} height={24} className="rounded-full" />
                          <span className="text-xs text-[#e6edf3] truncate flex-1">{c.login}</span>
                          <span className="text-[10px] tabular-nums" style={{ color }}>{c.contributions.toLocaleString()}</span>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!dataA.loading && !dataB.loading && dataA.contributors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#484f58]">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
            </svg>
            <p className="text-sm">Enter two repos above to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}
