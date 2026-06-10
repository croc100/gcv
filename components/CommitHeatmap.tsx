"use client";

import { useMemo, useState } from "react";

type WeekData = { w: number; c: number };
type StatsEntry = { author: { login: string } | null; weeks: WeekData[] };

interface CommitHeatmapProps {
  stats: StatsEntry[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || max === 0) return 0;
  const pct = count / max;
  if (pct < 0.15) return 1;
  if (pct < 0.4) return 2;
  if (pct < 0.7) return 3;
  return 4;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

export default function CommitHeatmap({ stats }: CommitHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);
  const [focusLogin, setFocusLogin] = useState<string>("__all__");

  // Build top 5 contributors + "All"
  const topContributors = useMemo(() => {
    return stats
      .filter((e) => e.author)
      .map((e) => ({ login: e.author!.login, total: e.weeks.reduce((s, w) => s + w.c, 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [stats]);

  // Aggregate weekly commits — either all or for a specific contributor
  const weeklyMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const entry of stats) {
      if (focusLogin !== "__all__" && entry.author?.login !== focusLogin) continue;
      for (const w of entry.weeks) {
        map.set(w.w, (map.get(w.w) ?? 0) + w.c);
      }
    }
    return map;
  }, [stats, focusLogin]);

  // Build calendar: last 52 weeks aligned to Sunday columns
  const { columns, monthLabels } = useMemo(() => {
    const today = new Date();
    // Align to most recent Saturday (end of week)
    const dayOfWeek = today.getDay(); // 0=Sun
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - dayOfWeek + 6); // last Saturday

    const columns: { weekTs: number; days: { date: Date; ts: number }[] }[] = [];
    for (let col = 51; col >= 0; col--) {
      const days: { date: Date; ts: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - col * 7 - (6 - day));
        days.push({ date: d, ts: Math.floor(d.getTime() / 1000) });
      }
      // Week timestamp key: GitHub uses Sunday 00:00 UTC
      // Use UTC date parts to avoid DST/timezone shifting the key off midnight
      const sunday = days[0];
      const d = sunday.date;
      const wts = Math.floor(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000
      );
      columns.push({ weekTs: wts, days });
    }

    // Month labels: find first column of each month
    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    columns.forEach(({ days }, i) => {
      const m = days[0].date.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col: i, label: MONTHS[m] });
        lastMonth = m;
      }
    });

    return { columns, monthLabels };
  }, []);

  const max = useMemo(() => {
    let m = 0;
    weeklyMap.forEach((v) => { if (v > m) m = v; });
    return m;
  }, [weeklyMap]);

  const totalInView = useMemo(() => {
    let t = 0;
    weeklyMap.forEach((v) => { t += v; });
    return t;
  }, [weeklyMap]);

  const CELL = 13; // px per cell
  const GAP = 2;
  const STEP = CELL + GAP;
  const LEFT_OFFSET = 28; // room for day labels
  const TOP_OFFSET = 20;  // room for month labels

  const svgWidth = LEFT_OFFSET + 52 * STEP;
  const svgHeight = TOP_OFFSET + 7 * STEP;

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide">
          Commit activity
          <span className="ml-2 font-normal normal-case text-[#484f58]">— last 52 weeks</span>
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFocusLogin("__all__")}
            className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
              focusLogin === "__all__"
                ? "border-[#388bfd] text-[#388bfd] bg-[#388bfd11]"
                : "border-[#30363d] text-[#484f58] hover:border-[#484f58]"
            }`}
          >
            All
          </button>
          {topContributors.map((c) => (
            <button
              key={c.login}
              onClick={() => setFocusLogin(c.login)}
              className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                focusLogin === c.login
                  ? "border-[#388bfd] text-[#388bfd] bg-[#388bfd11]"
                  : "border-[#30363d] text-[#484f58] hover:border-[#484f58]"
              }`}
            >
              {c.login}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: "block", minWidth: svgWidth }}
        >
          {/* Month labels */}
          {monthLabels.map(({ col, label }) => (
            <text
              key={`${col}-${label}`}
              x={LEFT_OFFSET + col * STEP}
              y={12}
              fontSize={9}
              fill="#484f58"
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {[1, 3, 5].map((day) => (
            <text
              key={day}
              x={0}
              y={TOP_OFFSET + day * STEP + CELL - 2}
              fontSize={9}
              fill="#484f58"
            >
              {DAYS[day].slice(0, 3)}
            </text>
          ))}

          {/* Cells */}
          {columns.map(({ weekTs, days }, col) => {
            const weekCommits = weeklyMap.get(weekTs) ?? 0;
            const level = getLevel(weekCommits, max);

            return days.map(({ date }, day) => {
              // Per-day data not available from GitHub stats (weekly only), so all days in week share same count
              const isFuture = date > new Date();
              const color = isFuture ? "transparent" : LEVEL_COLORS[level];
              const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

              return (
                <rect
                  key={`${col}-${day}`}
                  x={LEFT_OFFSET + col * STEP}
                  y={TOP_OFFSET + day * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={color}
                  style={{ cursor: isFuture ? "default" : "pointer" }}
                  onMouseEnter={(e) => {
                    if (isFuture) return;
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    const x = Math.min(rect.left + rect.width / 2, window.innerWidth - 120);
                    setTooltip({
                      x: Math.max(x, 60),
                      y: rect.top - 8,
                      date: dateStr,
                      count: weekCommits,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            });
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[#484f58]">{totalInView.toLocaleString()} commits in view</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#484f58]">Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div
                key={l}
                style={{ width: 10, height: 10, borderRadius: 2, background: LEVEL_COLORS[l] }}
              />
            ))}
            <span className="text-[10px] text-[#484f58]">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1.5 rounded-md bg-[#1c2128] border border-[#30363d] shadow-lg text-[11px] text-[#e6edf3] whitespace-nowrap -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-semibold">{tooltip.count.toLocaleString()} commits</span>
          <span className="text-[#7d8590] ml-1.5">week of {tooltip.date}</span>
        </div>
      )}
    </div>
  );
}
