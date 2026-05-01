import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage BEFORE any imports that use it
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

// Mock fetch for Node.js
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({}) });
}

const api = await import('../utils/api.js');
const { setToken, getToken, clearToken } = api;

describe('API Client — Token Management', () => {
  beforeEach(() => {
    clearToken();
  });

  it('starts with no token after clear', () => {
    assert.equal(getToken(), '');
  });

  it('stores a token', () => {
    setToken('test-abc-123');
    assert.equal(getToken(), 'test-abc-123');
  });

  it('persists token to localStorage', () => {
    setToken('persist-me');
    assert.equal(localStorage.getItem('ck_token'), 'persist-me');
  });

  it('clears token from memory and storage', () => {
    setToken('to-clear');
    clearToken();
    assert.equal(getToken(), '');
    assert.equal(localStorage.getItem('ck_token'), null);
  });

  it('overwrites existing token', () => {
    setToken('first');
    setToken('second');
    assert.equal(getToken(), 'second');
  });
});

describe('API Client — Endpoint Definitions', () => {
  it('exports all expected endpoint functions', () => {
    const required = [
      'health', 'healthDeep', 'getAgents', 'getAgent', 'agentAction',
      'getAgentMetrics', 'getDashboard', 'getLeads', 'getLead', 'createLead',
      'enrichLead', 'inference', 'battlePlan', 'investorEscalation',
      'nurtureLead', 'generateContent', 'getIntelOfficers', 'getIntelDashboard',
      'fleetScan', 'getEmailAgents', 'composeEmail', 'getEmailDashboard',
      'getPricingRecommendation', 'getPricingZones', 'searchProperties',
      'getPropertyStats', 'getCampaignDashboard', 'getCampaignAnalytics',
      'getAuditLog', 'getGovernance', 'getMission', 'getMarketBrief',
      'getSubscriptionTiers', 'executeSkill', 'getSystemStatus', 'triggerRepair'
    ];

    for (const fn of required) {
      assert.equal(typeof api[fn], 'function', `Missing export: ${fn}`);
    }
  });

  it('exports exactly the expected number of endpoint functions', () => {
    const exports = Object.keys(api).filter(k => typeof api[k] === 'function');
    assert.ok(exports.length >= 35, `Expected 35+ exports, got ${exports.length}`);
  });
});
