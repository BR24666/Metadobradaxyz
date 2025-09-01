import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { CRYPTO_PAIRS } from '@/lib/data/tradingPairs'
import type { Strategy, TradeSimulation } from '@/types/trading'

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
    console.log(`�� INICIANDO MOTOR DE APRENDIZADO COM ${CRYPTO_PAIRS.length} PARES`)
    this.intervalId = setInterval(() => this.runLearningCycle(), 2000)
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('⏹️ Motor de aprendizado parado')
  }

  private async runLearningCycle(): Promise<void> {
    try {
      const batch = CRYPTO_PAIRS.sort(() => 0.5 - Math.random()).slice(0, 100)
      const promises = batch.map(pair => this.simulateAndLearn(pair))
      await Promise.allSettled(promises)
      
      // Log de status a cada 10 ciclos
      if (Math.random() < 0.1) {
        console.log(`🔄 Ciclo executado com ${batch.length} pares`)
      }
    } catch (error) {
      console.error('❌ Erro no ciclo de aprendizado:', error)
    }
  }

  private async simulateAndLearn(pair: string): Promise<void> {
    try {
      // Gerar dados simulados de candles
      const candles = Array.from({ length: 4 }, () => Math.random() > 0.5 ? 'GREEN' : 'RED')
      const patternId = candles.slice(0, 3).join('_')
      const actualResult = candles[3]

      // Buscar estratégia existente ou criar nova
      const { data: existing } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .eq('name', patternId)
        .single()

      const strategy: Strategy = existing || {
        id: uuidv4(),
        name: patternId,
        total_simulations: 0,
        total_wins: 0,
        win_rate: 0,
        last_seen_at: null
      }

      // Calcular predição e resultado
      const predictedResult = patternId.split('_')[2] as 'GREEN' | 'RED'
      const isWin = predictedResult === actualResult

      // Atualizar estatísticas da estratégia
      strategy.total_simulations++
      strategy.total_wins = (strategy.total_wins || 0) + (isWin ? 1 : 0)
      strategy.win_rate = (strategy.total_wins / strategy.total_simulations) * 100
      strategy.last_seen_at = new Date().toISOString()
      
      // Salvar no banco
      await supabaseAdmin.from('strategies').upsert(strategy)
      
      // Registrar simulação de trade
      await supabaseAdmin.from('trade_simulations').insert({
        id: uuidv4(),
        pair,
        strategy_id: patternId,
        result: isWin ? 'WIN' : 'LOSS',
        created_at: new Date().toISOString()
      })

    } catch (error) {
      // Log silencioso de erros para não poluir o console
      if (Math.random() < 0.01) { // Log apenas 1% dos erros
        console.error(`❌ Erro na simulação para ${pair}:`, error)
      }
    }
  }

  // Método para obter estatísticas do motor
  async getStats(): Promise<{
    isRunning: boolean
    totalPairs: number
    batchSize: number
    cycleInterval: number
  }> {
    return {
      isRunning: this.isRunning,
      totalPairs: CRYPTO_PAIRS.length,
      batchSize: 100,
      cycleInterval: 2000
    }
  }

  // Método para ajustar configurações
  async updateConfig(config: {
    batchSize?: number
    cycleInterval?: number
  }): Promise<void> {
    if (config.cycleInterval && this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = setInterval(() => this.runLearningCycle(), config.cycleInterval)
    }
  }
}

export const learningEngine = LearningEngine.getInstance()