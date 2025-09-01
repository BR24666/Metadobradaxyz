import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import type { MarketData, BinanceKline } from '@/types/trading';

export class BinanceDataService {
  private static instance: BinanceDataService;
  private baseUrl = 'https://api.binance.com';
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): BinanceDataService {
    if (!BinanceDataService.instance) {
      BinanceDataService.instance = new BinanceDataService();
    }
    return BinanceDataService.instance;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🚀 Iniciando coleta de dados reais da Binance');
    this.intervalId = setInterval(() => this.collectData(), 60000);
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async collectData(): Promise<void> {
    try {
      const pairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
      const promises = pairs.map(pair => this.fetchKlines(pair));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ Coletados dados de ${successful}/${pairs.length} pares`);
    } catch (error) {
      console.error('❌ Erro na coleta de dados:', error);
    }
  }

  private async fetchKlines(symbol: string): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol,
          interval: '1m',
          limit: 2
        },
        timeout: 5000
      });

      const klines: BinanceKline[] = response.data;
      if (klines.length >= 2) {
        const lastKline = klines[klines.length - 2];
        await this.saveMarketData(symbol, lastKline);
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar dados para ${symbol}:`, error);
    }
  }

  private async saveMarketData(symbol: string, kline: BinanceKline): Promise<void> {
    const open = parseFloat(kline.open);
    const close = parseFloat(kline.close);
    const color: 'GREEN' | 'RED' = close >= open ? 'GREEN' : 'RED';

    const marketData: Omit<MarketData, 'id'> = {
      symbol,
      timestamp: new Date(kline.closeTime).toISOString(),
      open,
      high: parseFloat(kline.high),
      low: parseFloat(kline.low),
      close,
      volume: parseFloat(kline.volume),
      color,
      created_at: new Date().toISOString()
    };

    await supabaseAdmin.from('market_data').upsert(marketData, {
      onConflict: 'symbol,timestamp'
    });
  }
}

export const binanceDataService = BinanceDataService.getInstance();