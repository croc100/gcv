"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ContributorCard from "@/components/ContributorCard";
import ContributorDrawer from "@/components/ContributorDrawer";
import BadgeModal from "@/components/BadgeModal";
import OGShareModal from "@/components/OGShareModal";
import PeriodFilter, { Period } from "@/components/PeriodFilter";
import type { Contributor } from "@/lib/types";
import { recordVisit, isFavorite, toggleFavorite } from "@/lib/history";

const ContributorChart = dynamic(() => import("@/components/ContributorChart"), { ssr: false });
const GrowthChart = dynamic(() => import("@/components/GrowthChart"), { ssr: false });

type StatsEntry = {
  author: { login: string } | null;
  weeks: { w: number; c: number }[];
  total: number;
};
type GrowthPoint = { date: string; total: number };

const BOT_PATTERNS = [/\[bot\]$/i, /-bot$/i, /^dependabot/, /^renovate/, /^snyk-bot/, /^github-actions/, /^codecov/];
const isBot = (login: string) => BOT_PATTERNS.some((p) => p.test(login));

function filterByPeriod(stats: StatsEntry[], period: Period): Map<string, number> {
  const now = Date.now() / 1000;
  const cutoff: Record<Period, number> = {
    "1M": now - 30 * 86400, "3M": now - 90 * 86400,
    "6M": now - 180 * 86400, "1Y": now - 365 * 86400, MAX: 0,
  };
  const map = new Map<string, number>();
  for (const entry of stats) {
    if (!entry.author) continue;
    const total = entry.weeks.filter((w) => w.w >= cutoff[period]).reduce((s, w) => s + w.c, 0);
    if (total > 0) map.set(entry.author.login, total);
  }
  return map;
}

