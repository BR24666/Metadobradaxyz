import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { ScalabilityConfig } from '@/types/trading';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config: ScalabilityConfig = {
    maxConcurrentPairs: 1000,
    batchSize: 100,
    cycleInterval: 2000,
    providers: [
      {
        name: 'BINANCE',
        baseUrl: 'https://api.binance.com',
        rateLimit: 1200
      },
      {
        name: 'ALPHA_VANTAGE',
        apiKey: process.env.ALPHA_VANTAGE_API_KEY,
        baseUrl: 'https://alpha-vantage.p.rapidapi.com',
        rateLimit: 5
      },
      {
        name: 'COINGECKO',
        apiKey: process.env.COINGECKO_API_KEY,
        baseUrl: 'https://coingecko.p.rapidapi.com',
        rateLimit: 10
      }
    ],
    cache: {
      enabled: true,
      ttl: 300,
      maxSize: 1000
    }
  };

  return NextResponse.json({ success: true, config });
}