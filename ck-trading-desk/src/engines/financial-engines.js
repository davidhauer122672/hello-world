/**
 * CK Trading Desk - 10 Enterprise-Grade Financial Analysis Engines
 * Ferrari-Standard Execution - Works 24/7/365
 */

// ============================================================
// ENGINE 1: Goldman Sachs Stock Screener
// ============================================================
export class GoldmanSachsScreener {
  screenStocks(stocks, criteria) {
    return stocks.filter(s => {
      if (criteria.maxPE && s.pe > criteria.maxPE) return false;
      if (criteria.minGrowth && s.revenueGrowth < criteria.minGrowth) return false;
      if (criteria.maxDebtToEquity && s.debtToEquity > criteria.maxDebtToEquity) return false;
      if (criteria.minYield && s.dividendYield < criteria.minYield) return false;
      return true;
    }).map(s => ({ ...s, score: this.calculateRiskRating(s) }))
      .sort((a, b) => a.score - b.score);
  }

  calculatePERatio(price, eps) {
    if (!eps || eps <= 0) return null;
    return price / eps;
  }

  analyzeRevenueGrowth(history) {
    if (!history || history.length < 2) return { cagr: 0, trend: 'insufficient data' };
    const start = history[0];
    const end = history[history.length - 1];
    const years = history.length - 1;
    const cagr = Math.pow(end / start, 1 / years) - 1;
    const trend = cagr > 0.15 ? 'accelerating' : cagr > 0.05 ? 'steady' : cagr > 0 ? 'decelerating' : 'declining';
    return { cagr, trend, startRevenue: start, endRevenue: end, periods: years };
  }

  rateMoat(metrics) {
    let score = 0;
    if (metrics.grossMargin > 0.6) score += 3;
    else if (metrics.grossMargin > 0.4) score += 2;
    else if (metrics.grossMargin > 0.2) score += 1;
    if (metrics.marketShare > 0.3) score += 3;
    else if (metrics.marketShare > 0.15) score += 2;
    else if (metrics.marketShare > 0.05) score += 1;
    if (metrics.switchingCost > 7) score += 2;
    else if (metrics.switchingCost > 4) score += 1;
    const rating = score >= 7 ? 'strong' : score >= 4 ? 'moderate' : 'weak';
    return { rating, score, maxScore: 8 };
  }

  generatePriceTargets(stock) {
    const base = stock.currentPrice;
    const pe = stock.pe || 20;
    const growth = stock.revenueGrowth || 0.1;
    return {
      bull: { price: +(base * (1 + growth * 2)).toFixed(2), probability: 0.25, scenario: 'Accelerated growth, multiple expansion' },
      base: { price: +(base * (1 + growth)).toFixed(2), probability: 0.50, scenario: 'Consensus growth maintained' },
      bear: { price: +(base * (1 - growth * 0.5)).toFixed(2), probability: 0.25, scenario: 'Growth deceleration, margin compression' },
      weightedTarget: +(base * (1 + growth * 2) * 0.25 + base * (1 + growth) * 0.50 + base * (1 - growth * 0.5) * 0.25).toFixed(2),
    };
  }

  calculateRiskRating(metrics) {
    let risk = 5;
    if (metrics.pe > 40) risk += 2;
    else if (metrics.pe > 25) risk += 1;
    else if (metrics.pe < 10) risk -= 1;
    if (metrics.debtToEquity > 2) risk += 2;
    else if (metrics.debtToEquity > 1) risk += 1;
    if (metrics.beta > 1.5) risk += 1;
    else if (metrics.beta < 0.8) risk -= 1;
    return Math.max(1, Math.min(10, Math.round(risk)));
  }
}


// ============================================================
// ENGINE 2: Morgan Stanley DCF
// ============================================================
export class MorganStanleyDCF {
  projectRevenue(currentRevenue, growthRates, years) {
    const projections = [];
    let revenue = currentRevenue;
    for (let i = 0; i < years; i++) {
      const rate = Array.isArray(growthRates) ? (growthRates[i] || growthRates[growthRates.length - 1]) : growthRates;
      revenue *= (1 + rate);
      projections.push({ year: i + 1, revenue: +revenue.toFixed(2), growthRate: rate });
    }
    return projections;
  }

  calculateFreeCashFlow(revenue, operatingMargin, capexPercent, taxRate) {
    const operatingIncome = revenue * operatingMargin;
    const taxes = operatingIncome * taxRate;
    const nopat = operatingIncome - taxes;
    const capex = revenue * capexPercent;
    const fcf = nopat - capex;
    return { revenue, operatingIncome, taxes, nopat, capex, fcf: +fcf.toFixed(2) };
  }

  calculateWACC(equityCost, debtCost, equityWeight, debtWeight, taxRate) {
    const wacc = equityCost * equityWeight + debtCost * (1 - taxRate) * debtWeight;
    return +wacc.toFixed(6);
  }

  calculateTerminalValue(lastFCF, perpetualGrowth, wacc) {
    if (wacc <= perpetualGrowth) return null;
    return +(lastFCF * (1 + perpetualGrowth) / (wacc - perpetualGrowth)).toFixed(2);
  }

