import { NextRequest, NextResponse } from "next/server";
import { createOctokit } from "@/lib/github";

function badge(count: number): string {
  const label = "contributors";
  const value = count.toLocaleString();
  const lw = 97;
  const vw = Math.max(value.length * 7 + 16, 30);
  const tw = lw + vw;
  const lx = lw / 2;
  const vx = lw + vw / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tw}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${tw}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#24292e"/>
    <rect x="${lw}" width="${vw}" height="20" fill="#2563eb"/>
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
  const token = request.headers.get("x-github-token") || undefined;

  try {
    const octokit = createOctokit(token);
    const contributors: unknown[] = [];
    let page = 1;
    while (true) {
      const { data } = await octokit.repos.listContributors({ owner, repo, per_page: 100, page });
      if (!Array.isArray(data) || data.length === 0) break;
      contributors.push(...data);
      if (data.length < 100) break;
      page++;
    }

    return new NextResponse(badge(contributors.length), {
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
