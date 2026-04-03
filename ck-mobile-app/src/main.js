/**
 * Coastal Key Mobile App — Entry Point
 * Initializes the app shell, router, and renders the active screen.
 */

import { renderAppShell, navigateTo } from './components/app-shell.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAppShell();

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const path = window.location.hash.slice(1) || 'home';
    navigateTo(path, false);
  });

  // Initial route
  const initial = window.location.hash.slice(1) || 'home';
  navigateTo(initial, false);
});