function buildGrowthData(stats: StatsEntry[], period: Period): GrowthPoint[] {
  const now = Date.now() / 1000;
  const cutoff: Record<Period, number> = {
    "1M": now - 30 * 86400, "3M": now - 90 * 86400,
    "6M": now - 180 * 86400, "1Y": now - 365 * 86400, MAX: 0,
  };
  const weekSet = new Set<number>();
  for (const entry of stats)
    for (const w of entry.weeks)
      if (w.w >= cutoff[period] && w.c > 0) weekSet.add(w.w);
  const weeks = Array.from(weekSet).sort((a, b) => a - b);
  const seen = new Set<string>();
  return weeks.map((week) => {
    for (const entry of stats) {
      if (!entry.author) continue;
      const w = entry.weeks.find((x) => x.w === week);
      if (w && w.c > 0) seen.add(entry.author.login);
    }
    return { date: new Date(week * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }), total: seen.size };
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

function IconButton({ onClick, title, active, activeClass, children }: {
  onClick: () => void; title: string; active?: boolean;
  activeClass?: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg border transition-colors ${
        active ? activeClass ?? "border-[#388bfd] text-[#388bfd]" : "border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#484f58]"
      }`}
    >
      {children}
    </button>
  );
}

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "MAX"];

export default function RepoPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [stats, setStats] = useState<StatsEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("MAX");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const [starred, setStarred] = useState(false);

  // Feature states
  const [hideBots, setHideBots] = useState(false);
  const [search, setSearch] = useState("");
  const [shareMode, setShareMode] = useState(false);
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
  const [drawerLogin, setDrawerLogin] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [showOG, setShowOG] = useState(false);

  const periodRef = useRef(false);
  const statsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("github_token") ?? "";
    setToken(saved);
    setTokenDraft(saved);
    setStarred(isFavorite(owner, repo));
    recordVisit(owner, repo);

    // Read period from URL
    const p = new URLSearchParams(window.location.search).get("period") as Period | null;
    if (p && PERIODS.includes(p)) setPeriod(p);
  }, [owner, repo]);

  // Sync period to URL
  useEffect(() => {
    if (!periodRef.current) { periodRef.current = true; return; }
    const url = new URL(window.location.href);
    url.searchParams.set("period", period);
    window.history.replaceState({}, "", url.toString());
  }, [period]);

  const fetchStats = useCallback(async (headers: Record<string, string>, attempt = 0) => {
    const res = await fetch(`/api/github/stats?owner=${owner}&repo=${repo}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) { setStats(data); setStatsLoading(false); return; }
    }
    if (attempt < 5) {
      statsTimerRef.current = setTimeout(() => fetchStats(headers, attempt + 1), 3000);
    } else setStatsLoading(false);
  }, [owner, repo]);

  useEffect(() => {
    return () => { if (statsTimerRef.current) clearTimeout(statsTimerRef.current); };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = {};
      if (token) headers["x-github-token"] = token;
      const cRes = await fetch(`/api/github/contributors?owner=${owner}&repo=${repo}`, { headers });
      if (!cRes.ok) throw new Error((await cRes.json()).error ?? "Failed to load contributors");
      const cData = await cRes.json();
      setContributors(Array.isArray(cData) ? cData : []);
      fetchStats(headers);
    } catch (e: unknown) {
      setError((e as Error).message);
      setStatsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, token, fetchStats]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function saveToken() {
    setToken(tokenDraft);
    localStorage.setItem("github_token", tokenDraft);
    setShowTokenInput(false);
  }

  function exitShareMode() {
    setShareMode(false);
    setSelectedLogins(new Set());
  }

  const filteredCommits = stats.length > 0 ? filterByPeriod(stats, period) : null;
  const byPeriod = filteredCommits
    ? contributors
        .map((c) => ({ ...c, contributions: filteredCommits.get(c.login) ?? 0 }))
        .filter((c) => c.contributions > 0)
        .sort((a, b) => b.contributions - a.contributions)
    : contributors;

  const displayContributors = byPeriod
    .filter((c) => !hideBots || !isBot(c.login))
    .filter((c) => !search || c.login.toLowerCase().includes(search.toLowerCase()));

  const totalCommits = byPeriod
    .filter((c) => !hideBots || !isBot(c.login))
    .reduce((s, c) => s + c.contributions, 0);

  const growthData = stats.length > 0 ? buildGrowthData(stats, period) : [];
  const firstDates = new Map<string, string>();
  for (const entry of stats) {
    if (!entry.author) continue;
    const fw = entry.weeks.find((w) => w.c > 0);
    if (fw) firstDates.set(entry.author.login, new Date(fw.w * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short" }));
  }

  const botCount = byPeriod.filter((c) => isBot(c.login)).length;
  const selectedContributors = displayContributors.filter((c) => selectedLogins.has(c.login));

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
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
              </svg>
              <h1 className="text-sm font-semibold text-[#e6edf3]">
                <span className="text-[#7d8590]">{owner}</span>
                <span className="text-[#7d8590] mx-1">/</span>
                <span>{repo}</span>
              </h1>
            </div>
            <Link
              href={`/compare?a=${owner}/${repo}`}
              className="text-[10px] text-[#484f58] hover:text-[#7d8590] border border-[#21262d] hover:border-[#30363d] rounded px-2 py-0.5 transition-colors"
            >
              Compare
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <PeriodFilter value={period} onChange={setPeriod} />

            {/* Bot filter */}
            <IconButton
              onClick={() => setHideBots((v) => !v)}
              title={hideBots ? "Show bots" : `Hide bots${botCount > 0 ? ` (${botCount})` : ""}`}
              active={hideBots}
              activeClass="border-[#9e6a03] text-yellow-400 bg-[#9e6a0311]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.5-1.575.4A9.065 9.065 0 0112 15M5 14.5l1.57.393M12 15v6m0-6a9.065 9.065 0 01-1.57-.107" />
              </svg>
            </IconButton>

            {/* Star */}
            <IconButton
              onClick={() => { const n = toggleFavorite(owner, repo); setStarred(n); }}
              title={starred ? "Remove from favorites" : "Add to favorites"}
              active={starred}
              activeClass="border-[#9e6a03] text-yellow-400 bg-[#9e6a0311]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill={starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
              </svg>
            </IconButton>

            {/* Share/OG */}
            <IconButton onClick={() => setShowOG(true)} title="Share image" active={false}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </IconButton>

            {/* Badge */}
            <IconButton onClick={() => setShowBadge(true)} title="Get badge" active={false}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </IconButton>

            {/* Token */}
            <IconButton
              onClick={() => setShowTokenInput((v) => !v)}
              title={token ? "Token configured" : "Set GitHub token"}
              active={!!token}
              activeClass="border-[#238636] text-[#3fb950]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Token input */}
        {showTokenInput && (
          <div className="mb-4 p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
            <p className="text-xs text-[#7d8590] mb-2">GitHub Personal Access Token — raises rate limit to 5,000 req/h. Stored in localStorage only.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveToken()}
                placeholder="ghp_..."
                className="flex-1 px-3 py-2 text-sm rounded-md border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
              <button onClick={saveToken} className="px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors">Save</button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[#da3633] bg-[#da363311] text-[#f85149] text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32">
            <div className="w-6 h-6 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#7d8590]">Loading contributors…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Contributors" value={displayContributors.length.toLocaleString()} />
              <StatCard label="Total commits" value={totalCommits.toLocaleString()} />
              <StatCard label="Top contributor" value={displayContributors[0]?.login ?? "—"} />
              <StatCard label="Period" value={period} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Commits — Top 20</p>
                <ContributorChart contributors={displayContributors} />
              </div>
              <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Contributor growth</p>
                {statsLoading ? (
                  <div className="flex flex-col items-center justify-center h-[280px] gap-2">
                    <div className="w-4 h-4 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-[#484f58]">GitHub is computing stats…</p>
                  </div>
                ) : (
                  <GrowthChart data={growthData} />
                )}
              </div>
            </div>

            {/* Contributor list */}
            <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">
                  All contributors
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#7d8590] text-[10px] font-normal">
                    {displayContributors.length}
                  </span>
                  {hideBots && botCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#9e6a0322] text-yellow-600 text-[10px] font-normal">
                      {botCount} bots hidden
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] w-36 transition-all focus:w-48"
                    />
                  </div>
                  {/* Share mode toggle */}
                  <button
                    onClick={() => shareMode ? exitShareMode() : setShareMode(true)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      shareMode
                        ? "border-[#388bfd] text-[#388bfd] bg-[#388bfd15]"
                        : "border-[#30363d] text-[#7d8590] hover:text-[#e6edf3]"
                    }`}
                  >
                    {shareMode ? "Cancel" : "Select"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {displayContributors.map((c, i) => (
                  <ContributorCard
                    key={c.login}
                    contributor={c}
                    rank={i + 1}
                    firstContributionDate={firstDates.get(c.login)}
                    selectable={shareMode}
                    selected={selectedLogins.has(c.login)}
                    onSelect={() => {
                      setSelectedLogins((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.login)) next.delete(c.login); else next.add(c.login);
                        return next;
                      });
                    }}
                    onClickUser={!shareMode ? () => setDrawerLogin(c.login) : undefined}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share mode floating bar */}
      {shareMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-full border border-[#388bfd] bg-[#161b22] shadow-2xl shadow-black/50">
          <span className="text-sm text-[#7d8590]">
            <span className="text-[#e6edf3] font-semibold">{selectedLogins.size}</span> selected
          </span>
          <button
            onClick={() => { setShowOG(true); exitShareMode(); }}
            disabled={selectedLogins.size === 0}
            className="px-4 py-1.5 text-sm bg-[#388bfd] hover:bg-[#58a6ff] disabled:opacity-40 text-white rounded-full transition-colors"
          >
            Generate image
          </button>
        </div>
      )}

      {/* Modals & Drawer */}
      <ContributorDrawer login={drawerLogin} onClose={() => setDrawerLogin(null)} />
      {showBadge && <BadgeModal owner={owner} repo={repo} onClose={() => setShowBadge(false)} />}
      {showOG && (
        <OGShareModal
          owner={owner}
          repo={repo}
          contributors={selectedLogins.size > 0 ? selectedContributors : displayContributors}
          onClose={() => setShowOG(false)}
        />
      )}
    </div>
  );
}
