"use client";

import Image from "next/image";
import { Contributor } from "@/lib/types";

interface ContributorCardProps {
  contributor: Contributor;
  rank: number;
  firstContributionDate?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onClickUser?: () => void;
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

export default function ContributorCard({
  contributor, rank, firstContributionDate,
  selectable, selected, onSelect, onClickUser,
}: ContributorCardProps) {
  function handleClick(e: React.MouseEvent) {
    if (selectable) {
      e.preventDefault();
      onSelect?.();
      return;
    }
    if (onClickUser) {
      e.preventDefault();
      onClickUser();
    }
  }

  return (
    <a
      href={contributor.html_url}
      target={selectable || onClickUser ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
        ${selectable
          ? selected
            ? "border-[#388bfd] bg-[#1c2128] ring-1 ring-[#388bfd]"
            : "border-[#21262d] bg-[#161b22] hover:border-[#388bfd40]"
          : "border-[#21262d] bg-[#161b22] hover:border-[#388bfd] hover:bg-[#1c2128]"
        }`}
    >
      {selectable && (
        <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors
          ${selected ? "border-[#388bfd] bg-[#388bfd]" : "border-[#30363d]"}`}>
          {selected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}
      <span className={`w-6 text-xs font-bold text-right shrink-0 ${RANK_COLORS[rank] ?? "text-[#484f58]"}`}>
        {rank <= 3 ? ["🥇","🥈","🥉"][rank - 1] : `#${rank}`}
      </span>
      <Image
        src={contributor.avatar_url}
        alt={contributor.login}
        width={32}
        height={32}
        className="rounded-full ring-1 ring-[#30363d] group-hover:ring-[#388bfd] transition-all"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e6edf3] truncate leading-tight">
          {contributor.login}
        </p>
        {firstContributionDate && (
          <p className="text-[10px] text-[#484f58] mt-0.5">Since {firstContributionDate}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#e6edf3] tabular-nums">
          {contributor.contributions.toLocaleString()}
        </p>
        <p className="text-[10px] text-[#484f58]">commits</p>
      </div>
    </a>
  );
}
