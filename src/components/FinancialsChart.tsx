"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface Financial {
  quarter: string;
  revenue: number;
  profit: number;
  eps: number;
}

interface Props {
  data: Financial[];
}

export default function FinancialsChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    revenueB: +(d.revenue / 1e9).toFixed(2),
    profitB: +(d.profit / 1e9).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#475569" />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v}B`} stroke="#475569" />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "13px",
          }}
          formatter={(value, name) => [
            `$${Number(value).toFixed(2)}B`,
            name === "revenueB" ? "Revenue" : "Profit",
          ]}
        />
        <Legend formatter={(value) => (value === "revenueB" ? "Revenue" : "Profit")} />
        <Bar dataKey="revenueB" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profitB" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
