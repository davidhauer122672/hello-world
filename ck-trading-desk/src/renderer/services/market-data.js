/**
 * CK Trading Desk — Market Data Service
 * Real-time market data processing pipeline
 * Feeds all 10 analysis engines and 97 agents simultaneously
 * Never stops. Never sleeps. Always watching the market.
 */

// Simulated real-time market data for initial build
// Production will connect to Alpaca, Polygon, or IEX Cloud APIs
const WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financials' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financials' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer' },
  { symbol: 'VZ', name: 'Verizon Comm.', sector: 'Telecom' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Telecom' },
  { symbol: 'O', name: 'Realty Income', sector: 'Real Estate' },
  { symbol: 'SCHD', name: 'Schwab US Dividend', sector: 'ETF' },
  { symbol: 'SPY', name: 'S&P 500 ETF', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', sector: 'ETF' },
  { symbol: 'VTI', name: 'Total Stock Market', sector: 'ETF' },
  { symbol: 'BND', name: 'Total Bond Market', sector: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select', sector: 'Energy' },
];

const BASE_PRICES = {
  AAPL: 198.45, MSFT: 425.12, NVDA: 892.30, GOOGL: 175.88, AMZN: 186.75,
  META: 512.44, JPM: 198.32, GS: 468.90, MS: 98.45, 'BRK.B': 412.30,
  V: 284.56, MA: 478.23, JNJ: 156.78, UNH: 542.10, PG: 168.45,
  KO: 62.34, VZ: 42.18, T: 18.92, O: 56.78, SCHD: 78.45,
  SPY: 518.42, QQQ: 445.67, VTI: 262.34, BND: 72.45, XLE: 89.34,
};

export class MarketDataService {
  constructor() {
    this.prices = { ...BASE_PRICES };
    this.subscribers = new Map();
    this.tickInterval = null;
    this.ticks = [];
    this.dailyChanges = {};
    this.volumes = {};

    // Initialize daily changes and volumes
    Object.keys(BASE_PRICES).forEach(symbol => {
      this.dailyChanges[symbol] = (Math.random() - 0.45) * 4;
      this.volumes[symbol] = Math.floor(Math.random() * 50000000) + 5000000;
    });
  }

  start(intervalMs = 2000) {
    if (this.tickInterval) return;

    this.tickInterval = setInterval(() => {
      const updates = {};

      Object.keys(this.prices).forEach(symbol => {
        const volatility = symbol === 'NVDA' ? 0.003 : symbol === 'BND' ? 0.0002 : 0.001;
        const change = (Math.random() - 0.48) * this.prices[symbol] * volatility;
        this.prices[symbol] = Math.max(0.01, this.prices[symbol] + change);

        const basePrice = BASE_PRICES[symbol];
        this.dailyChanges[symbol] = ((this.prices[symbol] - basePrice) / basePrice) * 100;
        this.volumes[symbol] += Math.floor(Math.random() * 10000);

        updates[symbol] = {
          symbol,
          price: this.prices[symbol],
          change: this.dailyChanges[symbol],
          volume: this.volumes[symbol],
          bid: this.prices[symbol] - Math.random() * 0.05,
          ask: this.prices[symbol] + Math.random() * 0.05,
          timestamp: Date.now(),
        };
      });

      this.ticks.push({ timestamp: Date.now(), prices: { ...this.prices } });
      if (this.ticks.length > 1000) this.ticks.shift();

      // Notify all subscribers
      this.subscribers.forEach((callback, id) => {
        try { callback(updates); } catch (e) { /* subscriber error */ }
      });
    }, intervalMs);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  subscribe(callback) {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  getPrice(symbol) {
    return {
      symbol,
      price: this.prices[symbol] || 0,
      change: this.dailyChanges[symbol] || 0,
      volume: this.volumes[symbol] || 0,
      timestamp: Date.now(),
    };
  }

  getAllPrices() {
    return Object.keys(this.prices).map(symbol => this.getPrice(symbol));
  }

  getWatchlist() { return WATCHLIST; }

  getHistoricalPrices(symbol, periods = 30) {
    const base = BASE_PRICES[symbol] || 100;
    const prices = [];
    let price = base * 0.9;

    for (let i = 0; i < periods; i++) {
      price += (Math.random() - 0.45) * base * 0.02;
      prices.push({
        date: new Date(Date.now() - (periods - i) * 86400000).toISOString().split('T')[0],
        open: price - Math.random() * 2,
        high: price + Math.random() * 3,
        low: price - Math.random() * 3,
        close: price,
        volume: Math.floor(Math.random() * 30000000) + 5000000,
      });
    }
    return prices;
  }

  getSectorPerformance() {
    const sectors = {};
    WATCHLIST.forEach(stock => {
      if (!sectors[stock.sector]) sectors[stock.sector] = { gains: 0, count: 0 };
      sectors[stock.sector].gains += this.dailyChanges[stock.symbol] || 0;
      sectors[stock.sector].count++;
    });

    return Object.entries(sectors).map(([sector, data]) => ({
      sector,
      change: data.gains / data.count,
    }));
  }
}

// Singleton
let marketDataInstance = null;

export function getMarketData() {
  if (!marketDataInstance) {
    marketDataInstance = new MarketDataService();
    marketDataInstance.start();
  }
  return marketDataInstance;
}
