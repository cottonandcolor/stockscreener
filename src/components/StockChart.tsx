"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface PricePoint {
  date: string;
  close: number;
  volume: number;
}

interface Props {
  data: PricePoint[];
  color?: string;
}

const RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

export default function StockChart({ data, color = "#10b981" }: Props) {
  const [range, setRange] = useState(4);
  const filtered = data.slice(-RANGES[range].days);

  const minPrice = Math.min(...filtered.map((d) => d.close));
  const maxPrice = Math.max(...filtered.map((d) => d.close));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setRange(i)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              range === i
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(d) => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            interval={Math.max(Math.floor(filtered.length / 8), 1)}
            stroke="#475569"
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            stroke="#475569"
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Close"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
