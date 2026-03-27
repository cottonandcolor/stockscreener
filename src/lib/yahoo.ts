import YahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet, TTL } from "./cache";
import type { Stock, StockDetail } from "./stockData";
import { STOCK_DEFS } from "./stockData";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const SYMBOLS = STOCK_DEFS.map((d) => d.symbol);
const DEF_MAP = new Map(STOCK_DEFS.map((d) => [d.symbol, d]));

const ETF_DEFS: { symbol: string; name: string; category: string }[] = [
  // Major Index ETFs
  { symbol: "SPY", name: "S&P 500 ETF", category: "Major Index" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", category: "Major Index" },
  { symbol: "DIA", name: "Dow Jones ETF", category: "Major Index" },
  { symbol: "IWM", name: "Russell 2000 ETF", category: "Major Index" },
  { symbol: "VTI", name: "Total Stock Market", category: "Major Index" },
  { symbol: "VOO", name: "Vanguard S&P 500", category: "Major Index" },
  { symbol: "RSP", name: "Equal Weight S&P 500", category: "Major Index" },
  { symbol: "MDY", name: "S&P MidCap 400", category: "Major Index" },
  // Style
  { symbol: "VUG", name: "Vanguard Growth", category: "Style" },
  { symbol: "VTV", name: "Vanguard Value", category: "Style" },
  { symbol: "SCHD", name: "Schwab Dividend", category: "Style" },
  // International
  { symbol: "EFA", name: "Intl Developed ETF", category: "International" },
  { symbol: "EEM", name: "Emerging Markets ETF", category: "International" },
  { symbol: "VWO", name: "Vanguard EM ETF", category: "International" },
  { symbol: "KWEB", name: "China Internet ETF", category: "International" },
  { symbol: "FXI", name: "China Large-Cap ETF", category: "International" },
  // Bonds
  { symbol: "TLT", name: "20+ Year Treasury", category: "Bonds" },
  { symbol: "BND", name: "Total Bond Market", category: "Bonds" },
  { symbol: "HYG", name: "High Yield Corporate", category: "Bonds" },
  { symbol: "LQD", name: "Investment Grade Corp", category: "Bonds" },
  // Commodities
  { symbol: "GLD", name: "Gold ETF", category: "Commodities" },
  { symbol: "SLV", name: "Silver ETF", category: "Commodities" },
  { symbol: "USO", name: "Oil ETF", category: "Commodities" },
  // Sector SPDRs (complete set)
  { symbol: "XLK", name: "Technology Select", category: "Sector" },
  { symbol: "XLF", name: "Financial Select", category: "Sector" },
  { symbol: "XLE", name: "Energy Select", category: "Sector" },
  { symbol: "XLV", name: "Healthcare Select", category: "Sector" },
  { symbol: "XLI", name: "Industrials Select", category: "Sector" },
  { symbol: "XLP", name: "Consumer Staples", category: "Sector" },
  { symbol: "XLY", name: "Consumer Discretionary", category: "Sector" },
  { symbol: "XLC", name: "Communication Svc", category: "Sector" },
  { symbol: "XLB", name: "Materials Select", category: "Sector" },
  { symbol: "XLU", name: "Utilities Select", category: "Sector" },
  { symbol: "XLRE", name: "Real Estate Select", category: "Sector" },
  // Thematic / Specialty
  { symbol: "XBI", name: "Biotech ETF", category: "Thematic" },
  { symbol: "SOXX", name: "Semiconductor ETF", category: "Thematic" },
  { symbol: "ARKK", name: "ARK Innovation ETF", category: "Thematic" },
  { symbol: "VNQ", name: "Real Estate ETF", category: "Thematic" },
  { symbol: "SMH", name: "VanEck Semiconductor", category: "Thematic" },
  // Defined Outcome / Buffer ETFs
  { symbol: "BUFR", name: "FT Vest Laddered Buffer", category: "Defined Outcome" },
  { symbol: "BUFD", name: "FT Vest Laddered Deep Buffer", category: "Defined Outcome" },
  { symbol: "BUFF", name: "Laddered Buffer ETF", category: "Defined Outcome" },
  { symbol: "BJAN", name: "Innovator Buffer Jan", category: "Defined Outcome" },
  { symbol: "BAPR", name: "Innovator Buffer Apr", category: "Defined Outcome" },
  { symbol: "BJUL", name: "Innovator Buffer Jul", category: "Defined Outcome" },
  { symbol: "BOCT", name: "Innovator Buffer Oct", category: "Defined Outcome" },
  { symbol: "PJAN", name: "Innovator Power Buffer Jan", category: "Defined Outcome" },
  { symbol: "PAPR", name: "Innovator Power Buffer Apr", category: "Defined Outcome" },
  { symbol: "PJUL", name: "Innovator Power Buffer Jul", category: "Defined Outcome" },
  { symbol: "POCT", name: "Innovator Power Buffer Oct", category: "Defined Outcome" },
  { symbol: "UJAN", name: "Innovator Ultra Buffer Jan", category: "Defined Outcome" },
  { symbol: "UJUL", name: "Innovator Ultra Buffer Jul", category: "Defined Outcome" },
  { symbol: "CPSM", name: "Calamos S&P 500 Structured", category: "Defined Outcome" },
  { symbol: "QCLR", name: "Global X Nasdaq 100 Buffer", category: "Defined Outcome" },
  // Hedged ETFs
  { symbol: "TAIL", name: "Cambria Tail Risk ETF", category: "Hedged" },
  { symbol: "SWAN", name: "Amplify BlackSwan Growth", category: "Hedged" },
  { symbol: "HEQT", name: "Simplify Hedged Equity", category: "Hedged" },
  { symbol: "HEGD", name: "Swan Hedged Equity US LC", category: "Hedged" },
  { symbol: "PHDG", name: "Invesco S&P 500 Hedged", category: "Hedged" },
  { symbol: "DBEH", name: "iM DBi Hedge Strategy", category: "Hedged" },
  { symbol: "QAI", name: "IQ Hedge Multi-Strategy", category: "Hedged" },
  { symbol: "CAOS", name: "Alpha Architect Tail Risk", category: "Hedged" },
  { symbol: "NUSI", name: "Nationwide Nasdaq-100 Risk", category: "Hedged" },
  { symbol: "JEPI", name: "JPMorgan Equity Premium", category: "Hedged" },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Prem", category: "Hedged" },
  { symbol: "DIVO", name: "Amplify CWP Enhanced Div", category: "Hedged" },
  { symbol: "XYLD", name: "Global X S&P 500 Covered Call", category: "Hedged" },
  { symbol: "QYLD", name: "Global X Nasdaq Covered Call", category: "Hedged" },
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

/* ─── Signal Detection Helpers ─── */

export interface SignalResult {
  symbol: string;
  name: string;
  category?: string;
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
  strength: number;
}

export type BuySignal = SignalResult;
export type SellSignal = SignalResult;

interface QuoteFields {
  price: number; ma50: number; ma200: number; vol: number; avgVol: number;
  chg: number; chgPct: number; h52: number; l52: number; mktCap: number;
}

function extractQuoteFields(q: Record<string, any>): QuoteFields {
  return {
    price: safeNum(q.regularMarketPrice),
    ma50: safeNum(q.fiftyDayAverage),
    ma200: safeNum(q.twoHundredDayAverage),
    vol: safeNum(q.regularMarketVolume),
    avgVol: safeNum(q.averageDailyVolume3Month),
    chg: safeNum(q.regularMarketChange),
    chgPct: safeNum(q.regularMarketChangePercent),
    h52: safeNum(q.fiftyTwoWeekHigh),
    l52: safeNum(q.fiftyTwoWeekLow),
    mktCap: safeNum(q.marketCap),
  };
}

function detectBuySignals(f: QuoteFields): string[] {
  const sigs: string[] = [];
  if (f.ma50 > 0 && f.ma200 > 0 && f.price > f.ma50 && f.ma50 > f.ma200) sigs.push("Golden Cross");
  if (f.ma50 > 0 && f.price > f.ma50 && f.chg > 0) sigs.push("Above 50-Day MA");
  if (f.ma200 > 0 && f.price > f.ma200 && f.chg > 0) sigs.push("Above 200-Day MA");
  if (f.avgVol > 0 && f.vol > f.avgVol * 1.5 && f.chg > 0) sigs.push("Volume Surge");
  if (f.l52 > 0 && f.price <= f.l52 * 1.1 && f.chg > 0) sigs.push("52W Low Bounce");
  if (f.h52 > 0 && f.price >= f.h52 * 0.97) sigs.push("Near 52W High");
  return sigs;
}

function detectSellSignals(f: QuoteFields): string[] {
  const sigs: string[] = [];
  if (f.ma50 > 0 && f.ma200 > 0 && f.price < f.ma50 && f.ma50 < f.ma200) sigs.push("Death Cross");
  if (f.ma50 > 0 && f.price < f.ma50 && f.chg < 0) sigs.push("Below 50-Day MA");
  if (f.ma200 > 0 && f.price < f.ma200 && f.chg < 0) sigs.push("Below 200-Day MA");
  if (f.avgVol > 0 && f.vol > f.avgVol * 1.5 && f.chg < 0) sigs.push("Heavy Selloff");
  if (f.l52 > 0 && f.price <= f.l52 * 1.05) sigs.push("Near 52W Low");
  if (f.h52 > 0 && f.price <= f.h52 * 0.8) sigs.push("Down 20%+ from High");
  return sigs;
}

function buildSignalResult(
  q: Record<string, any>, f: QuoteFields, name: string, signals: string[], category?: string,
): SignalResult {
  return {
    symbol: String(q.symbol ?? ""),
    name,
    category,
    price: f.price,
    change: f.chg,
    changePercent: f.chgPct,
    marketCap: f.mktCap,
    volume: f.vol,
    avgVolume: f.avgVol,
    ma50: f.ma50,
    ma200: f.ma200,
    high52: f.h52,
    low52: f.l52,
    signals,
    strength: signals.length,
  };
}

/* ─── Stock Buy Signal Scanner ─── */

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
    const f = extractQuoteFields(q);
    if (f.price <= 0) continue;
    const signals = detectBuySignals(f);
    if (signals.length === 0) continue;
    results.push(buildSignalResult(q, f, String(q.longName ?? q.shortName ?? def.name), signals));
  }

  results.sort((a, b) => b.strength - a.strength || b.changePercent - a.changePercent);
  cacheSet(cacheKey, results, TTL.QUOTES);
  return results;
}

