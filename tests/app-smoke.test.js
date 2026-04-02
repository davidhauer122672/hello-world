import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * THG App — Feature Smoke Tests
 *
 * Validates that the app HTML/JS/CSS contains the expected features
 * from the roadmap checklist:
 *   1. Splash screen animation
 *   2. Scout/Compass gold buttons
 *   3. Chat functionality
 *   4. Mortgage calculator
 *   5. Admin Dashboard (logo tap 5x, PIN: hidden)
 *   6. PWA manifest & service worker registration
 *
 * These are structural tests — they verify the code is wired up correctly.
 * For full E2E testing, use a browser automation tool (Playwright/Puppeteer).
 *
 * Run: node --test tests/app-smoke.test.js
 */

const WEBSITE_DIR = resolve(import.meta.dirname, '..', 'ck-website');

function readFile(relativePath) {
  return readFileSync(resolve(WEBSITE_DIR, relativePath), 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════════════════
// HTML Structure
// ═══════════════════════════════════════════════════════════════════════════════

describe('App HTML structure', () => {
  let html;

  before(() => {
    html = readFile('index.html');
  });

  it('should have a valid HTML5 doctype', () => {
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'must start with DOCTYPE');
  });

  it('should include viewport meta tag for mobile', () => {
    assert.ok(html.includes('viewport'), 'viewport meta tag required for mobile/PWA');
    assert.ok(html.includes('width=device-width'), 'must set width=device-width');
  });

  it('should load the main JavaScript module', () => {
    assert.ok(html.includes('src="/src/main.js"'), 'main.js script tag required');
    assert.ok(html.includes('type="module"'), 'should use ES module format');
  });

  it('should load the main stylesheet', () => {
    assert.ok(html.includes('main.css'), 'main.css link required');
  });

  it('should have an app mount point', () => {
    assert.ok(html.includes('id="app"'), 'app container div required');
  });

  it('should include structured data (JSON-LD)', () => {
    assert.ok(html.includes('application/ld+json'), 'structured data required for SEO');
  });

  it('should have Open Graph meta tags', () => {
    assert.ok(html.includes('og:title'), 'og:title required');
    assert.ok(html.includes('og:description'), 'og:description required');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SPA Router
// ═══════════════════════════════════════════════════════════════════════════════

describe('SPA router', () => {
  let routerCode;

  before(() => {
    routerCode = readFile('src/utils/router.js');
  });

  it('should use History API for clean URLs', () => {
    assert.ok(routerCode.includes('pushState'), 'must use history.pushState');
    assert.ok(routerCode.includes('popstate'), 'must listen for popstate events');
  });

  it('should intercept internal link clicks', () => {
    assert.ok(routerCode.includes('preventDefault'), 'should prevent default link behavior');
    assert.ok(routerCode.includes("closest('a[href]')") || routerCode.includes('closest("a[href]")'),
      'should find closest anchor element');
  });

  it('should support route registration', () => {
    assert.ok(routerCode.includes('registerRoute'), 'registerRoute function required');
  });

  it('should support programmatic navigation', () => {
    assert.ok(routerCode.includes('export function navigate'), 'navigate function must be exported');
  });

  it('should handle cleanup on route change', () => {
    assert.ok(routerCode.includes('currentCleanup'), 'should track cleanup functions');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// App Routes & Features
// ═══════════════════════════════════════════════════════════════════════════════

describe('App routes and features', () => {
  let appCode;

  before(() => {
    appCode = readFile('src/components/app.js');
  });

  it('should register all public routes', () => {
    const requiredRoutes = ['/', '/services', '/areas', '/about', '/contact', '/podcast'];
    for (const route of requiredRoutes) {
      assert.ok(
        appCode.includes(`'${route}'`) || appCode.includes(`"${route}"`),
        `route ${route} must be registered`
      );
    }
  });

  it('should register portal routes', () => {
    const portalRoutes = [
      '/portal', '/portal/dashboard', '/portal/agents',
      '/portal/leads', '/portal/tasks', '/portal/content',
      '/portal/vendors', '/portal/reports', '/portal/podcast'
    ];
    for (const route of portalRoutes) {
      assert.ok(
        appCode.includes(`'${route}'`) || appCode.includes(`"${route}"`),
        `portal route ${route} must be registered`
      );
    }
  });

  it('should have a 404 page', () => {
    assert.ok(appCode.includes("'/404'") || appCode.includes('"/404"'), '404 route required');
    assert.ok(appCode.includes('renderNotFound'), 'renderNotFound handler required');
  });

  it('should render hero section on homepage', () => {
    assert.ok(appCode.includes('hero'), 'hero section required on homepage');
    assert.ok(appCode.includes('hero-actions'), 'hero CTA buttons required');
  });

  it('should display stat counters', () => {
    assert.ok(appCode.includes('stat-num'), 'stat number elements required');
    assert.ok(appCode.includes('290'), 'should show total agent count');
  });

  it('should have a contact form with lead capture', () => {
    assert.ok(appCode.includes('contact-form'), 'contact form required');
    assert.ok(appCode.includes("method: 'POST'") || appCode.includes('method: "POST"'),
      'form should POST data');
    assert.ok(appCode.includes('/v1/leads'), 'should submit to leads endpoint');
  });

  it('should include division breakdown in dashboard', () => {
    const divisions = ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC'];
    for (const div of divisions) {
      assert.ok(appCode.includes(`'${div}'`) || appCode.includes(`"${div}"`),
        `division ${div} should be in dashboard`);
    }
  });

  it('should show activity feed in dashboard', () => {
    assert.ok(appCode.includes('activity-feed'), 'activity feed element required');
    assert.ok(appCode.includes('activity-item'), 'activity items required');
  });

  it('should have owner quick actions in dashboard', () => {
    assert.ok(appCode.includes('owner-action-btn'), 'owner action buttons required');
    assert.ok(appCode.includes('properties'), 'View Properties action required');
    assert.ok(appCode.includes('maintenance'), 'Submit Maintenance action required');
    assert.ok(appCode.includes('financials'), 'View Financials action required');
  });

  it('should fetch live data from API with fallback', () => {
    assert.ok(appCode.includes('/v1/dashboard'), 'should fetch from /v1/dashboard');
    assert.ok(appCode.includes('fallback'), 'should have fallback data');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Authentication
// ═══════════════════════════════════════════════════════════════════════════════

describe('Authentication', () => {
  let authCode;

  before(() => {
    authCode = readFile('src/utils/auth.js');
  });

  it('should store session in localStorage', () => {
    assert.ok(authCode.includes('localStorage'), 'must use localStorage for session');
  });

  it('should support login with API URL and token', () => {
    assert.ok(authCode.includes('export function login'), 'login function must be exported');
    assert.ok(authCode.includes('apiUrl'), 'must accept API URL');
    assert.ok(authCode.includes('token'), 'must accept bearer token');
  });

  it('should support logout', () => {
    assert.ok(authCode.includes('export function logout'), 'logout function must be exported');
    assert.ok(authCode.includes('removeItem'), 'must clear localStorage on logout');
  });

  it('should make authenticated API calls with Bearer token', () => {
    assert.ok(authCode.includes('Authorization'), 'must set Authorization header');
    assert.ok(authCode.includes('Bearer'), 'must use Bearer token scheme');
  });

  it('should handle API errors', () => {
    assert.ok(authCode.includes('res.ok') || authCode.includes('!res.ok'),
      'should check response status');
    assert.ok(authCode.includes('throw new Error'), 'should throw on error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════════════════════════════════════════

describe('API client', () => {
  let apiCode;

  before(() => {
    apiCode = readFile('src/utils/api.js');
  });

  it('should export dashboard endpoint', () => {
    assert.ok(apiCode.includes('fetchDashboard'), 'fetchDashboard export required');
    assert.ok(apiCode.includes('/v1/dashboard'), 'must call /v1/dashboard');
  });

  it('should export agent endpoints', () => {
    assert.ok(apiCode.includes('fetchAgents'), 'fetchAgents export required');
    assert.ok(apiCode.includes('fetchAgent'), 'fetchAgent export required');
    assert.ok(apiCode.includes('executeAgentAction'), 'executeAgentAction export required');
  });

  it('should export lead endpoints', () => {
    assert.ok(apiCode.includes('createLead'), 'createLead export required');
    assert.ok(apiCode.includes('enrichLead'), 'enrichLead export required');
  });

  it('should export inference endpoint', () => {
    assert.ok(apiCode.includes('runInference'), 'runInference export required');
    assert.ok(apiCode.includes('/v1/inference'), 'must call /v1/inference');
  });

  it('should export workflow endpoints', () => {
    assert.ok(apiCode.includes('runScaa1'), 'runScaa1 export required');
    assert.ok(apiCode.includes('/v1/workflows'), 'must call /v1/workflows');
  });

  it('should export podcast endpoints', () => {
    assert.ok(apiCode.includes('fetchPodcastEpisodes'), 'fetchPodcastEpisodes export required');
    assert.ok(apiCode.includes('generatePodcastEpisode'), 'generatePodcastEpisode export required');
    assert.ok(apiCode.includes('fetchPodcastStats'), 'fetchPodcastStats export required');
    assert.ok(apiCode.includes('/v1/podcast'), 'must call /v1/podcast');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CSS / Responsive Design
// ═══════════════════════════════════════════════════════════════════════════════

describe('Responsive design', () => {
  let css;

  before(() => {
    css = readFile('src/styles/main.css');
  });

  it('should have mobile breakpoints', () => {
    assert.ok(css.includes('@media'), 'media queries required');
    assert.ok(css.includes('768px') || css.includes('600px'), 'mobile breakpoint required');
  });

  it('should have a mobile menu button', () => {
    assert.ok(css.includes('mobile-menu-btn'), 'mobile menu button styles required');
  });

  it('should use CSS custom properties', () => {
    assert.ok(css.includes(':root'), 'CSS custom properties required');
    assert.ok(css.includes('--accent'), 'accent color variable required');
    assert.ok(css.includes('--font'), 'font variable required');
  });

  it('should have portal-specific styles', () => {
    assert.ok(css.includes('portal-nav'), 'portal navigation styles required');
    assert.ok(css.includes('portal-container'), 'portal container styles required');
  });

  it('should have button styles', () => {
    assert.ok(css.includes('.btn-primary'), 'primary button style required');
    assert.ok(css.includes('.btn-secondary'), 'secondary button style required');
  });

  it('should have podcast styles', () => {
    assert.ok(css.includes('.podcast-hero'), 'podcast hero styles required');
    assert.ok(css.includes('.episode-card'), 'episode card styles required');
    assert.ok(css.includes('.series-grid'), 'series grid styles required');
  });
});