  buildDCFModel(inputs) {
    const { currentRevenue, growthRates, years, operatingMargin, capexPercent, taxRate,
            equityCost, debtCost, equityWeight, debtWeight, perpetualGrowth, sharesOutstanding, netDebt } = inputs;
    const wacc = this.calculateWACC(equityCost, debtCost, equityWeight, debtWeight, taxRate);
    const revenueProjections = this.projectRevenue(currentRevenue, growthRates, years);
    const fcfProjections = revenueProjections.map(p => ({
      ...p,
      ...this.calculateFreeCashFlow(p.revenue, operatingMargin, capexPercent, taxRate),
    }));
    const lastFCF = fcfProjections[fcfProjections.length - 1].fcf;
    const terminalValue = this.calculateTerminalValue(lastFCF, perpetualGrowth, wacc);
    let pvFCFs = 0;
    fcfProjections.forEach((p, i) => {
      const pv = p.fcf / Math.pow(1 + wacc, i + 1);
      p.presentValue = +pv.toFixed(2);
      pvFCFs += pv;
    });
    const pvTerminal = terminalValue / Math.pow(1 + wacc, years);
    const enterpriseValue = pvFCFs + pvTerminal;
    const equityValue = enterpriseValue - (netDebt || 0);
    const pricePerShare = equityValue / sharesOutstanding;
    return {
      wacc, fcfProjections, terminalValue, pvTerminal: +pvTerminal.toFixed(2),
      pvFCFs: +pvFCFs.toFixed(2), enterpriseValue: +enterpriseValue.toFixed(2),
      equityValue: +equityValue.toFixed(2), pricePerShare: +pricePerShare.toFixed(2),
    };
  }

  sensitivityAnalysis(baseInputs, waccRange, growthRange) {
    const matrix = [];
    for (const w of waccRange) {
      const row = { wacc: w, values: [] };
      for (const g of growthRange) {
        const inputs = { ...baseInputs, equityCost: w, perpetualGrowth: g };
        const model = this.buildDCFModel(inputs);
        row.values.push({ growth: g, pricePerShare: model.pricePerShare });
      }
      matrix.push(row);
    }
    return matrix;
  }

  getValuationVerdict(intrinsicValue, marketPrice) {
    const upside = (intrinsicValue - marketPrice) / marketPrice;
    let verdict, recommendation;
    if (upside > 0.25) { verdict = 'SIGNIFICANTLY UNDERVALUED'; recommendation = 'STRONG BUY'; }
    else if (upside > 0.10) { verdict = 'UNDERVALUED'; recommendation = 'BUY'; }
    else if (upside > -0.10) { verdict = 'FAIRLY VALUED'; recommendation = 'HOLD'; }
    else if (upside > -0.25) { verdict = 'OVERVALUED'; recommendation = 'SELL'; }
    else { verdict = 'SIGNIFICANTLY OVERVALUED'; recommendation = 'STRONG SELL'; }
    return { intrinsicValue, marketPrice, upside: +(upside * 100).toFixed(2), verdict, recommendation };
  }
}


// ============================================================
// ENGINE 3: Bridgewater Risk Analyzer
// ============================================================
export class BridgewaterRiskAnalyzer {
  calculateCorrelation(a, b) {
    if (a.length !== b.length || a.length < 2) return null;
    const n = a.length;
    const meanA = a.reduce((s, v) => s + v, 0) / n;
    const meanB = b.reduce((s, v) => s + v, 0) / n;
    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA;
      const db = b[i] - meanB;
      num += da * db;
      denA += da * da;
      denB += db * db;
    }
    const den = Math.sqrt(denA * denB);
    return den === 0 ? 0 : +(num / den).toFixed(4);
  }

  analyzeSectorConcentration(portfolio) {
    const total = portfolio.reduce((s, p) => s + p.value, 0);
    const sectors = {};
    portfolio.forEach(p => {
      sectors[p.sector] = (sectors[p.sector] || 0) + p.value;
    });
    const weights = Object.entries(sectors).map(([sector, value]) => ({
      sector, value, weight: +(value / total * 100).toFixed(2),
    }));
    const hhi = weights.reduce((s, w) => s + Math.pow(w.weight / 100, 2), 0);
    const concentration = hhi > 0.25 ? 'HIGH' : hhi > 0.15 ? 'MODERATE' : 'LOW';
    return { sectors: weights.sort((a, b) => b.weight - a.weight), hhi: +hhi.toFixed(4), concentration };
  }

  stressTestRecession(portfolio, scenario) {
    const shocks = {
      '2008': { equity: -0.38, bonds: 0.05, realestate: -0.27, commodities: -0.36, cash: 0.02 },
      'covid': { equity: -0.25, bonds: 0.08, realestate: -0.15, commodities: -0.20, cash: 0.01 },
      'dotcom': { equity: -0.45, bonds: 0.12, realestate: -0.05, commodities: -0.10, cash: 0.03 },
      'stagflation': { equity: -0.20, bonds: -0.15, realestate: -0.10, commodities: 0.25, cash: -0.03 },
    };
    const shock = shocks[scenario] || shocks['2008'];
    const total = portfolio.reduce((s, p) => s + p.value, 0);
    let impactTotal = 0;
    const impacts = portfolio.map(p => {
      const assetClass = (p.assetClass || 'equity').toLowerCase();
      const drawdown = shock[assetClass] || shock.equity;
      const impact = p.value * drawdown;
      impactTotal += impact;
      return { ...p, drawdown, impact: +impact.toFixed(2), postValue: +(p.value + impact).toFixed(2) };
    });
    return {
      scenario, totalBefore: total, totalAfter: +(total + impactTotal).toFixed(2),
      drawdownPercent: +((impactTotal / total) * 100).toFixed(2), impacts,
    };
  }

  calculateVaR(returns, confidence = 0.95) {
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    const var95 = sorted[index];
    const cvar = sorted.slice(0, index + 1).reduce((s, v) => s + v, 0) / (index + 1);
    const mean = returns.reduce((s, v) => s + v, 0) / returns.length;
    const std = Math.sqrt(returns.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / returns.length);
    return {
      var: +(var95 * 100).toFixed(2),
      cvar: +(cvar * 100).toFixed(2),
      confidence,
      mean: +(mean * 100).toFixed(4),
      volatility: +(std * 100).toFixed(4),
      sharpe: std > 0 ? +((mean - 0.0001) / std).toFixed(4) : 0,
    };
  }

  suggestHedges(portfolio) {
    const equityWeight = portfolio.filter(p => (p.assetClass || 'equity') === 'equity')
      .reduce((s, p) => s + p.value, 0) / portfolio.reduce((s, p) => s + p.value, 0);
    const hedges = [];
    if (equityWeight > 0.6) hedges.push({ strategy: 'Put options on SPY', cost: 'Low', protection: 'High', description: 'Buy 5% OTM puts covering 50% of equity exposure' });
    hedges.push({ strategy: 'Long-duration Treasuries (TLT)', cost: 'None', protection: 'Moderate', description: 'Allocate 10-15% to 20+ year treasuries for flight-to-safety hedge' });
    hedges.push({ strategy: 'Gold allocation (GLD)', cost: 'None', protection: 'Moderate', description: 'Allocate 5-10% to gold as inflation and tail-risk hedge' });
    return { currentEquityWeight: +(equityWeight * 100).toFixed(1), hedges: hedges.slice(0, 3) };
  }

  rebalancingPlan(currentAllocation, targetAllocation) {
    const totalValue = currentAllocation.reduce((s, p) => s + p.value, 0);
    const changes = [];
    for (const target of targetAllocation) {
      const current = currentAllocation.find(c => c.asset === target.asset);
      const currentValue = current ? current.value : 0;
      const targetValue = totalValue * target.weight;
      const diff = targetValue - currentValue;
      if (Math.abs(diff) > totalValue * 0.01) {
        changes.push({
          asset: target.asset, currentValue: +currentValue.toFixed(2),
          targetValue: +targetValue.toFixed(2), action: diff > 0 ? 'BUY' : 'SELL',
          amount: +Math.abs(diff).toFixed(2),
        });
      }
    }
    return { totalValue, changes: changes.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)) };
  }
}


