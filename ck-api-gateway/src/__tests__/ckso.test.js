import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getCKSODashboard, APP_TEMPLATES, DATA_ENGINE_CONFIG,
  WORKFLOW_TRIGGERS, WORKFLOW_ACTIONS, ANALYTICS_METRICS,
  AI_COMMAND_CONFIG, GOVERNANCE_CONFIG, getGovernanceStatus,
} from '../services/ckso.js';

import {
  handleCKSODashboard, handleAppTemplates, handleDataTables,
  handleWorkflowTriggers, handleWorkflowActions, handleAnalyticsMetrics,
  handleGovernanceStatus, handleGovernanceRoles,
  handleGenerateApp, handleGenerateSchema, handleGenerateWorkflow,
  handleGenerateReport, handleAICommand,
} from '../routes/ckso.js';

async function body(res) { return JSON.parse(await res.text()); }
const mockCtx = { waitUntil: () => {} };

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('CKSO Service — Core Modules', () => {
  it('dashboard reports 6 operational modules', () => {
    const d = getCKSODashboard();
    assert.equal(d.system, 'Coastal Key Sovereign OS (CKSO)');
    assert.equal(d.version, '1.0.0');
    assert.equal(d.status, 'operational');
    assert.equal(Object.keys(d.modules).length, 6);
    for (const mod of Object.values(d.modules)) {
      assert.ok(['operational', 'enforcing'].includes(mod.status));
    }
  });

  it('app builder has 8 templates', () => {
    assert.equal(APP_TEMPLATES.length, 8);
    for (const t of APP_TEMPLATES) {
      assert.ok(t.id && t.name && t.category && t.description);
    }
  });

  it('data engine wires 6 Airtable tables', () => {
    assert.equal(Object.keys(DATA_ENGINE_CONFIG.tables).length, 6);
    assert.equal(DATA_ENGINE_CONFIG.baseId, 'appUSnNgpDkcEOzhN');
  });

  it('workflow core defines 7 triggers and 9 actions', () => {
    assert.equal(WORKFLOW_TRIGGERS.length, 7);
    assert.equal(WORKFLOW_ACTIONS.length, 9);
  });

  it('analytics engine covers 3 metric categories with 15 total metrics', () => {
    assert.equal(Object.keys(ANALYTICS_METRICS).length, 3);
    const total = Object.values(ANALYTICS_METRICS).reduce((s, a) => s + a.length, 0);
    assert.equal(total, 15);
  });

  it('AI command center reports 383-agent fleet', () => {
    assert.equal(AI_COMMAND_CONFIG.fleet.total, 383);
    assert.ok(AI_COMMAND_CONFIG.capabilities.length >= 10);
  });

  it('governance core defines 7 roles with CEO at level 10', () => {
    assert.equal(GOVERNANCE_CONFIG.roles.length, 7);
    const ceo = GOVERNANCE_CONFIG.roles.find(r => r.id === 'ceo');
    assert.equal(ceo.level, 10);
    assert.deepEqual(ceo.permissions, ['*']);
  });

  it('governance status reports enforcement', () => {
    const s = getGovernanceStatus();
    assert.equal(s.status, 'enforcing');
    assert.equal(s.sovereignty.dataOwnership, 'Coastal Key Enterprise');
  });

  it('TCPA compliance is configured', () => {
    assert.equal(GOVERNANCE_CONFIG.compliance.tcpa, true);
    assert.equal(GOVERNANCE_CONFIG.compliance.dnc, true);
    assert.equal(GOVERNANCE_CONFIG.compliance.callingHours.start, '10:00');
    assert.equal(GOVERNANCE_CONFIG.compliance.callingHours.end, '15:00');
  });

  it('dashboard includes 4 core goals', () => {
    const d = getCKSODashboard();
    assert.equal(d.coreGoals.length, 4);
  });

  it('dashboard lists 6 differentiators', () => {
    const d = getCKSODashboard();
    assert.equal(d.differentiators.length, 6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE TESTS — Static Endpoints
// ═══════════════════════════════════════════════════════════════════════════

describe('CKSO Routes — Static Endpoints', () => {
  it('GET /v1/ckso/dashboard returns full system status', async () => {
    const res = handleCKSODashboard();
    assert.equal(res.status, 200);
    const d = await body(res);
    assert.equal(d.system, 'Coastal Key Sovereign OS (CKSO)');
    assert.equal(d.governance, 'sovereign');
    assert.ok(d.modules.app_builder);
    assert.ok(d.modules.governance_core);
  });

  it('GET /v1/ckso/app/templates returns 8 templates', async () => {
    const res = handleAppTemplates();
    const d = await body(res);
    assert.equal(d.count, 8);
    assert.ok(d.templates.find(t => t.id === 'property-tracker'));
  });

  it('GET /v1/ckso/data/tables returns Airtable config', async () => {
    const res = handleDataTables();
    const d = await body(res);
    assert.equal(d.provider, 'Airtable');
    assert.equal(d.baseId, 'appUSnNgpDkcEOzhN');
    assert.equal(d.tableCount, 6);
  });

  it('GET /v1/ckso/workflow/triggers returns 7 triggers', async () => {
    const d = await body(handleWorkflowTriggers());
    assert.equal(d.count, 7);
  });

  it('GET /v1/ckso/workflow/actions returns 9 actions', async () => {
    const d = await body(handleWorkflowActions());
    assert.equal(d.count, 9);
  });

  it('GET /v1/ckso/analytics/metrics returns 3 categories, 15 metrics', async () => {
    const d = await body(handleAnalyticsMetrics());
    assert.equal(d.categories, 3);
    assert.equal(d.totalMetrics, 15);
  });

  it('GET /v1/ckso/governance/status returns enforcing', async () => {
    const d = await body(handleGovernanceStatus());
    assert.equal(d.status, 'enforcing');
  });

  it('GET /v1/ckso/governance/roles returns 7 roles', async () => {
    const d = await body(handleGovernanceRoles());
    assert.equal(d.count, 7);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE TESTS — Input Validation
// ═══════════════════════════════════════════════════════════════════════════

describe('CKSO Routes — Input Validation', () => {
  it('POST /v1/ckso/app/generate rejects missing name', async () => {
    const res = await handleGenerateApp({ json: async () => ({}) }, {}, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/ckso/data/schema rejects missing requirements', async () => {
    const res = await handleGenerateSchema({ json: async () => ({}) }, {}, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/ckso/workflow/generate rejects missing description', async () => {
    const res = await handleGenerateWorkflow({ json: async () => ({}) }, {}, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/ckso/analytics/report rejects invalid report_type', async () => {
    const res = await handleGenerateReport({ json: async () => ({ report_type: 'invalid' }) }, {}, mockCtx);
    assert.equal(res.status, 400);
    const d = await body(res);
    assert.ok(d.error.includes('financial'));
  });

  it('POST /v1/ckso/analytics/report rejects missing report_type', async () => {
    const res = await handleGenerateReport({ json: async () => ({}) }, {}, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/ckso/ai/command rejects missing command', async () => {
    const res = await handleAICommand({ json: async () => ({}) }, {}, mockCtx);
    assert.equal(res.status, 400);
  });

  it('all POST endpoints reject invalid JSON', async () => {
    const badReq = { json: async () => { throw new Error('bad'); } };
    const handlers = [handleGenerateApp, handleGenerateSchema, handleGenerateWorkflow, handleGenerateReport, handleAICommand];
    for (const h of handlers) {
      const res = await h(badReq, {}, mockCtx);
      assert.equal(res.status, 400);
    }
  });
});
