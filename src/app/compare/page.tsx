"use client";

import { useMemo, useState } from "react";
import { LineChart as LineChartIcon, Loader2, Plus, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/formatters";

type CompareRange = "1m" | "3m" | "6m" | "1y" | "2y" | "5y";

interface CompareSymbolSeries {
  symbol: string;
  name: string;
  currentPrice: number;
  firstPrice: number;
  returnPercent: number;
}

interface CompareChartPoint {
  date: string;
  [symbol: string]: string | number | null;
}

interface CompareResult {
  symbols: CompareSymbolSeries[];
  priceSeries: CompareChartPoint[];
  normalizedSeries: CompareChartPoint[];
  range: CompareRange;
}

const RANGE_OPTIONS: CompareRange[] = ["1m", "3m", "6m", "1y", "2y", "5y"];
const COLORS = ["#34d399", "#60a5fa", "#f97316", "#a78bfa", "#f43f5e", "#22d3ee", "#facc15", "#fb7185"];
const PRESET_SYMBOLS = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA", "GLD", "TLT"];

export default function ComparePage() {
  const [input, setInput] = useState("");
  const [symbols, setSymbols] = useState<string[]>(["SPY", "QQQ"]);
  const [range, setRange] = useState<CompareRange>("1y");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  const symbolColorMap = useMemo(() => {
    const map = new Map<string, string>();
    symbols.forEach((s, i) => map.set(s, COLORS[i % COLORS.length]));
    return map;
  }, [symbols]);

  const addSymbol = (raw: string) => {
    const symbol = raw.trim().toUpperCase();
    if (!symbol) return;
    setSymbols((prev) => {
      if (prev.includes(symbol) || prev.length >= 8) return prev;
      return [...prev, symbol];
    });
  };

  const removeSymbol = (symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  };

  const runCompare = async () => {
    if (symbols.length < 2) {
      setError("Add at least 2 symbols.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/compare?symbols=${encodeURIComponent(symbols.join(","))}&range=${range}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load comparison data");
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <LineChartIcon className="w-8 h-8 text-emerald-400" />
          Stock / ETF Comparison
        </h1>
        <p className="text-slate-400">Compare multiple tickers on one chart (price + normalized performance).</p>
      </div>

      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">Add Symbol (Stock or ETF)</label>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSymbol(input);
                    setInput("");
                  }
                }}
                placeholder="e.g. AAPL or VTI"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={() => {
                  addSymbol(input);
                  setInput("");
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {PRESET_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => addSymbol(s)}
                  className="px-2 py-0.5 rounded text-[10px] border border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as CompareRange)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              {RANGE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runCompare}
            disabled={loading || symbols.length < 2}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LineChartIcon className="w-4 h-4" />}
            Compare
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Selected Symbols ({symbols.length}/8)</p>
          <div className="flex flex-wrap gap-2">
            {symbols.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs border border-slate-600 text-white"
                style={{ backgroundColor: `${symbolColorMap.get(s)}20` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: symbolColorMap.get(s) }} />
                {s}
                <button onClick={() => removeSymbol(s)} className="text-slate-300 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      </div>

      {result && (
        <>
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Normalized Performance (Starts at 100)</h2>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.normalizedSeries} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(d: string) =>
                      new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                    }
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value, name) => [Number(value).toFixed(2), String(name)]}
                  />
                  <Legend />
                  <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 4" />
                  {result.symbols.map((s, i) => (
                    <Line
                      key={s.symbol}
                      type="monotone"
                      dataKey={s.symbol}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Price Chart</h2>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.priceSeries} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(d: string) =>
                      new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                    }
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
                  />
                  <Legend />
                  {result.symbols.map((s, i) => (
                    <Line
                      key={s.symbol}
                      type="monotone"
                      dataKey={s.symbol}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-3 py-2">Symbol</th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-right px-3 py-2">Start Price</th>
                    <th className="text-right px-3 py-2">Current Price</th>
                    <th className="text-right px-3 py-2">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {result.symbols
                    .slice()
                    .sort((a, b) => b.returnPercent - a.returnPercent)
                    .map((s) => (
                      <tr key={s.symbol} className="border-b border-slate-700/50">
                        <td className="px-3 py-2 text-white font-semibold">{s.symbol}</td>
                        <td className="px-3 py-2 text-slate-300">{s.name}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{formatCurrency(s.firstPrice)}</td>
                        <td className="px-3 py-2 text-right text-white">{formatCurrency(s.currentPrice)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${s.returnPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatPercent(s.returnPercent)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
