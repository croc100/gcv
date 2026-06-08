"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ContributorCard from "@/components/ContributorCard";
import ContributorChart from "@/components/ContributorChart";
import GrowthChart from "@/components/GrowthChart";
import PeriodFilter, { Period } from "@/components/PeriodFilter";
import { Contributor } from "@/lib/github";

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
  const points: GrowthPoint[] = [];

  for (const week of weeks) {
    for (const entry of stats) {
      if (!entry.author) continue;
      const w = entry.weeks.find((x) => x.w === week);
      if (w && w.c > 0) seenAuthors.add(entry.author.login);
    }
    points.push({
      date: new Date(week * 1000).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      total: seenAuthors.size,
    });
  }

  return points;
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
  const [token, setToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("github_token");
    if (saved) setToken(saved);
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
        throw new Error(e.error || "기여자 데이터 로드 실패");
      }

      const cData: Contributor[] = await cRes.json();
      setContributors(cData);

      if (sRes.ok) {
        const sData: StatsEntry[] = await sRes.json();
        setStats(sData);
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function saveToken(t: string) {
    setToken(t);
    localStorage.setItem("github_token", t);
    setShowTokenInput(false);
  }

  const filteredCommits = stats.length > 0 ? filterByPeriod(stats, period) : null;
  const displayContributors =
    filteredCommits
      ? contributors
          .map((c) => ({ ...c, contributions: filteredCommits.get(c.login) ?? 0 }))
          .filter((c) => c.contributions > 0)
          .sort((a, b) => b.contributions - a.contributions)
      : contributors;

  const growthData = stats.length > 0 ? buildGrowthData(stats, period) : [];

  const firstDates = new Map<string, string>();
  for (const entry of stats) {
    if (!entry.author) continue;
    const firstWeek = entry.weeks.find((w) => w.c > 0);
    if (firstWeek) {
      firstDates.set(
        entry.author.login,
        new Date(firstWeek.w * 1000).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link href="/" className="text-sm text-blue-500 hover:underline">
              ← 홈으로
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {owner}/{repo}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <PeriodFilter value={period} onChange={setPeriod} />
            <button
              onClick={() => setShowTokenInput((v) => !v)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {token ? "토큰 변경" : "토큰 설정"}
            </button>
          </div>
        </div>

        {showTokenInput && (
          <div className="mb-4 p-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
              GitHub Personal Access Token (rate limit: 5000/h)
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                defaultValue={token}
                placeholder="ghp_..."
                id="token-input"
                className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <button
                onClick={() => {
                  const el = document.getElementById("token-input") as HTMLInputElement;
                  saveToken(el.value);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-400">
            불러오는 중...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  커밋 수 Top 20
                </h2>
                <ContributorChart contributors={displayContributors} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  누적 기여자 성장
                </h2>
                <GrowthChart data={growthData} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                기여자 목록{" "}
                <span className="font-normal text-gray-500">
                  ({displayContributors.length}명)
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
