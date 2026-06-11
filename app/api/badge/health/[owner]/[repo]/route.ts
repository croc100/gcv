import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

function busFactor(contribs: { contributions: number }[]): number {
  const total = contribs.reduce((s, c) => s + c.contributions, 0);
  if (total === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < contribs.length; i++) {
    cumulative += contribs[i].contributions;
    if (cumulative / total >= 0.5) return i + 1;
  }
  return contribs.length;
}

function diversityScore(contribs: { contributions: number }[]): number {
  const total = contribs.reduce((s, c) => s + c.contributions, 0);
  if (total === 0 || contribs.length <= 1) return 0;
  const hhi = contribs.reduce((s, c) => {
    const share = c.contributions / total;
    return s + share * share;
  }, 0);
  const normalized = (1 - hhi) / (1 - 1 / contribs.length);
  return Math.round(Math.min(normalized, 1) * 100);
}

function activityTrendScore(stats: { weeks: { w: number; c: number }[] }[]): number {
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
  return Math.min(Math.max(pct + 50, 0), 100);
}

function healthColor(score: number): string {
  if (score >= 70) return "#3fb950";
  if (score >= 40) return "#d29922";
  return "#f85149";
}

function badge(score: number): string {
  const label = "gcv";
  const value = `${score}%`;
  const color = healthColor(score);
  const lw = 36;
  const vw = Math.max(value.length * 7 + 14, 30);
  const tw = lw + vw;
  const lx = lw / 2;
  const vx = lw + vw / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${tw}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#24292e"/>
    <rect x="${lw}" width="${vw}" height="20" fill="${color}"/>
    <rect width="${tw}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${lx}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${lx}" y="14">${label}</text>
    <text x="${vx}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${vx}" y="14">${value}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = params;

  try {
    const octokit = createOctokit();

    const [contribRes, statsRes] = await Promise.allSettled([
      octokit.repos.listContributors({ owner, repo, per_page: 100 }),
      octokit.repos.getContributorsStats({ owner, repo }),
    ]);

    const contribs = contribRes.status === "fulfilled" ? contribRes.value.data : [];
    const statsRaw = statsRes.status === "fulfilled" && Array.isArray(statsRes.value.data)
      ? statsRes.value.data
      : [];

    const stats = statsRaw.map((s) => ({
      weeks: (s.weeks ?? []).map((w) => ({ w: w.w ?? 0, c: w.c ?? 0 })),
    }));

    const bf = busFactor(contribs as { contributions: number }[]);
    const div = diversityScore(contribs as { contributions: number }[]);
    const trend = activityTrendScore(stats);
    const score = Math.round(Math.min(bf * 20, 100) * 0.4 + div * 0.4 + trend * 0.2);

    return new NextResponse(badge(score), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse(badge(0), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
