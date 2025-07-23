export interface SellTransaction {
  id: string;
  positionId: string;
  ticker: string;
  sharesSold: number;
  saleDate: string;
  salePricePerShare: number;
  totalSaleAmount: number;
  purchasePricePerShare: number;
  realizedGainLoss: number;
  realizedGainLossPercentage: number;
}

export interface StockPosition {
  id: string;
  ticker: string;
  companyName?: string;
  shares: number; // remaining shares after any sales
  originalShares: number; // original shares purchased
  totalPurchasePrice: number;
  purchaseDate: string;
  purchasePricePerShare: number;
  currentPrice?: number;
  currentValue?: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercentage?: number;
  realizedGainLoss?: number; // total realized from this position
  lastUpdated?: string;
  sellTransactions: SellTransaction[];
}

export interface Portfolio {
  positions: StockPosition[];
  totalValue: number;
  totalCost: number;
  totalUnrealizedGainLoss: number;
  totalRealizedGainLoss: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export interface TickerGroup {
  ticker: string;
  companyName?: string;
  positions: StockPosition[];
  totalShares: number;
  totalCost: number;
  totalCurrentValue: number;
  totalUnrealizedGainLoss: number;
  totalRealizedGainLoss: number;
  averagePurchasePrice: number;
  currentPrice?: number;
}

export interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}