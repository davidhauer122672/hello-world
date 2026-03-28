/**
 * Client-side SPA Router for Cloudflare Pages
 *
 * Uses History API for clean URLs.
 * Cloudflare Pages _redirects sends all paths to index.html.
 */

const routes = new Map();
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  dispatch();
}

function dispatch() {
  const path = window.location.pathname;

  // Clean up previous page
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Exact match first, then prefix match for portal sub-routes
  let handler = routes.get(path);
  if (!handler) {
    for (const [pattern, h] of routes) {
      if (path.startsWith(pattern + '/') || path === pattern) {
        handler = h;
        break;
      }
    }
  }

  if (!handler) handler = routes.get('/404');

  const main = document.getElementById('main-content');
  if (main && handler) {
    currentCleanup = handler(main, path) || null;
  }

  // Update active nav
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === path || path.startsWith(el.dataset.nav + '/'));
  });

  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

export function initRouter() {
  window.addEventListener('popstate', dispatch);

  // Intercept all internal link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      navigate(href);
    }
  });

  dispatch();
}
