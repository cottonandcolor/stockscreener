export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  volume: number;
  avgVolume: number;
  high52: number;
  low52: number;
  beta: number;
  revenue: number;
  profit: number;
  debtToEquity: number;
  roe: number;
}

export interface StockDetail extends Stock {
  description: string;
  exchange: string;
  ceo: string;
  employees: number;
  founded: string;
  headquarters: string;
  website: string;
  historicalPrices: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
  financials: { quarter: string; revenue: number; profit: number; eps: number }[];
}

export interface InsiderTrade {
  id: number;
  symbol: string;
  companyName: string;
  insiderName: string;
  title: string;
  tradeType: "Buy" | "Sell";
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
  sharesOwned: number;
}

const SECTORS = [
  "Technology", "Healthcare", "Finance", "Consumer Cyclical",
  "Communication Services", "Industrials", "Consumer Defensive",
  "Energy", "Utilities", "Real Estate", "Basic Materials",
];

const INDUSTRIES: Record<string, string[]> = {
  Technology: ["Software", "Semiconductors", "Hardware", "Cloud Computing", "Cybersecurity"],
  Healthcare: ["Biotechnology", "Pharmaceuticals", "Medical Devices", "Health Services"],
  Finance: ["Banking", "Insurance", "Asset Management", "Fintech"],
  "Consumer Cyclical": ["Retail", "Automotive", "Restaurants", "E-Commerce"],
  "Communication Services": ["Social Media", "Streaming", "Telecom", "Gaming"],
  Industrials: ["Aerospace", "Defense", "Machinery", "Transportation"],
  "Consumer Defensive": ["Grocery", "Beverages", "Household Products", "Tobacco"],
  Energy: ["Oil & Gas", "Renewable Energy", "Utilities", "Pipelines"],
  Utilities: ["Electric", "Water", "Gas", "Renewable"],
  "Real Estate": ["REITs", "Commercial", "Residential", "Industrial"],
  "Basic Materials": ["Mining", "Chemicals", "Steel", "Paper"],
};

export const STOCK_DEFS: { symbol: string; name: string; sector: string; industry: string; basePrice: number; baseCap: number }[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Hardware", basePrice: 189, baseCap: 2950000000000 },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", industry: "Software", basePrice: 415, baseCap: 3090000000000 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services", industry: "Social Media", basePrice: 155, baseCap: 1940000000000 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", industry: "E-Commerce", basePrice: 185, baseCap: 1920000000000 },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors", basePrice: 875, baseCap: 2160000000000 },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Communication Services", industry: "Social Media", basePrice: 505, baseCap: 1300000000000 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical", industry: "Automotive", basePrice: 175, baseCap: 555000000000 },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Finance", industry: "Insurance", basePrice: 410, baseCap: 890000000000 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Finance", industry: "Banking", basePrice: 195, baseCap: 565000000000 },
  { symbol: "V", name: "Visa Inc.", sector: "Finance", industry: "Fintech", basePrice: 280, baseCap: 575000000000 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 156, baseCap: 376000000000 },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", industry: "Grocery", basePrice: 165, baseCap: 445000000000 },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare", industry: "Health Services", basePrice: 525, baseCap: 485000000000 },
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", industry: "Oil & Gas", basePrice: 104, baseCap: 440000000000 },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Finance", industry: "Fintech", basePrice: 455, baseCap: 425000000000 },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive", industry: "Household Products", basePrice: 160, baseCap: 377000000000 },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Cyclical", industry: "Retail", basePrice: 355, baseCap: 352000000000 },
  { symbol: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Defensive", industry: "Grocery", basePrice: 725, baseCap: 322000000000 },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", industry: "Biotechnology", basePrice: 170, baseCap: 300000000000 },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy", industry: "Oil & Gas", basePrice: 155, baseCap: 295000000000 },
  { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 125, baseCap: 316000000000 },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", industry: "Semiconductors", basePrice: 1320, baseCap: 545000000000 },
  { symbol: "LLY", name: "Eli Lilly and Company", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 780, baseCap: 740000000000 },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive", industry: "Beverages", basePrice: 170, baseCap: 233000000000 },
  { symbol: "KO", name: "Coca-Cola Company", sector: "Consumer Defensive", industry: "Beverages", basePrice: 60, baseCap: 260000000000 },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare", industry: "Medical Devices", basePrice: 565, baseCap: 216000000000 },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", industry: "Software", basePrice: 570, baseCap: 255000000000 },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology", industry: "Cloud Computing", basePrice: 270, baseCap: 262000000000 },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services", industry: "Streaming", basePrice: 620, baseCap: 270000000000 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", sector: "Technology", industry: "Hardware", basePrice: 50, baseCap: 204000000000 },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology", industry: "Semiconductors", basePrice: 175, baseCap: 283000000000 },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology", industry: "Semiconductors", basePrice: 44, baseCap: 186000000000 },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology", industry: "Software", basePrice: 125, baseCap: 345000000000 },
  { symbol: "ACN", name: "Accenture plc", sector: "Technology", industry: "Software", basePrice: 355, baseCap: 222000000000 },
  { symbol: "DIS", name: "Walt Disney Company", sector: "Communication Services", industry: "Streaming", basePrice: 112, baseCap: 204000000000 },
  { symbol: "TXN", name: "Texas Instruments", sector: "Technology", industry: "Semiconductors", basePrice: 172, baseCap: 157000000000 },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Cyclical", industry: "Retail", basePrice: 98, baseCap: 148000000000 },
  { symbol: "LIN", name: "Linde plc", sector: "Basic Materials", industry: "Chemicals", basePrice: 430, baseCap: 206000000000 },
  { symbol: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", industry: "Renewable", basePrice: 62, baseCap: 128000000000 },
  { symbol: "UPS", name: "United Parcel Service", sector: "Industrials", industry: "Transportation", basePrice: 148, baseCap: 126000000000 },
  { symbol: "BA", name: "Boeing Company", sector: "Industrials", industry: "Aerospace", basePrice: 210, baseCap: 126000000000 },
  { symbol: "RTX", name: "RTX Corporation", sector: "Industrials", industry: "Defense", basePrice: 92, baseCap: 126000000000 },
  { symbol: "SPGI", name: "S&P Global Inc.", sector: "Finance", industry: "Asset Management", basePrice: 445, baseCap: 138000000000 },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials", industry: "Machinery", basePrice: 295, baseCap: 143000000000 },
  { symbol: "GS", name: "Goldman Sachs Group", sector: "Finance", industry: "Banking", basePrice: 385, baseCap: 128000000000 },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare", industry: "Biotechnology", basePrice: 285, baseCap: 152000000000 },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Finance", industry: "Asset Management", basePrice: 810, baseCap: 121000000000 },
  { symbol: "SYK", name: "Stryker Corporation", sector: "Healthcare", industry: "Medical Devices", basePrice: 340, baseCap: 129000000000 },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 28, baseCap: 157000000000 },
  { symbol: "SBUX", name: "Starbucks Corporation", sector: "Consumer Cyclical", industry: "Restaurants", basePrice: 93, baseCap: 106000000000 },
];

export function getSectors(): string[] {
  return SECTORS;
}

export function getIndustries(): Record<string, string[]> {
  return INDUSTRIES;
}
