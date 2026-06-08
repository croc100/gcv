"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthDataPoint {
  date: string;
  total: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        데이터 없음
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [Number(value), "누적 기여자"]} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#growthGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
