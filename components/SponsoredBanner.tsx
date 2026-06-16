"use client";

import { useEffect, useState } from "react";
import type { PromotedRepo } from "@/lib/promoted";

export default function SponsoredBanner() {
  const [repos, setRepos] = useState<PromotedRepo[]>([]);

  useEffect(() => {
    fetch("/api/promote/active")
      .then((r) => r.json())
      .then((d) => setRepos((d.promotions ?? []).slice(0, 4)))
      .catch(() => {});
  }, []);

  if (repos.length === 0) return null;

  return (
    <div
      className="w-full border-b"
      style={{ borderColor: "#9e6a0330", background: "linear-gradient(180deg, #110d00 0%, #0d1117 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Label */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #d2992240, transparent)" }} />
          <span className="text-[9px] tracking-widest font-semibold uppercase" style={{ color: "#9e6a03" }}>
            Sponsored
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, #d2992240, transparent)" }} />
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {repos.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-1 rounded-lg px-3 py-2.5 transition-all"
              style={{
                background: "#0d1117",
                border: "1px solid #9e6a0340",
                boxShadow: "inset 0 0 0 1px #d299220a",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#d29922aa";
                (e.currentTarget as HTMLElement).style.background = "#13100200";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#9e6a0340";
                (e.currentTarget as HTMLElement).style.background = "#0d1117";
              }}
            >
              {/* Gold accent line */}
              <div className="absolute top-0 left-3 right-3 h-px" style={{ background: "linear-gradient(90deg, transparent, #d29922, transparent)" }} />

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#e6edf3] truncate font-mono group-hover:text-[#d29922] transition-colors">
                  {r.full_name}
                </span>
                {r.stars > 0 && (
                  <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium" style={{ color: "#d29922" }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    {r.stars >= 1000 ? `${(r.stars / 1000).toFixed(1)}k` : r.stars}
                  </span>
                )}
              </div>

              {r.description && (
                <p className="text-[10px] text-[#484f58] leading-relaxed line-clamp-1 group-hover:text-[#7d8590] transition-colors">
                  {r.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-0.5">
                {r.language && (
                  <span className="text-[9px] text-[#484f58]">{r.language}</span>
                )}
                <span className="ml-auto text-[9px] font-medium" style={{ color: "#9e6a03" }}>
                  ad
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
