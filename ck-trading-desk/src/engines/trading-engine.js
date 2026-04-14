/**
 * CK Trading Desk - Autonomous Revenue Engine
 * Works 24/7/365 - Ferrari-Standard Execution
 */

// ============================================================
// MarketDataProcessor
// ============================================================
export class MarketDataProcessor {
  processTickData(tick) {
    return {
      symbol: tick.symbol,
      price: +tick.price.toFixed(4),
      volume: tick.volume,
      timestamp: tick.timestamp || Date.now(),
      bid: tick.bid || null,
      ask: tick.ask || null,
      spread: tick.bid && tick.ask ? +(tick.ask - tick.bid).toFixed(4) : null,
    };
  }

  calculateVWAP(ticks) {
    if (!ticks || ticks.length === 0) return null;
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    const vwapSeries = ticks.map(t => {
      const tp = (t.high + t.low + t.close) / 3;
      cumulativeTPV += tp * t.volume;
      cumulativeVolume += t.volume;
      return {
        timestamp: t.timestamp,
        vwap: +(cumulativeTPV / cumulativeVolume).toFixed(4),
        cumulativeVolume,
      };
    });
    return {
      currentVWAP: vwapSeries[vwapSeries.length - 1].vwap,
      totalVolume: cumulativeVolume,
      series: vwapSeries,
    };
  }

  detectPriceAnomaly(ticks, threshold = 2) {
    if (ticks.length < 20) return { anomalies: [], message: 'Insufficient data' };
    const prices = ticks.map(t => t.price || t.close);
    const mean = prices.reduce((s, v) => s + v, 0) / prices.length;
    const std = Math.sqrt(prices.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / prices.length);
    const anomalies = ticks.filter(t => {
      const p = t.price || t.close;
      return Math.abs(p - mean) > threshold * std;
    }).map(t => ({
      ...t, zScore: +(((t.price || t.close) - mean) / std).toFixed(2),
      direction: (t.price || t.close) > mean ? 'ABOVE' : 'BELOW',
    }));
    return { mean: +mean.toFixed(4), std: +std.toFixed(4), threshold, anomalies };
  }

  aggregateOHLCV(ticks, intervalMinutes = 5) {
    if (!ticks || ticks.length === 0) return [];
    const intervalMs = intervalMinutes * 60 * 1000;
    const bars = new Map();
    ticks.forEach(t => {
      const ts = t.timestamp || Date.now();
      const barKey = Math.floor(ts / intervalMs) * intervalMs;
      const price = t.price || t.close;
      if (!bars.has(barKey)) {
        bars.set(barKey, { timestamp: barKey, open: price, high: price, low: price, close: price, volume: t.volume || 0 });
      } else {
        const bar = bars.get(barKey);
        bar.high = Math.max(bar.high, price);
        bar.low = Math.min(bar.low, price);
        bar.close = price;
        bar.volume += t.volume || 0;
      }
    });
    return Array.from(bars.values()).sort((a, b) => a.timestamp - b.timestamp);
  }
}

// ============================================================
// OrderManager
// ============================================================
export class OrderManager {
  constructor() {
    this.orders = new Map();
    this.orderCounter = 0;
  }

  generateOrderId() {
    this.orderCounter++;
    return `ORD-${Date.now()}-${String(this.orderCounter).padStart(6, '0')}`;
  }

  createOrder(params) {
    const validation = this.validateOrder(params);
    if (!validation.valid) return { success: false, error: validation.errors };
    const order = {
      id: this.generateOrderId(),
      symbol: params.symbol,
      side: params.side.toUpperCase(),
      type: (params.type || 'MARKET').toUpperCase(),
      quantity: params.quantity,
      price: params.price || null,
      stopPrice: params.stopPrice || null,
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fills: [],
      filledQty: 0,
      avgFillPrice: 0,
    };
    this.orders.set(order.id, order);
    return { success: true, order };
  }

