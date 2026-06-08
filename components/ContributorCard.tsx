import Image from "next/image";
import { Contributor } from "@/lib/types";

interface ContributorCardProps {
  contributor: Contributor;
  rank: number;
  firstContributionDate?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

export default function ContributorCard({ contributor, rank, firstContributionDate }: ContributorCardProps) {
  return (
    <a
      href={contributor.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-3 rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#388bfd] hover:bg-[#1c2128] transition-all"
    >
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
          <p className="text-[10px] text-[#484f58] mt-0.5">
            Since {firstContributionDate}
          </p>
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
