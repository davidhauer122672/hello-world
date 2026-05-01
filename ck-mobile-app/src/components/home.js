/**
 * Coastal Key Mobile App — Home Dashboard
 * Revenue counter, lead heat index, AI suggestions, quick actions
 */

import * as api from '../utils/api.js';
import { getState } from '../utils/state.js';

export function renderHome() {
  return `
    <!-- Mission Banner -->
    <div class="mission-block mb-lg animate-slide-up">
      <p class="mission-text">Service &middot; Stewardship &middot; Security</p>
      <p style="font-size:0.7rem;color:var(--ck-gold);margin-top:8px;padding-left:var(--space-lg);letter-spacing:0.08em;text-transform:uppercase;">Your Treasure Coast Home Watch Partner</p>
    </div>

    <!-- Revenue Hero Card -->
    <div class="card-hero mb-lg animate-slide-up" style="animation-delay:50ms">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-xs text-dim mb-sm" style="margin-bottom:4px">Monthly Revenue</div>
          <div class="metric-value gold" id="revenue-counter">$0</div>
          <div class="metric-delta up mt-sm" id="revenue-delta" style="margin-top:8px">+12.4% vs last month</div>
        </div>
        <div class="gauge-ring" id="revenue-gauge" style="--gauge-value:78%">
          <span class="gauge-label">78%</span>
        </div>
      </div>
    </div>

    <!-- Live Metrics Row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm);margin-bottom:var(--space-lg);" class="animate-slide-up" style="animation-delay:100ms">
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value blue" id="metric-leads" style="font-size:1.5rem;">247</div>
        <div class="metric-label">Active Leads</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value green" id="metric-agents" style="font-size:1.5rem;">342</div>
        <div class="metric-label">Agents Online</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value" id="metric-uptime" style="font-size:1.5rem;color:var(--ck-cyan);">98.7%</div>
        <div class="metric-label">Uptime</div>
      </div>
    </div>

    <!-- Lead Heat Index -->
    <div class="section-header">
      <span class="section-title">Lead Heat Index</span>
      <button class="section-action">View All</button>
    </div>
    <div class="heat-map-container mb-lg" id="lead-heat-map">
      <div style="display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(5,1fr);height:100%;gap:2px;padding:8px;">
        ${generateHeatCells()}
      </div>
    </div>

    <!-- AI Execute Now -->
    <div class="section-header">
      <span class="section-title">AI Recommendations</span>
      <button class="section-action">History</button>
    </div>

    <div class="card mb-md" style="border-left:3px solid var(--ck-gold);">
      <div class="flex items-center gap-md">
        <div style="font-size:1.5rem;">&#9889;</div>
        <div class="flex-col" style="flex:1;display:flex;flex-direction:column;">
          <span style="font-size:0.85rem;font-weight:600;color:#fff;">3 Hot Leads Ready for Battle Plan</span>
          <span style="font-size:0.75rem;color:#71717a;margin-top:2px;">Score 85+ — recommend immediate engagement</span>
        </div>
      </div>
      <button class="btn btn-execute w-full mt-md" style="margin-top:12px;width:100%;">Execute Now</button>
    </div>

    <div class="card mb-md" style="border-left:3px solid var(--ck-blue);">
      <div class="flex items-center gap-md">
        <div style="font-size:1.5rem;">&#128200;</div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <span style="font-size:0.85rem;font-weight:600;color:#fff;">Market Shift Detected — Stuart, FL</span>
          <span style="font-size:0.75rem;color:#71717a;margin-top:2px;">Luxury segment up 8.2% — pricing adjustment recommended</span>
        </div>
      </div>
      <button class="btn btn-secondary w-full mt-md" style="margin-top:12px;width:100%;">Review Analysis</button>
    </div>

    <div class="card mb-lg" style="border-left:3px solid var(--ck-green);">
      <div class="flex items-center gap-md">
        <div style="font-size:1.5rem;">&#128233;</div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <span style="font-size:0.85rem;font-weight:600;color:#fff;">12 Nurture Emails Queued</span>
          <span style="font-size:0.75rem;color:#71717a;margin-top:2px;">90-day sequence — 4 leads approaching re-engagement window</span>
        </div>
      </div>
      <button class="btn btn-ghost w-full mt-md" style="margin-top:12px;width:100%;">Send Now</button>
    </div>

    <!-- Quick Actions -->
    <div class="section-header">
      <span class="section-title">Quick Actions</span>
    </div>
    <div class="quick-actions mb-lg">
      <a class="quick-action" onclick="window.location.hash='leads'">
        <div class="quick-action-icon" style="background:var(--ck-red-dim);color:var(--ck-red);">&#9733;</div>
        <span class="quick-action-label">Score Lead</span>
      </a>
      <a class="quick-action" onclick="window.location.hash='content'">
        <div class="quick-action-icon" style="background:var(--ck-purple-dim);color:var(--ck-purple);">&#9998;</div>
        <span class="quick-action-label">Create Post</span>
      </a>
      <a class="quick-action" onclick="window.location.hash='skills'">
        <div class="quick-action-icon" style="background:var(--ck-blue-dim);color:var(--ck-blue);">&#9881;</div>
        <span class="quick-action-label">Run Skill</span>
      </a>
      <a class="quick-action" onclick="window.location.hash='systems'">
        <div class="quick-action-icon" style="background:var(--ck-green-dim);color:var(--ck-green);">&#9879;</div>
        <span class="quick-action-label">Fleet Scan</span>
      </a>
    </div>

    <!-- Fleet Status Summary -->
    <div class="section-header">
      <span class="section-title">Fleet Status</span>
      <button class="section-action" onclick="window.location.hash='systems'">Details</button>
    </div>
    <div class="card" id="fleet-status-card">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-md);text-align:center;">
        <div>
          <div style="font-size:0.85rem;font-weight:700;color:var(--ck-green);" id="fleet-agents">290</div>
          <div class="text-xs text-dim" style="margin-top:4px;">AI Agents</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:6px;">
            <span class="status-dot active"></span>
            <span style="font-size:0.7rem;color:#71717a;">Online</span>
          </div>
        </div>
        <div>
          <div style="font-size:0.85rem;font-weight:700;color:var(--ck-amber);" id="fleet-intel">50</div>
          <div class="text-xs text-dim" style="margin-top:4px;">Intel Officers</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:6px;">
            <span class="status-dot active"></span>
            <span style="font-size:0.7rem;color:#71717a;">Scanning</span>
          </div>
        </div>
        <div>
          <div style="font-size:0.85rem;font-weight:700;color:var(--ck-purple);" id="fleet-email">20</div>
          <div class="text-xs text-dim" style="margin-top:4px;">Email Agents</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:6px;">
            <span class="status-dot active"></span>
            <span style="font-size:0.7rem;color:#71717a;">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Governance Footer -->
    <div class="divider"></div>
    <div style="text-align:center;padding:var(--space-md) 0;">
      <div style="font-size:0.65rem;color:var(--ck-gold-dim);letter-spacing:0.1em;text-transform:uppercase;">
        Truth Over Convenience &middot; Transparency Over Opacity &middot; Long-Term Reputation Over Short-Term Revenue
      </div>
    </div>
  `;
}