  validateOrder(order) {
    const errors = [];
    if (!order.symbol) errors.push('Symbol is required');
    if (!order.side || !['BUY', 'SELL', 'buy', 'sell'].includes(order.side)) errors.push('Side must be BUY or SELL');
    if (!order.quantity || order.quantity <= 0) errors.push('Quantity must be positive');
    if (order.type === 'LIMIT' && !order.price) errors.push('Limit price required for LIMIT orders');
    if (order.quantity > 1000000) errors.push('Quantity exceeds maximum order size');
    return { valid: errors.length === 0, errors };
  }

  getOrderStatus(id) {
    const order = this.orders.get(id);
    if (!order) return { found: false };
    return { found: true, order };
  }

  getOrderHistory(filters = {}) {
    let orders = Array.from(this.orders.values());
    if (filters.symbol) orders = orders.filter(o => o.symbol === filters.symbol);
    if (filters.side) orders = orders.filter(o => o.side === filters.side);
    if (filters.status) orders = orders.filter(o => o.status === filters.status);
    if (filters.since) orders = orders.filter(o => o.createdAt >= filters.since);
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }

  calculateSlippage(order, fill) {
    if (!order.price) return { slippage: 0, slippagePercent: 0, note: 'Market order - no expected price' };
    const slippage = order.side === 'BUY' ? fill.price - order.price : order.price - fill.price;
    return {
      expectedPrice: order.price,
      fillPrice: fill.price,
      slippage: +slippage.toFixed(4),
      slippagePercent: +((slippage / order.price) * 100).toFixed(4),
      favorable: slippage <= 0,
    };
  }
}

// ============================================================
// PositionTracker
// ============================================================
export class PositionTracker {
  constructor() {
    this.positions = new Map();
    this.closedTrades = [];
  }

  openPosition(fill) {
    const pos = {
      symbol: fill.symbol,
      side: fill.side,
      quantity: fill.quantity,
      avgEntry: fill.price,
      openedAt: Date.now(),
      fills: [fill],
    };
    this.positions.set(fill.symbol, pos);
    return pos;
  }

  updatePosition(symbol, fill) {
    const pos = this.positions.get(symbol);
    if (!pos) return this.openPosition(fill);
    const totalCost = pos.avgEntry * pos.quantity + fill.price * fill.quantity;
    pos.quantity += fill.quantity;
    pos.avgEntry = totalCost / pos.quantity;
    pos.fills.push(fill);
    return pos;
  }

  closePosition(symbol, quantity, exitPrice) {
    const pos = this.positions.get(symbol);
    if (!pos) return { success: false, error: 'Position not found' };
    const closeQty = Math.min(quantity, pos.quantity);
    const pnl = pos.side === 'BUY'
      ? (exitPrice - pos.avgEntry) * closeQty
      : (pos.avgEntry - exitPrice) * closeQty;
    const trade = {
      symbol, side: pos.side, quantity: closeQty,
      entryPrice: pos.avgEntry, exitPrice,
      pnl: +pnl.toFixed(2),
      pnlPercent: +((pnl / (pos.avgEntry * closeQty)) * 100).toFixed(2),
      closedAt: Date.now(),
    };
    this.closedTrades.push(trade);
    pos.quantity -= closeQty;
    if (pos.quantity <= 0) this.positions.delete(symbol);
    return { success: true, trade };
  }

  getAllPositions() {
    return Array.from(this.positions.values());
  }

  calculateUnrealizedPnL(position, currentPrice) {
    const pnl = position.side === 'BUY'
      ? (currentPrice - position.avgEntry) * position.quantity
      : (position.avgEntry - currentPrice) * position.quantity;
    return {
      symbol: position.symbol, unrealizedPnL: +pnl.toFixed(2),
      pnlPercent: +((pnl / (position.avgEntry * position.quantity)) * 100).toFixed(2),
      marketValue: +(currentPrice * position.quantity).toFixed(2),
    };
  }

