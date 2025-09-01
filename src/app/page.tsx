'use client'

import React, { useState, useEffect } from 'react'
import { useAutoStart } from '@/hooks/useAutoStart'
import { motion } from 'framer-motion'
import type { Signal } from '@/types/trading'

export default function Dashboard() {
  useAutoStart();
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [signal, setSignal] = useState<Signal | null>(null);
  const [message, setMessage] = useState('Selecione um par e clique para gerar um sinal.');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ 
    totalSimulations: number, 
    recentTrades: Array<{
      id: string;
      pair: string;
      result: string;
      created_at: string;
    }> 
  } | null>(null);
  const [learningStats, setLearningStats] = useState<{
    totalSimulations: number;
    totalWins: number;
    averageWinRate: number;
    highConfidenceStrategies: number;
    totalStrategies: number;
    topStrategies: Array<{
      id: number;
      name: string;
      level: number;
      winRate: number;
      totalTrades: number;
    }>;
    recentTrades: Array<{
      id: string;
      pair: string;
      result: string;
      created_at: string;
    }>;
    learningProgress: {
      isLearning: boolean;
      confidence: string;
      recommendation: string;
    };
  } | null>(null);

  useEffect(() => {
      const checkStatus = async () => {
        try {
          const res = await fetch('/api/system-stats');
          if (res.ok) {
            const data = await res.json();
            if(data.success) setStats(data.data);
          }
        } catch {}
      }

      const checkLearningStats = async () => {
        try {
          const res = await fetch('/api/learning-stats');
          if (res.ok) {
            const data = await res.json();
            if(data.success) setLearningStats(data.data);
          }
        } catch {}
      }

      const interval = setInterval(() => {
        checkStatus();
        checkLearningStats();
      }, 3000);
      
      checkStatus();
      checkLearningStats();
      
      return () => clearInterval(interval);
  }, []);

  const handleGenerateSignal = async () => {
    setIsLoading(true);
    setSignal(null);
    setMessage('');
    try {
      const response = await fetch('/api/generate-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: selectedPair }),
      });
      const data = await response.json();
      if (data.success) {
        setSignal(data.signal);
      } else {
        setMessage(data.message || 'Erro desconhecido.');
      }
    } catch {
        setMessage('Falha na comunicação com a API.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 p-4 border-b border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center">Meta Dobrada - AI Signal Generator</h1>
      </motion.header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-gray-800 p-6 rounded-lg flex flex-col"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Gerador de Sinais (Próxima Vela)</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">Selecione o par e obtenha a previsão da IA.</p>
          <select 
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-gray-700 text-white p-3 rounded mb-4 w-full text-center"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="XRPUSDT">XRP/USDT</option>
          </select>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateSignal}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded w-full disabled:bg-gray-500 transition-all"
          >
            {isLoading ? 'Analisando...' : 'Gerar Sinal'}
          </motion.button>
          {signal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-600/20 border border-green-500 rounded-lg"
            >
              <h3 className="font-bold text-green-400 mb-2">Sinal Gerado!</h3>
              <p className="text-sm"><strong>Par:</strong> {signal.pair}</p>
              <p className="text-sm"><strong>Direção:</strong> {signal.direction}</p>
              <p className="text-sm"><strong>Confiança:</strong> {signal.confidence}%</p>
              <p className="text-sm"><strong>Estratégia:</strong> {signal.strategy}</p>
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-600/20 border border-red-500 rounded-lg"
            >
              <p className="text-red-400">{message}</p>
            </motion.div>
          )}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-gray-800 p-6 rounded-lg"
        >
          <h2 className="text-xl font-bold mb-4">Progresso do Aprendizado</h2>
          
          {learningStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                <h3 className="text-gray-400 text-sm">ACERTIVIDADE GERAL</h3>
                <p className="text-2xl font-bold text-green-400">{learningStats.averageWinRate}%</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                <h3 className="text-gray-400 text-sm">SIMULAÇÕES TOTAIS</h3>
                <p className="text-2xl font-bold">{(learningStats.totalSimulations || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                <h3 className="text-gray-400 text-sm">ESTRATÉGIAS CONFIÁVEIS</h3>
                <p className="text-2xl font-bold text-blue-400">{learningStats.highConfidenceStrategies}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                <h3 className="text-gray-400 text-sm">STATUS</h3>
                <p className={`text-lg font-bold ${
                  learningStats.learningProgress.confidence === 'ALTA' ? 'text-green-400' :
                  learningStats.learningProgress.confidence === 'MÉDIA' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {learningStats.learningProgress.confidence}
                </p>
              </div>
            </motion.div>
          )}

          {learningStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/50 p-4 rounded-lg mb-4"
            >
              <h3 className="font-bold mb-2">Recomendação da IA:</h3>
              <p className="text-gray-300">{learningStats.learningProgress.recommendation}</p>
            </motion.div>
          )}

          <h3 className="font-bold mb-2">Feed de Simulações em Tempo Real (Acertos e Erros)</h3>
          <div className="space-y-2">
            {(stats?.recentTrades || []).map((trade, index) => (
              <motion.div 
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-3 items-center bg-gray-700/50 p-2 rounded text-sm"
              >
                <span className="font-mono">{trade.pair}</span>
                <span className="font-mono text-xs text-blue-300">{trade.id}</span>
                <span className={`font-bold ${trade.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>{trade.result}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}