/* ─── Stock Sell Signal Scanner ─── */

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
    const f = extractQuoteFields(q);
    if (f.price <= 0) continue;
    const signals = detectSellSignals(f);
    if (signals.length === 0) continue;
    results.push(buildSignalResult(q, f, String(q.longName ?? q.shortName ?? def.name), signals));
  }

  results.sort((a, b) => b.strength - a.strength || a.changePercent - b.changePercent);
  cacheSet(cacheKey, results, TTL.QUOTES);
  return results;
}

/* ─── ETF Buy Signal Scanner ─── */

const ETF_MAP = new Map(ETF_DEFS.map((e) => [e.symbol, e]));

export async function fetchETFBuySignals(): Promise<SignalResult[]> {
  const cacheKey = "yahoo:etf-buy-signals";
  const cached = cacheGet<SignalResult[]>(cacheKey);
  if (cached) return cached;

  const etfSymbols = ETF_DEFS.map((e) => e.symbol);
  const raw = await yf.quote(etfSymbols, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];
  const results: SignalResult[] = [];

  for (const q of quotes) {
    const sym = String(q.symbol ?? "");
    const def = ETF_MAP.get(sym);
    if (!def) continue;
    const f = extractQuoteFields(q);
    if (f.price <= 0) continue;
    const signals = detectBuySignals(f);
    if (signals.length === 0) continue;
    results.push(buildSignalResult(q, f, def.name, signals, def.category));
  }

  results.sort((a, b) => b.strength - a.strength || b.changePercent - a.changePercent);
  cacheSet(cacheKey, results, TTL.QUOTES);
  return results;
}