  calculateRealizedPnL(trades) {
    const tradeList = trades || this.closedTrades;
    const totalPnL = tradeList.reduce((s, t) => s + t.pnl, 0);
    const winners = tradeList.filter(t => t.pnl > 0);
    const losers = tradeList.filter(t => t.pnl < 0);
    return {
      totalPnL: +totalPnL.toFixed(2),
      totalTrades: tradeList.length,
      winners: winners.length,
      losers: losers.length,
      winRate: tradeList.length > 0 ? +((winners.length / tradeList.length) * 100).toFixed(1) : 0,
      avgWin: winners.length > 0 ? +(winners.reduce((s, t) => s + t.pnl, 0) / winners.length).toFixed(2) : 0,
      avgLoss: losers.length > 0 ? +(losers.reduce((s, t) => s + t.pnl, 0) / losers.length).toFixed(2) : 0,
      largestWin: winners.length > 0 ? +Math.max(...winners.map(t => t.pnl)).toFixed(2) : 0,
      largestLoss: losers.length > 0 ? +Math.min(...losers.map(t => t.pnl)).toFixed(2) : 0,
    };
  }

  calculatePortfolioMetrics() {
    const positions = this.getAllPositions();
    const totalValue = positions.reduce((s, p) => s + p.avgEntry * p.quantity, 0);
    return {
      openPositions: positions.length,
      totalMarketValue: +totalValue.toFixed(2),
      closedTrades: this.closedTrades.length,
      realizedPnL: this.calculateRealizedPnL(),
    };
  }
}

// ============================================================
// RiskManager
// ============================================================
export class RiskManager {
  checkPreTradeRisk(order, portfolio) {
    const checks = [];
    const posLimit = this.calculatePositionLimit(order.symbol, portfolio);
    if (order.quantity * (order.price || 0) > posLimit.maxNotional) {
      checks.push({ check: 'POSITION_SIZE', passed: false, message: `Order exceeds max position size of $${posLimit.maxNotional}` });
    } else {
      checks.push({ check: 'POSITION_SIZE', passed: true });
    }
    const concentration = portfolio.totalValue > 0
      ? ((order.quantity * (order.price || 0)) / portfolio.totalValue) * 100 : 0;
    if (concentration > 10) {
      checks.push({ check: 'CONCENTRATION', passed: false, message: `${concentration.toFixed(1)}% exceeds 10% concentration limit` });
    } else {
      checks.push({ check: 'CONCENTRATION', passed: true });
    }
    const allPassed = checks.every(c => c.passed);
    return { approved: allPassed, checks, timestamp: Date.now() };
  }

  calculatePositionLimit(symbol, portfolio) {
    const maxPercent = 0.10;
    const maxNotional = portfolio.totalValue * maxPercent;
    const currentExposure = (portfolio.positions || [])
      .filter(p => p.symbol === symbol)
      .reduce((s, p) => s + p.avgEntry * p.quantity, 0);
    return {
      symbol, maxNotional: +maxNotional.toFixed(2),
      currentExposure: +currentExposure.toFixed(2),
      remaining: +(maxNotional - currentExposure).toFixed(2),
    };
  }

  calculatePortfolioVaR(portfolio, confidence = 0.95) {
    const returns = portfolio.returns || [];
    if (returns.length < 10) return { var: 0, message: 'Insufficient return history' };
    const sorted = [...returns].sort((a, b) => a - b);
    const idx = Math.floor((1 - confidence) * sorted.length);
    const var95 = sorted[idx];
    const totalValue = portfolio.totalValue || 0;
    return {
      varPercent: +(var95 * 100).toFixed(2),
      varDollar: +(totalValue * Math.abs(var95)).toFixed(2),
      confidence,
      totalValue,
    };
  }

  monitorDrawdown(portfolio, maxDrawdownPercent = 10) {
    const { currentValue, peakValue } = portfolio;
    const drawdown = peakValue > 0 ? ((peakValue - currentValue) / peakValue) * 100 : 0;
    const breached = drawdown >= maxDrawdownPercent;
    return {
      currentDrawdown: +drawdown.toFixed(2),
      maxAllowed: maxDrawdownPercent,
      breached,
      action: breached ? 'HALT_TRADING' : drawdown > maxDrawdownPercent * 0.8 ? 'REDUCE_RISK' : 'NORMAL',
      peakValue, currentValue,
    };
  }

