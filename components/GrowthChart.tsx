"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
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
      <div className="flex items-center justify-center h-[280px] text-[#484f58] text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#388bfd" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#388bfd" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#7d8590" }}
          axisLine={{ stroke: "#21262d" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#7d8590" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: "#e6edf3" }}
          itemStyle={{ color: "#7d8590" }}
          formatter={(value) => [Number(value), "total contributors"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#388bfd"
          strokeWidth={2}
          fill="url(#growthGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
