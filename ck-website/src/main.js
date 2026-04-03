/**
 * Coastal Key Website — Cloudflare Pages SPA Router
 *
 * Single entry point for coastalkey-pm.com
 * Handles client-side routing for:
 *   /                — Public homepage
 *   /services        — Service offerings
 *   /areas           — Service areas (Treasure Coast)
 *   /about           — Company overview
 *   /contact         — Contact & inquiry form
 *   /portal          — Team portal (auth-gated)
 *   /portal/dashboard — Operational dashboard
 *   /portal/agents   — AI agent fleet monitor
 *   /portal/leads    — Lead pipeline
 *   /portal/tasks    — Task management
 *   /portal/content  — Content calendar
 *   /portal/vendors  — Vendor compliance
 *   /portal/reports  — Reports & analytics
 *   /portal/podcast  — Podcast channel management
 *   /podcast         — Public podcast page
 *
 * All legacy subdomains redirect to this domain via _redirects.
 */

import { initRouter } from './utils/router.js';
import { initAuth } from './utils/auth.js';
import { renderApp } from './components/app.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  renderApp();
  initRouter();

  // Register service worker for PWA support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
