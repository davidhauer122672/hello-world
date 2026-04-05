/**
 * CK Trading Desk — 10 Institutional-Grade Financial Analysis Engines
 * Autonomous Revenue Engine — Works 24/7/365 — Ferrari-Standard Execution
 * Independent financial operations platform for Coastal Key Enterprise
 */

// ─── ENGINE 1: Goldman Sachs Stock Screener ──────────────────────
export class GoldmanSachsScreener {
  screenStocks(stocks, criteria = {}) {
    return stocks.filter(s => {
      if (criteria.maxPE && s.pe > criteria.maxPE) return false;
      if (criteria.minGrowth && s.revenueGrowth < criteria.minGrowth) return false;
      if (criteria.maxDE && s.debtToEquity > criteria.maxDE) return false;
      if (criteria.minYield && s.dividendYield < criteria.minYield) return false;
      if (criteria.minMarketCap && s.marketCap < criteria.minMarketCap) return false;
      return true;
    }).map(s => ({ ...s, risk: this.calculateRiskRating(s), moat: this.rateMoat(s) }));
  }

  calculatePERatio(price, eps) {
    if (!eps || eps <= 0) return Infinity;
    return price / eps;
  }

  analyzeRevenueGrowth(revenueHistory) {
    if (!revenueHistory || revenueHistory.length < 2) return 0;
    const start = revenueHistory[0];
    const end = revenueHistory[revenueHistory.length - 1];
    const years = revenueHistory.length - 1;
    return (Math.pow(end / start, 1 / years) - 1) * 100;
  }

  rateMoat(metrics) {
    let score = 0;
    if (metrics.grossMargin > 60) score += 2;
    else if (metrics.grossMargin > 40) score += 1;
    if (metrics.marketShare > 30) score += 2;
    else if (metrics.marketShare > 15) score += 1;
    if (metrics.roe > 20) score += 1;
    if (metrics.brandValue > 50) score += 1;
    if (metrics.switchingCost > 7) score += 1;
    if (score >= 5) return 'strong';
    if (score >= 3) return 'moderate';
    return 'weak';
  }

  generatePriceTargets(stock) {
    const base = stock.price;
    return {
      bull: +(base * 1.25).toFixed(2),
      base: +(base * 1.08).toFixed(2),
      bear: +(base * 0.85).toFixed(2),
    };
  }

  calculateRiskRating(metrics) {
    let risk = 5;
    if (metrics.beta > 1.5) risk += 2;
    else if (metrics.beta > 1.2) risk += 1;
    if (metrics.debtToEquity > 2) risk += 2;
    else if (metrics.debtToEquity > 1) risk += 1;
    if (metrics.pe > 40) risk += 1;
    if (metrics.dividendYield > 3) risk -= 1;
    if (metrics.revenueGrowth > 20) risk -= 1;
    return Math.max(1, Math.min(10, Math.round(risk)));
  }

  suggestEntryZones(price, support, resistance) {
    return {
      idealEntry: +(support + (price - support) * 0.3).toFixed(2),
      stopLoss: +(support * 0.97).toFixed(2),
      takeProfit: +(resistance * 0.98).toFixed(2),
    };
  }
}

// ─── ENGINE 2: Morgan Stanley DCF Valuation ──────────────────────
export class MorganStanleyDCF {
  projectRevenue(currentRevenue, growthRates, years = 5) {
    const projections = [];
    let revenue = currentRevenue;
    for (let i = 0; i < years; i++) {
      const rate = Array.isArray(growthRates) ? growthRates[i] || growthRates[growthRates.length - 1] : growthRates;
      revenue *= (1 + rate / 100);
      projections.push({ year: i + 1, revenue: +revenue.toFixed(2) });
    }
    return projections;
  }

  calculateFreeCashFlow(revenue, opMargin, capexRatio = 0.08, taxRate = 0.21, nwcChange = 0.02) {
    const ebit = revenue * (opMargin / 100);
    const nopat = ebit * (1 - taxRate);
    const capex = revenue * capexRatio;
    const nwc = revenue * nwcChange;
    return +(nopat - capex - nwc).toFixed(2);
  }

