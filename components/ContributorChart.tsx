"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Contributor } from "@/lib/types";

interface ContributorChartProps {
  contributors: Contributor[];
  limit?: number;
}

export default function ContributorChart({ contributors, limit = 20 }: ContributorChartProps) {
  const data = contributors.slice(0, limit).map((c) => ({
    name: c.login,
    commits: c.contributions,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 56, left: 4 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#7d8590" }}
          angle={-45}
          textAnchor="end"
          interval={0}
          axisLine={{ stroke: "#21262d" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#7d8590" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "#21262d" }}
          contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: "#e6edf3" }}
          itemStyle={{ color: "#7d8590" }}
          formatter={(value) => [Number(value).toLocaleString(), "commits"]}
        />
        <Bar dataKey="commits" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#388bfd" : i < 3 ? "#1f6feb" : "#0d419d"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
