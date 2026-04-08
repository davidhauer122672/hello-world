// CK Trading Desk — Preload Script
// Safely exposes IPC channels to the renderer via contextBridge.
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

// ---------------------------------------------------------------------------
// Channel Whitelists — only these channels are permitted
// ---------------------------------------------------------------------------

const INVOKE_CHANNELS = new Set([
  // Trading
  'trading:start',
  'trading:stop',
  'trading:status',
  'trading:dashboard',
  'trading:execute',
  'trading:positions',
  'trading:pnl',
  // Analysis
  'analysis:run',
  'analysis:screen',
  // Agents
  'agents:list',
  'agents:status',
  // Portfolio
  'portfolio:overview',
  'portfolio:cashflow',
  // Market
  'market:data',
  // Config
  'config:get',
  'config:set',
  // Integrations
  'gateway:sync',
  'airtable:push',
]);

const RECEIVE_CHANNELS = new Set([
  // Trading events
  'trading:state-changed',
  'trading:trade-executed',
  'trading:position-changed',
  'trading:alert',
  // Market data stream
  'market:tick',
  'market:depth-update',
  'market:trade-stream',
  // Gateway / Airtable sync events
  'gateway:sync-started',
  'gateway:sync-complete',
  'gateway:sync-error',
  'airtable:push-started',
  'airtable:push-complete',
  'airtable:push-error',
  // Config changes
  'config:changed',
  // Auto-updater events
  'updater:checking',
  'updater:available',
  'updater:not-available',
  'updater:progress',
  'updater:downloaded',
  'updater:error',
  // Menu actions
  'menu:export-positions',
  'menu:export-pnl',
  'menu:new-trade',
  'menu:close-all-positions',
  'menu:navigate',
  'menu:run-analysis',
  'menu:stock-screener',
  'menu:rebalance',
  'menu:deploy-agent',
  'menu:recall-agents',
  'menu:about',
  // Deep links
  'deep-link',
]);

// ---------------------------------------------------------------------------
// Validated IPC helpers
// ---------------------------------------------------------------------------

function validateChannel(channel, whitelist) {
  if (typeof channel !== 'string') {
    throw new Error('IPC channel must be a string');
  }
  if (!whitelist.has(channel)) {
    throw new Error(`IPC channel "${channel}" is not allowed`);
  }
}

function invoke(channel, ...args) {
  validateChannel(channel, INVOKE_CHANNELS);
  return ipcRenderer.invoke(channel, ...args);
}

function on(channel, callback) {
  validateChannel(channel, RECEIVE_CHANNELS);
  const wrappedCallback = (_event, ...args) => callback(...args);
  ipcRenderer.on(channel, wrappedCallback);
  // Return an unsubscribe function
  return () => {
    ipcRenderer.removeListener(channel, wrappedCallback);
  };
}

function once(channel, callback) {
  validateChannel(channel, RECEIVE_CHANNELS);
  ipcRenderer.once(channel, (_event, ...args) => callback(...args));
}

// ---------------------------------------------------------------------------
// Exposed API: window.ckTradingDesk
// ---------------------------------------------------------------------------

contextBridge.exposeInMainWorld('ckTradingDesk', {
  // ---- Trading ----
  trading: {
    start: () => invoke('trading:start'),
    stop: () => invoke('trading:stop'),
    status: () => invoke('trading:status'),
    dashboard: () => invoke('trading:dashboard'),
    execute: (trade) => invoke('trading:execute', trade),
    positions: () => invoke('trading:positions'),
    pnl: () => invoke('trading:pnl'),

    // Real-time events
    onStateChanged: (cb) => on('trading:state-changed', cb),
    onTradeExecuted: (cb) => on('trading:trade-executed', cb),
    onPositionChanged: (cb) => on('trading:position-changed', cb),
    onAlert: (cb) => on('trading:alert', cb),
  },

  // ---- Analysis ----
  analysis: {
    run: (params) => invoke('analysis:run', params),
    screen: (criteria) => invoke('analysis:screen', criteria),
  },

  // ---- Agents ----
  agents: {
    list: () => invoke('agents:list'),
    status: () => invoke('agents:status'),
  },

  // ---- Portfolio ----
  portfolio: {
    overview: () => invoke('portfolio:overview'),
    cashflow: () => invoke('portfolio:cashflow'),
  },

  // ---- Market Data ----
  market: {
    data: (request) => invoke('market:data', request),

    // Real-time streams
    onTick: (cb) => on('market:tick', cb),
    onDepthUpdate: (cb) => on('market:depth-update', cb),
    onTradeStream: (cb) => on('market:trade-stream', cb),
  },

  // ---- Config ----
  config: {
    get: (key) => invoke('config:get', key),
    set: (updates) => invoke('config:set', updates),
    onChanged: (cb) => on('config:changed', cb),
  },

  // ---- System / Integrations ----
  system: {
    syncGateway: () => invoke('gateway:sync'),
    pushToAirtable: (data) => invoke('airtable:push', data),

    // Sync events
    onGatewaySyncStarted: (cb) => on('gateway:sync-started', cb),
    onGatewaySyncComplete: (cb) => on('gateway:sync-complete', cb),
    onGatewaySyncError: (cb) => on('gateway:sync-error', cb),
    onAirtablePushStarted: (cb) => on('airtable:push-started', cb),
    onAirtablePushComplete: (cb) => on('airtable:push-complete', cb),
    onAirtablePushError: (cb) => on('airtable:push-error', cb),

    // Updater events
    onUpdaterChecking: (cb) => on('updater:checking', cb),
    onUpdateAvailable: (cb) => on('updater:available', cb),
    onUpdateNotAvailable: (cb) => on('updater:not-available', cb),
    onUpdateProgress: (cb) => on('updater:progress', cb),
    onUpdateDownloaded: (cb) => on('updater:downloaded', cb),
    onUpdaterError: (cb) => on('updater:error', cb),

    // Menu events
    onMenuExportPositions: (cb) => on('menu:export-positions', cb),
    onMenuExportPnl: (cb) => on('menu:export-pnl', cb),
    onMenuNewTrade: (cb) => on('menu:new-trade', cb),
    onMenuCloseAllPositions: (cb) => on('menu:close-all-positions', cb),
    onMenuNavigate: (cb) => on('menu:navigate', cb),
    onMenuRunAnalysis: (cb) => on('menu:run-analysis', cb),
    onMenuStockScreener: (cb) => on('menu:stock-screener', cb),
    onMenuRebalance: (cb) => on('menu:rebalance', cb),
    onMenuDeployAgent: (cb) => on('menu:deploy-agent', cb),
    onMenuRecallAgents: (cb) => on('menu:recall-agents', cb),
    onMenuAbout: (cb) => on('menu:about', cb),

    // Deep links
    onDeepLink: (cb) => on('deep-link', cb),
  },
});
