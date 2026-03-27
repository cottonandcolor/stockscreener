"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, TrendingUp, TrendingDown, Globe, Building2, Users, Calendar, UserCheck } from "lucide-react";
import StockChart from "@/components/StockChart";
import FinancialsChart from "@/components/FinancialsChart";
import InsiderTrades from "@/components/InsiderTrades";
import { useWatchlist } from "@/components/WatchlistProvider";
import { formatCurrency, formatLargeNumber, formatVolume, formatPercent, formatNumber } from "@/lib/formatters";
import type { StockDetail, InsiderTrade } from "@/lib/stockData";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const { isWatched, toggle } = useWatchlist();

  const [stock, setStock] = useState<StockDetail | null>(null);
  const [insiderTrades, setInsiderTrades] = useState<InsiderTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chart" | "financials">("chart");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/stocks/${symbol}`).then((r) => r.json()),
      fetch(`/api/stocks/${symbol}/insiders`).then((r) => r.json()),
    ])
      .then(([stockData, insiderData]) => {
        if (stockData.error) setStock(null);
        else setStock(stockData);
        setInsiderTrades(insiderData.trades || []);
      })
      .catch(() => setStock(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-700 rounded mx-auto mb-4" />
          <div className="h-4 w-64 bg-slate-700 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Stock Not Found</h2>
        <p className="text-slate-400 mb-6">Could not find stock with symbol &ldquo;{symbol}&rdquo;</p>
        <Link href="/screener" className="text-emerald-400 hover:underline">
          &larr; Back to Screener
        </Link>
      </div>
    );
  }

  const isUp = stock.change >= 0;
  const watched = isWatched(stock.symbol);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back + Header */}
      <Link href="/screener" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Screener
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">{stock.symbol}</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-700 text-slate-300">
              {stock.exchange}
            </span>
            <button
              onClick={() => toggle(stock.symbol)}
              className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Star className={`w-5 h-5 ${watched ? "fill-yellow-400 text-yellow-400" : "text-slate-500"}`} />
            </button>
          </div>
          <p className="text-lg text-slate-300">{stock.name}</p>
          <p className="text-sm text-slate-500 mt-1">{stock.sector} &middot; {stock.industry}</p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-4xl font-bold text-white">{formatCurrency(stock.price)}</p>
          <p className={`text-lg font-semibold flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {formatCurrency(Math.abs(stock.change))} ({formatPercent(stock.changePercent)})
          </p>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("chart")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "chart" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Price Chart
        </button>
        <button
          onClick={() => setTab("financials")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "financials" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Financials
        </button>
      </div>

      {/* Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
        {tab === "chart" ? (
          <StockChart
            data={stock.historicalPrices.map((p) => ({ date: p.date, close: p.close, volume: p.volume }))}
            color={isUp ? "#10b981" : "#ef4444"}
          />
        ) : (
          <FinancialsChart data={stock.financials} />
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Market Cap" value={formatLargeNumber(stock.marketCap)} />
        <MetricCard label="P/E Ratio" value={formatNumber(stock.pe)} />
        <MetricCard label="EPS" value={formatCurrency(stock.eps)} />
        <MetricCard label="Dividend Yield" value={`${stock.dividend}%`} />
        <MetricCard label="Volume" value={formatVolume(stock.volume)} />
        <MetricCard label="Avg Volume" value={formatVolume(stock.avgVolume)} />
        <MetricCard label="52W High" value={formatCurrency(stock.high52)} />
        <MetricCard label="52W Low" value={formatCurrency(stock.low52)} />
        <MetricCard label="Beta" value={formatNumber(stock.beta)} />
        <MetricCard label="Revenue" value={formatLargeNumber(stock.revenue)} />
        <MetricCard label="Net Profit" value={formatLargeNumber(stock.profit)} />
        <MetricCard label="ROE" value={`${stock.roe}%`} />
        <MetricCard label="Debt/Equity" value={formatNumber(stock.debtToEquity)} />
      </div>

      {/* Insider Trades */}
      {insiderTrades.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Insider Trades</h3>
            <span className="text-xs text-slate-500 ml-auto">Source: SEC EDGAR Form 4</span>
          </div>
          <InsiderTrades trades={insiderTrades} showSymbol={false} />
        </div>
      )}

      {/* About */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">About {stock.name}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{stock.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <InfoItem icon={<Building2 className="w-4 h-4" />} label="Headquarters" value={stock.headquarters} />
          <InfoItem icon={<Users className="w-4 h-4" />} label="Employees" value={stock.employees.toLocaleString()} />
          <InfoItem icon={<Calendar className="w-4 h-4" />} label="Founded" value={stock.founded} />
          <InfoItem icon={<Globe className="w-4 h-4" />} label="Website" value={stock.website} link />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoItem({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-500 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-xs">
            {value.replace("https://www.", "")}
          </a>
        ) : (
          <p className="text-slate-200">{value}</p>
        )}
      </div>
    </div>
  );
}
