/**
 * Master Prompt V2.1 Tests — Full automation cycle
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function body(res) { return JSON.parse(await res.text()); }

describe('Master Prompt V2.1 Engine', async () => {
  const { AVATARS, MARKETING_ASSETS, INDUSTRY_GAPS, calculateNOIGapImpact, getMasterPromptDashboard } = await import('../engines/master-prompt-v21.js');

  it('defines 4 executive administrator avatars', () => {
    assert.equal(Object.keys(AVATARS).length, 4);
    assert.ok(AVATARS.daphne);
    assert.ok(AVATARS.stephanie);
    assert.ok(AVATARS.twin);
    assert.ok(AVATARS.orchestrator);
  });

  it('defines 10 V2.1 marketing assets', () => {
    assert.equal(MARKETING_ASSETS.length, 10);
    assert.equal(MARKETING_ASSETS[0].headline, 'Peace of Mind, Engineered.');
  });

  it('identifies 3 top-1% industry gaps', () => {
    assert.equal(INDUSTRY_GAPS.length, 3);
    assert.equal(INDUSTRY_GAPS[0].rank, 1);
    assert.ok(INDUSTRY_GAPS[0].gap.includes('Predictive'));
  });

  it('calculates NOI impact for 30 properties', () => {
    const m = calculateNOIGapImpact(30);
    assert.equal(m.portfolio.properties, 30);
    assert.ok(m.coastalKey.projectedNOI > m.traditional.noi);
    assert.ok(m.sensitivity.optimistic.noi > m.sensitivity.conservative.noi);
    assert.equal(m.breakEven, '< 6 months');
  });

  it('calculates NOI impact for custom portfolio', () => {
    const m = calculateNOIGapImpact(100);
    assert.equal(m.portfolio.properties, 100);
    assert.ok(m.portfolio.annualRevenue > 0);
  });

  it('generates full production dashboard', () => {
    const d = getMasterPromptDashboard();
    assert.equal(d.system, 'Coastal Key Master Prompt V2.1');
    assert.equal(d.status, 'PRODUCTION_LIVE');
    assert.ok(d.avatars.length >= 4);
    assert.equal(d.marketingAssets.count, 10);
    assert.equal(d.researchGaps.length, 3);
    assert.ok(d.noiModel);
    assert.ok(d.nextActions.length >= 4);
  });
});

describe('Master Prompt V2.1 Routes', async () => {
  const { handleOrchestratorDashboard, handleOrchestratorAssets, handleOrchestratorAvatars, handleOrchestratorGaps, handleOrchestratorNOIModel } = await import('../routes/master-prompt.js');

  it('GET /v1/orchestrator/dashboard returns V2.1 system', async () => {
    const b = await body(handleOrchestratorDashboard());
    assert.equal(b.system, 'Coastal Key Master Prompt V2.1');
    assert.equal(b.status, 'PRODUCTION_LIVE');
  });

  it('GET /v1/orchestrator/assets returns 10 assets', async () => {
    const b = await body(handleOrchestratorAssets());
    assert.equal(b.count, 10);
  });

  it('GET /v1/orchestrator/avatars returns 4 avatars', async () => {
    const b = await body(handleOrchestratorAvatars());
    assert.equal(b.count, 4);
  });

  it('GET /v1/orchestrator/gaps returns 3 gaps', async () => {
    const b = await body(handleOrchestratorGaps());
    assert.equal(b.count, 3);
  });

  it('GET /v1/orchestrator/noi-model returns 30-property model', async () => {
    const b = await body(handleOrchestratorNOIModel());
    assert.equal(b.portfolio.properties, 30);
  });
});

describe('Master Orchestrator Fleet & Dispatch', async () => {
  const {
    AGENT_FLEET, RATE_LIMITS_CONFIG, HITL_THRESHOLDS, TRIGGER_ACTION_SEQUENCES,
    classifyDispatch, validateGoalAlignment, evaluateHITL, routeDispatch,
    getOrchestratorFleetStatus, getMasterPromptDashboard,
  } = await import('../engines/master-prompt-v21.js');

  it('exposes 4 fleet agents', () => {
    assert.equal(Object.keys(AGENT_FLEET).length, 4);
    assert.ok(AGENT_FLEET.sentry);
    assert.ok(AGENT_FLEET.ledger);
    assert.ok(AGENT_FLEET.acquisition);
    assert.ok(AGENT_FLEET.report);
  });

  it('configures per-agent rate limits including orchestrator control plane', () => {
    assert.equal(RATE_LIMITS_CONFIG.sentry.rpm, 60);
    assert.equal(RATE_LIMITS_CONFIG.ledger.rpm, 20);
    assert.equal(RATE_LIMITS_CONFIG.acquisition.daily, 100);
    assert.equal(RATE_LIMITS_CONFIG.report.burst, 3);
    assert.equal(RATE_LIMITS_CONFIG.orchestrator.rpm, 600);
  });

  it('encodes $5,000 HITL threshold as 500000 cents', () => {
    assert.equal(HITL_THRESHOLDS.financialTransferSingleCents, 500000);
    assert.equal(HITL_THRESHOLDS.priorityP0Always, true);
  });

  it('catalogs 15 trigger-action sequences', () => {
    assert.equal(TRIGGER_ACTION_SEQUENCES.length, 15);
    assert.equal(TRIGGER_ACTION_SEQUENCES[0].id, 'TAS-001');
    assert.equal(TRIGGER_ACTION_SEQUENCES[14].id, 'TAS-015');
  });

  it('classifyDispatch routes by action when recipient missing', () => {
    const c = classifyDispatch({ action: 'bill_pay_execute', priority: 'P1', risk_class: 'R2' });
    assert.equal(c.agent, 'ledger');
    assert.equal(c.priority, 'P1');
    assert.equal(c.riskClass, 'R2');
  });

  it('validateGoalAlignment passes for goal-tagged event', () => {
    const v = validateGoalAlignment({ goal_alignment: ['G2_risk', 'G1_automation'] });
    assert.equal(v.passed, true);
    assert.deepEqual(v.matched, ['G2_risk', 'G1_automation']);
  });

  it('validateGoalAlignment fails when no goals tagged', () => {
    const v = validateGoalAlignment({ goal_alignment: [] });
    assert.equal(v.passed, false);
  });

  it('evaluateHITL flags transfers over $5,000', () => {
    const e = evaluateHITL({
      action: 'bill_pay_execute',
      priority: 'P1',
      payload: { amount: { amount_cents: 600000, currency: 'USD' } },
    });
    assert.equal(e.hitlRequired, true);
    assert.ok(e.reasons.some(r => r.includes('financial_exposure_exceeds')));
  });

  it('evaluateHITL passes transfers under $5,000', () => {
    const e = evaluateHITL({
      action: 'bill_pay_execute',
      priority: 'P2',
      payload: { amount: { amount_cents: 250000, currency: 'USD' } },
    });
    assert.equal(e.hitlRequired, false);
  });

  it('evaluateHITL always flags P0 events', () => {
    const e = evaluateHITL({ action: 'dispatch_work_order', priority: 'P0' });
    assert.equal(e.hitlRequired, true);
    assert.ok(e.reasons.includes('p0_priority_always_requires_hitl'));
  });

  it('evaluateHITL flags structural scope of work', () => {
    const e = evaluateHITL({
      action: 'dispatch_work_order',
      priority: 'P1',
      payload: { scope_of_work: 'Replace structural beam in garage' },
    });
    assert.equal(e.hitlRequired, true);
  });

  it('routeDispatch quarantines events failing goal alignment', () => {
    const r = routeDispatch({ action: 'lead_enriched', priority: 'P3', risk_class: 'R0', goal_alignment: [] });
    assert.equal(r.status, 'quarantined');
  });

  it('routeDispatch puts P0 envelopes into hitl_pending', () => {
    const r = routeDispatch({
      action: 'dispatch_work_order',
      priority: 'P0',
      risk_class: 'R3',
      goal_alignment: ['G2_risk'],
      payload: { estimated_cost: { amount_cents: 200000, currency: 'USD' } },
    });
    assert.equal(r.status, 'hitl_pending');
    assert.equal(r.agent, 'sentry');
    assert.ok(r.hitl.reasons.length >= 1);
  });

  it('routeDispatch dispatches low-risk goal-aligned events', () => {
    const r = routeDispatch({
      action: 'lead_enriched',
      priority: 'P3',
      risk_class: 'R0',
      goal_alignment: ['G4_market'],
      payload: { daily_outbound_count: 10 },
    });
    assert.equal(r.status, 'dispatched');
    assert.equal(r.agent, 'acquisition');
    assert.equal(r.rate_limit.daily, 100);
  });

  it('getOrchestratorFleetStatus returns 4 active agents', () => {
    const s = getOrchestratorFleetStatus();
    assert.equal(s.count, 4);
    assert.equal(s.activeAgents, 4);
    assert.ok(s.rateLimits.sentry);
    assert.ok(s.hitlThresholds);
  });

  it('master dashboard now includes fleet + trigger sequences', () => {
    const d = getMasterPromptDashboard();
    assert.ok(d.fleet);
    assert.equal(d.fleet.count, 4);
    assert.equal(d.triggerSequences.count, 15);
  });
});

describe('Master Orchestrator dispatch & HITL routes', async () => {
  const { handleOrchestratorFleet, handleOrchestratorTriggers, handleOrchestratorDispatch, handleOrchestratorHITL } = await import('../routes/master-prompt.js');

  const noopEnv = {};
  const noopCtx = { waitUntil: () => {} };

  it('GET /v1/orchestrator/fleet returns 4 agents', async () => {
    const b = await body(handleOrchestratorFleet());
    assert.equal(b.count, 4);
  });

  it('GET /v1/orchestrator/triggers returns 15 sequences', async () => {
    const b = await body(handleOrchestratorTriggers());
    assert.equal(b.count, 15);
  });

  it('POST /v1/orchestrator/dispatch returns 200 dispatched for low-risk lead', async () => {
    const req = new Request('http://x/v1/orchestrator/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'lead_enriched',
        priority: 'P3',
        risk_class: 'R0',
        goal_alignment: ['G4_market'],
        payload: { daily_outbound_count: 5 },
      }),
    });
    const res = await handleOrchestratorDispatch(req, noopEnv, noopCtx);
    assert.equal(res.status, 200);
    const b = JSON.parse(await res.text());
    assert.equal(b.status, 'dispatched');
    assert.equal(b.agent, 'acquisition');
  });

  it('POST /v1/orchestrator/dispatch returns 202 hitl_pending for $5K+ payment', async () => {
    const req = new Request('http://x/v1/orchestrator/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        action: 'bill_pay_execute',
        priority: 'P1',
        risk_class: 'R2',
        goal_alignment: ['G3_financial'],
        payload: { amount: { amount_cents: 750000, currency: 'USD' } },
      }),
    });
    const res = await handleOrchestratorDispatch(req, noopEnv, noopCtx);
    assert.equal(res.status, 202);
    const b = JSON.parse(await res.text());
    assert.equal(b.status, 'hitl_pending');
    assert.equal(b.agent, 'ledger');
  });

  it('POST /v1/orchestrator/dispatch returns 409 quarantined when goals missing', async () => {
    const req = new Request('http://x/v1/orchestrator/dispatch', {
      method: 'POST',
      body: JSON.stringify({ action: 'lead_enriched', priority: 'P3', risk_class: 'R0' }),
    });
    const res = await handleOrchestratorDispatch(req, noopEnv, noopCtx);
    assert.equal(res.status, 409);
  });

  it('POST /v1/orchestrator/dispatch returns 400 without action', async () => {
    const req = new Request('http://x/v1/orchestrator/dispatch', { method: 'POST', body: '{}' });
    const res = await handleOrchestratorDispatch(req, noopEnv, noopCtx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/orchestrator/hitl records a decision', async () => {
    const req = new Request('http://x/v1/orchestrator/hitl', {
      method: 'POST',
      body: JSON.stringify({
        blocked_envelope_id: 'env_abc123',
        decision: 'approve',
        approver_id: 'ceo',
        rationale: 'Authorized vendor; within budget reserve',
      }),
    });
    const res = await handleOrchestratorHITL(req, noopEnv, noopCtx);
    assert.equal(res.status, 200);
    const b = JSON.parse(await res.text());
    assert.equal(b.status, 'recorded');
    assert.equal(b.decision, 'approve');
  });

  it('POST /v1/orchestrator/hitl rejects invalid decision', async () => {
    const req = new Request('http://x/v1/orchestrator/hitl', {
      method: 'POST',
      body: JSON.stringify({ blocked_envelope_id: 'env_x', decision: 'maybe', approver_id: 'ceo' }),
    });
    const res = await handleOrchestratorHITL(req, noopEnv, noopCtx);
    assert.equal(res.status, 400);
  });
});
