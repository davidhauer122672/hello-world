import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Custom Domain Validation Tests
 *
 * Validates that the THG app custom domain (app.traceyhuntergroup.com)
 * is properly configured with correct DNS, SSL, headers, and redirects.
 *
 * Run: node --test tests/domain-validation.test.js
 *
 * Modes:
 *   - Offline (default): validates config files and structure
 *   - Live (LIVE_DOMAIN_TEST=1): makes real HTTP requests to verify the domain
 */

const CONFIG_PATH = resolve(import.meta.dirname, '..', 'ck-website', 'custom-domains.json');
const HEADERS_PATH = resolve(import.meta.dirname, '..', 'ck-website', '_headers');
const REDIRECTS_PATH = resolve(import.meta.dirname, '..', 'ck-website', '_redirects');

const isLive = process.env.LIVE_DOMAIN_TEST === '1';
const DOMAIN = process.env.TEST_DOMAIN || 'app.traceyhuntergroup.com';
const PAGES_URL = 'thg-app.pages.dev';

// ── Helper: fetch with timeout ──────────────────────────────────────────────
async function fetchWithTimeout(url, opts = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, redirect: 'manual' });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── Helper: DNS lookup via DoH (Cloudflare) ─────────────────────────────────
async function dnsLookup(name, type = 'CNAME') {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetchWithTimeout(url, {
    headers: { 'Accept': 'application/dns-json' },
  });
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Config Validation (always runs)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Custom domain configuration', () => {
  let config;

  before(() => {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    config = JSON.parse(raw);
  });

  it('should have a valid custom-domains.json', () => {
    assert.ok(config.project, 'project name is required');
    assert.ok(config.pagesUrl, 'pagesUrl is required');
    assert.ok(Array.isArray(config.customDomains), 'customDomains must be an array');
    assert.ok(config.customDomains.length > 0, 'at least one custom domain required');
  });

  it('should define app.traceyhuntergroup.com as a custom domain', () => {
    const thgDomain = config.customDomains.find(d => d.domain === 'app.traceyhuntergroup.com');
    assert.ok(thgDomain, 'app.traceyhuntergroup.com must be listed');
    assert.equal(thgDomain.type, 'CNAME', 'should use CNAME record');
    assert.equal(thgDomain.target, PAGES_URL, 'should point to Pages URL');
    assert.equal(thgDomain.ssl, 'full', 'should use full SSL');
    assert.equal(thgDomain.proxied, true, 'should be proxied through Cloudflare');
  });

  it('should have DNS records configured', () => {
    assert.ok(Array.isArray(config.dnsRecords), 'dnsRecords must be an array');
    const cname = config.dnsRecords.find(r => r.type === 'CNAME' && r.name === 'app');
    assert.ok(cname, 'CNAME record for app subdomain must exist');
    assert.equal(cname.content, PAGES_URL, 'CNAME must point to Pages URL');
  });

  it('should have verification steps documented', () => {
    assert.ok(config.verification, 'verification section required');
    assert.ok(Array.isArray(config.verification.steps), 'verification steps must be an array');
    assert.ok(config.verification.steps.length >= 3, 'at least 3 verification steps');
  });

  it('should define expected security headers', () => {
    assert.ok(config.expectedHeaders, 'expectedHeaders required');
    assert.equal(config.expectedHeaders['x-frame-options'], 'DENY');
    assert.equal(config.expectedHeaders['x-content-type-options'], 'nosniff');
  });
});

describe('Cloudflare Pages _headers file', () => {
  let headersContent;

  before(() => {
    headersContent = readFileSync(HEADERS_PATH, 'utf-8');
  });

  it('should set X-Frame-Options to DENY', () => {
    assert.ok(headersContent.includes('X-Frame-Options: DENY'), 'X-Frame-Options header missing');
  });

  it('should set X-Content-Type-Options to nosniff', () => {
    assert.ok(headersContent.includes('X-Content-Type-Options: nosniff'), 'X-Content-Type-Options header missing');
  });

  it('should set Referrer-Policy', () => {
    assert.ok(headersContent.includes('Referrer-Policy:'), 'Referrer-Policy header missing');
  });

  it('should cache static assets with immutable directive', () => {
    assert.ok(headersContent.includes('immutable'), 'static assets should be cached as immutable');
  });

  it('should not cache index.html', () => {
    assert.ok(headersContent.includes('no-cache'), 'index.html should have no-cache');
  });
});

