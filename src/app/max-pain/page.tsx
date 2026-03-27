"use client";

import { useState } from "react";
import {
  Crosshair,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface MaxPainStrike {
  strike: number;
  callOI: number;
  putOI: number;
  callPain: number;
  putPain: number;
  totalPain: number;
}

interface MaxPainResult {
  symbol: string;
  name: string;
  currentPrice: number;
  expirationDate: string;
  expirationDates: string[];
  maxPainPrice: number;
  strikes: MaxPainStrike[];
  totalCallOI: number;
  totalPutOI: number;
  putCallRatio: number;
}

const PRESETS = [
  "SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "AMD",
];

export default function MaxPainPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MaxPainResult | null>(null);
  const [error, setError] = useState("");

  const fetchData = async (overrideDate?: string) => {
    if (!symbol) return;
    setLoading(true);
    setError("");

    const dateParam = overrideDate ?? date;
    try {
      const url = `/api/max-pain?symbol=${encodeURIComponent(symbol)}${
        dateParam ? `&date=${dateParam}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch");
      }
      const data: MaxPainResult = await res.json();
      setResult(data);
      if (!dateParam && data.expirationDate) {
        setDate(data.expirationDate);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (symbol) fetchData(newDate);
  };

  const chartStrikes = result
    ? filterStrikesForChart(result.strikes, result.currentPrice, result.maxPainPrice)
    : [];

  const maxTotalPain = chartStrikes.length
    ? Math.max(...chartStrikes.map((s) => s.totalPain))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-purple-400" />
          Options Max Pain Calculator
        </h1>
        <p className="text-slate-400">
          Find the strike price where maximum options expire worthless using live options chain data
        </p>
      </div>

      {/* Input */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Stock / ETF Ticker
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. SPY, AAPL"
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSymbol(p);
                    setDate("");
                    setResult(null);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    symbol === p
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Expiration Date
            </label>
            {result && result.expirationDates.length > 0 ? (
              <select
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              >
                {result.expirationDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            )}
            <p className="text-[10px] text-slate-500 mt-1.5">
              Leave blank to auto-select the nearest expiration
            </p>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchData()}
              disabled={loading || !symbol}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" /> Calculate Max Pain
                </>
              )}
            </button>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <SummaryCard
              label="Max Pain Price"
              value={formatCurrency(result.maxPainPrice)}
              icon={<Target className="w-4 h-4 text-purple-400" />}
              accent="purple"
            />
            <SummaryCard
              label="Current Price"
              value={formatCurrency(result.currentPrice)}
              icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
              accent="blue"
            />
            <SummaryCard
              label="Distance"
              value={`${((result.maxPainPrice - result.currentPrice) / result.currentPrice * 100).toFixed(2)}%`}
              icon={
                result.maxPainPrice >= result.currentPrice ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )
              }
              accent={result.maxPainPrice >= result.currentPrice ? "emerald" : "red"}
            />
            <SummaryCard
              label="Put/Call Ratio"
              value={String(result.putCallRatio)}
              icon={<ArrowRight className="w-4 h-4 text-amber-400" />}
              accent={result.putCallRatio > 1 ? "red" : "emerald"}
            />
            <SummaryCard
              label="Total OI"
              value={((result.totalCallOI + result.totalPutOI) / 1000).toFixed(1) + "K"}
              icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
              accent="cyan"
            />
          </div>

          {/* Low OI warning */}
          {result.totalCallOI + result.totalPutOI < 100 && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Open interest is low for this expiration ({(result.totalCallOI + result.totalPutOI).toLocaleString()} contracts).
                OI updates once daily after market close. Try a monthly expiration (3rd Friday) for better data, or check during market hours.
              </span>
            </div>
          )}

          {/* Pain Chart */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-purple-400" />
              Max Pain Chart — {result.symbol}{" "}
              <span className="text-slate-500 font-normal">
                Exp:{" "}
                {new Date(result.expirationDate + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Total dollar pain per strike — the lowest point is max pain ({formatCurrency(result.maxPainPrice)})
            </p>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartStrikes} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="strike"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1e9
                        ? `$${(v / 1e9).toFixed(1)}B`
                        : v >= 1e6
                          ? `$${(v / 1e6).toFixed(1)}M`
                          : `$${(v / 1e3).toFixed(0)}K`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    labelFormatter={(v) => `Strike: $${v}`}
                    formatter={(value, name) => {
                      const label =
                        String(name) === "callPain"
                          ? "Call Pain"
                          : String(name) === "putPain"
                            ? "Put Pain"
                            : "Total Pain";
                      return [
                        `$${(Number(value) / 1e6).toFixed(2)}M`,
                        label,
                      ];
                    }}
                  />
                  <Bar dataKey="callPain" stackId="pain" fill="#34d399" fillOpacity={0.7} radius={[0, 0, 0, 0]}>
                    {chartStrikes.map((s, i) => (
                      <Cell
                        key={i}
                        fill={s.strike === result.maxPainPrice ? "#a855f7" : "#34d399"}
                        fillOpacity={s.strike === result.maxPainPrice ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="putPain" stackId="pain" fill="#f87171" fillOpacity={0.7} radius={[2, 2, 0, 0]}>
                    {chartStrikes.map((s, i) => (
                      <Cell
                        key={i}
                        fill={s.strike === result.maxPainPrice ? "#a855f7" : "#f87171"}
                        fillOpacity={s.strike === result.maxPainPrice ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="totalPain"
                    stroke="#c084fc"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 3"
                  />
                  <ReferenceLine
                    x={result.maxPainPrice}
                    stroke="#a855f7"
                    strokeWidth={2}
                    label={{
                      value: `Max Pain $${result.maxPainPrice}`,
                      position: "top",
                      fill: "#a855f7",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                  <ReferenceLine
                    x={result.currentPrice}
                    stroke="#60a5fa"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    label={{
                      value: `Price $${result.currentPrice.toFixed(2)}`,
                      position: "insideTopRight",
                      fill: "#60a5fa",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-400 rounded-sm opacity-70" /> Call Pain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-red-400 rounded-sm opacity-70" /> Put Pain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0 border-t-2 border-dashed border-purple-400" /> Total Pain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-purple-500 rounded-sm" /> Max Pain
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0 border-t-2 border-dashed border-blue-400" /> Current Price
              </span>
            </div>
          </div>

          {/* Open Interest Chart */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Open Interest by Strike
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartStrikes} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="strike"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    labelFormatter={(v) => `Strike: $${v}`}
                    formatter={(value, name) => {
                      const label = String(name) === "callOI" ? "Call OI" : "Put OI";
                      return [Number(value).toLocaleString(), label];
                    }}
                  />
                  <Bar dataKey="callOI" fill="#34d399" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="putOI" fill="#f87171" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                  <ReferenceLine
                    x={result.currentPrice}
                    stroke="#60a5fa"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-400 rounded-sm opacity-70" /> Call OI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-red-400 rounded-sm opacity-70" /> Put OI
              </span>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-slate-800/30 border border-purple-900/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Max Pain Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="space-y-3">
                <AnalysisItem
                  title="Max Pain Level"
                  text={`The max pain price for ${result.symbol} at the ${new Date(result.expirationDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })} expiration is ${formatCurrency(result.maxPainPrice)}. The current price is ${formatCurrency(result.currentPrice)}, which is ${Math.abs(((result.currentPrice - result.maxPainPrice) / result.maxPainPrice) * 100).toFixed(1)}% ${result.currentPrice > result.maxPainPrice ? "above" : "below"} max pain.`}
                />
                <AnalysisItem
                  title="Put/Call OI Ratio"
                  text={`The put/call ratio is ${result.putCallRatio}. ${
                    result.putCallRatio > 1.2
                      ? "This is bearishly skewed — more put open interest suggests hedging or bearish bets."
                      : result.putCallRatio < 0.8
                        ? "This is bullishly skewed — more call open interest suggests optimism or upside speculation."
                        : "This is relatively balanced between calls and puts."
                  } Total call OI: ${result.totalCallOI.toLocaleString()}, total put OI: ${result.totalPutOI.toLocaleString()}.`}
                />
              </div>
              <div className="space-y-3">
                <AnalysisItem
                  title="What is Max Pain?"
                  text="Max pain is the strike price where the most options (calls + puts) expire worthless, causing maximum loss for option buyers. Market makers, who sell options, theoretically benefit when the stock closes near this price at expiration."
                />
                <AnalysisItem
                  title="How to Use It"
                  text="Max pain acts as a magnet for price action near expiration. If the stock is far from max pain, there may be gravitational pull toward it. Combine with volume, open interest concentration, and other signals — max pain alone is not a trading signal."
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Intro when no results */}
      {!result && !loading && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">About Options Max Pain</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <div className="space-y-2">
              <p className="text-purple-400 font-semibold">What It Is</p>
              <p>
                Max pain is the strike price at which the total dollar value of outstanding options
                would result in the greatest financial loss for option holders at expiration. It
                represents the price where most options expire worthless.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-purple-400 font-semibold">How It&apos;s Calculated</p>
              <p>
                For each strike, we compute the total intrinsic value of all calls and puts if the
                stock settled at that price. The strike with the lowest total value is max pain —
                where option buyers lose the most.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-purple-400 font-semibold">How to Use This Tool</p>
              <p>
                Enter a ticker symbol and optionally select an expiration date. The tool fetches
                live options chain data and calculates max pain, showing a visual breakdown of
                pain distribution and open interest at each strike.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function filterStrikesForChart(
  strikes: MaxPainStrike[],
  currentPrice: number,
  maxPainPrice: number
): MaxPainStrike[] {
  const center = (currentPrice + maxPainPrice) / 2;
  const range = Math.max(Math.abs(currentPrice - maxPainPrice) * 2.5, currentPrice * 0.15);
  const lo = center - range;
  const hi = center + range;
  const filtered = strikes.filter((s) => s.strike >= lo && s.strike <= hi);
  if (filtered.length > 60) {
    const step = Math.ceil(filtered.length / 50);
    return filtered.filter((_, i) => i % step === 0);
  }
  return filtered;
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  const colorMap: Record<string, string> = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400",
  };
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-xl font-bold ${colorMap[accent] ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function AnalysisItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-purple-400 font-semibold text-xs uppercase tracking-wide mb-1">{title}</p>
      <p className="text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
