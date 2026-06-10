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

const COLOR_A = "#388bfd";
const COLOR_B = "#3fb950";

function RepoInput({ value, onChange, placeholder, color }: {
  value: string; onChange: (v: string) => void; placeholder: string; color: string;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: color }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
      />
    </div>
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

function StatBox({ label, a, b, format = (v: number) => v.toLocaleString() }: {
  label: string; a: number; b: number; format?: (v: number) => string;
}) {
  const winner = a > b ? "a" : b > a ? "b" : "tie";
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] text-[#484f58] uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-2">
        <span className={`text-xl font-bold tabular-nums ${winner === "a" ? "text-[#e6edf3]" : "text-[#484f58]"}`}>
          {format(a)}
        </span>
        <span className="text-[#30363d] text-xs mb-0.5">vs</span>
        <span className={`text-xl font-bold tabular-nums ${winner === "b" ? "text-[#e6edf3]" : "text-[#484f58]"}`}>
          {format(b)}
        </span>
      </div>
      {/* Mini bar */}
      <div className="flex h-1 rounded-full overflow-hidden bg-[#21262d]">
        {a + b > 0 && (
          <>
            <div style={{ width: `${(a / (a + b)) * 100}%`, background: COLOR_A }} />
            <div style={{ width: `${(b / (a + b)) * 100}%`, background: COLOR_B }} />
          </>
        )}
      </div>
    </div>
  );
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
  const sharedLogins = new Set(
    dataA.contributors.map((c) => c.login).filter((l) =>
      dataB.contributors.some((c) => c.login === l)
    )
  );

  const top = 10;
  const topA = dataA.contributors.slice(0, top);
  const topB = dataB.contributors.slice(0, top);
  const maxContrib = Math.max(
    topA[0]?.contributions ?? 1,
    topB[0]?.contributions ?? 1,
  );

  const hasResults = dataA.contributors.length > 0 || dataB.contributors.length > 0;
  const doneLoading = !dataA.loading && !dataB.loading;

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
          <h1 className="text-sm font-semibold text-[#e6edf3]">Compare repositories</h1>
        </div>

        {/* Repo inputs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <RepoInput value={repoA} onChange={setRepoA} placeholder="owner/repo" color={COLOR_A} />
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#30363d] bg-[#161b22] text-[10px] font-bold text-[#484f58] shrink-0">
            VS
          </div>
          <RepoInput value={repoB} onChange={setRepoB} placeholder="owner/repo" color={COLOR_B} />
          <button
            onClick={() => compare()}
            disabled={!repoA || !repoB}
            className="px-5 py-2.5 text-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
          >
            Compare
          </button>
        </div>

        {(dataA.loading || dataB.loading || hasResults) && (
          <>
            {/* Repo header cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: repoA, data: dataA, total: totalA, color: COLOR_A },
                { label: repoB, data: dataB, total: totalB, color: COLOR_B },
              ].map(({ label, data, total, color }) => (
                <div key={label} className="rounded-xl border bg-[#161b22] p-4" style={{ borderColor: color + "44" }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <Link
                        href={`/${label}`}
                        className="text-xs font-mono text-[#7d8590] hover:text-[#e6edf3] transition-colors truncate"
                      >
                        {label || "—"}
                      </Link>
                    </div>
                    {!data.loading && !data.error && (
                      <Link
                        href={`/${label}`}
                        className="text-[10px] text-[#484f58] hover:text-[#7d8590] transition-colors shrink-0"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                  {data.loading ? (
                    <div className="flex items-center gap-2 py-3">
                      <div className="w-3 h-3 border border-[#388bfd] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-[#484f58]">Loading…</span>
                    </div>
                  ) : data.error ? (
                    <p className="text-xs text-[#f85149] py-2">{data.error}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-2xl font-bold text-[#e6edf3] tabular-nums">{data.contributors.length.toLocaleString()}</p>
                        <p className="text-[10px] text-[#484f58]">contributors</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#e6edf3] tabular-nums">{total.toLocaleString()}</p>
                        <p className="text-[10px] text-[#484f58]">commits</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {doneLoading && hasResults && (
              <>
                {/* Stats comparison */}
                <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 mb-4">
                  <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Head-to-head</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <StatBox label="Total commits" a={totalA} b={totalB} />
                    <StatBox label="Contributors" a={dataA.contributors.length} b={dataB.contributors.length} />
                    <StatBox
                      label="Avg commits / contributor"
                      a={dataA.contributors.length ? Math.round(totalA / dataA.contributors.length) : 0}
                      b={dataB.contributors.length ? Math.round(totalB / dataB.contributors.length) : 0}
                    />
                  </div>

                  {/* Commit share bar */}
                  <div className="mt-5 pt-4 border-t border-[#21262d]">
                    <div className="flex items-center justify-between text-[10px] text-[#484f58] mb-1.5">
                      <span className="font-mono">{repoA}</span>
                      <span className="font-mono">{repoB}</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="transition-all duration-700"
                        style={{ width: `${(totalA / (totalA + totalB || 1)) * 100}%`, background: COLOR_A }}
                      />
                      <div
                        className="transition-all duration-700"
                        style={{ width: `${(totalB / (totalA + totalB || 1)) * 100}%`, background: COLOR_B }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span style={{ color: COLOR_A }}>{totalA + totalB > 0 ? Math.round((totalA / (totalA + totalB)) * 100) : 0}%</span>
                      <span style={{ color: COLOR_B }}>{totalA + totalB > 0 ? Math.round((totalB / (totalA + totalB)) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Top contributors */}
                {topA.length > 0 && (
                  <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">Top {top} contributors</p>
                      {sharedLogins.size > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: COLOR_B, borderColor: COLOR_B + "40", background: COLOR_B + "10" }}>
                          {sharedLogins.size} shared
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {Array.from({ length: Math.max(topA.length, topB.length) }).map((_, i) => {
                        const ca = topA[i];
                        const cb = topB[i];
                        return (
                          <div key={i} className="contents">
                            {/* Left */}
                            {ca ? (
                              <a
                                href={ca.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors hover:bg-[#1c2128] ${sharedLogins.has(ca.login) ? "border-[#3fb95030] bg-[#3fb95008]" : "border-transparent"}`}
                              >
                                <span className="text-[10px] text-[#484f58] w-4 text-right shrink-0">{i + 1}</span>
                                <Image src={ca.avatar_url} alt={ca.login} width={22} height={22} className="rounded-full ring-1 ring-[#30363d] shrink-0" />
                                <span className="text-xs text-[#e6edf3] truncate flex-1">{ca.login}</span>
                                {sharedLogins.has(ca.login) && (
                                  <span className="text-[9px] px-1 rounded" style={{ color: COLOR_B, background: COLOR_B + "20" }}>both</span>
                                )}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="w-16 h-1 rounded-full bg-[#21262d] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(ca.contributions / maxContrib) * 100}%`, background: COLOR_A }} />
                                  </div>
                                  <span className="text-[10px] tabular-nums w-10 text-right" style={{ color: COLOR_A }}>{ca.contributions.toLocaleString()}</span>
                                </div>
                              </a>
                            ) : <div />}
                            {/* Right */}
                            {cb ? (
                              <a
                                href={cb.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors hover:bg-[#1c2128] ${sharedLogins.has(cb.login) ? "border-[#3fb95030] bg-[#3fb95008]" : "border-transparent"}`}
                              >
                                <span className="text-[10px] text-[#484f58] w-4 text-right shrink-0">{i + 1}</span>
                                <Image src={cb.avatar_url} alt={cb.login} width={22} height={22} className="rounded-full ring-1 ring-[#30363d] shrink-0" />
                                <span className="text-xs text-[#e6edf3] truncate flex-1">{cb.login}</span>
                                {sharedLogins.has(cb.login) && (
                                  <span className="text-[9px] px-1 rounded" style={{ color: COLOR_B, background: COLOR_B + "20" }}>both</span>
                                )}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="w-16 h-1 rounded-full bg-[#21262d] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(cb.contributions / maxContrib) * 100}%`, background: COLOR_B }} />
                                  </div>
                                  <span className="text-[10px] tabular-nums w-10 text-right" style={{ color: COLOR_B }}>{cb.contributions.toLocaleString()}</span>
                                </div>
                              </a>
                            ) : <div />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Empty state */}
        {!dataA.loading && !dataB.loading && !hasResults && (
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
