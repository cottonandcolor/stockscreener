import { TrendingUp, TrendingDown, Activity, BarChart3, Gauge } from "lucide-react";
import { fetchAllQuotes } from "@/lib/yahoo";
import { formatPercent, formatLargeNumber } from "@/lib/formatters";
import MiniStockCard from "@/components/MiniStockCard";
import DashboardInsiderTrades from "@/components/DashboardInsiderTrades";
import DashboardInsiderBuys from "@/components/DashboardInsiderBuys";
import MarketBreadth from "@/components/MarketBreadth";
import type { BreadthData } from "@/components/MarketBreadth";
import Link from "next/link";
import type { Stock } from "@/lib/stockData";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const allStocks = await fetchAllQuotes();

  const advancers = allStocks.filter((s) => s.change > 0).length;
  const decliners = allStocks.filter((s) => s.change < 0).length;
  const totalMarketCap = allStocks.reduce((sum, s) => sum + s.marketCap, 0);
  const avgPE = allStocks.filter((s) => s.pe > 0).length > 0
    ? +(allStocks.filter((s) => s.pe > 0).reduce((sum, s) => sum + s.pe, 0) / allStocks.filter((s) => s.pe > 0).length).toFixed(2)
    : 0;

  const topGainers = [...allStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...allStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...allStocks].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const near52High = allStocks.filter((s) => s.high52 > 0 && s.price >= s.high52 * 0.95).length;
  const near52Low = allStocks.filter((s) => s.low52 > 0 && s.price <= s.low52 * 1.05).length;
  const aboveAvgVolume = allStocks.filter((s) => s.avgVolume > 0 && s.volume > s.avgVolume).length;

  const sectorMap = new Map<string, { adv: number; dec: number; total: number; count: number }>();
  for (const s of allStocks) {
    const existing = sectorMap.get(s.sector) || { adv: 0, dec: 0, total: 0, count: 0 };
    if (s.change > 0) existing.adv++;
    else if (s.change < 0) existing.dec++;
    existing.total += s.changePercent;
    existing.count++;
    sectorMap.set(s.sector, existing);
  }
  const sectorBreadth = Array.from(sectorMap.entries()).map(([sector, d]) => ({
    sector,
    advancers: d.adv,
    decliners: d.dec,
    avgChange: +(d.total / d.count).toFixed(2),
  }));

  const breadthData: BreadthData = {
    advancers,
    decliners,
    unchanged: allStocks.length - advancers - decliners,
    totalStocks: allStocks.length,
    near52High,
    near52Low,
    aboveAvgVolume,
    belowAvgVolume: allStocks.length - aboveAvgVolume,
    sectorBreadth,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Market Dashboard</h1>
        <p className="text-slate-400">Real-time market overview and top movers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<BarChart3 className="w-5 h-5 text-blue-400" />} label="Total Stocks" value={String(allStocks.length)} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} label="Advancers" value={String(advancers)} accent="emerald" />
        <StatCard icon={<TrendingDown className="w-5 h-5 text-red-400" />} label="Decliners" value={String(decliners)} accent="red" />
        <StatCard icon={<Activity className="w-5 h-5 text-purple-400" />} label="Avg P/E" value={String(avgPE)} />
      </div>

      {/* Market Cap & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Market Cap</p>
          <p className="text-2xl font-bold text-white">{formatLargeNumber(totalMarketCap)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Advance / Decline</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-emerald-400">{advancers}</span>
            <span className="text-slate-500">/</span>
            <span className="text-2xl font-bold text-red-400">{decliners}</span>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Unchanged</p>
          <p className="text-2xl font-bold text-slate-300">{allStocks.length - advancers - decliners}</p>
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Section title="Top Gainers" icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}>
          <div className="space-y-2">
            {topGainers.map((s) => (
              <MiniStockCard key={s.symbol} stock={s} />
            ))}
          </div>
        </Section>
        <Section title="Top Losers" icon={<TrendingDown className="w-5 h-5 text-red-400" />}>
          <div className="space-y-2">
            {topLosers.map((s) => (
              <MiniStockCard key={s.symbol} stock={s} />
            ))}
          </div>
        </Section>
        <Section title="Most Active" icon={<Activity className="w-5 h-5 text-blue-400" />}>
          <div className="space-y-2">
            {mostActive.map((s) => (
              <MiniStockCard key={s.symbol} stock={s} />
            ))}
          </div>
        </Section>
      </div>

      {/* Market Breadth Trends */}
      <div className="mb-8">
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Market Breadth Trends</h2>
          </div>
          <MarketBreadth data={breadthData} />
        </div>
      </div>

      {/* Top 10 Insider Buys */}
      <div className="mb-8">
        <DashboardInsiderBuys />
      </div>

      {/* Top 10 Insider Trades */}
      <div className="mb-8">
        <DashboardInsiderTrades />
      </div>

      {/* Sector Breakdown */}
      <Section title="Sector Performance" icon={<BarChart3 className="w-5 h-5 text-purple-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectorPerformance(allStocks).map((sp) => (
            <Link
              key={sp.sector}
              href={`/screener?sector=${encodeURIComponent(sp.sector)}`}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{sp.sector}</p>
                <p className="text-xs text-slate-400">{sp.count} stocks</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${sp.avgChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatPercent(sp.avgChange)}
                </p>
                <p className="text-xs text-slate-500">{formatLargeNumber(sp.totalCap)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-slate-700/50">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-xl font-bold ${accent === "emerald" ? "text-emerald-400" : accent === "red" ? "text-red-400" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function sectorPerformance(stocks: Stock[]) {
  const map = new Map<string, { total: number; count: number; cap: number }>();
  for (const s of stocks) {
    const existing = map.get(s.sector) || { total: 0, count: 0, cap: 0 };
    existing.total += s.changePercent;
    existing.count += 1;
    existing.cap += s.marketCap;
    map.set(s.sector, existing);
  }
  return Array.from(map.entries())
    .map(([sector, data]) => ({
      sector,
      avgChange: +(data.total / data.count).toFixed(2),
      count: data.count,
      totalCap: data.cap,
    }))
    .sort((a, b) => b.avgChange - a.avgChange);
}