/* ─── ETF Sell Signal Scanner ─── */

export async function fetchETFSellSignals(): Promise<SignalResult[]> {
  const cacheKey = "yahoo:etf-sell-signals";
  const cached = cacheGet<SignalResult[]>(cacheKey);
  if (cached) return cached;

  const etfSymbols = ETF_DEFS.map((e) => e.symbol);
  const raw = await yf.quote(etfSymbols, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];
  const results: SignalResult[] = [];

  for (const q of quotes) {
    const sym = String(q.symbol ?? "");
    const def = ETF_MAP.get(sym);
    if (!def) continue;
    const f = extractQuoteFields(q);
    if (f.price <= 0) continue;
    const signals = detectSellSignals(f);
    if (signals.length === 0) continue;
    results.push(buildSignalResult(q, f, def.name, signals, def.category));
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

/* ─── DCA Simulator ─── */

export interface DCAInput {
  symbol: string;
  totalAmount: number;
  months: number;
  frequency: "weekly" | "biweekly" | "monthly";
}

export interface DCAPurchase {
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

export interface DCAResult {
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

export async function fetchDCASimulation(input: DCAInput): Promise<DCAResult | null> {
  const { symbol, totalAmount, months, frequency } = input;
  const upper = symbol.toUpperCase();

  const periodDays = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
  const totalDays = months * 30;
  const numberOfPurchases = Math.max(1, Math.floor(totalDays / periodDays));
  const investmentPerPeriod = +(totalAmount / numberOfPurchases).toFixed(2);

  const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
  const today = new Date();

  const chart = await yf.chart(upper, {
    period1: startDate.toISOString().split("T")[0],
    period2: today.toISOString().split("T")[0],
    interval: "1d",
  }) as any;

  const quotes: { date: Date; close: number }[] = ((chart?.quotes ?? []) as any[])
    .filter((q: any) => q.close && q.close > 0)
    .map((q: any) => ({
      date: q.date instanceof Date ? q.date : new Date(String(q.date)),
      close: Number(q.close),
    }));

  if (quotes.length < 2) return null;

  const quoteResult = await yf.quote(upper, {}, { validateResult: false }) as any;
  const currentPrice = Number(
    Array.isArray(quoteResult)
      ? quoteResult[0]?.regularMarketPrice ?? 0
      : quoteResult?.regularMarketPrice ?? 0
  );
  const name = String(
    Array.isArray(quoteResult)
      ? quoteResult[0]?.longName ?? quoteResult[0]?.shortName ?? upper
      : quoteResult?.longName ?? quoteResult?.shortName ?? upper
  );

  const lumpSumPrice = quotes[0].close;
  const lumpSumShares = totalAmount / lumpSumPrice;

  let totalShares = 0;
  let totalInvested = 0;
  let purchaseIndex = 0;
  const purchases: DCAPurchase[] = [];
  let nextPurchaseDate = new Date(quotes[0].date);

  for (const q of quotes) {
    if (purchaseIndex >= numberOfPurchases) break;
    if (q.date < nextPurchaseDate && purchaseIndex > 0) continue;

    const amountThisPeriod = purchaseIndex === numberOfPurchases - 1
      ? totalAmount - totalInvested
      : investmentPerPeriod;

    if (amountThisPeriod <= 0) break;

    const sharesBought = amountThisPeriod / q.close;
    totalShares += sharesBought;
    totalInvested += amountThisPeriod;

    const marketValue = totalShares * q.close;

    purchases.push({
      date: q.date.toISOString().split("T")[0],
      price: +q.close.toFixed(2),
      invested: +amountThisPeriod.toFixed(2),
      sharesBought: +sharesBought.toFixed(4),
      totalShares: +totalShares.toFixed(4),
      totalInvested: +totalInvested.toFixed(2),
      marketValue: +marketValue.toFixed(2),
      gainLoss: +(marketValue - totalInvested).toFixed(2),
      gainLossPercent: +((marketValue - totalInvested) / totalInvested * 100).toFixed(2),
    });

    purchaseIndex++;
    nextPurchaseDate = new Date(q.date.getTime() + periodDays * 24 * 60 * 60 * 1000);
  }

  const finalPrice = currentPrice > 0 ? currentPrice : quotes[quotes.length - 1].close;
  const currentValue = totalShares * finalPrice;
  const avgCostBasis = totalInvested > 0 ? totalInvested / totalShares : 0;
  const lumpSumCurrentValue = lumpSumShares * finalPrice;

  return {
    symbol: upper,
    name,
    currentPrice: finalPrice,
    totalAmount,
    months,
    frequency,
    investmentPerPeriod,
    numberOfPurchases: purchases.length,
    purchases,
    summary: {
      totalInvested: +totalInvested.toFixed(2),
      totalShares: +totalShares.toFixed(4),
      avgCostBasis: +avgCostBasis.toFixed(2),
      currentValue: +currentValue.toFixed(2),
      totalReturn: +(currentValue - totalInvested).toFixed(2),
      totalReturnPercent: +((currentValue - totalInvested) / totalInvested * 100).toFixed(2),
      lumpSumShares: +lumpSumShares.toFixed(4),
      lumpSumValue: +lumpSumCurrentValue.toFixed(2),
      lumpSumReturn: +(lumpSumCurrentValue - totalAmount).toFixed(2),
      lumpSumReturnPercent: +((lumpSumCurrentValue - totalAmount) / totalAmount * 100).toFixed(2),
    },
  };
}

/* ─── Market News ─── */

export interface NewsArticle {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  thumbnail: string | null;
  relatedTickers: string[];
  type: string;
}

const NEWS_QUERIES = [
  "stock market today",
  "S&P 500",
  "Federal Reserve",
  "earnings",
  "economy",
];

export async function fetchMarketNews(count = 30): Promise<NewsArticle[]> {
  const cacheKey = "yahoo:market-news";
  const cached = cacheGet<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const seen = new Set<string>();
  const articles: NewsArticle[] = [];

  for (const query of NEWS_QUERIES) {
    try {
      const result = await yf.search(query, {
        newsCount: 10,
        quotesCount: 0,
      }) as any;

      const news: any[] = result?.news ?? [];
      for (const n of news) {
        if (seen.has(n.uuid)) continue;
        seen.add(n.uuid);

        const thumb =
          n.thumbnail?.resolutions?.[0]?.url ?? null;

        articles.push({
          uuid: String(n.uuid ?? ""),
          title: String(n.title ?? ""),
          publisher: String(n.publisher ?? ""),
          link: String(n.link ?? ""),
          publishedAt:
            n.providerPublishTime instanceof Date
              ? n.providerPublishTime.toISOString()
              : typeof n.providerPublishTime === "number"
                ? new Date(n.providerPublishTime * 1000).toISOString()
                : String(n.providerPublishTime ?? ""),
          thumbnail: thumb ? String(thumb) : null,
          relatedTickers: Array.isArray(n.relatedTickers) ? n.relatedTickers.map(String) : [],
          type: String(n.type ?? ""),
        });
      }
    } catch {
      // skip failed query
    }
  }

  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const trimmed = articles.slice(0, count);
  cacheSet(cacheKey, trimmed, TTL.QUOTES);
  return trimmed;
}

/* ─── Multi-Symbol Comparison ─── */

export type CompareRange = "1m" | "3m" | "6m" | "1y" | "2y" | "5y";

export interface CompareSymbolSeries {
  symbol: string;
  name: string;
  currentPrice: number;
  firstPrice: number;
  returnPercent: number;
}

export interface CompareChartPoint {
  date: string;
  [symbol: string]: string | number | null;
}

export interface CompareResult {
  symbols: CompareSymbolSeries[];
  priceSeries: CompareChartPoint[];
  normalizedSeries: CompareChartPoint[];
  range: CompareRange;
}

function rangeToDays(range: CompareRange): number {
  switch (range) {
    case "1m":
      return 31;
    case "3m":
      return 93;
    case "6m":
      return 186;
    case "1y":
      return 365;
    case "2y":
      return 730;
    case "5y":
      return 1825;
    default:
      return 365;
  }
}

export async function fetchComparison(
  symbolsInput: string[],
  range: CompareRange = "1y"
): Promise<CompareResult | null> {
  const symbols = Array.from(
    new Set(
      symbolsInput
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )
  ).slice(0, 8);

  if (symbols.length < 2) return null;

  const cacheKey = `yahoo:compare:${range}:${symbols.join(",")}`;
  const cached = cacheGet<CompareResult>(cacheKey);
  if (cached) return cached;

  const days = rangeToDays(range);
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const period2 = new Date().toISOString().split("T")[0];

  const [rawQuotes, charts] = await Promise.all([
    yf.quote(symbols, {}, { validateResult: false }) as Promise<any>,
    Promise.all(
      symbols.map((symbol) =>
        yf
          .chart(symbol, { period1, period2, interval: "1d" })
          .catch(() => null)
      )
    ),
  ]);

  const quoteList: Record<string, any>[] = Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes];
  const quoteMap = new Map(quoteList.map((q) => [String(q.symbol ?? "").toUpperCase(), q]));

  const dateMap = new Map<string, CompareChartPoint>();
  const normalizedDateMap = new Map<string, CompareChartPoint>();
  const symbolSeries: CompareSymbolSeries[] = [];

  symbols.forEach((symbol, idx) => {
    const chart = charts[idx] as any;
    const quote = quoteMap.get(symbol) ?? {};
    const chartQuotes = ((chart?.quotes ?? []) as any[])
      .filter((q) => q?.close && Number(q.close) > 0)
      .map((q) => ({
        date:
          q.date instanceof Date
            ? q.date.toISOString().split("T")[0]
            : String(q.date).split("T")[0],
        close: Number(q.close),
      }));

    if (chartQuotes.length < 2) return;

    const firstPrice = chartQuotes[0].close;
    const currentPrice = safeNum(quote.regularMarketPrice, chartQuotes[chartQuotes.length - 1].close);
    const name = String(quote.longName ?? quote.shortName ?? symbol);
    const returnPercent = firstPrice > 0 ? +(((currentPrice - firstPrice) / firstPrice) * 100).toFixed(2) : 0;

    symbolSeries.push({
      symbol,
      name,
      currentPrice: +currentPrice.toFixed(2),
      firstPrice: +firstPrice.toFixed(2),
      returnPercent,
    });

    for (const p of chartQuotes) {
      if (!dateMap.has(p.date)) dateMap.set(p.date, { date: p.date });
      if (!normalizedDateMap.has(p.date)) normalizedDateMap.set(p.date, { date: p.date });
      dateMap.get(p.date)![symbol] = +p.close.toFixed(2);
      normalizedDateMap.get(p.date)![symbol] = +((p.close / firstPrice) * 100).toFixed(2);
    }
  });

  if (symbolSeries.length < 2) return null;

  const priceSeries = Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
  const normalizedSeries = Array.from(normalizedDateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const result: CompareResult = {
    symbols: symbolSeries,
    priceSeries,
    normalizedSeries,
    range,
  };

  cacheSet(cacheKey, result, TTL.QUOTES);
  return result;
}

/* ─── Max Pain Calculator ─── */

export interface MaxPainStrike {
  strike: number;
  callOI: number;
  putOI: number;
  callPain: number;
  putPain: number;
  totalPain: number;
}

export interface MaxPainResult {
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

export async function fetchMaxPain(
  symbol: string,
  expirationDate?: string
): Promise<MaxPainResult | null> {
  const upper = symbol.toUpperCase();
  const cacheKey = `yahoo:maxpain:${upper}:${expirationDate ?? "default"}`;
  const cached = cacheGet<MaxPainResult>(cacheKey);
  if (cached) return cached;

  let requestDate = expirationDate;

  // If no date specified, fetch default first to get expiration list, then pick a good one
  const initialData = await yf.options(upper, requestDate ? { date: new Date(requestDate) } as any : {}, { validateResult: false }) as any;
  if (!initialData?.options?.length && !initialData?.expirationDates?.length) return null;

  const allExpDates: string[] = (initialData.expirationDates ?? []).map((d: any) =>
    d instanceof Date ? d.toISOString().split("T")[0] : String(d).split("T")[0]
  );

  // Auto-pick: skip today, prefer the nearest Friday expiration >= 3 days out
  if (!requestDate && allExpDates.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const threeDaysOut = new Date(Date.now() + 3 * 86_400_000).toISOString().split("T")[0];
    const future = allExpDates.filter((d) => d > todayStr && d >= threeDaysOut);
    if (future.length > 0) {
      requestDate = future[0];
    } else {
      const anyFuture = allExpDates.filter((d) => d > todayStr);
      requestDate = anyFuture.length > 0 ? anyFuture[0] : allExpDates[0];
    }
  }

  // Re-fetch for the chosen date if different from initial
  const data = requestDate && requestDate !== allExpDates[0]
    ? await yf.options(upper, { date: new Date(requestDate) } as any, { validateResult: false }) as any
    : initialData;

  if (!data?.options?.length) return null;

  const quote = data.quote ?? {};
  const currentPrice = Number(quote.regularMarketPrice ?? 0);
  const name = String(quote.longName ?? quote.shortName ?? upper);

  const expirationDates = allExpDates;

  const chain = data.options[0];
  const calls: any[] = chain?.calls ?? [];
  const puts: any[] = chain?.puts ?? [];
  const expDate = chain?.expirationDate instanceof Date
    ? chain.expirationDate.toISOString().split("T")[0]
    : String(chain?.expirationDate ?? "").split("T")[0];

  const callMap = new Map<number, number>();
  const putMap = new Map<number, number>();
  const allStrikes = new Set<number>();

  for (const c of calls) {
    const k = Number(c.strike);
    const oi = Number(c.openInterest ?? 0);
    callMap.set(k, oi);
    allStrikes.add(k);
  }
  for (const p of puts) {
    const k = Number(p.strike);
    const oi = Number(p.openInterest ?? 0);
    putMap.set(k, oi);
    allStrikes.add(k);
  }

  const sortedStrikes = Array.from(allStrikes).sort((a, b) => a - b);
  if (sortedStrikes.length === 0) return null;

  const strikeResults: MaxPainStrike[] = sortedStrikes.map((s) => {
    const callOI = callMap.get(s) ?? 0;
    const putOI = putMap.get(s) ?? 0;

    let callPain = 0;
    let putPain = 0;

    for (const k of sortedStrikes) {
      const cOI = callMap.get(k) ?? 0;
      const pOI = putMap.get(k) ?? 0;
      if (s > k) callPain += (s - k) * cOI * 100;
      if (s < k) putPain += (k - s) * pOI * 100;
    }

    return {
      strike: s,
      callOI,
      putOI,
      callPain,
      putPain,
      totalPain: callPain + putPain,
    };
  });

  let minPain = Infinity;
  let maxPainPrice = sortedStrikes[0];
  for (const sr of strikeResults) {
    if (sr.totalPain < minPain) {
      minPain = sr.totalPain;
      maxPainPrice = sr.strike;
    }
  }

  const totalCallOI = Array.from(callMap.values()).reduce((a, b) => a + b, 0);
  const totalPutOI = Array.from(putMap.values()).reduce((a, b) => a + b, 0);

  const result: MaxPainResult = {
    symbol: upper,
    name,
    currentPrice,
    expirationDate: expDate,
    expirationDates,
    maxPainPrice,
    strikes: strikeResults,
    totalCallOI,
    totalPutOI,
    putCallRatio: totalCallOI > 0 ? +(totalPutOI / totalCallOI).toFixed(2) : 0,
  };

  cacheSet(cacheKey, result, TTL.QUOTES);
  return result;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