// ============================================================
// ENGINE 4: JPMorgan Earnings Analyzer
// ============================================================
export class JPMorganEarningsAnalyzer {
  analyzeEarningsHistory(quarters) {
    const beats = quarters.filter(q => q.actualEPS > q.estimateEPS).length;
    const misses = quarters.filter(q => q.actualEPS < q.estimateEPS).length;
    const meets = quarters.length - beats - misses;
    const avgSurprise = quarters.reduce((s, q) => s + this.calculateEPSSurprise(q.actualEPS, q.estimateEPS), 0) / quarters.length;
    return {
      totalQuarters: quarters.length, beats, misses, meets,
      beatRate: +((beats / quarters.length) * 100).toFixed(1),
      avgSurprise: +avgSurprise.toFixed(2),
      trend: beats >= quarters.length * 0.75 ? 'CONSISTENTLY BEATING' : beats >= quarters.length * 0.5 ? 'MIXED' : 'CONSISTENTLY MISSING',
      history: quarters.map(q => ({ ...q, surprise: +this.calculateEPSSurprise(q.actualEPS, q.estimateEPS).toFixed(2) })),
    };
  }

  calculateEPSSurprise(actualEPS, estimateEPS) {
    if (!estimateEPS) return 0;
    return ((actualEPS - estimateEPS) / Math.abs(estimateEPS)) * 100;
  }

  estimateImpliedMove(impliedVolatility, daysToExpiry) {
    const annualizationFactor = Math.sqrt(daysToExpiry / 365);
    const impliedMove = impliedVolatility * annualizationFactor;
    return {
      impliedMovePercent: +(impliedMove * 100).toFixed(2),
      impliedVolatility: +(impliedVolatility * 100).toFixed(2),
      daysToExpiry,
      straddleApprox: +(impliedMove * 100).toFixed(2),
    };
  }

  generateScenarios(data) {
    const { currentPrice, estimateEPS, historicalBeatRate, impliedMove } = data;
    const moveUp = currentPrice * (impliedMove / 100);
    const moveDown = currentPrice * (impliedMove / 100);
    return {
      bull: {
        scenario: 'EPS beat + raised guidance',
        probability: +(historicalBeatRate * 0.6).toFixed(1),
        targetPrice: +(currentPrice + moveUp * 1.5).toFixed(2),
        epsEstimate: +(estimateEPS * 1.08).toFixed(2),
      },
      base: {
        scenario: 'Inline results, maintained guidance',
        probability: +(100 - historicalBeatRate * 0.6 - (100 - historicalBeatRate) * 0.6).toFixed(1),
        targetPrice: +currentPrice.toFixed(2),
        epsEstimate: +estimateEPS.toFixed(2),
      },
      bear: {
        scenario: 'EPS miss + lowered guidance',
        probability: +((100 - historicalBeatRate) * 0.6).toFixed(1),
        targetPrice: +(currentPrice - moveDown * 1.5).toFixed(2),
        epsEstimate: +(estimateEPS * 0.92).toFixed(2),
      },
    };
  }

  recommendAction(analysis) {
    const { beatRate, avgSurprise, trend } = analysis;
    if (beatRate > 80 && avgSurprise > 5) return { action: 'BUY', confidence: 'HIGH', rationale: 'Consistent beats with strong surprise magnitude' };
    if (beatRate > 60 && avgSurprise > 0) return { action: 'BUY', confidence: 'MODERATE', rationale: 'Above-average beat rate with positive surprises' };
    if (beatRate >= 40 && beatRate <= 60) return { action: 'WAIT', confidence: 'LOW', rationale: 'Mixed track record, wait for more clarity' };
    return { action: 'SELL', confidence: 'MODERATE', rationale: 'Below-average beat rate indicates execution risk' };
  }
}