  calculateKellyFraction(winRate, avgWin, avgLoss) {
    const w = winRate;
    const r = avgWin / Math.abs(avgLoss);
    const kelly = w - (1 - w) / r;
    const halfKelly = kelly / 2;
    return {
      fullKelly: +Math.max(0, kelly * 100).toFixed(2),
      halfKelly: +Math.max(0, halfKelly * 100).toFixed(2),
      recommendation: kelly <= 0 ? 'DO NOT TRADE' : halfKelly > 25 ? 'Cap at 25%' : `Allocate ${halfKelly.toFixed(1)}% per trade`,
      winRate, avgWin, avgLoss,
    };
  }
}

// ============================================================
// StrategyEngine
// ============================================================
export class StrategyEngine {
  momentumStrategy(signals) {
    const { prices, smaShort, smaLong, volume, avgVolume } = signals;
    const currentPrice = prices[prices.length - 1];
    const shortMA = smaShort[smaShort.length - 1];
    const longMA = smaLong[smaLong.length - 1];
    const volumeRatio = volume / avgVolume;
    let signal = 'NEUTRAL';
    let strength = 0;
    if (shortMA > longMA && currentPrice > shortMA) {
      signal = 'BUY';
      strength = Math.min(100, Math.round(((shortMA - longMA) / longMA) * 1000 + volumeRatio * 20));
    } else if (shortMA < longMA && currentPrice < shortMA) {
      signal = 'SELL';
      strength = Math.min(100, Math.round(((longMA - shortMA) / longMA) * 1000 + volumeRatio * 20));
    }
    return { strategy: 'MOMENTUM', signal, strength, currentPrice, shortMA, longMA, volumeRatio: +volumeRatio.toFixed(2) };
  }

  meanReversionStrategy(signals) {
    const { prices, sma, bollingerUpper, bollingerLower } = signals;
    const currentPrice = prices[prices.length - 1];
    const deviation = (currentPrice - sma) / sma;
    let signal = 'NEUTRAL';
    let strength = 0;
    if (currentPrice <= bollingerLower) {
      signal = 'BUY';
      strength = Math.min(100, Math.round(Math.abs(deviation) * 500));
    } else if (currentPrice >= bollingerUpper) {
      signal = 'SELL';
      strength = Math.min(100, Math.round(Math.abs(deviation) * 500));
    }
    return { strategy: 'MEAN_REVERSION', signal, strength, currentPrice, sma, deviation: +(deviation * 100).toFixed(2) };
  }

