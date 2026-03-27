"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
} from "lucide-react";

export interface BreadthData {
  advancers: number;
  decliners: number;
  unchanged: number;
  totalStocks: number;
  near52High: number;
  near52Low: number;
  aboveAvgVolume: number;
  belowAvgVolume: number;
  sectorBreadth: { sector: string; advancers: number; decliners: number; avgChange: number }[];
}

export default function MarketBreadth({ data }: { data: BreadthData }) {
  const adRatio = data.decliners > 0 ? +(data.advancers / data.decliners).toFixed(2) : data.advancers;
  const advPct = +((data.advancers / data.totalStocks) * 100).toFixed(1);
  const decPct = +((data.decliners / data.totalStocks) * 100).toFixed(1);

  const adPieData = [
    { name: "Advancers", value: data.advancers, color: "#34d399" },
    { name: "Decliners", value: data.decliners, color: "#f87171" },
    { name: "Unchanged", value: data.unchanged, color: "#64748b" },
  ];

  const sectorData = [...data.sectorBreadth]
    .sort((a, b) => b.avgChange - a.avgChange)
    .slice(0, 11);

  const highLowData = [
    { label: "Near 52W High", value: data.near52High, color: "#34d399" },
    { label: "Near 52W Low", value: data.near52Low, color: "#f87171" },
  ];

  const volumeData = [
    { label: "Above Avg Vol", value: data.aboveAvgVolume, color: "#60a5fa" },
    { label: "Below Avg Vol", value: data.belowAvgVolume, color: "#94a3b8" },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: A/D ratio, pie chart, key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* A/D Ratio card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Advance / Decline Ratio</p>
          <p className={`text-4xl font-bold ${adRatio >= 1 ? "text-emerald-400" : "text-red-400"}`}>
            {adRatio}
          </p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> {data.advancers} ({advPct}%)
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <TrendingDown className="w-3.5 h-3.5" /> {data.decliners} ({decPct}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{data.unchanged} unchanged</p>
        </div>

        {/* A/D Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2 text-center">Market Participation</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {adPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  formatter={(value, name) => [`${Number(value)} stocks`, String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {adPieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400">{d.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 52-week + Volume stats */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wide">52-Week Proximity</p>
            </div>
            {highLowData.map((d) => (
              <div key={d.label} className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-300">{d.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(d.value / data.totalStocks) * 100}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: d.color }}>
                    {d.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wide">Volume Trend</p>
            </div>
            {volumeData.map((d) => (
              <div key={d.label} className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-300">{d.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(d.value / data.totalStocks) * 100}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: d.color }}>
                    {d.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Sector Breadth Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <p className="text-sm font-medium text-white">Sector Breadth</p>
          <span className="text-xs text-slate-500 ml-auto">Avg % change by sector</span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
              />
              <YAxis
                type="category"
                dataKey="sector"
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                itemStyle={{ color: "#e2e8f0" }}
                formatter={(value) => { const v = Number(value); return [`${v > 0 ? "+" : ""}${v.toFixed(2)}%`, "Avg Change"]; }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="avgChange" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {sectorData.map((entry, i) => (
                  <Cell key={i} fill={entry.avgChange >= 0 ? "#34d399" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