// ============================================================
// ENGINE 5: BlackRock Portfolio Constructor
// ============================================================
export class BlackRockPortfolioConstructor {
  buildAssetAllocation(riskTolerance, age, horizon) {
    const equityBase = Math.max(20, Math.min(90, 110 - age));
    let riskMultiplier;
    if (riskTolerance === 'aggressive') riskMultiplier = 1.2;
    else if (riskTolerance === 'moderate') riskMultiplier = 1.0;
    else riskMultiplier = 0.7;
    const horizonBoost = horizon > 20 ? 10 : horizon > 10 ? 5 : 0;
    let equity = Math.min(95, Math.round((equityBase + horizonBoost) * riskMultiplier));
    let bonds = Math.round((100 - equity) * 0.7);
    let alternatives = Math.round((100 - equity) * 0.2);
    let cash = 100 - equity - bonds - alternatives;
    return {
      equity: { weight: equity, breakdown: { usLargeCap: Math.round(equity * 0.45), usSmallCap: Math.round(equity * 0.15), international: Math.round(equity * 0.25), emerging: Math.round(equity * 0.15) } },
      bonds: { weight: bonds, breakdown: { usAggregate: Math.round(bonds * 0.5), tips: Math.round(bonds * 0.2), international: Math.round(bonds * 0.15), highYield: Math.round(bonds * 0.15) } },
      alternatives: { weight: alternatives, breakdown: { reits: Math.round(alternatives * 0.4), commodities: Math.round(alternatives * 0.3), gold: Math.round(alternatives * 0.3) } },
      cash: { weight: cash },
      riskProfile: riskTolerance, investorAge: age, timeHorizon: horizon,
    };
  }

  selectETFs(allocation) {
    const etfMap = {
      usLargeCap: { ticker: 'VOO', name: 'Vanguard S&P 500', expense: 0.03 },
      usSmallCap: { ticker: 'VB', name: 'Vanguard Small-Cap', expense: 0.05 },
      international: { ticker: 'VXUS', name: 'Vanguard Total International', expense: 0.07 },
      emerging: { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets', expense: 0.08 },
      usAggregate: { ticker: 'BND', name: 'Vanguard Total Bond Market', expense: 0.03 },
      tips: { ticker: 'VTIP', name: 'Vanguard Short-Term TIPS', expense: 0.04 },
      highYield: { ticker: 'HYG', name: 'iShares High Yield Corporate Bond', expense: 0.49 },
      reits: { ticker: 'VNQ', name: 'Vanguard Real Estate', expense: 0.12 },
      commodities: { ticker: 'DJP', name: 'iPath Bloomberg Commodity', expense: 0.70 },
      gold: { ticker: 'GLD', name: 'SPDR Gold Shares', expense: 0.40 },
    };
    const picks = [];
    for (const [category, alloc] of Object.entries(allocation)) {
      if (alloc.breakdown) {
        for (const [sub, weight] of Object.entries(alloc.breakdown)) {
          if (etfMap[sub]) picks.push({ ...etfMap[sub], category, subCategory: sub, weight });
        }
      }
    }
    return picks;
  }

  projectReturns(allocation, years) {
    const expectedReturns = { equity: 0.10, bonds: 0.04, alternatives: 0.07, cash: 0.03 };
    const volatility = { equity: 0.16, bonds: 0.05, alternatives: 0.12, cash: 0.01 };
    let portfolioReturn = 0, portfolioVol = 0;
    for (const [asset, data] of Object.entries(allocation)) {
      const w = (data.weight || 0) / 100;
      portfolioReturn += w * (expectedReturns[asset] || 0.05);
      portfolioVol += Math.pow(w * (volatility[asset] || 0.10), 2);
    }
    portfolioVol = Math.sqrt(portfolioVol);
    const projections = [];
    for (let y = 1; y <= years; y++) {
      projections.push({
        year: y,
        expected: +Math.pow(1 + portfolioReturn, y).toFixed(4),
        optimistic: +Math.pow(1 + portfolioReturn + portfolioVol, y).toFixed(4),
        pessimistic: +Math.pow(1 + portfolioReturn - portfolioVol, y).toFixed(4),
      });
    }
    return { annualReturn: +(portfolioReturn * 100).toFixed(2), annualVol: +(portfolioVol * 100).toFixed(2), projections };
  }

  estimateMaxDrawdown(allocation) {
    const drawdowns = { equity: -0.50, bonds: -0.10, alternatives: -0.30, cash: -0.01 };
    let maxDD = 0;
    for (const [asset, data] of Object.entries(allocation)) {
      maxDD += ((data.weight || 0) / 100) * (drawdowns[asset] || -0.20);
    }
    return { maxDrawdown: +(maxDD * 100).toFixed(2), recoveryEstimate: Math.round(Math.abs(maxDD) * 60) + ' months' };
  }

  createRebalancingRules(allocation) {
    return {
      thresholdBased: { trigger: '5% drift from target', frequency: 'Check monthly' },
      calendarBased: { frequency: 'Quarterly', nextDate: 'End of quarter' },
      taxEfficient: { strategy: 'Use new contributions to rebalance before selling', taxLossHarvest: true },
      bands: Object.entries(allocation).filter(([, d]) => d.weight).map(([asset, data]) => ({
        asset, target: data.weight, min: Math.max(0, data.weight - 5), max: Math.min(100, data.weight + 5),
      })),
    };
  }
}


// ============================================================
// ENGINE 6: Citadel Technical Analyzer
// ============================================================
export class CitadelTechnicalAnalyzer {
  calculateSMA(prices, period) {
    if (prices.length < period) return [];
    const result = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0);
      result.push(+(sum / period).toFixed(4));
    }
    return result;
  }

  calculateEMA(prices, period) {
    if (prices.length < period) return [];
    const multiplier = 2 / (period + 1);
    const sma = prices.slice(0, period).reduce((s, v) => s + v, 0) / period;
    const result = [sma];
    for (let i = period; i < prices.length; i++) {
      const ema = (prices[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
      result.push(+ema.toFixed(4));
    }
    return result;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    const changes = [];
    for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;
    const rsiValues = [];
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push(+(100 - 100 / (1 + rs)).toFixed(2));
    for (let i = period; i < changes.length; i++) {
      const gain = changes[i] > 0 ? changes[i] : 0;
      const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs2 = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiValues.push(+(100 - 100 / (1 + rs2)).toFixed(2));
    }
    return rsiValues;
  }

  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const offset = slowPeriod - fastPeriod;
    const macdLine = [];
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(+(fastEMA[i + offset] - slowEMA[i]).toFixed(4));
    }
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histOffset = signalPeriod - 1;
    const histogram = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(+(macdLine[i + histOffset] - signalLine[i]).toFixed(4));
    }
    return {
      macd: macdLine[macdLine.length - 1],
      signal: signalLine[signalLine.length - 1],
      histogram: histogram[histogram.length - 1],
      macdLine, signalLine, histogram,
    };
  }

  calculateBollingerBands(prices, period = 20, stdMultiplier = 2) {
    const sma = this.calculateSMA(prices, period);
    const bands = [];
    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = sma[i];
      const std = Math.sqrt(slice.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / period);
      bands.push({
        upper: +(mean + stdMultiplier * std).toFixed(4),
        middle: +mean.toFixed(4),
        lower: +(mean - stdMultiplier * std).toFixed(4),
        bandwidth: +((stdMultiplier * 2 * std) / mean * 100).toFixed(4),
      });
    }
    return bands;
  }

  identifySupportResistance(prices) {
    const pivotHigh = prices[prices.length - 1];
    const pivotLow = Math.min(...prices.slice(-20));
    const pp = (pivotHigh + pivotLow + prices[prices.length - 1]) / 3;
    return {
      pivot: +pp.toFixed(2),
      resistance1: +(2 * pp - pivotLow).toFixed(2),
      resistance2: +(pp + (pivotHigh - pivotLow)).toFixed(2),
      support1: +(2 * pp - pivotHigh).toFixed(2),
      support2: +(pp - (pivotHigh - pivotLow)).toFixed(2),
      recentHigh: +pivotHigh.toFixed(2),
      recentLow: +pivotLow.toFixed(2),
    };
  }

  fibonacciRetracement(high, low) {
    const diff = high - low;
    return {
      level0: +high.toFixed(2),
      level236: +(high - diff * 0.236).toFixed(2),
      level382: +(high - diff * 0.382).toFixed(2),
      level500: +(high - diff * 0.500).toFixed(2),
      level618: +(high - diff * 0.618).toFixed(2),
      level786: +(high - diff * 0.786).toFixed(2),
      level1: +low.toFixed(2),
    };
  }

  generateTradeSignal(analysis) {
    let score = 0;
    if (analysis.rsi < 30) score += 2;
    else if (analysis.rsi < 40) score += 1;
    else if (analysis.rsi > 70) score -= 2;
    else if (analysis.rsi > 60) score -= 1;
    if (analysis.macdHistogram > 0) score += 1;
    else score -= 1;
    if (analysis.priceVsSMA > 0) score += 1;
    else score -= 1;
    if (analysis.bollingerPosition === 'below_lower') score += 2;
    else if (analysis.bollingerPosition === 'above_upper') score -= 2;
    const signals = ['STRONG SELL', 'SELL', 'WEAK SELL', 'NEUTRAL', 'WEAK BUY', 'BUY', 'STRONG BUY'];
    const idx = Math.max(0, Math.min(6, Math.round(score + 3)));
    return { signal: signals[idx], score, confidence: Math.min(100, Math.abs(score) * 20) };
  }
}


