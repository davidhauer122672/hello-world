/**
 * CK Trading Desk — React Hooks
 * Real-time data hooks for the trading dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMarketData } from '../services/market-data.js';

/**
 * Subscribe to real-time market data updates
 */
export function useMarketData() {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const subIdRef = useRef(null);

  useEffect(() => {
    const mds = getMarketData();
    setConnected(true);

    // Initial load
    const allPrices = {};
    mds.getAllPrices().forEach(p => { allPrices[p.symbol] = p; });
    setPrices(allPrices);

    // Subscribe to updates
    subIdRef.current = mds.subscribe((updates) => {
      setPrices(prev => ({ ...prev, ...updates }));
    });

    return () => {
      if (subIdRef.current) mds.unsubscribe(subIdRef.current);
    };
  }, []);

  const getPrice = useCallback((symbol) => prices[symbol] || null, [prices]);

  return { prices, connected, getPrice };
}

/**
 * Portfolio tracking hook
 */
export function usePortfolio(initialHoldings = []) {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const { prices } = useMarketData();

  useEffect(() => {
    let value = 0;
    let pnl = 0;

    holdings.forEach(h => {
      const current = prices[h.symbol]?.price || h.avgCost;
      const marketValue = current * h.shares;
      const costBasis = h.avgCost * h.shares;
      value += marketValue;
      pnl += marketValue - costBasis;
    });

    setTotalValue(value);
    setTotalPnL(pnl);
  }, [holdings, prices]);

  const addHolding = useCallback((holding) => {
    setHoldings(prev => [...prev, holding]);
  }, []);

  const removeHolding = useCallback((symbol) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
  }, []);

  return { holdings, totalValue, totalPnL, addHolding, removeHolding };
}

/**
 * Trading signals hook — aggregates signals from all engines
 */
export function useTradingSignals() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    // Simulate signals from the 10 analysis engines
    const generateSignals = () => {
      const symbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'JPM', 'GS', 'V', 'META'];
      const engines = [
        'Goldman Sachs', 'Morgan Stanley', 'Bridgewater', 'JPMorgan',
        'BlackRock', 'Citadel', 'Harvard', 'Bain', 'Renaissance', 'McKinsey',
      ];
      const actions = ['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'];
      const weights = [0.15, 0.35, 0.30, 0.15, 0.05]; // Bias toward buy

      const newSignals = symbols.map(symbol => {
        const rand = Math.random();
        let cumWeight = 0;
        let action = 'HOLD';
        for (let i = 0; i < weights.length; i++) {
          cumWeight += weights[i];
          if (rand <= cumWeight) { action = actions[i]; break; }
        }

        return {
          symbol,
          action,
          confidence: 60 + Math.random() * 35,
          engine: engines[Math.floor(Math.random() * engines.length)],
          timestamp: Date.now(),
          priceTarget: null,
        };
      });

      setSignals(newSignals);
    };

    generateSignals();
    const interval = setInterval(generateSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  return signals;
}
