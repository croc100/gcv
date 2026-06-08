"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ContributorCard from "@/components/ContributorCard";
import PeriodFilter, { Period } from "@/components/PeriodFilter";
import { Contributor } from "@/lib/github";

const ContributorChart = dynamic(() => import("@/components/ContributorChart"), { ssr: false });
const GrowthChart = dynamic(() => import("@/components/GrowthChart"), { ssr: false });

type StatsEntry = {
  author: { login: string } | null;
  weeks: { w: number; c: number }[];
  total: number;
};

type GrowthPoint = { date: string; total: number };

function filterByPeriod(stats: StatsEntry[], period: Period): Map<string, number> {
  const now = Date.now() / 1000;
  const cutoff: Record<Period, number> = {
    "1M": now - 30 * 86400,
    "3M": now - 90 * 86400,
    "6M": now - 180 * 86400,
    "1Y": now - 365 * 86400,
    MAX: 0,
  };
  const commitMap = new Map<string, number>();
  for (const entry of stats) {
    if (!entry.author) continue;
    const total = entry.weeks
      .filter((w) => w.w >= cutoff[period])
      .reduce((s, w) => s + w.c, 0);
    if (total > 0) commitMap.set(entry.author.login, total);
  }
  return commitMap;
}

function buildGrowthData(stats: StatsEntry[], period: Period): GrowthPoint[] {
  const now = Date.now() / 1000;
  const cutoff: Record<Period, number> = {
    "1M": now - 30 * 86400,
    "3M": now - 90 * 86400,
    "6M": now - 180 * 86400,
    "1Y": now - 365 * 86400,
    MAX: 0,
  };
  const weekSet = new Set<number>();
  for (const entry of stats) {
    for (const w of entry.weeks) {
      if (w.w >= cutoff[period] && w.c > 0) weekSet.add(w.w);
    }
  }
  const weeks = Array.from(weekSet).sort((a, b) => a - b);
  const seenAuthors = new Set<string>();
  return weeks.map((week) => {
    for (const entry of stats) {
      if (!entry.author) continue;
      const w = entry.weeks.find((x) => x.w === week);
      if (w && w.c > 0) seenAuthors.add(entry.author.login);
    }
    return {
      date: new Date(week * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: seenAuthors.size,
    };
  });
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3 rounded-lg border border-[#21262d] bg-[#161b22]">
      <span className="text-xs text-[#7d8590]">{label}</span>
      <span className="text-xl font-semibold text-[#e6edf3] tabular-nums">{value}</span>
    </div>
  );
}

export default function RepoPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [stats, setStats] = useState<StatsEntry[]>([]);
  const [period, setPeriod] = useState<Period>("MAX");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("github_token") ?? "";
    setToken(saved);
    setTokenDraft(saved);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;

      const [cRes, sRes] = await Promise.all([
        fetch(`/api/github/contributors?owner=${owner}&repo=${repo}`, { headers }),
        fetch(`/api/github/stats?owner=${owner}&repo=${repo}`, { headers }),
      ]);

      if (!cRes.ok) {
        const e = await cRes.json();
        throw new Error(e.error ?? "Failed to load contributors");
      }

      setContributors(await cRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function saveToken() {
    setToken(tokenDraft);
    localStorage.setItem("github_token", tokenDraft);
    setShowTokenInput(false);
  }

  const filteredCommits = stats.length > 0 ? filterByPeriod(stats, period) : null;
  const displayContributors = filteredCommits
    ? contributors
        .map((c) => ({ ...c, contributions: filteredCommits.get(c.login) ?? 0 }))
        .filter((c) => c.contributions > 0)
        .sort((a, b) => b.contributions - a.contributions)
    : contributors;

  const totalCommits = displayContributors.reduce((s, c) => s + c.contributions, 0);
  const growthData = stats.length > 0 ? buildGrowthData(stats, period) : [];

  const firstDates = new Map<string, string>();
  for (const entry of stats) {
    if (!entry.author) continue;
    const firstWeek = entry.weeks.find((w) => w.c > 0);
    if (firstWeek) {
      firstDates.set(
        entry.author.login,
        new Date(firstWeek.w * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      );
    }
  }

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
            <div className="flex items-center gap-2">
              <svg className="text-[#7d8590]" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
              </svg>
              <h1 className="text-sm font-semibold text-[#e6edf3]">
                <span className="text-[#7d8590]">{owner}</span>
                <span className="text-[#7d8590] mx-1">/</span>
                <span>{repo}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PeriodFilter value={period} onChange={setPeriod} />
            <button
              onClick={() => setShowTokenInput((v) => !v)}
              title={token ? "Token configured" : "Set GitHub token"}
              className={`p-2 rounded-lg border transition-colors ${
                token
                  ? "border-[#238636] text-[#3fb950]"
                  : "border-[#30363d] text-[#7d8590] hover:text-[#e6edf3]"
              }`}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Token input */}
        {showTokenInput && (
          <div className="mb-4 p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
            <p className="text-xs text-[#7d8590] mb-2">
              GitHub Personal Access Token — raises rate limit to 5,000 req/h. Stored in localStorage only.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveToken()}
                placeholder="ghp_..."
                className="flex-1 px-3 py-2 text-sm rounded-md border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
              <button
                onClick={saveToken}
                className="px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#7d8590]">Loading contributors…</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Contributors" value={displayContributors.length.toLocaleString()} />
              <StatCard label="Total commits" value={totalCommits.toLocaleString()} />
              <StatCard label="Top contributor" value={displayContributors[0]?.login ?? "—"} />
              <StatCard label="Period" value={period} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Commits — Top 20</p>
                <ContributorChart contributors={displayContributors} />
              </div>
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Contributor growth</p>
                <GrowthChart data={growthData} />
              </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
              <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">
                All contributors
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#7d8590] text-[10px] font-normal">
                  {displayContributors.length}
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {displayContributors.map((c, i) => (
                  <ContributorCard
                    key={c.login}
                    contributor={c}
                    rank={i + 1}
                    firstContributionDate={firstDates.get(c.login)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