// ============================================================
// ENGINE 7: Harvard Dividend Strategy
// ============================================================
export class HarvardDividendStrategy {
  screenDividendStocks(stocks, criteria = {}) {
    const minYield = criteria.minYield || 2.0;
    const maxPayout = criteria.maxPayout || 75;
    const minGrowthYears = criteria.minGrowthYears || 5;
    return stocks.filter(s =>
      s.dividendYield >= minYield &&
      s.payoutRatio <= maxPayout &&
      s.consecutiveGrowthYears >= minGrowthYears
    ).sort((a, b) => b.dividendYield - a.dividendYield)
     .map(s => ({ ...s, safetyScore: this.calculateDividendSafety(s.payoutRatio, s.fcfYield, s.debtToEquity) }));
  }

  calculateDividendSafety(payoutRatio, fcfYield, debtToEquity) {
    let score = 10;
    if (payoutRatio > 90) score -= 4;
    else if (payoutRatio > 75) score -= 3;
    else if (payoutRatio > 60) score -= 2;
    else if (payoutRatio > 40) score -= 1;
    if (fcfYield < 2) score -= 2;
    else if (fcfYield < 4) score -= 1;
    else if (fcfYield > 8) score += 1;
    if (debtToEquity > 2) score -= 2;
    else if (debtToEquity > 1) score -= 1;
    const rating = score >= 8 ? 'VERY SAFE' : score >= 6 ? 'SAFE' : score >= 4 ? 'MODERATE' : 'UNSAFE';
    return { score: Math.max(1, Math.min(10, score)), rating };
  }

  projectDRIP(initialInvestment, dividendYield, dividendGrowthRate, years) {
    const projections = [];
    let shares = 1000;
    let sharePrice = initialInvestment / shares;
    let totalDividends = 0;
    let currentYield = dividendYield / 100;
    for (let y = 1; y <= years; y++) {
      const annualDividend = sharePrice * shares * currentYield;
      totalDividends += annualDividend;
      sharePrice *= 1.07;
      const newShares = annualDividend / sharePrice;
      shares += newShares;
      currentYield *= (1 + dividendGrowthRate / 100);
      projections.push({
        year: y, shares: +shares.toFixed(2), sharePrice: +sharePrice.toFixed(2),
        annualDividend: +annualDividend.toFixed(2), portfolioValue: +(shares * sharePrice).toFixed(2),
        totalDividends: +totalDividends.toFixed(2), yieldOnCost: +((annualDividend / initialInvestment) * 100).toFixed(2),
      });
    }
    return { initialInvestment, finalValue: projections[projections.length - 1].portfolioValue, totalReturn: +((projections[projections.length - 1].portfolioValue / initialInvestment - 1) * 100).toFixed(2), projections };
  }

