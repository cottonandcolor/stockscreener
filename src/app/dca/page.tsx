"use client";

import { useState } from "react";
import {
  Calculator,
  Loader2,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";

interface DCAPurchase {
  date: string;
  price: number;
  invested: number;
  sharesBought: number;
  totalShares: number;
  totalInvested: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface DCAResult {
  symbol: string;
  name: string;
  currentPrice: number;
  totalAmount: number;
  months: number;
  frequency: string;
  investmentPerPeriod: number;
  numberOfPurchases: number;
  purchases: DCAPurchase[];
  summary: {
    totalInvested: number;
    totalShares: number;
    avgCostBasis: number;
    currentValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    lumpSumShares: number;
    lumpSumValue: number;
    lumpSumReturn: number;
    lumpSumReturnPercent: number;
  };
}

const PRESETS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq 100" },
  { symbol: "VTI", label: "Total Market" },
  { symbol: "AAPL", label: "Apple" },
  { symbol: "MSFT", label: "Microsoft" },
  { symbol: "NVDA", label: "NVIDIA" },
  { symbol: "GOOGL", label: "Alphabet" },
  { symbol: "SCHD", label: "Schwab Div" },
];

export default function DCAPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [amount, setAmount] = useState("10000");
  const [months, setMonths] = useState("12");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DCAResult | null>(null);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);

  const runSimulation = async () => {
    if (!symbol || Number(amount) <= 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/dca?symbol=${encodeURIComponent(symbol)}&amount=${amount}&months=${months}&frequency=${frequency}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to run simulation");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const freqLabel = frequency === "weekly" ? "week" : frequency === "biweekly" ? "2 weeks" : "month";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-emerald-400" />
          Dollar Cost Averaging Calculator
        </h1>
        <p className="text-slate-400">
          Simulate a DCA strategy using real historical prices from Yahoo Finance
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Symbol */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Stock / ETF Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. SPY, AAPL"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p.symbol}
                  onClick={() => setSymbol(p.symbol)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    symbol === p.symbol
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Total Investment ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="100"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {["1000", "5000", "10000", "25000", "50000"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    amount === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  ${Number(v).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Timeframe (Months)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                min="1"
                max="60"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {["3", "6", "12", "24", "36"].map((v) => (
                <button
                  key={v}
                  onClick={() => setMonths(v)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    months === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {v}mo
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
              Purchase Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as typeof frequency)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-2">
              {Number(amount) > 0 && Number(months) > 0
                ? `≈ ${formatCurrency(
                    Number(amount) /
                      Math.max(
                        1,
                        Math.floor(
                          (Number(months) * 30) /
                            (frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30)
                        )
                      )
                  )} per ${freqLabel}`
                : ""}
            </p>
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading || !symbol || Number(amount) <= 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Simulating...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" /> Run DCA Simulation
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Total Invested"
              value={formatCurrency(result.summary.totalInvested)}
              sub={`${result.numberOfPurchases} purchases`}
              color="text-white"
            />
            <SummaryCard
              label="Current Value"
              value={formatCurrency(result.summary.currentValue)}
              sub={`${formatNumber(result.summary.totalShares, 4)} shares`}
              color="text-white"
            />
            <SummaryCard
              label="DCA Return"
              value={formatCurrency(result.summary.totalReturn)}
              sub={formatPercent(result.summary.totalReturnPercent)}
              color={result.summary.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}
            />
            <SummaryCard
              label="Avg Cost Basis"
              value={formatCurrency(result.summary.avgCostBasis)}
              sub={`Current: ${formatCurrency(result.currentPrice)}`}
              color="text-white"
            />
          </div>

          {/* DCA vs Lump Sum Comparison */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-purple-400" />
              DCA vs Lump Sum Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 border ${
                result.summary.totalReturn >= result.summary.lumpSumReturn
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-slate-800/50 border-slate-700"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">DCA Strategy</span>
                  {result.summary.totalReturn >= result.summary.lumpSumReturn && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">WINNER</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(result.summary.currentValue)}</p>
                <p className={`text-sm font-medium ${result.summary.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(result.summary.totalReturn)} ({formatPercent(result.summary.totalReturnPercent)})
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(result.investmentPerPeriod)} / {freqLabel} over {result.months} months
                </p>
              </div>
              <div className={`rounded-lg p-4 border ${
                result.summary.lumpSumReturn > result.summary.totalReturn
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-slate-800/50 border-slate-700"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Lump Sum (Day 1)</span>
                  {result.summary.lumpSumReturn > result.summary.totalReturn && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">WINNER</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(result.summary.lumpSumValue)}</p>
                <p className={`text-sm font-medium ${result.summary.lumpSumReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(result.summary.lumpSumReturn)} ({formatPercent(result.summary.lumpSumReturnPercent)})
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(result.totalAmount)} invested on {result.purchases[0]?.date ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Portfolio Growth Over Time
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.purchases} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="dcaValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dcaInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(d: string) => {
                      const dt = new Date(d);
                      return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value, name) => {
                      const label = name === "marketValue" ? "Market Value" : "Total Invested";
                      return [formatCurrency(Number(value)), label];
                    }}
                  />
                  <Area type="monotone" dataKey="totalInvested" stroke="#60a5fa" fill="url(#dcaInvested)" strokeWidth={2} />
                  <Area type="monotone" dataKey="marketValue" stroke="#34d399" fill="url(#dcaValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 rounded" /> Market Value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-400 rounded" /> Total Invested
              </span>
            </div>
          </div>

          {/* Purchase History (collapsible) */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 mb-6">
            <button
              onClick={() => setShowTable(!showTable)}
              className="w-full flex items-center justify-between text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Purchase History ({result.numberOfPurchases} purchases)
              </span>
              {showTable ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showTable && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-right px-3 py-2">Price</th>
                      <th className="text-right px-3 py-2">Invested</th>
                      <th className="text-right px-3 py-2">Shares</th>
                      <th className="text-right px-3 py-2">Total Shares</th>
                      <th className="text-right px-3 py-2">Value</th>
                      <th className="text-right px-3 py-2">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.purchases.map((p, i) => (
                      <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-2 text-slate-300 tabular-nums whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-200 tabular-nums">{formatCurrency(p.price)}</td>
                        <td className="px-3 py-2 text-right text-blue-400 tabular-nums">{formatCurrency(p.invested)}</td>
                        <td className="px-3 py-2 text-right text-slate-300 tabular-nums">{p.sharesBought.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right text-slate-200 tabular-nums">{p.totalShares.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right text-white tabular-nums font-medium">{formatCurrency(p.marketValue)}</td>
                        <td className={`px-3 py-2 text-right tabular-nums font-medium ${p.gainLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatPercent(p.gainLossPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Strategy Guidance */}
          <div className="bg-slate-800/30 border border-emerald-900/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              DCA Strategy Guidance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="space-y-3">
                <GuidanceItem
                  title="Your Plan"
                  text={`Invest ${formatCurrency(result.investmentPerPeriod)} every ${freqLabel} into ${result.symbol} (${result.name}) for ${result.months} months. Total commitment: ${formatCurrency(result.totalAmount)}.`}
                />
                <GuidanceItem
                  title="Why DCA Works"
                  text="Dollar cost averaging reduces the risk of investing a large amount at the wrong time. By spreading purchases over time, you buy more shares when prices are low and fewer when prices are high, naturally lowering your average cost basis."
                />
                <GuidanceItem
                  title="Best For"
                  text="Investors who want to minimize timing risk, those investing from regular income (paychecks), volatile assets where entry price matters, and long-term portfolio building."
                />
              </div>
              <div className="space-y-3">
                <GuidanceItem
                  title="Your Average Cost"
                  text={`Your DCA average cost basis is ${formatCurrency(result.summary.avgCostBasis)} per share vs the current price of ${formatCurrency(result.currentPrice)}. ${
                    result.summary.avgCostBasis < result.currentPrice
                      ? "Your average cost is below the current price — the strategy worked in your favor."
                      : "Your average cost is above the current price — this can happen in downtrends, but DCA protects you from investing everything at the top."
                  }`}
                />
                <GuidanceItem
                  title="DCA vs Lump Sum"
                  text={`In this simulation, ${
                    result.summary.totalReturn >= result.summary.lumpSumReturn
                      ? "DCA outperformed lump sum investing"
                      : "lump sum outperformed DCA"
                  }. Historically, lump sum wins ~65% of the time in rising markets, but DCA provides better risk-adjusted returns and peace of mind in volatile markets.`}
                />
                <GuidanceItem
                  title="Tips"
                  text="Set up automatic investments to remove emotion from the process. Stay consistent regardless of market conditions. Consider increasing your DCA amount when you get raises. Combine DCA with diversification across multiple assets."
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Intro guidance when no results */}
      {!result && !loading && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">What is Dollar Cost Averaging?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <div className="space-y-2">
              <p className="text-emerald-400 font-semibold">How It Works</p>
              <p>Instead of investing a lump sum all at once, you divide your total investment into equal periodic purchases. This spreads your buy-in price across different market conditions.</p>
            </div>
            <div className="space-y-2">
              <p className="text-emerald-400 font-semibold">Example</p>
              <p>$12,000 invested monthly over 12 months = $1,000/month. If the stock dips mid-year, you automatically buy more shares at lower prices, reducing your average cost.</p>
            </div>
            <div className="space-y-2">
              <p className="text-emerald-400 font-semibold">How to Use This Tool</p>
              <p>Enter a symbol, your total budget, timeframe, and purchase frequency. The calculator will simulate the strategy using real historical prices and compare it to a lump sum investment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${color === "text-white" ? "text-slate-400" : color}`}>{sub}</p>
    </div>
  );
}

function GuidanceItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-1">{title}</p>
      <p className="text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
