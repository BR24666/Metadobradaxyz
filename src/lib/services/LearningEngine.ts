import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { CRYPTO_PAIRS } from '@/lib/data/tradingPairs'
import type { Strategy } from '@/types/trading'

export class LearningEngine {
  private static instance: LearningEngine
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  static getInstance(): LearningEngine {
    if (!LearningEngine.instance) {
      LearningEngine.instance = new LearningEngine()
    }
    return LearningEngine.instance
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    console.log(`🚀 INICIANDO MOTOR DE APRENDIZADO COM ${CRYPTO_PAIRS.length} PARES`)
    this.intervalId = setInterval(() => this.runLearningCycle(), 2000)
  }

  private async runLearningCycle(): Promise<void> {
    const batch = CRYPTO_PAIRS.sort(() => 0.5 - Math.random()).slice(0, 100) // Processa 100 por ciclo
    const promises = batch.map(pair => this.simulateAndLearn(pair))
    await Promise.all(promises)
  }

  private async simulateAndLearn(pair: string): Promise<void> {
    try {
      const candles = Array.from({ length: 4 }, () => Math.random() > 0.5 ? 'GREEN' : 'RED')
      const patternId = candles.slice(0, 3).join('_')
      const actualResult = candles[3]

      const { data: existing } = await supabaseAdmin.from('strategies').select('*').eq('name', patternId).single()
      const strategy: Strategy = existing || {
        id: uuidv4(), name: patternId, total_simulations: 0, total_wins: 0, win_rate: 0, last_seen_at: null
      }

      const predictedResult = patternId.split('_')[2] as 'GREEN' | 'RED'
      const isWin = predictedResult === actualResult

      strategy.total_simulations++
      strategy.total_wins = (strategy.total_wins || 0) + (isWin ? 1 : 0)
      strategy.win_rate = (strategy.total_wins / strategy.total_simulations) * 100
      strategy.last_seen_at = new Date().toISOString()
      
      await supabaseAdmin.from('strategies').upsert(strategy)
      await supabaseAdmin.from('trade_simulations').insert({
          id: uuidv4(), pair, strategy_id: patternId, result: isWin ? 'WIN' : 'LOSS'
      })
    } catch (_error) { /* Ignora erros de simulação para manter o motor rodando */ }
  }
}
export const learningEngine = LearningEngine.getInstance()