  projectMonthlyIncome(portfolio, investmentAmount) {
    const totalYield = portfolio.reduce((s, p) => s + p.weight * p.dividendYield, 0) / portfolio.reduce((s, p) => s + p.weight, 0);
    const annualIncome = investmentAmount * (totalYield / 100);
    const monthlyIncome = annualIncome / 12;
    const byHolding = portfolio.map(p => ({
      ticker: p.ticker, weight: p.weight, allocation: +(investmentAmount * p.weight / 100).toFixed(2),
      annualDividend: +(investmentAmount * p.weight / 100 * p.dividendYield / 100).toFixed(2),
      monthlyDividend: +(investmentAmount * p.weight / 100 * p.dividendYield / 100 / 12).toFixed(2),
      frequency: p.frequency || 'quarterly',
    }));
    return { totalYield: +totalYield.toFixed(2), annualIncome: +annualIncome.toFixed(2), monthlyIncome: +monthlyIncome.toFixed(2), byHolding };
  }
}

// ============================================================
// ENGINE 8: Bain Competitive Analyzer
// ============================================================
export class BainCompetitiveAnalyzer {
  compareMarketCap(companies) {
    const sorted = [...companies].sort((a, b) => b.marketCap - a.marketCap);
    const total = sorted.reduce((s, c) => s + c.marketCap, 0);
    return sorted.map((c, i) => ({
      rank: i + 1, ...c, marketShare: +((c.marketCap / total) * 100).toFixed(2),
    }));
  }

  assessMoat(company) {
    const moatSources = [];
    if (company.brandValue > 50) moatSources.push({ type: 'Brand', strength: 'STRONG', detail: 'Top-tier brand recognition and pricing power' });
    else if (company.brandValue > 25) moatSources.push({ type: 'Brand', strength: 'MODERATE', detail: 'Recognized brand with some pricing power' });
    if (company.switchingCost > 7) moatSources.push({ type: 'Switching Costs', strength: 'STRONG', detail: 'High customer lock-in through ecosystem/integration' });
    else if (company.switchingCost > 4) moatSources.push({ type: 'Switching Costs', strength: 'MODERATE', detail: 'Moderate friction to switch competitors' });
    if (company.networkEffect > 7) moatSources.push({ type: 'Network Effects', strength: 'STRONG', detail: 'Value increases with user base growth' });
    if (company.costAdvantage > 7) moatSources.push({ type: 'Cost Advantage', strength: 'STRONG', detail: 'Structural cost advantage through scale/technology' });
    const overallMoat = moatSources.filter(m => m.strength === 'STRONG').length >= 2 ? 'WIDE' : moatSources.length >= 2 ? 'NARROW' : 'NONE';
    return { company: company.name, overallMoat, sources: moatSources, durability: overallMoat === 'WIDE' ? '10+ years' : overallMoat === 'NARROW' ? '5-10 years' : '< 5 years' };
  }

  generateSWOT(company) {
    return {
      company: company.name,
      strengths: company.strengths || ['Market leadership', 'Strong brand', 'Innovation pipeline'],
      weaknesses: company.weaknesses || ['High valuation', 'Regulatory risk', 'Geographic concentration'],
      opportunities: company.opportunities || ['Market expansion', 'AI integration', 'M&A targets'],
      threats: company.threats || ['New entrants', 'Regulatory changes', 'Macro headwinds'],
    };
  }

