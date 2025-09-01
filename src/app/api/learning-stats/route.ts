import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Buscar estratégias com melhor performance
        const { data: topStrategies } = await supabaseAdmin
            .from('strategies')
            .select('*')
            .gte('total_simulations', 10) // Mínimo 10 simulações
            .order('win_rate', { ascending: false })
            .limit(5);

        // Estatísticas gerais
        const { data: allStrategies } = await supabaseAdmin
            .from('strategies')
            .select('total_simulations, total_wins, win_rate');

        // Calcular médias
        const totalSimulations = allStrategies?.reduce((sum, s) => sum + (s.total_simulations || 0), 0) || 0;
        const totalWins = allStrategies?.reduce((sum, s) => sum + (s.total_wins || 0), 0) || 0;
        const averageWinRate = totalSimulations > 0 ? (totalWins / totalSimulations) * 100 : 0;

        // Estratégias com alta confiança (>70%)
        const highConfidenceStrategies = allStrategies?.filter(s => (s.win_rate || 0) > 70).length || 0;

        // Últimas simulações
        const { data: recentTrades } = await supabaseAdmin
            .from('trade_simulations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            success: true,
            data: {
                totalSimulations,
                totalWins,
                averageWinRate: Math.round(averageWinRate * 100) / 100,
                highConfidenceStrategies,
                totalStrategies: allStrategies?.length || 0,
                topStrategies: topStrategies || [],
                recentTrades: recentTrades || [],
                learningProgress: {
                    isLearning: true,
                    confidence: averageWinRate > 60 ? 'ALTA' : averageWinRate > 50 ? 'MÉDIA' : 'BAIXA',
                    recommendation: averageWinRate > 70 ? 'Sistema pronto para sinais reais!' : 'Continue aprendendo...'
                }
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de aprendizado:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao buscar estatísticas'
        });
    }
}