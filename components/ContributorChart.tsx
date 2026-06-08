"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Contributor } from "@/lib/github";

interface ContributorChartProps {
  contributors: Contributor[];
  limit?: number;
}

export default function ContributorChart({
  contributors,
  limit = 20,
}: ContributorChartProps) {
  const data = contributors.slice(0, limit).map((c) => ({
    name: c.login,
    commits: c.contributions,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 60, left: 8 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [Number(value).toLocaleString(), "커밋"]}
        />
        <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#2563eb" : i < 3 ? "#60a5fa" : "#93c5fd"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
