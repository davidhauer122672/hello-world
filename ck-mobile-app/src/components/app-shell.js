/**
 * Coastal Key Mobile App — App Shell
 * Persistent header + bottom tab bar + screen router
 */

import { setState, getState, subscribe } from '../utils/state.js';
import { renderHome, initHome } from './home.js';
import { renderLeads, initLeads } from './leads.js';
import { renderAISkills } from './ai-skills.js';
import { renderContent } from './content.js';
import { renderMarket, initMarket } from './market.js';
import { renderSystems, initSystems } from './systems.js';
import { renderSettings } from './settings.js';

const TABS = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'leads', label: 'Leads', icon: '⚑' },
  { id: 'skills', label: 'AI Skills', icon: '⚙' },
  { id: 'content', label: 'Content', icon: '✎' },
  { id: 'market', label: 'Market', icon: '↗' },
  { id: 'systems', label: 'Systems', icon: '☰' }
];

const SCREENS = {
  home: renderHome,
  leads: renderLeads,
  skills: renderAISkills,
  content: renderContent,
  market: renderMarket,
  systems: renderSystems,
  settings: renderSettings
};

const SCREEN_INIT = {
  home: initHome,
  leads: initLeads,
  market: initMarket,
  systems: initSystems
};

export function renderAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="app-header">
      <div class="header-brand">
        <div class="header-logo">CK</div>
        <span class="header-title">Coastal Key</span>
      </div>
      <div class="header-actions">
        <button class="header-btn" id="btn-voice" title="Voice Command" aria-label="Voice Command">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
        </button>
        <button class="header-btn" id="btn-notifications" title="Notifications" aria-label="Notifications" style="position:relative;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="badge" style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:var(--ck-red);border-radius:50%;border:2px solid var(--ck-black);"></span>
        </button>
        <button class="header-btn" id="btn-profile" title="Settings" aria-label="Profile" onclick="window.location.hash='settings'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </header>
    <main class="app-content" id="screen-container"></main>
    <nav class="tab-bar" id="tab-bar">
      ${TABS.map((t) => `
        <button class="tab-item${getState('currentTab') === t.id ? ' active' : ''}" data-tab="${t.id}" aria-label="${t.label}">
          <span class="tab-icon">${t.icon}</span>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `;

  // Tab click handlers
  document.getElementById('tab-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-item');
    if (!btn) return;
    navigateTo(btn.dataset.tab);
  });

  // Subscribe to tab changes
  subscribe('currentTab', (tab) => {
    document.querySelectorAll('.tab-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    renderScreen(tab);
  });
}

export function navigateTo(tab, pushState = true) {
  if (pushState) window.location.hash = tab;
  setState('currentTab', tab);
}

function renderScreen(tab) {
  const container = document.getElementById('screen-container');
  if (!container) return;
  const renderer = SCREENS[tab] || SCREENS.home;
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = renderer();
  container.appendChild(screen);

  const init = SCREEN_INIT[tab];
  if (init) init();
}
