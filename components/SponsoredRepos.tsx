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
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-[#484f58] uppercase tracking-widest">Sponsored</span>
        <Link href="/promote" className="text-[10px] text-[#388bfd] hover:underline">
          Promote your repo →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {repos.map((r) => (
          <div
            key={r.id}
            className="group rounded-xl border border-[#9e6a0330] bg-[#9e6a030a] p-4 hover:border-[#9e6a0360] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/${r.full_name}`}
                    className="text-sm font-semibold text-[#e6edf3] hover:text-[#58a6ff] transition-colors"
                  >
                    {r.full_name}
                  </Link>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#9e6a0340] text-[#d29922] bg-[#9e6a0318]">
                    Sponsored
                  </span>
                  {r.language && (
                    <span className="text-[10px] text-[#7d8590]">{r.language}</span>
                  )}
                </div>
                {r.description && (
                  <p className="text-xs text-[#7d8590] mt-1 line-clamp-2">{r.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1 text-xs text-[#7d8590]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  {r.stars.toLocaleString()}
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2.5 py-1 rounded-md border border-[#30363d] text-[#7d8590] hover:border-[#388bfd] hover:text-[#388bfd] transition-colors"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
