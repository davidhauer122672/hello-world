/**
 * Coastal Key Mobile App Builder — Entry Point
 * Multi-step wizard + Admin Dashboard for deployed app management
 */

import { INDUSTRY_TEMPLATES, getTemplate, getTemplateModules } from './utils/templates.js';

const state = {
  view: 'wizard',
  step: 1,
  occupation: null,
  modules: {},
  branding: {},
  agentTier: null,
  agentCount: 10
};

const STEPS = [
  { num: 1, label: 'Occupation' },
  { num: 2, label: 'Modules' },
  { num: 3, label: 'Branding' },
  { num: 4, label: 'AI Agents' },
  { num: 5, label: 'Deploy' }
];

const DEPLOYED_APPS = [
  { id: 'app-001', name: 'Coastal Key PM', industry: 'Property Management', agents: 200, tier: 'Enterprise', status: 'live', health: 99.2, deployed: '2026-04-03', mrr: 25000, color: '#c4a35a' },
  { id: 'app-002', name: 'TC Legal AI', industry: 'Legal', agents: 50, tier: 'Pro', status: 'live', health: 97.8, deployed: '2026-04-12', mrr: 1500, color: '#4a9eff' },
  { id: 'app-003', name: 'Marina Ops AI', industry: 'Hospitality', agents: 50, tier: 'Pro', status: 'live', health: 98.5, deployed: '2026-04-18', mrr: 1500, color: '#34d399' },
  { id: 'app-004', name: 'Stuart Med Group', industry: 'Healthcare', agents: 10, tier: 'Starter', status: 'staging', health: 95.1, deployed: '2026-04-25', mrr: 299, color: '#a78bfa' }
];

document.addEventListener('DOMContentLoaded', () => render());

function render() {
  const app = document.getElementById('builder-app');
  app.innerHTML = `
    <div class="builder-shell">
      ${renderHeader()}
      ${state.view === 'dashboard' ? renderDashboard() : renderWizardView()}
    </div>
  `;
  attachHandlers();
}

function renderWizardView() {
  return `${renderStepProgress()}<div id="step-content">${renderStep()}</div>`;
}

function renderHeader() {
  return `
    <header class="builder-header">
      <div class="builder-logo">
        <div class="builder-logo-mark">CK</div>
        <div>
          <div class="builder-logo-text">Coastal Key</div>
          <div class="builder-logo-sub">Mobile App Builder</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="view-toggle">
          <button class="view-toggle-btn${state.view === 'wizard' ? ' active' : ''}" data-view="wizard">Builder</button>
          <button class="view-toggle-btn${state.view === 'dashboard' ? ' active' : ''}" data-view="dashboard">Dashboard</button>
        </div>
        <span class="tag tag-gold">${state.view === 'dashboard' ? 'Admin' : 'Builder Mode'}</span>
      </div>
    </header>
  `;
}

function renderStepProgress() {
  return `
    <div class="step-progress">
      ${STEPS.map((s, i) => `
        <div class="step-dot ${s.num < state.step ? 'completed' : s.num === state.step ? 'active' : 'pending'}">${s.num < state.step ? '✓' : s.num}</div>
        ${i < STEPS.length - 1 ? `<div class="step-line ${s.num < state.step ? 'completed' : ''}"></div>` : ''}
      `).join('')}
    </div>
  `;
}

function renderStep() {
  switch (state.step) {
    case 1: return renderOccupationSelect();
    case 2: return renderModuleConfig();
    case 3: return renderBrandConfig();
    case 4: return renderAgentQuantity();
    case 5: return renderDeployPreview();
    default: return '';
  }
}

// ── Admin Dashboard ─────────────────────────────────────────────────────────

