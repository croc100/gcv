"use client";

type ContributorSlim = { login: string; contributions: number };
type WeekData = { w: number; c: number };
type StatsEntry = { author: { login: string } | null; weeks: WeekData[] };

interface Props {
  contributors: ContributorSlim[];
  stats: StatsEntry[];
}

function busFactor(contribs: ContributorSlim[]): number {
  const total = contribs.reduce((s, c) => s + c.contributions, 0);
  if (total === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < contribs.length; i++) {
    cumulative += contribs[i].contributions;
    if (cumulative / total >= 0.5) return i + 1;
  }
  return contribs.length;
}

// Herfindahl-Hirschman Index → diversity (0=monopoly, 100=perfectly spread)
function diversityScore(contribs: ContributorSlim[]): number {
  const total = contribs.reduce((s, c) => s + c.contributions, 0);
  if (total === 0 || contribs.length === 0) return 0;
  const hhi = contribs.reduce((s, c) => {
    const share = c.contributions / total;
    return s + share * share;
  }, 0);
  // hhi ranges from 1/n (perfectly equal) to 1 (monopoly)
  const normalized = (1 - hhi) / (1 - 1 / Math.max(contribs.length, 1));
  return Math.round(Math.min(normalized, 1) * 100);
}

// Compare last 4 weeks vs previous 4 weeks across all contributors
function activityTrend(stats: StatsEntry[]): { pct: number; recent: number; prev: number } {
  const now = Math.floor(Date.now() / 1000);
  const fourWeeks = 4 * 7 * 24 * 3600;
  let recent = 0, prev = 0;
  for (const entry of stats) {
    for (const w of entry.weeks) {
      if (w.w >= now - fourWeeks) recent += w.c;
      else if (w.w >= now - 2 * fourWeeks) prev += w.c;
    }
  }
  const pct = prev === 0 ? (recent > 0 ? 100 : 0) : Math.round(((recent - prev) / prev) * 100);
  return { pct, recent, prev };
}

// Composite score 0–100
function overallScore(bf: number, div: number, trend: { pct: number }): number {
  const bfScore = Math.min(bf * 20, 100);   // 5+ people = 100
  const trendScore = Math.min(Math.max(trend.pct + 50, 0), 100);
  return Math.round(bfScore * 0.4 + div * 0.4 + trendScore * 0.2);
}

function scoreColor(score: number) {
  if (score >= 70) return { ring: "#238636", text: "#3fb950", bg: "#1a4731" };
  if (score >= 40) return { ring: "#9e6a03", text: "#d29922", bg: "#2d1f00" };
  return { ring: "#da3633", text: "#f85149", bg: "#3d1210" };
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[#484f58] uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold tabular-nums" style={{ color: color ?? "#e6edf3" }}>{value}</span>
      {sub && <span className="text-[10px] text-[#484f58]">{sub}</span>}
    </div>
  );
}

export default function RepoHealthScore({ contributors, stats }: Props) {
  if (contributors.length === 0) return null;

  const bf = busFactor(contributors);
  const div = diversityScore(contributors);
  const trend = activityTrend(stats);
  const score = overallScore(bf, div, trend);
  const col = scoreColor(score);

  const trendLabel = trend.pct > 0 ? `+${trend.pct}%` : `${trend.pct}%`;
  const trendColor = trend.pct > 0 ? "#3fb950" : trend.pct < 0 ? "#f85149" : "#7d8590";

  return (
    <div className="rounded-xl border bg-[#161b22] p-5 mb-4" style={{ borderColor: col.ring + "55" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Score gauge */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
            style={{ background: col.bg, border: `2px solid ${col.ring}`, color: col.text }}
          >
            {score}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e6edf3]">Repo Health Score</p>
            <p className="text-xs text-[#484f58] mt-0.5">
              {score >= 70 ? "Healthy — well distributed, active" : score >= 40 ? "Fair — room for improvement" : "At risk — low contributor diversity"}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex gap-6 flex-wrap">
          <Metric
            label="Bus factor"
            value={String(bf)}
            sub={bf === 1 ? "critical risk" : bf <= 2 ? "high risk" : "healthy"}
            color={bf <= 1 ? "#f85149" : bf <= 2 ? "#d29922" : "#3fb950"}
          />
          <Metric
            label="Diversity"
            value={`${div}%`}
            sub="contributor spread"
            color={div >= 60 ? "#3fb950" : div >= 30 ? "#d29922" : "#f85149"}
          />
          <Metric
            label="Activity (4w)"
            value={trendLabel}
            sub={`${trend.recent} vs ${trend.prev} commits`}
            color={trendColor}
          />
        </div>
      </div>
    </div>
  );
}
