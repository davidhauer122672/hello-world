import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Coastal Key Website — Smoke Tests
 *
 * Validates that the website reverse proxy, API gateway proxy,
 * security headers, and subdomain consolidation are properly configured.
 *
 * Run: node --test tests/app-smoke.test.js
 */

const WEBSITE_DIR = resolve(import.meta.dirname, '..', 'ck-website');

function readFile(relativePath) {
  return readFileSync(resolve(WEBSITE_DIR, relativePath), 'utf-8');
}

function fileExists(relativePath) {
  return existsSync(resolve(WEBSITE_DIR, relativePath));
}

// ── Reverse Proxy Worker ──

describe('Reverse proxy worker', () => {
  let workerCode;

  before(() => {
    workerCode = readFile('_worker.js');
  });

  it('should define Manus origin', () => {
    assert.ok(workerCode.includes('MANUS_ORIGIN'), 'MANUS_ORIGIN constant required');
    assert.ok(workerCode.includes('manus.space'), 'must point to Manus origin');
  });

  it('should define canonical domain', () => {
    assert.ok(workerCode.includes('coastalkey-pm.com'), 'canonical domain required');
  });

  it('should define API gateway origin', () => {
    assert.ok(workerCode.includes('API_GATEWAY_ORIGIN'), 'API_GATEWAY_ORIGIN constant required');
  });

  it('should proxy /v1/* to API gateway', () => {
    assert.ok(workerCode.includes("/v1/"), 'must check for /v1/ prefix');
    assert.ok(workerCode.includes('API_GATEWAY_ORIGIN'), 'must route to API gateway');
  });

  it('should serve custom robots.txt', () => {
    assert.ok(workerCode.includes('robots.txt'), 'must handle robots.txt');
  });

  it('should rewrite URLs in responses', () => {
    assert.ok(workerCode.includes('rewriteUrls') || workerCode.includes('replaceAll'),
      'must rewrite origin URLs in responses');
  });

  it('should set security headers', () => {
    assert.ok(workerCode.includes('X-Content-Type-Options'), 'X-Content-Type-Options required');
    assert.ok(workerCode.includes('Strict-Transport-Security'), 'HSTS required');
    assert.ok(workerCode.includes('Referrer-Policy'), 'Referrer-Policy required');
  });

  it('should handle upstream failures gracefully', () => {
    assert.ok(workerCode.includes('catch') || workerCode.includes('maintenancePage'),
      'must have error handling');
  });

  it('should use ES module export format', () => {
    assert.ok(workerCode.includes('export default'), 'must use ES module default export');
  });

  it('should implement edge caching', () => {
    assert.ok(workerCode.includes('Cache-Control'), 'must set Cache-Control headers');
    assert.ok(workerCode.includes('max-age'), 'must set max-age for caching');
  });
});

// ── API Gateway Proxy ──

describe('API gateway proxy', () => {
  let workerCode;

  before(() => {
    workerCode = readFile('_worker.js');
  });

  it('should return 502 when gateway is unreachable', () => {
    assert.ok(workerCode.includes('502'), 'must return 502 on gateway failure');
    assert.ok(workerCode.includes('API gateway unreachable') || workerCode.includes('unreachable'),
      'must indicate gateway is unreachable');
  });

  it('should forward request method to gateway', () => {
    assert.ok(workerCode.includes('request.method'), 'must forward request method');
  });

  it('should set Host header for gateway', () => {
    assert.ok(workerCode.includes("'Host'") || workerCode.includes('"Host"'),
      'must set Host header for gateway');
  });
});

// ── Security Headers ──

describe('Cloudflare Pages _headers file', () => {
  let headersContent;

  before(() => {
    headersContent = readFile('_headers');
  });

  it('should set X-Content-Type-Options to nosniff', () => {
    assert.ok(headersContent.includes('X-Content-Type-Options: nosniff'),
      'X-Content-Type-Options header required');
  });

  it('should set Referrer-Policy', () => {
    assert.ok(headersContent.includes('Referrer-Policy:'), 'Referrer-Policy required');
  });

  it('should set HSTS', () => {
    assert.ok(headersContent.includes('Strict-Transport-Security:'), 'HSTS required');
  });

  it('should set Permissions-Policy', () => {
    assert.ok(headersContent.includes('Permissions-Policy:'), 'Permissions-Policy required');
  });

  it('should not cache index.html', () => {
    assert.ok(headersContent.includes('no-cache'), 'index.html should have no-cache');
  });
});

// ── Subdomain Consolidation ──

describe('Cloudflare Pages _redirects file', () => {
  let redirectsContent;

  before(() => {
    redirectsContent = readFile('_redirects');
  });

  it('should redirect www to primary domain', () => {
    assert.ok(redirectsContent.includes('www.coastalkey-pm.com'),
      'www subdomain redirect required');
  });

  it('should use 301 permanent redirects for subdomains', () => {
    assert.ok(redirectsContent.includes('301'), 'should use 301 redirects');
  });

  it('should consolidate all known subdomains', () => {
    const subdomains = ['www', 'app', 'dashboard', 'agents', 'api', 'admin', 'staging', 'dev', 'beta'];
    for (const sub of subdomains) {
      assert.ok(redirectsContent.includes(`${sub}.coastalkey-pm.com`),
        `${sub} subdomain redirect missing`);
    }
  });
});

// ── Website Structure ──

describe('Website file structure', () => {
  it('should have _worker.js reverse proxy', () => {
    assert.ok(fileExists('_worker.js'), '_worker.js required');
  });

  it('should have _headers file', () => {
    assert.ok(fileExists('_headers'), '_headers required');
  });

  it('should have _redirects file', () => {
    assert.ok(fileExists('_redirects'), '_redirects required');
  });

  it('should have index.html', () => {
    assert.ok(fileExists('index.html'), 'index.html required');
  });

  it('should have wrangler.toml', () => {
    assert.ok(fileExists('wrangler.toml'), 'wrangler.toml required');
  });

  it('should have custom-domains.json', () => {
    assert.ok(fileExists('custom-domains.json'), 'custom-domains.json required');
  });
});