  pickWinner(companies) {
    const scored = companies.map(c => {
      let score = 0;
      score += (c.revenueGrowth || 0) * 2;
      score += (c.profitMargin || 0) * 1.5;
      score += (c.moatScore || 0) * 3;
      score -= (c.debtToEquity || 0) * 1;
      score += (c.roic || 0) * 2;
      return { ...c, compositeScore: +score.toFixed(2) };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
    return {
      winner: scored[0],
      runnerUp: scored[1] || null,
      rankings: scored,
      rationale: `${scored[0].name} leads with a composite score of ${scored[0].compositeScore}, driven by superior growth metrics and competitive positioning.`,
    };
  }
}

// ============================================================
// ENGINE 9: Renaissance Pattern Finder
// ============================================================
export class RenaissancePatternFinder {
  analyzeSeasonality(monthlyData) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const avgByMonth = months.map((month, i) => {
      const dataForMonth = monthlyData.filter(d => d.month === i + 1);
      const avg = dataForMonth.length > 0 ? dataForMonth.reduce((s, d) => s + d.return, 0) / dataForMonth.length : 0;
      const winRate = dataForMonth.length > 0 ? (dataForMonth.filter(d => d.return > 0).length / dataForMonth.length) * 100 : 0;
      return { month, avgReturn: +avg.toFixed(2), winRate: +winRate.toFixed(1), sampleSize: dataForMonth.length };
    });
    const sorted = [...avgByMonth].sort((a, b) => b.avgReturn - a.avgReturn);
    return { monthly: avgByMonth, bestMonths: sorted.slice(0, 3), worstMonths: sorted.slice(-3).reverse() };
  }

  analyzeInsiderActivity(filings) {
    const buys = filings.filter(f => f.type === 'BUY');
    const sells = filings.filter(f => f.type === 'SELL');
    const buyValue = buys.reduce((s, f) => s + f.value, 0);
    const sellValue = sells.reduce((s, f) => s + f.value, 0);
    const ratio = sellValue > 0 ? buyValue / sellValue : buyValue > 0 ? 999 : 0;
    let signal;
    if (ratio > 2) signal = 'STRONG BULLISH';
    else if (ratio > 1) signal = 'BULLISH';
    else if (ratio > 0.5) signal = 'NEUTRAL';
    else signal = 'BEARISH';
    return {
      totalBuys: buys.length, totalSells: sells.length,
      buyValue: +buyValue.toFixed(2), sellValue: +sellValue.toFixed(2),
      buyToSellRatio: +ratio.toFixed(2), signal,
      recentFilings: filings.slice(0, 5),
    };
  }

  shortInterestAnalysis(data) {
    const { shortInterest, avgVolume, floatShares, daysToCover } = data;
    const siPercent = (shortInterest / floatShares) * 100;
    const dtc = daysToCover || shortInterest / avgVolume;
    let squeezePotential;
    if (siPercent > 20 && dtc > 5) squeezePotential = 'HIGH';
    else if (siPercent > 10 && dtc > 3) squeezePotential = 'MODERATE';
    else squeezePotential = 'LOW';
    return {
      shortInterest, shortInterestPercent: +siPercent.toFixed(2),
      daysToCover: +dtc.toFixed(1), squeezePotential,
      signal: squeezePotential === 'HIGH' ? 'Potential short squeeze setup' : 'No squeeze signal',
    };
  }

  calculateStatisticalEdge(patterns) {
    return patterns.map(p => {
      const ev = (p.winRate / 100) * p.avgWin - ((100 - p.winRate) / 100) * p.avgLoss;
      const kellyPct = ((p.winRate / 100) * (p.avgWin / p.avgLoss) - (1 - p.winRate / 100)) / (p.avgWin / p.avgLoss);
      return {
        pattern: p.name, winRate: p.winRate, avgWin: p.avgWin, avgLoss: p.avgLoss,
        expectedValue: +ev.toFixed(2), kellyFraction: +Math.max(0, kellyPct * 100).toFixed(2),
        edge: ev > 0 ? 'POSITIVE' : 'NEGATIVE',
      };
    });
  }
}

// ============================================================
// ENGINE 10: McKinsey Macro Analyzer
// ============================================================
export class McKinseyMacroAnalyzer {
  analyzeInterestRateImpact(rates, portfolio) {
    const { currentRate, expectedRate, direction } = rates;
    const rateChange = expectedRate - currentRate;
    const impacts = portfolio.map(p => {
      let sensitivity;
      const asset = (p.assetClass || p.sector || '').toLowerCase();
      if (['technology', 'growth'].includes(asset)) sensitivity = -2.5;
      else if (['financials', 'banks'].includes(asset)) sensitivity = 1.5;
      else if (['utilities', 'reits'].includes(asset)) sensitivity = -2.0;
      else if (['bonds', 'fixed income'].includes(asset)) sensitivity = -3.0;
      else sensitivity = -0.5;
      const impact = rateChange * sensitivity;
      return { ...p, sensitivity, estimatedImpact: +(impact).toFixed(2) };
    });
    return {
      currentRate, expectedRate, rateChange: +rateChange.toFixed(2),
      direction, favoredStyle: rateChange > 0 ? 'VALUE' : 'GROWTH',
      impacts,
    };
  }

  assessInflationTrend(cpiReadings) {
    if (cpiReadings.length < 2) return { trend: 'INSUFFICIENT DATA' };
    const recent = cpiReadings.slice(-3);
    const avgRecent = recent.reduce((s, v) => s + v, 0) / recent.length;
    const prior = cpiReadings.slice(-6, -3);
    const avgPrior = prior.length > 0 ? prior.reduce((s, v) => s + v, 0) / prior.length : avgRecent;
    let trend;
    if (avgRecent > avgPrior + 0.3) trend = 'RISING';
    else if (avgRecent < avgPrior - 0.3) trend = 'FALLING';
    else trend = 'STABLE';
    const beneficiaries = trend === 'RISING'
      ? ['Commodities', 'TIPS', 'Real Estate', 'Energy']
      : trend === 'FALLING'
      ? ['Growth Stocks', 'Long-Duration Bonds', 'Technology']
      : ['Balanced Portfolio', 'Dividend Stocks'];
    return { currentCPI: cpiReadings[cpiReadings.length - 1], avgRecent: +avgRecent.toFixed(2), avgPrior: +avgPrior.toFixed(2), trend, beneficiaries };
  }

  sectorRotationRecommendation(macroData) {
    const { gdpGrowth, inflation, interestRates, phase } = macroData;
    const rotations = {
      expansion: { overweight: ['Technology', 'Consumer Discretionary', 'Industrials'], underweight: ['Utilities', 'Consumer Staples', 'Healthcare'] },
      peak: { overweight: ['Energy', 'Materials', 'Financials'], underweight: ['Technology', 'Consumer Discretionary'] },
      contraction: { overweight: ['Healthcare', 'Consumer Staples', 'Utilities'], underweight: ['Financials', 'Industrials', 'Materials'] },
      trough: { overweight: ['Financials', 'Real Estate', 'Consumer Discretionary'], underweight: ['Energy', 'Utilities'] },
    };
    const recommendation = rotations[phase] || rotations.expansion;
    return { phase, gdpGrowth, inflation, interestRates, ...recommendation };
  }