  dividendCaptureStrategy(schedule) {
    const now = Date.now();
    const upcoming = schedule
      .filter(s => s.exDate > now && s.exDate - now < 30 * 24 * 60 * 60 * 1000)
      .map(s => ({
        ...s,
        annualizedYield: +((s.dividend / s.price) * (365 / 90) * 100).toFixed(2),
        daysUntilEx: Math.ceil((s.exDate - now) / (24 * 60 * 60 * 1000)),
        buyBefore: new Date(s.exDate - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      .sort((a, b) => a.exDate - b.exDate);
    return { strategy: 'DIVIDEND_CAPTURE', candidates: upcoming, totalCandidates: upcoming.length };
  }

  evaluateSignals(strategy, data) {
    switch (strategy) {
      case 'MOMENTUM': return this.momentumStrategy(data);
      case 'MEAN_REVERSION': return this.meanReversionStrategy(data);
      case 'DIVIDEND_CAPTURE': return this.dividendCaptureStrategy(data);
      default: return { strategy, signal: 'UNKNOWN', error: 'Strategy not recognized' };
    }
  }

  backtestStrategy(strategy, historicalData, params = {}) {
    const { initialCapital = 100000, positionSize = 0.1 } = params;
    let capital = initialCapital;
    let position = null;
    const trades = [];
    for (let i = 50; i < historicalData.length; i++) {
      const window = historicalData.slice(0, i + 1);
      const prices = window.map(d => d.close);
      const smaShort = prices.slice(-10).reduce((s, v) => s + v, 0) / 10;
      const smaLong = prices.slice(-30).reduce((s, v) => s + v, 0) / 30;
      const currentPrice = prices[prices.length - 1];
      if (!position && smaShort > smaLong) {
        const qty = Math.floor((capital * positionSize) / currentPrice);
        if (qty > 0) {
          position = { entry: currentPrice, qty, entryIdx: i };
          capital -= qty * currentPrice;
        }
      } else if (position && smaShort < smaLong) {
        const pnl = (currentPrice - position.entry) * position.qty;
        capital += position.qty * currentPrice;
        trades.push({ entry: position.entry, exit: currentPrice, qty: position.qty, pnl: +pnl.toFixed(2) });
        position = null;
      }
    }
    const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
    const winners = trades.filter(t => t.pnl > 0);
    return {
      strategy, initialCapital, finalCapital: +capital.toFixed(2),
      totalReturn: +(((capital - initialCapital) / initialCapital) * 100).toFixed(2),
      totalTrades: trades.length,
      winRate: trades.length > 0 ? +((winners.length / trades.length) * 100).toFixed(1) : 0,
      totalPnL: +totalPnL.toFixed(2),
      trades: trades.slice(-10),
    };
  }
}

// ============================================================
// CashFlowGenerator
// ============================================================
export class CashFlowGenerator {
  calculateDividendIncome(portfolio) {
    const holdings = portfolio.map(p => ({
      symbol: p.symbol, shares: p.shares, price: p.price,
      dividendPerShare: p.dividendPerShare || 0,
      annualDividend: +(p.shares * (p.dividendPerShare || 0)).toFixed(2),
      quarterlyDividend: +(p.shares * (p.dividendPerShare || 0) / 4).toFixed(2),
      yield: p.price > 0 ? +((p.dividendPerShare || 0) / p.price * 100).toFixed(2) : 0,
    }));
    const totalAnnual = holdings.reduce((s, h) => s + h.annualDividend, 0);
    return {
      holdings,
      totalAnnualDividend: +totalAnnual.toFixed(2),
      totalMonthlyDividend: +(totalAnnual / 12).toFixed(2),
      portfolioYield: +((totalAnnual / portfolio.reduce((s, p) => s + p.shares * p.price, 0)) * 100).toFixed(2),
    };
  }

  calculateOptionsIncome(coveredCalls, cashSecuredPuts) {
    const callIncome = (coveredCalls || []).map(c => ({
      ...c, premium: +(c.premium * c.contracts * 100).toFixed(2),
      annualized: +((c.premium / c.strikePrice) * (365 / c.daysToExpiry) * 100).toFixed(2),
    }));
    const putIncome = (cashSecuredPuts || []).map(p => ({
      ...p, premium: +(p.premium * p.contracts * 100).toFixed(2),
      annualized: +((p.premium / p.strikePrice) * (365 / p.daysToExpiry) * 100).toFixed(2),
    }));
    return {
      coveredCalls: callIncome,
      cashSecuredPuts: putIncome,
      totalCallPremium: +callIncome.reduce((s, c) => s + c.premium, 0).toFixed(2),
      totalPutPremium: +putIncome.reduce((s, p) => s + p.premium, 0).toFixed(2),
      totalMonthlyIncome: +((callIncome.reduce((s, c) => s + c.premium, 0) + putIncome.reduce((s, p) => s + p.premium, 0)) / 12).toFixed(2),
    };
  }

  projectCashFlow(portfolio, months) {
    const divIncome = this.calculateDividendIncome(portfolio);
    const monthlyDiv = divIncome.totalMonthlyDividend;
    const projections = [];
    let cumulative = 0;
    for (let m = 1; m <= months; m++) {
      cumulative += monthlyDiv;
      projections.push({
        month: m,
        dividendIncome: +monthlyDiv.toFixed(2),
        cumulativeIncome: +cumulative.toFixed(2),
      });
    }
    return { monthlyDividend: +monthlyDiv.toFixed(2), projections };
  }

  compoundGrowthProjection(initialInvestment, monthlyContribution, annualYield, years) {
    const monthlyRate = annualYield / 100 / 12;
    const projections = [];
    let balance = initialInvestment;
    let totalContributions = initialInvestment;
    let totalDividends = 0;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const dividend = balance * monthlyRate;
        totalDividends += dividend;
        balance += dividend + monthlyContribution;
        totalContributions += monthlyContribution;
      }
      projections.push({
        year: y, balance: +balance.toFixed(2),
        totalContributions: +totalContributions.toFixed(2),
        totalDividends: +totalDividends.toFixed(2),
        monthlyIncome: +(balance * monthlyRate).toFixed(2),
      });
    }
    return { initialInvestment, monthlyContribution, annualYield, projections };
  }
}

// ============================================================
// TradingDeskController
// ============================================================
export class TradingDeskController {
  constructor() {
    this.marketData = new MarketDataProcessor();
    this.orders = new OrderManager();
    this.positions = new PositionTracker();
    this.risk = new RiskManager();
    this.strategy = new StrategyEngine();
    this.cashFlow = new CashFlowGenerator();
    this.status = 'STOPPED';
    this.config = {};
    this.tradeLog = [];
  }

  initialize(config) {
    this.config = {
      maxPositions: config.maxPositions || 20,
      maxDrawdown: config.maxDrawdown || 10,
      defaultStrategy: config.defaultStrategy || 'MOMENTUM',
      riskPerTrade: config.riskPerTrade || 0.02,
      ...config,
    };
    this.status = 'INITIALIZED';
    return { status: this.status, config: this.config };
  }

  startTrading() {
    if (this.status !== 'INITIALIZED' && this.status !== 'STOPPED') {
      return { success: false, error: 'Must initialize before starting' };
    }
    this.status = 'ACTIVE';
    return { success: true, status: this.status, startedAt: Date.now() };
  }

  stopTrading() {
    this.status = 'STOPPED';
    return { success: true, status: this.status, stoppedAt: Date.now(), openPositions: this.positions.getAllPositions().length };
  }

  getDashboardData() {
    const positions = this.positions.getAllPositions();
    const metrics = this.positions.calculatePortfolioMetrics();
    return {
      status: this.status,
      positions: positions.length,
      totalValue: metrics.totalMarketValue,
      realizedPnL: metrics.realizedPnL.totalPnL,
      winRate: metrics.realizedPnL.winRate,
      totalTrades: metrics.realizedPnL.totalTrades,
      recentTrades: this.tradeLog.slice(-10),
    };
  }

  executeTradeDecision(signal) {
    if (this.status !== 'ACTIVE') return { executed: false, reason: 'Trading desk not active' };
    const portfolio = {
      totalValue: this.positions.calculatePortfolioMetrics().totalMarketValue || 100000,
      positions: this.positions.getAllPositions(),
    };
    const riskCheck = this.risk.checkPreTradeRisk({
      symbol: signal.symbol, quantity: signal.quantity, price: signal.price,
    }, portfolio);
    if (!riskCheck.approved) return { executed: false, reason: 'Risk check failed', checks: riskCheck.checks };
    const orderResult = this.orders.createOrder({
      symbol: signal.symbol, side: signal.signal === 'BUY' ? 'BUY' : 'SELL',
      type: 'MARKET', quantity: signal.quantity, price: signal.price,
    });
    if (orderResult.success) {
      this.tradeLog.push({ ...signal, orderId: orderResult.order.id, timestamp: Date.now() });
    }
    return { executed: orderResult.success, order: orderResult.order || null, signal };
  }

  getPerformanceReport(period = 'all') {
    const metrics = this.positions.calculatePortfolioMetrics();
    const kelly = metrics.realizedPnL.winRate > 0
      ? this.risk.calculateKellyFraction(
          metrics.realizedPnL.winRate / 100,
          metrics.realizedPnL.avgWin,
          metrics.realizedPnL.avgLoss
        )
      : null;
    return {
      period,
      status: this.status,
      portfolio: metrics,
      kelly,
      tradeCount: this.tradeLog.length,
      generatedAt: new Date().toISOString(),
    };
  }
}