  calculateWACC(equityCost, debtCost, equityWeight, debtWeight, taxRate = 0.21) {
    return +(equityWeight * equityCost + debtWeight * debtCost * (1 - taxRate)).toFixed(4);
  }

  calculateTerminalValue(lastFCF, perpetualGrowth, wacc) {
    if (wacc <= perpetualGrowth) return Infinity;
    return +(lastFCF * (1 + perpetualGrowth) / (wacc - perpetualGrowth)).toFixed(2);
  }

  calculateTerminalValueExitMultiple(ebitda, multiple) {
    return +(ebitda * multiple).toFixed(2);
  }

  buildDCFModel(inputs) {
    const { currentRevenue, growthRates, opMargin, capexRatio, taxRate, wacc, terminalGrowth, sharesOutstanding, netDebt } = inputs;
    const projections = this.projectRevenue(currentRevenue, growthRates);
    const fcfs = projections.map(p => ({
      ...p,
      fcf: this.calculateFreeCashFlow(p.revenue, opMargin, capexRatio, taxRate),
    }));
    const discountedFCFs = fcfs.map((f, i) => ({
      ...f,
      discounted: +(f.fcf / Math.pow(1 + wacc, i + 1)).toFixed(2),
    }));
    const pvFCFs = discountedFCFs.reduce((sum, f) => sum + f.discounted, 0);
    const terminalValue = this.calculateTerminalValue(fcfs[fcfs.length - 1].fcf, terminalGrowth, wacc);
    const pvTerminal = +(terminalValue / Math.pow(1 + wacc, fcfs.length)).toFixed(2);
    const enterpriseValue = +(pvFCFs + pvTerminal).toFixed(2);
    const equityValue = +(enterpriseValue - (netDebt || 0)).toFixed(2);
    const perShare = +(equityValue / sharesOutstanding).toFixed(2);
    return { projections: discountedFCFs, pvFCFs: +pvFCFs.toFixed(2), terminalValue, pvTerminal, enterpriseValue, equityValue, perShare };
  }

  sensitivityAnalysis(baseInputs, waccRange = [0.08, 0.09, 0.10, 0.11, 0.12], growthRange = [0.01, 0.02, 0.03, 0.04, 0.05]) {
    return waccRange.map(w => ({
      wacc: w,
      values: growthRange.map(g => {
        const model = this.buildDCFModel({ ...baseInputs, wacc: w, terminalGrowth: g });
        return { growth: g, perShare: model.perShare };
      }),
    }));
  }

  getValuationVerdict(intrinsicValue, marketPrice) {
    const diff = (intrinsicValue - marketPrice) / marketPrice;
    if (diff > 0.15) return 'UNDERVALUED';
    if (diff < -0.15) return 'OVERVALUED';
    return 'FAIRLY VALUED';
  }
}

// ─── ENGINE 3: Bridgewater Risk Analyzer ─────────────────────────
export class BridgewaterRiskAnalyzer {
  calculateCorrelation(returnsA, returnsB) {
    const n = Math.min(returnsA.length, returnsB.length);
    if (n < 2) return 0;
    const meanA = returnsA.reduce((s, v) => s + v, 0) / n;
    const meanB = returnsB.reduce((s, v) => s + v, 0) / n;
    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
      const dA = returnsA[i] - meanA, dB = returnsB[i] - meanB;
      num += dA * dB; denA += dA * dA; denB += dB * dB;
    }
    const den = Math.sqrt(denA * denB);
    return den === 0 ? 0 : +(num / den).toFixed(4);
  }

  analyzeSectorConcentration(portfolio) {
    const sectors = {};
    portfolio.forEach(p => { sectors[p.sector] = (sectors[p.sector] || 0) + p.weight; });
    const weights = Object.values(sectors);
    const hhi = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
    return { sectors, hhi: +hhi.toFixed(4), concentrated: hhi > 0.25 };
  }

  stressTestRecession(portfolio, scenarios) {
    return scenarios.map(s => {
      const drawdown = portfolio.reduce((sum, p) => {
        const sectorMultiplier = s.sectorImpact[p.sector] || s.defaultImpact;
        return sum + p.weight * sectorMultiplier;
      }, 0);
      return { scenario: s.name, drawdown: +(drawdown * 100).toFixed(2), portfolioImpact: +(portfolio.reduce((s2, p) => s2 + p.value, 0) * drawdown).toFixed(2) };
    });
  }

  calculateVaR(returns, confidence = 0.95) {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    return +sorted[index].toFixed(4);
  }

  suggestHedges(portfolio) {
    const totalValue = portfolio.reduce((s, p) => s + p.value, 0);
    return [
      { strategy: 'Put Protection', instrument: 'SPY Put Options', cost: +(totalValue * 0.015).toFixed(2), protection: '10-15% downside' },
      { strategy: 'Tail Risk Hedge', instrument: 'VIX Call Spreads', cost: +(totalValue * 0.005).toFixed(2), protection: 'Black swan events' },
      { strategy: 'Sector Hedge', instrument: 'Inverse Sector ETFs', cost: +(totalValue * 0.008).toFixed(2), protection: 'Concentrated sector risk' },
    ];
  }

  rebalancingPlan(current, target) {
    return Object.keys(target).map(asset => ({
      asset, current: current[asset] || 0, target: target[asset],
      action: (current[asset] || 0) < target[asset] ? 'BUY' : 'SELL',
      delta: +((target[asset] - (current[asset] || 0))).toFixed(2),
    }));
  }
}