  portfolioAdjustments(portfolio, macroData) {
    const rotation = this.sectorRotationRecommendation(macroData);
    const adjustments = portfolio.map(p => {
      const sector = p.sector || p.name;
      let action = 'HOLD';
      let reason = 'Neutral in current cycle';
      if (rotation.overweight.includes(sector)) { action = 'INCREASE'; reason = `Favored in ${rotation.phase} phase`; }
      if (rotation.underweight.includes(sector)) { action = 'DECREASE'; reason = `Unfavored in ${rotation.phase} phase`; }
      return { ...p, action, reason };
    });
    return { phase: rotation.phase, adjustments, summary: `${rotation.phase.toUpperCase()} phase: Overweight ${rotation.overweight.join(', ')}. Underweight ${rotation.underweight.join(', ')}.` };
  }
}

// ============================================================
// ORCHESTRATOR
// ============================================================
export class FinancialEngineOrchestrator {
  constructor() {
    this.screener = new GoldmanSachsScreener();
    this.dcf = new MorganStanleyDCF();
    this.risk = new BridgewaterRiskAnalyzer();
    this.earnings = new JPMorganEarningsAnalyzer();
    this.portfolio = new BlackRockPortfolioConstructor();
    this.technical = new CitadelTechnicalAnalyzer();
    this.dividend = new HarvardDividendStrategy();
    this.competitive = new BainCompetitiveAnalyzer();
    this.patterns = new RenaissancePatternFinder();
    this.macro = new McKinseyMacroAnalyzer();
    this.engines = [
      { name: 'Goldman Sachs Screener', code: 'GS-SCR', instance: this.screener },
      { name: 'Morgan Stanley DCF', code: 'MS-DCF', instance: this.dcf },
      { name: 'Bridgewater Risk', code: 'BW-RSK', instance: this.risk },
      { name: 'JPMorgan Earnings', code: 'JPM-ERN', instance: this.earnings },
      { name: 'BlackRock Portfolio', code: 'BLK-PRT', instance: this.portfolio },
      { name: 'Citadel Technical', code: 'CTD-TEC', instance: this.technical },
      { name: 'Harvard Dividend', code: 'HVD-DIV', instance: this.dividend },
      { name: 'Bain Competitive', code: 'BN-CMP', instance: this.competitive },
      { name: 'Renaissance Patterns', code: 'REN-PAT', instance: this.patterns },
      { name: 'McKinsey Macro', code: 'MCK-MAC', instance: this.macro },
    ];
  }

  runFullAnalysis(stock, portfolio, market) {
    const results = {};
    if (stock) {
      results.screening = this.screener.generatePriceTargets(stock);
      results.valuation = stock.dcfInputs ? this.dcf.buildDCFModel(stock.dcfInputs) : null;
      results.earnings = stock.earningsHistory ? this.earnings.analyzeEarningsHistory(stock.earningsHistory) : null;
      results.technical = stock.prices ? {
        rsi: this.technical.calculateRSI(stock.prices),
        macd: this.technical.calculateMACD(stock.prices),
        bollinger: this.technical.calculateBollingerBands(stock.prices),
        supportResistance: this.technical.identifySupportResistance(stock.prices),
      } : null;
    }
    if (portfolio) {
      results.risk = {
        var: this.risk.calculateVaR(portfolio.returns || []),
        concentration: this.risk.analyzeSectorConcentration(portfolio.positions || []),
        stressTest: this.risk.stressTestRecession(portfolio.positions || [], '2008'),
      };
    }
    if (market) {
      results.macro = this.macro.sectorRotationRecommendation(market);
    }
    results.timestamp = new Date().toISOString();
    results.enginesUsed = this.engines.map(e => e.code);
    return results;
  }

  getConsensusRating(stock) {
    const signals = [];
    if (stock.pe) {
      const peSignal = stock.pe < 15 ? 2 : stock.pe < 25 ? 1 : stock.pe < 40 ? 0 : -1;
      signals.push({ engine: 'GS-SCR', signal: peSignal });
    }
    if (stock.prices && stock.prices.length > 14) {
      const rsi = this.technical.calculateRSI(stock.prices);
      const lastRSI = rsi[rsi.length - 1];
      const rsiSignal = lastRSI < 30 ? 2 : lastRSI < 45 ? 1 : lastRSI > 70 ? -2 : lastRSI > 55 ? -1 : 0;
      signals.push({ engine: 'CTD-TEC', signal: rsiSignal });
    }
    if (stock.earningsHistory) {
      const analysis = this.earnings.analyzeEarningsHistory(stock.earningsHistory);
      const earnSignal = analysis.beatRate > 80 ? 2 : analysis.beatRate > 60 ? 1 : analysis.beatRate < 40 ? -1 : 0;
      signals.push({ engine: 'JPM-ERN', signal: earnSignal });
    }
    const avg = signals.length > 0 ? signals.reduce((s, v) => s + v.signal, 0) / signals.length : 0;
    const ratings = ['STRONG SELL', 'SELL', 'HOLD', 'BUY', 'STRONG BUY'];
    const idx = Math.max(0, Math.min(4, Math.round(avg + 2)));
    return { rating: ratings[idx], score: +avg.toFixed(2), signals, enginesConsulted: signals.length };
  }

  generateExecutiveBrief(results) {
    const sections = [];
    if (results.screening) sections.push(`Price Targets: Bull $${results.screening.bull.price} | Base $${results.screening.base.price} | Bear $${results.screening.bear.price}`);
    if (results.valuation) sections.push(`DCF Valuation: $${results.valuation.pricePerShare}/share (Enterprise Value: $${(results.valuation.enterpriseValue / 1e9).toFixed(1)}B)`);
    if (results.risk && results.risk.var) sections.push(`Risk: VaR(95%) ${results.risk.var.var}% | Sharpe ${results.risk.var.sharpe}`);
    if (results.macro) sections.push(`Macro: ${results.macro.phase} phase — Overweight ${results.macro.overweight.slice(0, 2).join(', ')}`);
    return {
      timestamp: results.timestamp,
      enginesUsed: results.enginesUsed,
      summary: sections,
      recommendation: sections.length > 0 ? 'See detailed analysis above' : 'Insufficient data for recommendation',
    };
  }
}
