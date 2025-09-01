import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const { pair } = await request.json()
    const { data: strategy } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .order('win_rate', { ascending: false })
        .limit(1)
        .single();

    if (!strategy || strategy.win_rate < 75) {
      return NextResponse.json({ success: false, message: `Nenhuma estratégia confiável encontrada (acima de 75%). Melhor estratégia atual: ${strategy?.win_rate.toFixed(1) || 0}%` });
    }
    
    const signal = {
        pair,
        direction: strategy.name.split('_')[2],
        confidence: strategy.win_rate.toFixed(1),
        strategy: strategy.name
    };
    return NextResponse.json({ success: true, signal });
  } catch {
    return NextResponse.json({ success: false, message: "Não foi possível analisar o mercado." });
  }
}