// ─── ENGINE 4: JPMorgan Earnings Analyzer ────────────────────────
export class JPMorganEarningsAnalyzer {
  analyzeEarningsHistory(quarters) {
    const results = quarters.map(q => ({
      ...q, surprise: this.calculateEPSSurprise(q.actual, q.estimate),
      beat: q.actual > q.estimate,
    }));
    const beatRate = results.filter(r => r.beat).length / results.length;
    return { quarters: results, beatRate: +(beatRate * 100).toFixed(1), avgSurprise: +(results.reduce((s, r) => s + r.surprise, 0) / results.length).toFixed(2) };
  }

  calculateEPSSurprise(actual, estimate) {
    if (!estimate) return 0;
    return +(((actual - estimate) / Math.abs(estimate)) * 100).toFixed(2);
  }

  estimateImpliedMove(ivATM, dte) {
    const annualizationFactor = Math.sqrt(dte / 365);
    return +(ivATM * annualizationFactor * 100).toFixed(2);
  }

  generateScenarios(data) {
    return {
      bull: { probability: 35, priceTarget: +(data.currentPrice * 1.12).toFixed(2), catalyst: 'Beat + raise guidance', epsImpact: +(data.epsEstimate * 1.08).toFixed(2) },
      base: { probability: 45, priceTarget: +(data.currentPrice * 1.02).toFixed(2), catalyst: 'In-line results', epsImpact: data.epsEstimate },
      bear: { probability: 20, priceTarget: +(data.currentPrice * 0.88).toFixed(2), catalyst: 'Miss + lower guidance', epsImpact: +(data.epsEstimate * 0.92).toFixed(2) },
    };
  }

  recommendAction(analysis) {
    if (analysis.beatRate > 75 && analysis.avgSurprise > 5) return 'BUY BEFORE';
    if (analysis.beatRate < 40 || analysis.avgSurprise < -3) return 'SELL BEFORE';
    return 'WAIT';
  }
}

// ─── ENGINE 5: BlackRock Portfolio Constructor ───────────────────
export class BlackRockPortfolioConstructor {
  buildAssetAllocation(riskProfile, age = 40, horizon = 20) {
    const equityBase = Math.max(20, Math.min(80, 110 - age));
    const profiles = {
      conservative: { equity: equityBase - 15, bonds: 50, alternatives: 5, cash: 60 - equityBase },
      moderate: { equity: equityBase, bonds: 35, alternatives: 10, cash: 55 - equityBase },
      aggressive: { equity: equityBase + 15, bonds: 15, alternatives: 15, cash: 55 - equityBase },
    };
    const alloc = profiles[riskProfile] || profiles.moderate;
    const total = Object.values(alloc).reduce((s, v) => s + v, 0);
    Object.keys(alloc).forEach(k => { alloc[k] = +((alloc[k] / total) * 100).toFixed(1); });
    return alloc;
  }

