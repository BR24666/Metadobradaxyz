import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic';
export async function GET() {
    const { data: trades, count } = await supabaseAdmin
        .from('trade_simulations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(15);
        
    return NextResponse.json({ success: true, data: { totalSimulations: count || 0, recentTrades: trades || [] } });
}
