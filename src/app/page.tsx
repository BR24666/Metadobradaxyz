'use client'

import React, { useState, useEffect } from 'react'
import { useAutoStart } from '@/hooks/useAutoStart'
import { motion, AnimatePresence } from 'framer-motion'
import type { Signal, TradeSimulation } from '@/types/trading'

export default function Dashboard() {
  useAutoStart();
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [signal, setSignal] = useState<Signal | null>(null);
  const [message, setMessage] = useState('Selecione um par e clique para gerar um sinal.');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ totalSimulations: number, recentTrades: TradeSimulation[] } | null>(null);

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
      const interval = setInterval(checkStatus, 3000); // Atualiza o feed a cada 3s
      checkStatus();
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
      <header className="bg-gray-800/50 p-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-center">Meta Dobrada - AI Signal Generator</h1>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Coluna Esquerda: Gerador de Sinais */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg flex flex-col">
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
          <button 
            onClick={handleGenerateSignal}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded w-full disabled:bg-gray-500 transition-all"
          >
            {isLoading ? 'Analisando...' : 'Gerar Sinal'}
          </button>
          <div className="mt-6 flex-grow flex items-center justify-center bg-gray-900/50 rounded-lg p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={JSON.stringify(signal) + message}
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }} className="text-center"
              >
                {isLoading && <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>}
                {signal && (
                  <div>
                    <p className={`text-5xl font-bold my-2 ${signal.direction === 'GREEN' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.direction === 'GREEN' ? 'COMPRA' : 'VENDA'}
                    </p>
                    <p className="text-sm">Confiança: <span className="font-bold">{signal.confidence}%</span></p>
                  </div>
                )}
                {!isLoading && !signal && <p className="text-gray-500">{message}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Coluna Direita: Feed de Aprendizado */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Progresso do Aprendizado</h2>
          <div className="flex items-center justify-between text-center bg-gray-900/50 p-3 rounded-lg mb-4">
              <div>
                  <h3 className="text-gray-400 text-sm">STATUS</h3>
                  <p className="text-lg font-bold text-green-400">APRENDENDO 24/7</p>
              </div>
              <div>
                  <h3 className="text-gray-400 text-sm">SIMULAÇÕES TOTAIS</h3>
                  <p className="text-lg font-bold">{(stats?.totalSimulations || 0).toLocaleString()}</p>
              </div>
          </div>
          <h3 className="font-bold mb-2">Feed de Simulações em Tempo Real (Acertos e Erros)</h3>
          <div className="space-y-2">
            {(stats?.recentTrades || []).map((trade: TradeSimulation) => (
              <div key={trade.id} className="grid grid-cols-3 items-center bg-gray-700/50 p-2 rounded text-sm">
                <span className="font-mono">{trade.pair}</span>
                <span className="font-mono text-xs text-blue-300">{trade.strategy_id.replaceAll('_', ' ')}</span>
                <span className={`font-bold ${trade.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>{trade.result}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
