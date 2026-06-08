"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecent, getFavorites, RepoEntry } from "@/lib/history";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function RepoChip({ owner, repo, starred }: { owner: string; repo: string; starred: boolean }) {
  return (
    <Link
      href={`/${owner}/${repo}`}
      className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#388bfd] transition-colors"
    >
      {starred && (
        <span className="text-yellow-400">
          <StarIcon filled />
        </span>
      )}
      <span className="text-xs font-mono text-[#7d8590] group-hover:text-[#e6edf3] transition-colors">
        <span className="text-[#484f58]">{owner}</span>
        <span className="text-[#484f58] mx-0.5">/</span>
        {repo}
      </span>
    </Link>
  );
}

export default function RecentRepos() {
  const [recent, setRecent] = useState<RepoEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecent());
    setFavorites(getFavorites());
  }, []);

  const favoriteEntries = favorites
    .map((key) => {
      const [owner, repo] = key.split("/");
      return { owner, repo };
    })
    .filter(Boolean);

  const recentFiltered = recent.filter(
    (e) => !favorites.includes(`${e.owner}/${e.repo}`)
  );

  if (favoriteEntries.length === 0 && recentFiltered.length === 0) return null;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      {favoriteEntries.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <StarIcon filled /> Favorites
          </p>
          <div className="flex flex-wrap gap-2">
            {favoriteEntries.map(({ owner, repo }) => (
              <RepoChip key={`${owner}/${repo}`} owner={owner} repo={repo} starred />
            ))}
          </div>
        </div>
      )}

      {recentFiltered.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-2">
            Recently visited
          </p>
          <div className="flex flex-wrap gap-2">
            {recentFiltered.map((e) => (
              <RepoChip key={`${e.owner}/${e.repo}`} owner={e.owner} repo={e.repo} starred={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