function renderDashboard() {
  const totalMRR = DEPLOYED_APPS.reduce((s, a) => s + a.mrr, 0);
  const totalAgents = DEPLOYED_APPS.reduce((s, a) => s + a.agents, 0);
  const liveApps = DEPLOYED_APPS.filter(a => a.status === 'live').length;
  const avgHealth = (DEPLOYED_APPS.reduce((s, a) => s + a.health, 0) / DEPLOYED_APPS.length).toFixed(1);

  return `
    <div class="dash-metrics">
      ${renderMetricCard('Deployed Apps', `${liveApps} Live`, `${DEPLOYED_APPS.length} total`, 'var(--ck-gold)')}
      ${renderMetricCard('Total AI Agents', totalAgents.toLocaleString(), '9 divisions active', 'var(--ck-blue)')}
      ${renderMetricCard('Monthly Revenue', '$' + totalMRR.toLocaleString(), 'across all deployments', 'var(--ck-green)')}
      ${renderMetricCard('Fleet Health', avgHealth + '%', 'all systems nominal', parseFloat(avgHealth) > 97 ? 'var(--ck-green)' : 'var(--ck-amber)')}
    </div>

    <div class="dash-grid">
      <div class="dash-panel">
        <div class="dash-panel-header">
          <span class="dash-panel-title">Deployed Applications</span>
          <button class="btn btn-ghost" style="padding:8px 16px;font-size:0.78rem;" id="btn-new-app">+ New App</button>
        </div>
        <div class="dash-app-list">
          ${DEPLOYED_APPS.map(renderAppRow).join('')}
        </div>
      </div>

      <div class="dash-sidebar">
        ${renderGovernancePanel()}
        ${renderSubscriptionBreakdown()}
        ${renderRecentActivity()}
      </div>
    </div>
  `;
}

function renderMetricCard(label, value, sub, color) {
  return `
    <div class="dash-metric">
      <div class="dash-metric-label">${label}</div>
      <div class="dash-metric-value" style="color:${color};">${value}</div>
      <div class="dash-metric-sub">${sub}</div>
    </div>
  `;
}

function renderAppRow(app) {
  const statusColors = { live: 'var(--ck-green)', staging: 'var(--ck-amber)', offline: 'var(--ck-red)' };
  return `
    <div class="dash-app-row">
      <div style="display:flex;align-items:center;gap:14px;flex:1;">
        <div class="dash-app-icon" style="background:${app.color};">
          ${app.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div class="dash-app-name">${app.name}</div>
          <div class="dash-app-meta">${app.industry} &middot; ${app.tier} &middot; ${app.agents} agents</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="text-align:right;">
          <div style="font-family:var(--font-mono);font-size:0.85rem;color:#fff;font-weight:600;">$${app.mrr.toLocaleString()}</div>
          <div style="font-size:0.7rem;color:#71717a;">/month</div>
        </div>
        <div class="dash-health-bar">
          <div class="dash-health-fill" style="width:${app.health}%;background:${app.health > 97 ? 'var(--ck-green)' : app.health > 90 ? 'var(--ck-amber)' : 'var(--ck-red)'};"></div>
        </div>
        <div class="dash-status" style="color:${statusColors[app.status]};">
          <span class="dash-status-dot" style="background:${statusColors[app.status]};"></span>
          ${app.status}
        </div>
      </div>
    </div>
  `;
}

function renderGovernancePanel() {
  return `
    <div class="dash-card dash-governance">
      <div class="dash-panel-title" style="margin-bottom:16px;">Governance Compliance</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div class="dash-compliance-ring">
          <svg viewBox="0 0 36 36" width="56" height="56">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--ck-green)" stroke-width="3" stroke-dasharray="100, 100" stroke-linecap="round"/>
          </svg>
          <span class="dash-compliance-pct">100%</span>
        </div>
        <div>
          <div style="font-size:0.85rem;color:#fff;font-weight:600;">Fully Compliant</div>
          <div style="font-size:0.72rem;color:#71717a;">Compendium v1.0</div>
        </div>
      </div>
      <div class="dash-principles">
        <div class="dash-principle"><span class="dash-principle-dot" style="background:var(--ck-gold);"></span>Service</div>
        <div class="dash-principle"><span class="dash-principle-dot" style="background:var(--ck-blue);"></span>Stewardship</div>
        <div class="dash-principle"><span class="dash-principle-dot" style="background:var(--ck-green);"></span>Security</div>
      </div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--ck-border);font-size:0.7rem;color:#52525b;font-style:italic;text-align:center;">
        Founded on Truth, Liberty, and the Irrevocable Rights of Free Speech
      </div>
    </div>
  `;
}