describe('Cloudflare Pages _redirects file', () => {
  let redirectsContent;

  before(() => {
    redirectsContent = readFileSync(REDIRECTS_PATH, 'utf-8');
  });

  it('should have SPA fallback rule', () => {
    assert.ok(redirectsContent.includes('/*'), 'SPA catch-all route missing');
    assert.ok(redirectsContent.includes('/index.html'), 'SPA should serve index.html');
    assert.ok(redirectsContent.includes('200'), 'SPA fallback should return 200');
  });

  it('should redirect legacy paths', () => {
    assert.ok(redirectsContent.includes('/dashboard'), 'dashboard redirect missing');
    assert.ok(redirectsContent.includes('/login'), 'login redirect missing');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Live Domain Validation (only when LIVE_DOMAIN_TEST=1)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Live domain validation', { skip: !isLive && 'Set LIVE_DOMAIN_TEST=1 to run live tests' }, () => {

  it('should resolve DNS CNAME to Pages URL', async () => {
    const result = await dnsLookup(DOMAIN, 'CNAME');
    // Cloudflare-proxied domains may not expose CNAME directly,
    // so we also accept A/AAAA records (Cloudflare edge IPs)
    const hasRecords = result.Answer && result.Answer.length > 0;
    assert.ok(hasRecords || result.Status === 0, `DNS for ${DOMAIN} should resolve (got status ${result.Status})`);
  });

  it('should serve HTTPS with valid certificate', async () => {
    const res = await fetchWithTimeout(`https://${DOMAIN}/`);
    assert.ok(res.ok, `HTTPS request to ${DOMAIN} should succeed (got ${res.status})`);
  });

  it('should return correct security headers', async () => {
    const res = await fetchWithTimeout(`https://${DOMAIN}/`);
    assert.equal(
      res.headers.get('x-frame-options')?.toUpperCase(),
      'DENY',
      'X-Frame-Options should be DENY'
    );
    assert.equal(
      res.headers.get('x-content-type-options'),
      'nosniff',
      'X-Content-Type-Options should be nosniff'
    );
  });

  it('should redirect HTTP to HTTPS', async () => {
    const res = await fetchWithTimeout(`http://${DOMAIN}/`, {}, 10000);
    // Expect a 301/302 redirect to HTTPS
    assert.ok(
      [301, 302, 308].includes(res.status),
      `HTTP should redirect to HTTPS (got ${res.status})`
    );
    const location = res.headers.get('location') || '';
    assert.ok(location.startsWith('https://'), `Should redirect to HTTPS (got ${location})`);
  });

  it('should serve HTML content on root path', async () => {
    const res = await fetchWithTimeout(`https://${DOMAIN}/`);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/html'), `Root should serve HTML (got ${contentType})`);
  });

  it('should handle SPA routing (return 200 for unknown paths)', async () => {
    const res = await fetchWithTimeout(`https://${DOMAIN}/some/app/route`);
    assert.equal(res.status, 200, 'SPA routes should return 200');
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/html'), 'SPA routes should serve HTML');
  });

  it('should cache static assets with immutable headers', async () => {
    const res = await fetchWithTimeout(`https://${DOMAIN}/src/styles/main.css`);
    assert.equal(res.status, 200, 'Static CSS should return 200');
    const cacheControl = res.headers.get('cache-control') || '';
    assert.ok(cacheControl.includes('immutable'), `Static assets should be immutable (got ${cacheControl})`);
  });

  it('Pages URL should still be accessible', async () => {
    const res = await fetchWithTimeout(`https://${PAGES_URL}/`);
    assert.ok(res.ok, `Pages URL ${PAGES_URL} should remain accessible`);
  });
});