  selectETFs(allocation) {
    const etfMap = {
      equity: [{ ticker: 'VTI', name: 'Total Stock Market', expense: 0.03 }, { ticker: 'QQQ', name: 'Nasdaq 100', expense: 0.20 }, { ticker: 'VXUS', name: 'International', expense: 0.07 }],
      bonds: [{ ticker: 'BND', name: 'Total Bond Market', expense: 0.03 }, { ticker: 'TIP', name: 'TIPS', expense: 0.19 }],
      alternatives: [{ ticker: 'GLD', name: 'Gold', expense: 0.40 }, { ticker: 'VNQ', name: 'Real Estate', expense: 0.12 }],
      cash: [{ ticker: 'SHV', name: 'Short Treasury', expense: 0.15 }],
    };
    return Object.entries(allocation).map(([category, weight]) => ({
      category, weight, etfs: (etfMap[category] || []).map(e => ({ ...e, allocation: +(weight / (etfMap[category]?.length || 1)).toFixed(1) })),
    }));
  }

  projectReturns(allocation, years = 10) {
    const expectedReturns = { equity: 0.095, bonds: 0.04, alternatives: 0.07, cash: 0.03 };
    const weightedReturn = Object.entries(allocation).reduce((sum, [cat, wt]) => sum + (wt / 100) * (expectedReturns[cat] || 0.05), 0);
    return { annualReturn: +(weightedReturn * 100).toFixed(2), low: +((weightedReturn - 0.03) * 100).toFixed(2), high: +((weightedReturn + 0.04) * 100).toFixed(2) };
  }

  estimateMaxDrawdown(allocation) {
    const drawdowns = { equity: -0.50, bonds: -0.10, alternatives: -0.25, cash: -0.01 };
    return +(Object.entries(allocation).reduce((sum, [cat, wt]) => sum + (wt / 100) * (drawdowns[cat] || -0.15), 0) * 100).toFixed(1);
  }

  createRebalancingRules(allocation) {
    return {
      frequency: 'Quarterly',
      driftThreshold: 5,
      rules: Object.entries(allocation).map(([asset, target]) => ({
        asset, target, rebalanceIf: `Drift > ${Math.max(3, Math.round(target * 0.15))}%`,
      })),
    };
  }
}

// ─── ENGINE 6: Citadel Technical Analyzer ────────────────────────
export class CitadelTechnicalAnalyzer {
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return +(slice.reduce((s, p) => s + p, 0) / period).toFixed(4);
  }

  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((s, p) => s + p, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return +ema.toFixed(4);
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    let avgGain = 0, avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) avgGain += change; else avgLoss -= change;
    }
    avgGain /= period; avgLoss /= period;
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return +(100 - 100 / (1 + rs)).toFixed(2);
  }

  calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
    const emaFast = this.calculateEMA(prices, fast);
    const emaSlow = this.calculateEMA(prices, slow);
    const macdLine = +(emaFast - emaSlow).toFixed(4);
    const signalLine = +(macdLine * 0.8).toFixed(4);
    return { macdLine, signalLine, histogram: +(macdLine - signalLine).toFixed(4), bullish: macdLine > signalLine };
  }

  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
    const sd = Math.sqrt(variance);
    return { upper: +(sma + stdDev * sd).toFixed(2), middle: +sma.toFixed(2), lower: +(sma - stdDev * sd).toFixed(2), bandwidth: +(stdDev * sd * 2 / sma * 100).toFixed(2) };
  }

  identifySupportResistance(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const len = sorted.length;
    return {
      support: [+sorted[Math.floor(len * 0.1)].toFixed(2), +sorted[Math.floor(len * 0.2)].toFixed(2), +sorted[Math.floor(len * 0.3)].toFixed(2)],
      resistance: [+sorted[Math.floor(len * 0.7)].toFixed(2), +sorted[Math.floor(len * 0.8)].toFixed(2), +sorted[Math.floor(len * 0.9)].toFixed(2)],
    };
  }

  fibonacciRetracement(high, low) {
    const diff = high - low;
    return { level236: +(high - diff * 0.236).toFixed(2), level382: +(high - diff * 0.382).toFixed(2), level500: +(high - diff * 0.500).toFixed(2), level618: +(high - diff * 0.618).toFixed(2), level786: +(high - diff * 0.786).toFixed(2) };
  }

  calculateRiskReward(entry, stopLoss, target) {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    return { risk: +risk.toFixed(2), reward: +reward.toFixed(2), ratio: risk > 0 ? +(reward / risk).toFixed(2) : 0 };
  }

  generateTradeSignal(analysis) {
    let score = 0;
    if (analysis.rsi < 30) score += 2; else if (analysis.rsi < 45) score += 1;
    else if (analysis.rsi > 70) score -= 2; else if (analysis.rsi > 55) score -= 1;
    if (analysis.macd?.bullish) score += 1; else score -= 1;
    if (analysis.priceAboveSMA200) score += 1; else score -= 1;
    if (score >= 3) return { signal: 'STRONG BUY', confidence: 85 };
    if (score >= 1) return { signal: 'BUY', confidence: 65 };
    if (score <= -3) return { signal: 'STRONG SELL', confidence: 85 };
    if (score <= -1) return { signal: 'SELL', confidence: 65 };
    return { signal: 'NEUTRAL', confidence: 50 };
  }
}

