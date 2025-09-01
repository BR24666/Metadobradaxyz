export interface Strategy {
  id: string;
  name: string; // O padrão de cor, ex: "GREEN_RED_GREEN"
  total_simulations: number;
  total_wins: number;
  win_rate: number;
  last_seen_at: string | null;
}
export interface Signal {
  pair: string;
  direction: string;
  confidence: string;
  strategy: string;
}
export interface ApiCandle {
  '1. open': string;
  '4. close': string;
}
