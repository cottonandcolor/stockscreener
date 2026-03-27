"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Loader2, Minus, Waves } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, formatPercent, formatVolume } from "@/lib/formatters";

interface ETFFlow {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  moneyFlow: number;
  flowDirection: "inflow" | "outflow" | "neutral";
}

export default function ETFFlows() {
  const [flows, setFlows] = useState<ETFFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/etf-flows")
      .then((r) => r.json())
      .then((data) => setFlows(data.flows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">ETF Fund Flows</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading ETF flow data...</span>
        </div>
      </div>
    );
  }

  const categories = ["All", ...Array.from(new Set(flows.map((f) => f.category)))];
  const filtered = activeCategory === "All" ? flows : flows.filter((f) => f.category === activeCategory);

  const inflowCount = filtered.filter((f) => f.flowDirection === "inflow").length;
  const outflowCount = filtered.filter((f) => f.flowDirection === "outflow").length;
  const totalInflow = filtered
    .filter((f) => f.moneyFlow > 0)
    .reduce((s, f) => s + f.moneyFlow, 0);
  const totalOutflow = Math.abs(
    filtered.filter((f) => f.moneyFlow < 0).reduce((s, f) => s + f.moneyFlow, 0)
  );

  const chartData = filtered
    .sort((a, b) => b.moneyFlow - a.moneyFlow)
    .map((f) => ({
      symbol: f.symbol,
      flow: +(f.moneyFlow / 1e6).toFixed(1),
      color: f.moneyFlow >= 0 ? "#34d399" : "#f87171",
    }));

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Waves className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">ETF Fund Flows</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4 ml-7">
        Volume-weighted money flow indicator (price direction x volume)
      </p>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">ETFs Tracked</p>
          <p className="text-lg font-bold text-white">{filtered.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Net Inflows</p>
          <p className="text-lg font-bold text-emerald-400">{inflowCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Net Outflows</p>
          <p className="text-lg font-bold text-red-400">{outflowCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Flow Ratio</p>
          <p className={`text-lg font-bold ${totalInflow >= totalOutflow ? "text-emerald-400" : "text-red-400"}`}>
            {totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : "N/A"}
          </p>
        </div>
      </div>

      {/* Money Flow bar chart */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-2">Estimated Money Flow ($M)</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
              <XAxis
                dataKey="symbol"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}M`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                itemStyle={{ color: "#e2e8f0" }}
                formatter={(value) => {
                  const v = Number(value);
                  return [`${v > 0 ? "+" : ""}$${v.toFixed(1)}M`, "Flow"];
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="flow" radius={[3, 3, 0, 0]} maxBarSize={24}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ETF table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
              <th className="text-left px-3 py-2">ETF</th>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-right px-3 py-2">Price</th>
              <th className="text-right px-3 py-2">Change</th>
              <th className="text-right px-3 py-2">Volume</th>
              <th className="text-right px-3 py-2">Vol Ratio</th>
              <th className="text-center px-3 py-2">Flow</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-3 py-2">
                  <span className="font-bold text-white">{f.symbol}</span>
                  <p className="text-xs text-slate-500 truncate max-w-[140px]">{f.name}</p>
                </td>
                <td className="px-3 py-2 text-xs text-slate-400">{f.category}</td>
                <td className="px-3 py-2 text-right text-slate-200 tabular-nums">{formatCurrency(f.price)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={f.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {formatPercent(f.changePercent)}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-300 tabular-nums">{formatVolume(f.volume)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={`font-medium ${f.volumeRatio >= 1.2 ? "text-blue-400" : f.volumeRatio <= 0.8 ? "text-slate-500" : "text-slate-400"}`}>
                    {f.volumeRatio.toFixed(1)}x
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  {f.flowDirection === "inflow" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">
                      <ArrowUpRight className="w-3 h-3" /> Inflow
                    </span>
                  ) : f.flowDirection === "outflow" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400">
                      <ArrowDownRight className="w-3 h-3" /> Outflow
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400">
                      <Minus className="w-3 h-3" /> Neutral
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