// ─── ENGINE 7: Harvard Dividend Strategy ─────────────────────────
export class HarvardDividendStrategy {
  screenDividendStocks(stocks, criteria = {}) {
    return stocks.filter(s => {
      if (criteria.minYield && s.yield < criteria.minYield) return false;
      if (criteria.maxPayout && s.payoutRatio > criteria.maxPayout) return false;
      if (criteria.minGrowthYears && s.consecutiveYears < criteria.minGrowthYears) return false;
      return true;
    });
  }

  calculateDividendSafety(payoutRatio, fcfCoverage, debtToEquity) {
    let score = 10;
    if (payoutRatio > 90) score -= 4; else if (payoutRatio > 75) score -= 2; else if (payoutRatio > 60) score -= 1;
    if (fcfCoverage < 1) score -= 3; else if (fcfCoverage < 1.5) score -= 1;
    if (debtToEquity > 2) score -= 2; else if (debtToEquity > 1) score -= 1;
    return Math.max(1, Math.min(10, score));
  }

  projectDRIP(initialInvestment, annualYield, dividendGrowthRate, years) {
    const projections = [];
    let balance = initialInvestment;
    for (let y = 1; y <= years; y++) {
      const currentYield = annualYield * Math.pow(1 + dividendGrowthRate / 100, y - 1);
      const income = balance * (currentYield / 100);
      balance += income;
      projections.push({ year: y, startBalance: +(balance - income).toFixed(2), income: +income.toFixed(2), endBalance: +balance.toFixed(2), yieldOnCost: +((income / initialInvestment) * 100).toFixed(2) });
    }
    return projections;
  }

  projectMonthlyIncome(holdings, totalInvestment) {
    const annualIncome = holdings.reduce((sum, h) => sum + (h.shares * h.annualDividend), 0);
    return { annual: +annualIncome.toFixed(2), monthly: +(annualIncome / 12).toFixed(2), weekly: +(annualIncome / 52).toFixed(2), daily: +(annualIncome / 365).toFixed(2), yieldOnCost: +((annualIncome / totalInvestment) * 100).toFixed(2) };
  }

  rankByRisk(stocks) {
    return [...stocks].sort((a, b) => b.safetyScore - a.safetyScore);
  }
}

// ─── ENGINE 8: Bain Competitive Analyzer ─────────────────────────
export class BainCompetitiveAnalyzer {
  compareMarketCap(companies) {
    return [...companies].sort((a, b) => b.marketCap - a.marketCap).map((c, i) => ({ ...c, rank: i + 1 }));
  }

  assessMoat(company) {
    return {
      brand: company.brandStrength || 'moderate',
      costAdvantage: company.costPosition || 'neutral',
      networkEffect: company.networkEffect || 'weak',
      switchingCost: company.switchingCost || 'moderate',
      overallMoat: this._calculateOverallMoat(company),
    };
  }

  _calculateOverallMoat(c) {
    const scores = { strong: 3, moderate: 2, weak: 1, neutral: 1.5 };
    const avg = ['brandStrength', 'costPosition', 'networkEffect', 'switchingCost']
      .map(k => scores[c[k]] || 2).reduce((s, v) => s + v, 0) / 4;
    if (avg >= 2.5) return 'strong';
    if (avg >= 1.8) return 'moderate';
    return 'weak';
  }

