"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLOR_A = "#388bfd";
const COLOR_B = "#3fb950";

export default function CompareUsersPage() {
  const router = useRouter();
  const [userA, setUserA] = useState("");
  const [userB, setUserB] = useState("");

  function go() {
    if (!userA.trim() || !userB.trim()) return;
    router.push(`/compare/u/${encodeURIComponent(userA.trim())}/${encodeURIComponent(userB.trim())}`);
  }

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "#0d1117" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-1 rounded-lg border border-[#30363d] bg-[#161b22] p-0.5">
            <Link href="/compare" className="px-3 py-1.5 text-xs text-[#7d8590] hover:text-[#e6edf3] transition-colors">Repos</Link>
            <span className="px-3 py-1.5 text-xs rounded-md bg-[#21262d] text-[#e6edf3]">Users</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: COLOR_A }} />
            <input
              type="text"
              value={userA}
              onChange={(e) => setUserA(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="username"
              className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
            />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#30363d] bg-[#161b22] text-[10px] font-bold text-[#484f58] shrink-0">
            VS
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: COLOR_B }} />
            <input
              type="text"
              value={userB}
              onChange={(e) => setUserB(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="username"
              className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
            />
          </div>
          <button
            onClick={go}
            disabled={!userA || !userB}
            className="px-5 py-2.5 text-sm bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
          >
            Compare
          </button>
        </div>

        {/* Empty state suggestions */}
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#484f58]">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <p className="text-sm">Compare two GitHub profiles</p>
          <p className="text-xs text-center max-w-xs">
            Side-by-side stats: followers, activity, languages, shared repos, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[["torvalds", "gvanrossum"], ["sindresorhus", "tj"], ["yyx990803", "antfu"]].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                onClick={() => router.push(`/compare/u/${a}/${b}`)}
                className="px-3 py-1.5 text-xs font-mono rounded-md border border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#58a6ff] transition-colors"
              >
                {a} vs {b}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
