export interface Strategy {
  id: string;
  name: string; // O padrão de cor, ex: "GREEN_RED_GREEN"
  total_simulations: number;
  total_wins: number;
  win_rate: number;
  last_seen_at: string | null;
}
export interface TradeSimulation {
  id: string;
  pair: string;
  strategy_id: string;
  result: 'WIN' | 'LOSS';
  created_at: string;
}
export interface Signal {
  pair: string;
  direction: string;
  confidence: string;
  strategy: string;
}
// Novos tipos para dados reais
export interface MarketData {
  id: string;
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color: 'GREEN' | 'RED';
  created_at: string;
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface DataProvider {
  name: 'BINANCE' | 'ALPHA_VANTAGE' | 'COINGECKO' | 'TWELVE_DATA';
  apiKey?: string;
  baseUrl: string;
  rateLimit: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface ScalabilityConfig {
  maxConcurrentPairs: number;
  batchSize: number;
  cycleInterval: number;
  providers: DataProvider[];
  cache: CacheConfig;
}