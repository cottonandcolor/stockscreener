import YahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet, TTL } from "./cache";
import type { Stock, StockDetail } from "./stockData";
import { STOCK_DEFS } from "./stockData";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const SYMBOLS = STOCK_DEFS.map((d) => d.symbol);
const DEF_MAP = new Map(STOCK_DEFS.map((d) => [d.symbol, d]));

const ETF_DEFS: { symbol: string; name: string; category: string }[] = [
  { symbol: "SPY", name: "S&P 500 ETF", category: "US Large Cap" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", category: "US Tech" },
  { symbol: "IWM", name: "Russell 2000 ETF", category: "US Small Cap" },
  { symbol: "DIA", name: "Dow Jones ETF", category: "US Large Cap" },
  { symbol: "VTI", name: "Total Stock Market", category: "US Broad" },
  { symbol: "EFA", name: "Intl Developed ETF", category: "International" },
  { symbol: "EEM", name: "Emerging Markets ETF", category: "Emerging Markets" },
  { symbol: "VWO", name: "Vanguard EM ETF", category: "Emerging Markets" },
  { symbol: "TLT", name: "20+ Year Treasury", category: "Bonds" },
  { symbol: "BND", name: "Total Bond Market", category: "Bonds" },
  { symbol: "HYG", name: "High Yield Corporate", category: "Bonds" },
  { symbol: "LQD", name: "Investment Grade Corp", category: "Bonds" },
  { symbol: "GLD", name: "Gold ETF", category: "Commodities" },
  { symbol: "SLV", name: "Silver ETF", category: "Commodities" },
  { symbol: "USO", name: "Oil ETF", category: "Commodities" },
  { symbol: "XLK", name: "Technology Select", category: "Sector" },
  { symbol: "XLF", name: "Financial Select", category: "Sector" },
  { symbol: "XLE", name: "Energy Select", category: "Sector" },
  { symbol: "XLV", name: "Healthcare Select", category: "Sector" },
  { symbol: "XLRE", name: "Real Estate Select", category: "Sector" },
  { symbol: "XBI", name: "Biotech ETF", category: "Sector" },
  { symbol: "ARKK", name: "ARK Innovation ETF", category: "Thematic" },
  { symbol: "SOXX", name: "Semiconductor ETF", category: "Sector" },
  { symbol: "VNQ", name: "Real Estate ETF", category: "Real Estate" },
];

function safeNum(val: unknown, fallback = 0): number {
  return typeof val === "number" && isFinite(val) ? val : fallback;
}

export async function fetchAllQuotes(): Promise<Stock[]> {
  const cacheKey = "yahoo:all-quotes";
  const cached = cacheGet<Stock[]>(cacheKey);
  if (cached) return cached;

  const raw = await yf.quote(SYMBOLS, {}, { validateResult: false });
  const quotes = Array.isArray(raw) ? raw : [raw];

  const stocks: Stock[] = quotes
    .map((q: Record<string, unknown>) => {
      const sym = String(q.symbol ?? "");
      const def = DEF_MAP.get(sym);
      if (!def) return null;

      return {
        symbol: sym,
        name: String(q.longName ?? q.shortName ?? def.name),
        sector: def.sector,
        industry: def.industry,
        price: safeNum(q.regularMarketPrice),
        change: safeNum(q.regularMarketChange),
        changePercent: safeNum(q.regularMarketChangePercent),
        marketCap: safeNum(q.marketCap),
        pe: safeNum(q.trailingPE),
        eps: safeNum(q.epsTrailingTwelveMonths),
        dividend: +(safeNum(q.trailingAnnualDividendYield) * 100).toFixed(2),
        volume: safeNum(q.regularMarketVolume),
        avgVolume: safeNum(q.averageDailyVolume3Month),
        high52: safeNum(q.fiftyTwoWeekHigh),
        low52: safeNum(q.fiftyTwoWeekLow),
        beta: 0,
        revenue: 0,
        profit: 0,
        debtToEquity: 0,
        roe: 0,
      } as Stock;
    })
    .filter(Boolean) as Stock[];

  cacheSet(cacheKey, stocks, TTL.QUOTES);
  return stocks;
}

export async function fetchStockDetail(symbol: string): Promise<StockDetail | null> {
  const cacheKey = `yahoo:detail:${symbol}`;
  const cached = cacheGet<StockDetail>(cacheKey);
  if (cached) return cached;

  const def = DEF_MAP.get(symbol.toUpperCase());
  if (!def) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [rawSummary, history, rawFinancials] = await Promise.all([
    yf.quoteSummary(symbol, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"],
    }) as Promise<any>,
    yf.chart(symbol, { period1: oneYearAgo, period2: today, interval: "1d" }),
    yf.fundamentalsTimeSeries(symbol, {
      period1: twoYearsAgo,
      period2: today,
      type: "quarterly",
      module: "financials",
    }).catch(() => []),
  ]);

  const summary = rawSummary as Record<string, any>;
  const price = summary.price ?? {};
  const sd = summary.summaryDetail ?? {};
  const ks = summary.defaultKeyStatistics ?? {};
  const fd = summary.financialData ?? {};
  const ap = summary.assetProfile ?? {};

  const chartQuotes = ((history as any)?.quotes ?? []) as any[];
  const historicalPrices = chartQuotes.map((h) => ({
    date: h.date instanceof Date ? h.date.toISOString().split("T")[0] : String(h.date),
    open: safeNum(h.open),
    high: safeNum(h.high),
    low: safeNum(h.low),
    close: safeNum(h.close ?? h.adjClose),
    volume: safeNum(h.volume),
  }));

  const financials = (rawFinancials as any[])
    .filter((q) => q.totalRevenue)
    .slice(-8)
    .map((q) => {
      const rev = safeNum(q.totalRevenue);
      const ni = safeNum(q.netIncome);
      const epsVal = safeNum(q.dilutedEPS) || safeNum(q.basicEPS);
      const d = q.date instanceof Date ? q.date : new Date(String(q.date ?? Date.now()));
      const qtr = `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
      return { quarter: qtr, revenue: rev, profit: ni, eps: epsVal };
    });

  const officers = Array.isArray(ap.companyOfficers) ? ap.companyOfficers : [];
  const ceo = (officers as any[]).find((o) =>
    String(o.title ?? "").toLowerCase().includes("ceo") ||
    String(o.title ?? "").toLowerCase().includes("chief executive")
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const detail: StockDetail = {
    symbol: symbol.toUpperCase(),
    name: String(price.longName ?? price.shortName ?? def.name),
    sector: String(ap.sector ?? def.sector),
    industry: String(ap.industry ?? def.industry),
    price: safeNum(price.regularMarketPrice),
    change: safeNum(price.regularMarketChange),
    changePercent: safeNum(price.regularMarketChangePercent),
    marketCap: safeNum(price.marketCap ?? sd.marketCap),
    pe: safeNum(sd.trailingPE),
    eps: safeNum(ks.trailingEps),
    dividend: +(safeNum(sd.dividendYield) * 100).toFixed(2),
    volume: safeNum(price.regularMarketVolume),
    avgVolume: safeNum(sd.averageVolume),
    high52: safeNum(sd.fiftyTwoWeekHigh),
    low52: safeNum(sd.fiftyTwoWeekLow),
    beta: safeNum(ks.beta),
    revenue: safeNum(fd.totalRevenue),
    profit: safeNum(fd.totalRevenue) * safeNum(fd.profitMargins),
    debtToEquity: +(safeNum(fd.debtToEquity) / 100).toFixed(2),
    roe: +(safeNum(fd.returnOnEquity) * 100).toFixed(2),
    description: String(ap.longBusinessSummary ?? `${def.name} operates in the ${ap.industry ?? def.industry} industry.`),
    exchange: String(price.exchangeName ?? "NASDAQ"),
    ceo: ceo ? String((ceo as Record<string, unknown>).name ?? "N/A") : "N/A",
    employees: safeNum(ap.fullTimeEmployees),
    founded: "N/A",
    headquarters: [ap.city, ap.state, ap.country].filter(Boolean).join(", ") || "N/A",
    website: String(ap.website ?? ""),
    historicalPrices,
    financials,
  };

  cacheSet(cacheKey, detail, TTL.STOCK_DETAIL);
  return detail;
}

/* ─── Buy Signal Scanner ─── */

export interface BuySignal {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  ma50: number;
  ma200: number;
  high52: number;
  low52: number;
  signals: string[];
  strength: number; // 0-5 composite score
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchBuySignals(): Promise<BuySignal[]> {
  const cacheKey = "yahoo:buy-signals";
  const cached = cacheGet<BuySignal[]>(cacheKey);
  if (cached) return cached;

  const raw = await yf.quote(SYMBOLS, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];

  const results: BuySignal[] = [];

  for (const q of quotes) {
    const sym = String(q.symbol ?? "");
    const def = DEF_MAP.get(sym);
    if (!def) continue;

    const price = safeNum(q.regularMarketPrice);
    const ma50 = safeNum(q.fiftyDayAverage);
    const ma200 = safeNum(q.twoHundredDayAverage);
    const vol = safeNum(q.regularMarketVolume);
    const avgVol = safeNum(q.averageDailyVolume3Month);
    const chg = safeNum(q.regularMarketChange);
    const chgPct = safeNum(q.regularMarketChangePercent);
    const h52 = safeNum(q.fiftyTwoWeekHigh);
    const l52 = safeNum(q.fiftyTwoWeekLow);

    if (price <= 0) continue;

    const signals: string[] = [];

    if (ma50 > 0 && ma200 > 0 && price > ma50 && ma50 > ma200) {
      signals.push("Golden Cross");
    }

    if (ma50 > 0 && price > ma50 && chg > 0) {
      signals.push("Above 50-Day MA");
    }

    if (ma200 > 0 && price > ma200 && chg > 0) {
      signals.push("Above 200-Day MA");
    }

    if (avgVol > 0 && vol > avgVol * 1.5 && chg > 0) {
      signals.push("Volume Surge");
    }

    if (l52 > 0 && price <= l52 * 1.1 && chg > 0) {
      signals.push("52W Low Bounce");
    }

    if (h52 > 0 && price >= h52 * 0.97) {
      signals.push("Near 52W High");
    }

    if (signals.length === 0) continue;

    results.push({
      symbol: sym,
      name: String(q.longName ?? q.shortName ?? def.name),
      price,
      change: chg,
      changePercent: chgPct,
      marketCap: safeNum(q.marketCap),
      volume: vol,
      avgVolume: avgVol,
      ma50,
      ma200,
      high52: h52,
      low52: l52,
      signals,
      strength: signals.length,
    });
  }

  results.sort((a, b) => b.strength - a.strength || b.changePercent - a.changePercent);

  cacheSet(cacheKey, results, TTL.QUOTES);
  return results;
}

/* ─── Sell Signal Scanner ─── */

export type SellSignal = BuySignal; // same shape, different signal names

export async function fetchSellSignals(): Promise<SellSignal[]> {
  const cacheKey = "yahoo:sell-signals";
  const cached = cacheGet<SellSignal[]>(cacheKey);
  if (cached) return cached;

  const raw = await yf.quote(SYMBOLS, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];

  const results: SellSignal[] = [];

  for (const q of quotes) {
    const sym = String(q.symbol ?? "");
    const def = DEF_MAP.get(sym);
    if (!def) continue;

    const price = safeNum(q.regularMarketPrice);
    const ma50 = safeNum(q.fiftyDayAverage);
    const ma200 = safeNum(q.twoHundredDayAverage);
    const vol = safeNum(q.regularMarketVolume);
    const avgVol = safeNum(q.averageDailyVolume3Month);
    const chg = safeNum(q.regularMarketChange);
    const chgPct = safeNum(q.regularMarketChangePercent);
    const h52 = safeNum(q.fiftyTwoWeekHigh);
    const l52 = safeNum(q.fiftyTwoWeekLow);

    if (price <= 0) continue;

    const signals: string[] = [];

    if (ma50 > 0 && ma200 > 0 && price < ma50 && ma50 < ma200) {
      signals.push("Death Cross");
    }

    if (ma50 > 0 && price < ma50 && chg < 0) {
      signals.push("Below 50-Day MA");
    }

    if (ma200 > 0 && price < ma200 && chg < 0) {
      signals.push("Below 200-Day MA");
    }

    if (avgVol > 0 && vol > avgVol * 1.5 && chg < 0) {
      signals.push("Heavy Selloff");
    }

    if (l52 > 0 && price <= l52 * 1.05) {
      signals.push("Near 52W Low");
    }

    if (h52 > 0 && price <= h52 * 0.8) {
      signals.push("Down 20%+ from High");
    }

    if (signals.length === 0) continue;

    results.push({
      symbol: sym,
      name: String(q.longName ?? q.shortName ?? def.name),
      price,
      change: chg,
      changePercent: chgPct,
      marketCap: safeNum(q.marketCap),
      volume: vol,
      avgVolume: avgVol,
      ma50,
      ma200,
      high52: h52,
      low52: l52,
      signals,
      strength: signals.length,
    });
  }

  results.sort((a, b) => b.strength - a.strength || a.changePercent - b.changePercent);

  cacheSet(cacheKey, results, TTL.QUOTES);
  return results;
}

/* ─── ETF Flow Tracker ─── */

export interface ETFFlow {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number; // current vol / avg vol
  moneyFlow: number;   // volume * price * direction as dollar proxy
  flowDirection: "inflow" | "outflow" | "neutral";
}

export async function fetchETFFlows(): Promise<ETFFlow[]> {
  const cacheKey = "yahoo:etf-flows";
  const cached = cacheGet<ETFFlow[]>(cacheKey);
  if (cached) return cached;

  const etfSymbols = ETF_DEFS.map((e) => e.symbol);
  const raw = await yf.quote(etfSymbols, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];

  const etfMap = new Map(ETF_DEFS.map((e) => [e.symbol, e]));

  const flows: ETFFlow[] = quotes
    .map((q) => {
      const sym = String(q.symbol ?? "");
      const def = etfMap.get(sym);
      if (!def) return null;

      const price = safeNum(q.regularMarketPrice);
      const chg = safeNum(q.regularMarketChange);
      const chgPct = safeNum(q.regularMarketChangePercent);
      const vol = safeNum(q.regularMarketVolume);
      const avgVol = safeNum(q.averageDailyVolume3Month);
      const volRatio = avgVol > 0 ? +(vol / avgVol).toFixed(2) : 1;

      const dollarVol = vol * price;
      const moneyFlow = chg >= 0 ? dollarVol : -dollarVol;

      let flowDirection: "inflow" | "outflow" | "neutral" = "neutral";
      if (volRatio > 0.8 && chg > 0) flowDirection = "inflow";
      else if (volRatio > 0.8 && chg < 0) flowDirection = "outflow";

      return {
        symbol: sym,
        name: def.name,
        category: def.category,
        price,
        change: chg,
        changePercent: chgPct,
        volume: vol,
        avgVolume: avgVol,
        volumeRatio: volRatio,
        moneyFlow,
        flowDirection,
      } as ETFFlow;
    })
    .filter(Boolean) as ETFFlow[];

  cacheSet(cacheKey, flows, TTL.QUOTES);
  return flows;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