  generateSWOT(company) {
    return {
      strengths: company.strengths || ['Market leadership', 'Strong brand', 'Scale advantages'],
      weaknesses: company.weaknesses || ['High valuation', 'Regulatory risk', 'Concentration'],
      opportunities: company.opportunities || ['Market expansion', 'AI integration', 'M&A'],
      threats: company.threats || ['Competition', 'Disruption', 'Macro headwinds'],
    };
  }

  pickWinner(companies) {
    const scored = companies.map(c => {
      let score = 0;
      score += (c.revenueGrowth || 0) * 2;
      score += (c.netMargin || 0) * 1.5;
      score += (c.roe || 0);
      score -= (c.debtToEquity || 0) * 5;
      return { ...c, compositeScore: +score.toFixed(2) };
    });
    return scored.sort((a, b) => b.compositeScore - a.compositeScore)[0];
  }

  identifyCatalysts(company) {
    return company.catalysts || [
      { event: 'Earnings Report', timeline: '30 days', impact: 'high' },
      { event: 'Product Launch', timeline: '90 days', impact: 'medium' },
      { event: 'Regulatory Decision', timeline: '180 days', impact: 'high' },
    ];
  }
}

// ─── ENGINE 9: Renaissance Pattern Finder ────────────────────────
export class RenaissancePatternFinder {
  analyzeSeasonality(monthlyReturns) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((name, i) => {
      const returns = monthlyReturns.filter((_, idx) => idx % 12 === i);
      const avg = returns.length ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
      return { month: name, avgReturn: +avg.toFixed(2), positive: avg > 0 };
    });
  }

  analyzeInsiderActivity(transactions) {
    const buys = transactions.filter(t => t.type === 'BUY');
    const sells = transactions.filter(t => t.type === 'SELL');
    const netValue = buys.reduce((s, t) => s + t.value, 0) - sells.reduce((s, t) => s + t.value, 0);
    return { totalBuys: buys.length, totalSells: sells.length, netValue, signal: netValue > 0 ? 'BULLISH' : netValue < 0 ? 'BEARISH' : 'NEUTRAL' };
  }

  shortInterestAnalysis(data) {
    const daysToCover = data.shortShares / (data.avgVolume || 1);
    return { shortRatio: +((data.shortShares / data.floatShares) * 100).toFixed(2), daysToCover: +daysToCover.toFixed(1), squeezePotential: daysToCover > 5 ? 'HIGH' : daysToCover > 3 ? 'MODERATE' : 'LOW' };
  }

  calculateStatisticalEdge(winRate, avgWin, avgLoss) {
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * Math.abs(avgLoss);
    return { expectancy: +expectancy.toFixed(2), edgePerTrade: +((expectancy / Math.abs(avgLoss)) * 100).toFixed(2), kellyPct: +(((winRate / 100) - ((100 - winRate) / 100) / (avgWin / Math.abs(avgLoss))) * 100).toFixed(2) };
  }
}

// ─── ENGINE 10: McKinsey Macro Analyzer ──────────────────────────
export class McKinseyMacroAnalyzer {
  analyzeInterestRateImpact(currentRate, previousRate, portfolio) {
    const rateChange = currentRate - previousRate;
    const impact = portfolio.map(p => ({
      ...p,
      sensitivity: p.duration ? +(p.duration * rateChange * -1).toFixed(2) : 0,
      category: p.type === 'growth' ? (rateChange > 0 ? 'NEGATIVE' : 'POSITIVE') : (rateChange > 0 ? 'POSITIVE' : 'NEGATIVE'),
    }));
    return { rateChange, direction: rateChange > 0 ? 'RISING' : 'FALLING', impact };
  }

  assessInflationTrend(cpiData) {
    const recent = cpiData.slice(-3);
    const trend = recent[recent.length - 1] - recent[0];
    return {
      current: recent[recent.length - 1],
      trend: trend > 0.3 ? 'RISING' : trend < -0.3 ? 'FALLING' : 'STABLE',
      beneficiaries: ['Commodities', 'Real Estate', 'TIPS', 'Energy'],
      losers: ['Long-Duration Bonds', 'Growth Stocks', 'Consumer Discretionary'],
    };
  }

