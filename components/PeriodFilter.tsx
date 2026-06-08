"use client";

export type Period = "1M" | "3M" | "6M" | "1Y" | "MAX";

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "MAX"];

interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-0.5 rounded-lg border border-[#30363d] bg-[#161b22] p-0.5">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === p
              ? "bg-[#21262d] text-[#e6edf3] shadow-sm"
              : "text-[#7d8590] hover:text-[#e6edf3]"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
