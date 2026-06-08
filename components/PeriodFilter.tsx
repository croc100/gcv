"use client";

export type Period = "1M" | "3M" | "6M" | "1Y" | "MAX";

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "MAX"];

interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === p
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
