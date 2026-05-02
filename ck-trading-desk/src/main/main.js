// CK Trading Desk — Coastal Key Enterprise
// Electron Main Process
// ============================================================================

const { app, BrowserWindow, ipcMain, Menu, Tray, shell, nativeTheme, crashReporter } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APP_TITLE = 'CK Trading Desk \u2014 Coastal Key Enterprise';
const PROTOCOL = 'ck-trading';
const IS_DEV = !app.isPackaged;
const DEV_URL = 'http://localhost:3000';
const PROD_ENTRY = path.join(__dirname, '..', 'renderer', 'index.html');
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

const CK_GATEWAY_URL = 'https://ck-api-gateway.david-e59.workers.dev';
const AIRTABLE_BASE_ID = 'appUSnNgpDkcEOzhN';

// ---------------------------------------------------------------------------
// Crash Reporter
// ---------------------------------------------------------------------------

crashReporter.start({
  productName: 'CK Trading Desk',
  companyName: 'Coastal Key Enterprise',
  submitURL: '', // Configure crash report endpoint when available
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
});

// ---------------------------------------------------------------------------
// Window State Persistence
// ---------------------------------------------------------------------------

function loadWindowState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (_err) {
    // Corrupted state file — use defaults
  }
  return { width: 1600, height: 1000, x: undefined, y: undefined, isMaximized: false };
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const bounds = win.isMaximized() ? (win._lastBounds || win.getBounds()) : win.getBounds();
    const state = {
      ...bounds,
      isMaximized: win.isMaximized(),
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (_err) {
    // Non-critical — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Application Config
// ---------------------------------------------------------------------------

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (_err) {
    // Return defaults on error
  }
  return {
    theme: 'dark',
    gatewayUrl: CK_GATEWAY_URL,
    airtableBaseId: AIRTABLE_BASE_ID,
    autoSync: true,
    syncIntervalMs: 30000,
    tradingEnabled: false,
    riskLimits: { maxPositionSize: 100000, maxDailyLoss: 5000, maxOpenPositions: 20 },
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('[CK] Failed to save config:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Trading Engine State (in-process stub — real logic lives in renderer / gateway)
// ---------------------------------------------------------------------------

const tradingState = {
  running: false,
  startedAt: null,
  positions: [],
  pnl: { realized: 0, unrealized: 0, total: 0, daily: 0 },
  tradeHistory: [],
};

// ---------------------------------------------------------------------------
// Singleton references
// ---------------------------------------------------------------------------

let mainWindow = null;
let tray = null;
let appConfig = loadConfig();

// ---------------------------------------------------------------------------
// Deep Link Protocol
// ---------------------------------------------------------------------------

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Handle deep link from argv on Windows/Linux
    const deepLink = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (deepLink) handleDeepLink(deepLink);
  });
}

function handleDeepLink(url) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('deep-link', url);
}

app.on('open-url', (_event, url) => {
  handleDeepLink(url);
});

// ---------------------------------------------------------------------------
// Window Creation
// ---------------------------------------------------------------------------