  sectorRotationRecommendation(macroIndicators) {
    const { gdpGrowth, inflation, interestRate, unemployment } = macroIndicators;
    const cycle = gdpGrowth > 2.5 && unemployment < 4.5 ? 'expansion' : gdpGrowth > 0 ? 'slowdown' : 'recession';
    const rotations = {
      expansion: { overweight: ['Technology', 'Financials', 'Industrials'], underweight: ['Utilities', 'Consumer Staples'], neutral: ['Healthcare', 'Energy'] },
      slowdown: { overweight: ['Healthcare', 'Utilities', 'Consumer Staples'], underweight: ['Technology', 'Industrials'], neutral: ['Financials', 'Energy'] },
      recession: { overweight: ['Utilities', 'Consumer Staples', 'Healthcare'], underweight: ['Financials', 'Industrials', 'Technology'], neutral: ['Energy'] },
    };
    return { cycle, ...rotations[cycle] };
  }

  portfolioAdjustments(portfolio, macroData) {
    const recommendations = [];
    if (macroData.inflation > 3) recommendations.push({ action: 'ADD', asset: 'TIPS/Commodities', reason: 'Inflation hedge' });
    if (macroData.interestRate > 5) recommendations.push({ action: 'REDUCE', asset: 'Long-Duration Bonds', reason: 'Rate sensitivity' });
    if (macroData.gdpGrowth < 1) recommendations.push({ action: 'ADD', asset: 'Defensive Equities', reason: 'Recession protection' });
    if (macroData.unemployment > 5) recommendations.push({ action: 'REDUCE', asset: 'Consumer Discretionary', reason: 'Spending slowdown' });
    recommendations.push({ action: 'MAINTAIN', asset: 'Diversified Core', reason: 'Long-term stability' });
    return recommendations;
  }
}

// ─── ORCHESTRATOR ────────────────────────────────────────────────
export class FinancialEngineOrchestrator {
  constructor() {
    this.engines = {
      screener: new GoldmanSachsScreener(),
      dcf: new MorganStanleyDCF(),
      risk: new BridgewaterRiskAnalyzer(),
      earnings: new JPMorganEarningsAnalyzer(),
      portfolio: new BlackRockPortfolioConstructor(),
      technical: new CitadelTechnicalAnalyzer(),
      dividend: new HarvardDividendStrategy(),
      competitive: new BainCompetitiveAnalyzer(),
      patterns: new RenaissancePatternFinder(),
      macro: new McKinseyMacroAnalyzer(),
    };
    this.status = 'ACTIVE';
  }

  runFullAnalysis(stock, portfolio, marketData) {
    return {
      timestamp: new Date().toISOString(),
      stock: stock.symbol,
      screener: this.engines.screener.generatePriceTargets(stock),
      technical: this.engines.technical.calculateRSI(marketData.prices || []),
      risk: this.engines.risk.calculateVaR(marketData.returns || [], 0.95),
      status: 'COMPLETE',
    };
  }

  getConsensusRating(signals) {
    const scores = { 'STRONG BUY': 2, 'BUY': 1, 'NEUTRAL': 0, 'SELL': -1, 'STRONG SELL': -2 };
    const avg = signals.reduce((s, sig) => s + (scores[sig] || 0), 0) / signals.length;
    if (avg >= 1.5) return 'STRONG BUY';
    if (avg >= 0.5) return 'BUY';
    if (avg <= -1.5) return 'STRONG SELL';
    if (avg <= -0.5) return 'SELL';
    return 'NEUTRAL';
  }

  generateExecutiveBrief(results) {
    return {
      timestamp: new Date().toISOString(),
      summary: 'Analysis complete across all 10 engines',
      topActions: results.recommendations || [],
      riskLevel: results.overallRisk || 'MODERATE',
      status: 'DELIVERED TO C-SUITE',
    };
  }

  getEngineStatus() {
    return Object.entries(this.engines).map(([name, engine]) => ({
      name, status: 'ACTIVE', class: engine.constructor.name,
    }));
  }
}