export function initHome() {
  loadDashboardData();
  loadSystemStatus();
}

async function loadDashboardData() {
  try {
    const data = await api.getDashboard();
    if (data.revenue !== undefined) {
      const el = document.getElementById('revenue-counter');
      if (el) el.textContent = '$' + Number(data.revenue).toLocaleString();
    }
    if (data.revenueChange !== undefined) {
      const el = document.getElementById('revenue-delta');
      if (el) el.textContent = `${data.revenueChange > 0 ? '+' : ''}${data.revenueChange}% vs last month`;
    }
    if (data.activeLeads !== undefined) {
      const el = document.getElementById('metric-leads');
      if (el) el.textContent = data.activeLeads.toLocaleString();
    }
    if (data.agentsOnline !== undefined) {
      const el = document.getElementById('metric-agents');
      if (el) el.textContent = data.agentsOnline.toLocaleString();
    }
    if (data.uptime !== undefined) {
      const el = document.getElementById('metric-uptime');
      if (el) el.textContent = data.uptime + '%';
    }
  } catch (_) {
    // Graceful degradation — sample data remains visible
  }
}

async function loadSystemStatus() {
  try {
    const data = await api.getSystemStatus();
    if (data.agents !== undefined) {
      const el = document.getElementById('fleet-agents');
      if (el) el.textContent = data.agents;
    }
    if (data.intelOfficers !== undefined) {
      const el = document.getElementById('fleet-intel');
      if (el) el.textContent = data.intelOfficers;
    }
    if (data.emailAgents !== undefined) {
      const el = document.getElementById('fleet-email');
      if (el) el.textContent = data.emailAgents;
    }
  } catch (_) {
    // Graceful degradation
  }
}

function generateHeatCells() {
  const colors = [
    'rgba(52,211,153,0.2)', 'rgba(52,211,153,0.4)', 'rgba(52,211,153,0.6)',
    'rgba(245,158,11,0.3)', 'rgba(245,158,11,0.5)', 'rgba(245,158,11,0.7)',
    'rgba(239,68,68,0.3)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0.7)', 'rgba(239,68,68,0.9)'
  ];
  let cells = '';
  for (let i = 0; i < 50; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    cells += `<div style="background:${color};border-radius:3px;transition:background 300ms;"></div>`;
  }
  return cells;
}
