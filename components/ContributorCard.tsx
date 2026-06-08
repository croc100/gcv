import Image from "next/image";
import { Contributor } from "@/lib/github";

interface ContributorCardProps {
  contributor: Contributor;
  rank: number;
  firstContributionDate?: string;
}

export default function ContributorCard({
  contributor,
  rank,
  firstContributionDate,
}: ContributorCardProps) {
  return (
    <a
      href={contributor.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800"
    >
      <span className="w-7 text-sm font-medium text-gray-400 text-right shrink-0">
        #{rank}
      </span>
      <Image
        src={contributor.avatar_url}
        alt={contributor.login}
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {contributor.login}
        </p>
        {firstContributionDate && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            첫 기여: {firstContributionDate}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {contributor.contributions.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">커밋</p>
      </div>
    </a>
  );
}