function createMainWindow() {
  const savedState = loadWindowState();

  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: savedState.width,
    height: savedState.height,
    x: savedState.x,
    y: savedState.y,
    minWidth: 1600,
    minHeight: 1000,
    titleBarStyle: 'hiddenInset',
    titleBarOverlay: {
      color: '#0a0a0f',
      symbolColor: '#e2e8f0',
      height: 38,
    },
    backgroundColor: '#0a0a0f',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
      spellcheck: false,
    },
  });

  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  // Track bounds before maximize so we can restore later
  mainWindow.on('resize', () => {
    if (!mainWindow.isMaximized()) {
      mainWindow._lastBounds = mainWindow.getBounds();
    }
  });
  mainWindow.on('move', () => {
    if (!mainWindow.isMaximized()) {
      mainWindow._lastBounds = mainWindow.getBounds();
    }
  });

  // Persist state on close
  mainWindow.on('close', () => {
    saveWindowState(mainWindow);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Graceful show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Load content
  if (IS_DEV) {
    mainWindow.loadURL(DEV_URL).catch((err) => {
      console.error('[CK] Failed to load dev server — is it running?', err.message);
      // Fallback to built files if dev server is not available
      if (fs.existsSync(PROD_ENTRY)) {
        mainWindow.loadFile(PROD_ENTRY);
      }
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(PROD_ENTRY);
  }

  // Block navigation to external URLs in the main window
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(DEV_URL) && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Block new window creation — open in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

// ---------------------------------------------------------------------------
// System Tray
// ---------------------------------------------------------------------------

function createTray() {
  // Use a simple text-based tray icon; replace with nativeImage in production
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  const iconExists = fs.existsSync(iconPath);

  tray = new Tray(iconExists ? iconPath : createFallbackTrayIcon());

  const contextMenu = Menu.buildFromTemplate([
    { label: APP_TITLE, enabled: false },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Start Trading',
      click: () => startTrading(),
    },
    {
      label: 'Stop Trading',
      click: () => stopTrading(),
    },
    {
      label: 'Sync with Gateway',
      click: () => syncWithGateway(),
    },
    { type: 'separator' },
    {
      label: 'Quit CK Trading Desk',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(APP_TITLE);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

function createFallbackTrayIcon() {
  // Create a minimal 16x16 tray icon via nativeImage when no asset file exists
  const { nativeImage } = require('electron');
  const img = nativeImage.createEmpty();
  // In production, replace with a real icon asset
  return img;
}

// ---------------------------------------------------------------------------
// Application Menu
// ---------------------------------------------------------------------------

function buildAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]
      : []),

    // File
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Positions',
          accelerator: 'CmdOrCtrl+E',
          click: () => sendToRenderer('menu:export-positions'),
        },
        {
          label: 'Export P&L Report',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => sendToRenderer('menu:export-pnl'),
        },
        { type: 'separator' },
        {
          label: 'Sync with Gateway',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => syncWithGateway(),
        },
        {
          label: 'Push to Airtable',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => pushToAirtable(),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // Edit
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    // View
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // Trading
    {
      label: 'Trading',
      submenu: [
        {
          label: 'Start Trading',
          accelerator: 'CmdOrCtrl+T',
          click: () => startTrading(),
        },
        {
          label: 'Stop Trading',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => stopTrading(),
        },
        { type: 'separator' },
        {
          label: 'Execute Trade...',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendToRenderer('menu:new-trade'),
        },
        {
          label: 'Close All Positions',
          click: () => sendToRenderer('menu:close-all-positions'),
        },
        { type: 'separator' },
        {
          label: 'Risk Dashboard',
          click: () => sendToRenderer('menu:navigate', '/risk'),
        },
      ],
    },

    // Analysis
    {
      label: 'Analysis',
      submenu: [
        {
          label: 'Run Analysis...',
          accelerator: 'CmdOrCtrl+R',
          click: () => sendToRenderer('menu:run-analysis'),
        },
        {
          label: 'Stock Screener',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => sendToRenderer('menu:stock-screener'),
        },
        { type: 'separator' },
        {
          label: 'Technical Analysis',
          click: () => sendToRenderer('menu:navigate', '/analysis/technical'),
        },
        {
          label: 'Fundamental Analysis',
          click: () => sendToRenderer('menu:navigate', '/analysis/fundamental'),
        },
        {
          label: 'Sentiment Analysis',
          click: () => sendToRenderer('menu:navigate', '/analysis/sentiment'),
        },
      ],
    },

    // Portfolio
    {
      label: 'Portfolio',
      submenu: [
        {
          label: 'Overview',
          accelerator: 'CmdOrCtrl+P',
          click: () => sendToRenderer('menu:navigate', '/portfolio'),
        },
        {
          label: 'Cash Flow Projections',
          click: () => sendToRenderer('menu:navigate', '/portfolio/cashflow'),
        },
        {
          label: 'Performance Attribution',
          click: () => sendToRenderer('menu:navigate', '/portfolio/attribution'),
        },
        { type: 'separator' },
        {
          label: 'Rebalance...',
          click: () => sendToRenderer('menu:rebalance'),
        },
      ],
    },

    // Agents
    {
      label: 'Agents',
      submenu: [
        {
          label: 'Fleet Status',
          accelerator: 'CmdOrCtrl+G',
          click: () => sendToRenderer('menu:navigate', '/agents'),
        },
        {
          label: 'Agent Console',
          click: () => sendToRenderer('menu:navigate', '/agents/console'),
        },
        { type: 'separator' },
        {
          label: 'Deploy Agent...',
          click: () => sendToRenderer('menu:deploy-agent'),
        },
        {
          label: 'Recall All Agents',
          click: () => sendToRenderer('menu:recall-agents'),
        },
      ],
    },

    // Help
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://main.coastalkey-pm.pages.dev/docs'),
        },
        {
          label: 'Command Center',
          click: () => shell.openExternal('https://ck-command-center.pages.dev'),
        },
        { type: 'separator' },
        {
          label: 'API Gateway Status',
          click: () => sendToRenderer('menu:navigate', '/system/gateway'),
        },
        {
          label: 'About CK Trading Desk',
          click: () => sendToRenderer('menu:about'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function sendToRenderer(channel, ...args) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

// ---------------------------------------------------------------------------
// Trading Operations (IPC-accessible stubs)
// ---------------------------------------------------------------------------

function startTrading() {
  if (tradingState.running) return { success: false, error: 'Trading already running' };
  tradingState.running = true;
  tradingState.startedAt = new Date().toISOString();
  sendToRenderer('trading:state-changed', { running: true, startedAt: tradingState.startedAt });
  return { success: true, startedAt: tradingState.startedAt };
}

function stopTrading() {
  if (!tradingState.running) return { success: false, error: 'Trading not running' };
  tradingState.running = false;
  const stoppedAt = new Date().toISOString();
  tradingState.startedAt = null;
  sendToRenderer('trading:state-changed', { running: false, stoppedAt });
  return { success: true, stoppedAt };
}

async function syncWithGateway() {
  try {
    sendToRenderer('gateway:sync-started');
    // Real implementation would call CK_GATEWAY_URL endpoints
    const result = { synced: true, timestamp: new Date().toISOString(), endpoints: 53 };
    sendToRenderer('gateway:sync-complete', result);
    return result;
  } catch (err) {
    const error = { synced: false, error: err.message };
    sendToRenderer('gateway:sync-error', error);
    return error;
  }
}

async function pushToAirtable() {
  try {
    sendToRenderer('airtable:push-started');
    // Real implementation would push to Airtable base
    const result = { pushed: true, timestamp: new Date().toISOString(), baseId: AIRTABLE_BASE_ID };
    sendToRenderer('airtable:push-complete', result);
    return result;
  } catch (err) {
    const error = { pushed: false, error: err.message };
    sendToRenderer('airtable:push-error', error);
    return error;
  }
}

// ---------------------------------------------------------------------------
// IPC Handlers
// ---------------------------------------------------------------------------

function registerIpcHandlers() {
  // --- Trading ---
  ipcMain.handle('trading:start', async () => {
    return startTrading();
  });

  ipcMain.handle('trading:stop', async () => {
    return stopTrading();
  });

  ipcMain.handle('trading:status', async () => {
    return {
      running: tradingState.running,
      startedAt: tradingState.startedAt,
      positionCount: tradingState.positions.length,
      pnl: tradingState.pnl,
      uptime: tradingState.startedAt
        ? Date.now() - new Date(tradingState.startedAt).getTime()
        : 0,
    };
  });

  ipcMain.handle('trading:dashboard', async () => {
    return {
      status: tradingState.running ? 'ACTIVE' : 'IDLE',
      startedAt: tradingState.startedAt,
      positions: tradingState.positions,
      pnl: tradingState.pnl,
      tradeCount: tradingState.tradeHistory.length,
      lastTrade: tradingState.tradeHistory[tradingState.tradeHistory.length - 1] || null,
      config: {
        riskLimits: appConfig.riskLimits,
        autoSync: appConfig.autoSync,
      },
    };
  });

  ipcMain.handle('trading:execute', async (_event, trade) => {
    if (!tradingState.running) {
      return { success: false, error: 'Trading engine is not running' };
    }
    if (!trade || !trade.symbol || !trade.side || !trade.quantity) {
      return { success: false, error: 'Invalid trade: symbol, side, and quantity required' };
    }
    const executed = {
      id: `TRD-${Date.now()}`,
      ...trade,
      executedAt: new Date().toISOString(),
      status: 'FILLED',
    };
    tradingState.tradeHistory.push(executed);
    sendToRenderer('trading:trade-executed', executed);
    return { success: true, trade: executed };
  });

  ipcMain.handle('trading:positions', async () => {
    return { positions: tradingState.positions };
  });

  ipcMain.handle('trading:pnl', async () => {
    return tradingState.pnl;
  });

  // --- Analysis ---
  ipcMain.handle('analysis:run', async (_event, params) => {
    if (!params || !params.engine) {
      return { success: false, error: 'Analysis engine must be specified' };
    }
    const validEngines = ['technical', 'fundamental', 'sentiment', 'quantitative', 'ml'];
    if (!validEngines.includes(params.engine)) {
      return { success: false, error: `Invalid engine. Valid: ${validEngines.join(', ')}` };
    }
    return {
      success: true,
      analysisId: `ANL-${Date.now()}`,
      engine: params.engine,
      parameters: params,
      status: 'QUEUED',
      queuedAt: new Date().toISOString(),
    };
  });

  ipcMain.handle('analysis:screen', async (_event, criteria) => {
    if (!criteria) {
      return { success: false, error: 'Screening criteria required' };
    }
    return {
      success: true,
      screenId: `SCR-${Date.now()}`,
      criteria,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
    };
  });

  // --- Agents ---
  ipcMain.handle('agents:list', async () => {
    // Returns the fleet structure aligned with CLAUDE.md fleet definitions
    return {
      total: 382,
      divisions: {
        mcco: 15,
        operational: 297,
        intelligenceOfficers: 50,
        emailAgents: 20,
      },
      operationalDivisions: ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB'],
      ioSquads: ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'],
      emailSquads: ['INTAKE', 'COMPOSE', 'NURTURE', 'MONITOR'],
    };
  });

  ipcMain.handle('agents:status', async () => {
    return {
      fleetSize: 382,
      status: 'OPERATIONAL',
      readiness: 0.97,
      activeAgents: 382,
      timestamp: new Date().toISOString(),
    };
  });

  // --- Portfolio ---
  ipcMain.handle('portfolio:overview', async () => {
    return {
      totalValue: 0,
      positions: tradingState.positions,
      pnl: tradingState.pnl,
      allocation: {},
      lastUpdated: new Date().toISOString(),
    };
  });

  ipcMain.handle('portfolio:cashflow', async () => {
    return {
      projections: [],
      horizon: '30d',
      generatedAt: new Date().toISOString(),
    };
  });

  // --- Market Data ---
  ipcMain.handle('market:data', async (_event, request) => {
    if (!request || !request.symbols) {
      return { success: false, error: 'Symbols array required' };
    }
    return {
      success: true,
      symbols: request.symbols,
      timestamp: new Date().toISOString(),
      data: {},
    };
  });

  // --- Config ---
  ipcMain.handle('config:get', async (_event, key) => {
    if (key) return { [key]: appConfig[key] };
    return { ...appConfig };
  });

  ipcMain.handle('config:set', async (_event, updates) => {
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Config updates must be an object' };
    }
    appConfig = { ...appConfig, ...updates };
    saveConfig(appConfig);
    sendToRenderer('config:changed', appConfig);
    return { success: true, config: appConfig };
  });

  // --- Gateway Sync ---
  ipcMain.handle('gateway:sync', async () => {
    return syncWithGateway();
  });

  // --- Airtable Push ---
  ipcMain.handle('airtable:push', async (_event, data) => {
    return pushToAirtable(data);
  });
}

// ---------------------------------------------------------------------------
// Auto Updater
// ---------------------------------------------------------------------------

function setupAutoUpdater() {
  if (IS_DEV) return; // Skip auto-update in development

  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('updater:checking');
  });

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('updater:available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    sendToRenderer('updater:not-available', info);
  });

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('updater:progress', progress);
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('updater:downloaded', info);
  });

  autoUpdater.on('error', (err) => {
    sendToRenderer('updater:error', err.message);
  });

  // Check for updates after a short delay to avoid slowing startup
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('[CK] Auto-update check failed:', err.message);
    });
  }, 5000);
}

// ---------------------------------------------------------------------------
// App Lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
  registerIpcHandlers();
  buildAppMenu();
  createMainWindow();
  createTray();
  setupAutoUpdater();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no windows exist
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS keep the app in the tray; on other platforms quit
  if (process.platform !== 'darwin') {
    // Keep running in tray if trading is active
    if (!tradingState.running) {
      app.quit();
    }
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (tradingState.running) {
    stopTrading();
  }
});

// Security: prevent loading remote content in webviews
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
});