function renderSubscriptionBreakdown() {
  const tiers = { Starter: 0, Pro: 0, Enterprise: 0 };
  DEPLOYED_APPS.forEach(a => { tiers[a.tier]++; });
  return `
    <div class="dash-card">
      <div class="dash-panel-title" style="margin-bottom:16px;">Subscription Tiers</div>
      ${Object.entries(tiers).map(([name, count]) => {
        const colors = { Starter: 'var(--ck-purple)', Pro: 'var(--ck-blue)', Enterprise: 'var(--ck-gold)' };
        const prices = { Starter: '$299', Pro: '$1,500', Enterprise: '$5K-$25K' };
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${name !== 'Enterprise' ? 'border-bottom:1px solid var(--ck-border);' : ''}">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="dash-status-dot" style="background:${colors[name]};"></span>
              <span style="font-size:0.85rem;color:#d4d4d8;">${name}</span>
            </div>
            <div style="text-align:right;">
              <span style="font-family:var(--font-mono);font-size:0.8rem;color:#fff;font-weight:600;">${count}</span>
              <span style="font-size:0.7rem;color:#71717a;margin-left:4px;">${prices[name]}/mo</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRecentActivity() {
  const events = [
    { time: '2 min ago', text: 'Fleet health scan completed', color: 'var(--ck-green)' },
    { time: '18 min ago', text: 'TC Legal AI — 3 agents auto-repaired', color: 'var(--ck-amber)' },
    { time: '1 hr ago', text: 'Marina Ops AI — module update deployed', color: 'var(--ck-blue)' },
    { time: '3 hr ago', text: 'Stuart Med Group promoted to staging', color: 'var(--ck-purple)' },
    { time: '6 hr ago', text: 'Coastal Key PM — governance audit passed', color: 'var(--ck-gold)' }
  ];
  return `
    <div class="dash-card">
      <div class="dash-panel-title" style="margin-bottom:16px;">Recent Activity</div>
      ${events.map(e => `
        <div style="display:flex;gap:10px;padding:6px 0;">
          <span class="dash-status-dot" style="background:${e.color};margin-top:6px;"></span>
          <div>
            <div style="font-size:0.8rem;color:#d4d4d8;">${e.text}</div>
            <div style="font-size:0.68rem;color:#52525b;">${e.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Step 1: Occupation Selection ─────────────────────────────────────────────

function renderOccupationSelect() {
  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:2rem;margin-bottom:8px;">Select Your Industry</h1>
      <p style="color:#71717a;font-size:0.9rem;">Choose your occupation to load a pre-configured AI-powered mobile app template.</p>
    </div>
    <div class="occupation-grid">
      ${INDUSTRY_TEMPLATES.map((t) => `
        <div class="occupation-card${state.occupation === t.id ? ' selected' : ''}" data-occupation="${t.id}">
          <div class="occupation-icon">${t.icon}</div>
          <div class="occupation-name">${t.name}</div>
          <div class="occupation-desc">${t.description}</div>
          ${t.isDefault ? '<div style="margin-top:12px;"><span class="tag tag-gold">Recommended</span></div>' : ''}
        </div>
      `).join('')}
      <div class="occupation-card" data-occupation="custom" style="border-style:dashed;">
        <div class="occupation-icon" style="opacity:0.5;">+</div>
        <div class="occupation-name">Custom</div>
        <div class="occupation-desc">Build from scratch with a blank template</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <button class="btn btn-primary" id="btn-next" ${!state.occupation ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Continue to Modules</button>
    </div>
  `;
}

// ── Step 2: Module Configuration ─────────────────────────────────────────────

function renderModuleConfig() {
  const template = getTemplate(state.occupation);
  const modules = getTemplateModules(state.occupation);
  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:1.75rem;margin-bottom:8px;">Configure Modules</h1>
      <p style="color:#71717a;font-size:0.9rem;">Enable or disable modules for your ${template.name} mobile app.</p>
    </div>
    <div class="module-list">
      ${modules.map((m) => {
        const enabled = state.modules[m.id] !== undefined ? state.modules[m.id] : m.enabled;
        return `
          <div class="module-row${enabled ? ' enabled' : ''}" data-module="${m.id}">
            <div class="module-info">
              <div class="module-name">${m.label}</div>
              <div class="module-desc">KPIs: ${m.kpis.join(', ')}</div>
            </div>
            <div class="toggle${enabled ? ' on' : ''}" data-toggle="${m.id}">
              <div class="toggle-knob"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:32px;">
      <button class="btn btn-ghost" id="btn-back">Back</button>
      <button class="btn btn-primary" id="btn-next">Continue to Branding</button>
    </div>
  `;
}

// ── Step 3: Brand Configuration ──────────────────────────────────────────────

function renderBrandConfig() {
  const template = getTemplate(state.occupation);
  const b = state.branding.primaryColor ? state.branding : template.branding;
  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:1.75rem;margin-bottom:8px;">Customize Branding</h1>
      <p style="color:#71717a;font-size:0.9rem;">Set your brand colors and visual identity.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div>
        <div style="margin-bottom:24px;">
          <label style="font-size:0.78rem;color:#71717a;display:block;margin-bottom:8px;">Primary Color</label>
          <div style="display:flex;align-items:center;gap:12px;">
            <input type="color" value="${b.primaryColor}" id="color-primary" style="width:48px;height:48px;border:none;border-radius:8px;cursor:pointer;background:none;" />
            <span style="font-family:var(--font-mono);font-size:0.85rem;color:#d4d4d8;">${b.primaryColor}</span>
          </div>
        </div>
        <div style="margin-bottom:24px;">
          <label style="font-size:0.78rem;color:#71717a;display:block;margin-bottom:8px;">App Name</label>
          <input type="text" value="${template.name} AI" style="width:100%;background:var(--ck-surface);border:1px solid var(--ck-border);border-radius:var(--radius-md);padding:12px 16px;color:#fff;font-size:0.9rem;font-family:var(--font-body);outline:none;" />
        </div>
        <div>
          <label style="font-size:0.78rem;color:#71717a;display:block;margin-bottom:8px;">Tagline</label>
          <input type="text" value="AI-Powered ${template.name} Operations" style="width:100%;background:var(--ck-surface);border:1px solid var(--ck-border);border-radius:var(--radius-md);padding:12px 16px;color:#fff;font-size:0.9rem;font-family:var(--font-body);outline:none;" />
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;">
        <div class="phone-preview">
          <div class="phone-notch"></div>
          <div class="phone-screen" style="background:${b.background};padding:12px;">
            <div style="width:28px;height:28px;background:${b.primaryColor};border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:900;color:#0a0a0a;">CK</div>
            <div style="font-size:0.55rem;color:#fff;font-weight:700;margin-bottom:12px;">${template.name} AI</div>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;margin-bottom:8px;">
              <div style="font-size:0.45rem;color:${b.primaryColor};text-transform:uppercase;letter-spacing:0.1em;">Revenue</div>
              <div style="font-size:0.8rem;font-weight:700;color:#fff;">$0</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
              <div style="background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;text-align:center;"><div style="font-size:0.5rem;color:#71717a;">Leads</div><div style="font-size:0.6rem;color:#fff;font-weight:700;">0</div></div>
              <div style="background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;text-align:center;"><div style="font-size:0.5rem;color:#71717a;">Agents</div><div style="font-size:0.6rem;color:#fff;font-weight:700;">${state.agentCount}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:32px;">
      <button class="btn btn-ghost" id="btn-back">Back</button>
      <button class="btn btn-primary" id="btn-next">Configure AI Agents</button>
    </div>
  `;
}

// ── Step 4: Agent Quantity Toggle (BUILDER ONLY) ─────────────────────────────

function renderAgentQuantity() {
  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:1.75rem;margin-bottom:8px;">AI Agent Configuration</h1>
      <p style="color:#71717a;font-size:0.9rem;">Select the number of AI agents for your mobile app deployment.</p>
      <p style="color:var(--ck-gold);font-size:0.72rem;margin-top:8px;letter-spacing:0.06em;text-transform:uppercase;">Builder-exclusive feature — not available to end-user apps</p>
    </div>
    <div class="agent-quantity-panel">
      <div style="font-size:0.78rem;color:var(--ck-gold);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">Select Agent Fleet Size</div>
      <div class="agent-tiers">
        <div class="agent-tier${state.agentTier === 'starter' ? ' selected' : ''}" data-tier="starter">
          <div class="tier-name">Starter</div>
          <div class="tier-agents">10</div>
          <div style="font-size:0.72rem;color:#71717a;margin-bottom:8px;">AI Agents</div>
          <div class="tier-price">$299</div>
          <div class="tier-interval">/month</div>
        </div>
        <div class="agent-tier${state.agentTier === 'pro' ? ' selected' : ''}" data-tier="pro">
          <div class="tier-name">Pro</div>
          <div class="tier-agents">50</div>
          <div style="font-size:0.72rem;color:#71717a;margin-bottom:8px;">AI Agents</div>
          <div class="tier-price">$1,500</div>
          <div class="tier-interval">/month</div>
          <div style="margin-top:8px;"><span class="tag tag-gold">Popular</span></div>
        </div>
        <div class="agent-tier${state.agentTier === 'enterprise' ? ' selected' : ''}" data-tier="enterprise">
          <div class="tier-name">Enterprise</div>
          <div class="tier-agents">200+</div>
          <div style="font-size:0.72rem;color:#71717a;margin-bottom:8px;">AI Agents</div>
          <div class="tier-price">$5,000 — $25,000</div>
          <div class="tier-interval">/month (custom)</div>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:32px;">
      <button class="btn btn-ghost" id="btn-back">Back</button>
      <button class="btn btn-primary" id="btn-next" ${!state.agentTier ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Preview & Deploy</button>
    </div>
  `;
}

// ── Step 5: Deploy Preview ───────────────────────────────────────────────────

function renderDeployPreview() {
  const template = getTemplate(state.occupation);
  const tierMap = { starter: { agents: 10, price: '$299/mo' }, pro: { agents: 50, price: '$1,500/mo' }, enterprise: { agents: '200+', price: '$5K-$25K/mo' } };
  const tier = tierMap[state.agentTier] || tierMap.starter;

  return `
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:1.75rem;margin-bottom:8px;">Ready to Deploy</h1>
      <p style="color:#71717a;font-size:0.9rem;">Review your configuration and launch your AI-powered mobile app.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div>
        <div style="background:var(--ck-surface);border:1px solid var(--ck-border);border-radius:var(--radius-lg);padding:24px;margin-bottom:16px;">
          <div style="font-size:0.72rem;color:var(--ck-gold);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">Configuration Summary</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#71717a;font-size:0.85rem;">Industry</span><span style="color:#fff;font-size:0.85rem;font-weight:600;">${template.name}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#71717a;font-size:0.85rem;">AI Agents</span><span style="color:var(--ck-gold);font-size:0.85rem;font-weight:600;">${tier.agents}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#71717a;font-size:0.85rem;">Subscription</span><span style="color:#fff;font-size:0.85rem;font-weight:600;">${tier.price}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#71717a;font-size:0.85rem;">Modules</span><span style="color:#fff;font-size:0.85rem;font-weight:600;">6 active</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#71717a;font-size:0.85rem;">Platform</span><span style="color:#fff;font-size:0.85rem;font-weight:600;">Cloudflare Pages (PWA)</span></div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,rgba(196,163,90,0.08),rgba(196,163,90,0.02));border:2px solid var(--ck-gold-dim);border-radius:var(--radius-lg);padding:24px;text-align:center;">
          <div style="font-size:0.72rem;color:var(--ck-gold);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Governed By</div>
          <div style="font-size:0.85rem;color:#d4d4d8;font-style:italic;">Coastal Key Sovereign Governance Compendium v1.0</div>
          <div style="font-size:0.7rem;color:#71717a;margin-top:8px;">Service &middot; Stewardship &middot; Security</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:center;">
        <div class="phone-preview">
          <div class="phone-notch"></div>
          <div class="phone-screen" style="background:#0a0a0a;padding:12px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
              <div style="width:24px;height:24px;background:${template.branding.primaryColor};border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:0.5rem;font-weight:900;color:#0a0a0a;">CK</div>
              <span style="font-size:0.55rem;color:#fff;font-weight:700;">${template.name} AI</span>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:8px;margin-bottom:6px;">
              <div style="font-size:0.4rem;color:${template.branding.primaryColor};text-transform:uppercase;">Revenue</div>
              <div style="font-size:0.7rem;font-weight:700;color:#fff;">Ready to Launch</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">
              <div style="background:rgba(255,255,255,0.05);border-radius:4px;padding:4px;text-align:center;font-size:0.4rem;color:#71717a;">Agents: ${tier.agents}</div>
              <div style="background:rgba(255,255,255,0.05);border-radius:4px;padding:4px;text-align:center;font-size:0.4rem;color:#71717a;">Skills: Active</div>
            </div>
            <div style="margin-top:8px;background:${template.branding.primaryColor};border-radius:6px;padding:6px;text-align:center;font-size:0.45rem;font-weight:700;color:#0a0a0a;">LAUNCH APP</div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:40px;">
      <button class="btn btn-ghost" id="btn-back">Back</button>
      <button class="btn btn-primary" id="btn-deploy" style="padding:16px 48px;font-size:1rem;">Deploy Mobile App</button>
    </div>
  `;
}

// ── Event Handlers ───────────────────────────────────────────────────────────

function attachHandlers() {
  // View toggle
  document.querySelectorAll('.view-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      render();
    });
  });

  // New app button (dashboard)
  const newAppBtn = document.getElementById('btn-new-app');
  if (newAppBtn) newAppBtn.addEventListener('click', () => { state.view = 'wizard'; state.step = 1; render(); });

  // Occupation selection
  document.querySelectorAll('.occupation-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.occupation = card.dataset.occupation;
      const template = getTemplate(state.occupation);
      if (template) {
        state.branding = { ...template.branding };
        const mods = getTemplateModules(state.occupation);
        mods.forEach((m) => { state.modules[m.id] = m.enabled; });
      }
      render();
    });
  });

  // Module toggles
  document.querySelectorAll('.toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const id = toggle.dataset.toggle;
      state.modules[id] = !state.modules[id];
      render();
    });
  });

  // Agent tier selection
  document.querySelectorAll('.agent-tier').forEach((tier) => {
    tier.addEventListener('click', () => {
      state.agentTier = tier.dataset.tier;
      state.agentCount = { starter: 10, pro: 50, enterprise: 200 }[state.agentTier] || 10;
      render();
    });
  });

  // Navigation
  const nextBtn = document.getElementById('btn-next');
  const backBtn = document.getElementById('btn-back');
  const deployBtn = document.getElementById('btn-deploy');

  if (nextBtn) nextBtn.addEventListener('click', () => { state.step++; render(); });
  if (backBtn) backBtn.addEventListener('click', () => { state.step--; render(); });
  if (deployBtn) deployBtn.addEventListener('click', () => {
    state.view = 'dashboard';
    render();
  });
}
