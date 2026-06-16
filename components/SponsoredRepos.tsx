"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PromotedRepo } from "@/lib/promoted";

export default function SponsoredRepos() {
  const [repos, setRepos] = useState<PromotedRepo[]>([]);

  useEffect(() => {
    fetch("/api/promote/active")
      .then((r) => r.json())
      .then((d) => setRepos(d.promotions ?? []))
      .catch(() => {});
  }, []);

  if (repos.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d29922]" />
          <span className="text-[10px] text-[#d29922] uppercase tracking-widest font-medium">Featured</span>
        </div>
        <Link href="/promote" className="text-[10px] text-[#484f58] hover:text-[#7d8590] transition-colors">
          Promote your repo →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {repos.map((r) => (
          <div
            key={r.id}
            className="relative rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1408 0%, #0d1117 60%)",
              border: "1px solid #9e6a0350",
              boxShadow: "0 0 0 1px #9e6a0318 inset",
            }}
          >
            {/* Gold top bar */}
            <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #d29922, #9e6a03, transparent)" }} />

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Link
                      href={`/${r.full_name}`}
                      className="text-base font-bold text-[#e6edf3] hover:text-[#f0c040] transition-colors"
                    >
                      {r.full_name}
                    </Link>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold tracking-wide" style={{ background: "#9e6a0325", color: "#d29922", border: "1px solid #9e6a0350" }}>
                      SPONSORED
                    </span>
                    {r.language && (
                      <span className="text-[10px] text-[#7d8590] bg-[#21262d] px-2 py-0.5 rounded-full">{r.language}</span>
                    )}
                  </div>

                  {/* Description */}
                  {r.description && (
                    <p className="text-sm text-[#7d8590] leading-relaxed mb-3">{r.description}</p>
                  )}

                  {/* CTA */}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{ background: "#9e6a0320", color: "#d29922", border: "1px solid #9e6a0360" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#9e6a0340"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#9e6a0320"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                    </svg>
                    View on GitHub
                  </a>
                </div>

                {/* Stars */}
                <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="#d29922">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  <span className="text-sm font-bold text-[#d29922]">{r.stars.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
