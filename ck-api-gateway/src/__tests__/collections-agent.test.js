/**
 * Collections Agent Tests - full DEVIQA verification cycle.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Collections Agent Engine', async () => {
  const {
    COLLECTIONS_AGENT,
    VOICE_CONFIG,
    COMPLIANCE_CONTROLS,
    KPI_BASELINE,
    checkCallEligibility,
    validateSession,
    getCollectionsAgentStatus,
    OUTCOME_TYPES,
  } = await import('../engines/collections-agent.js');

  it('registers agent identity', () => {
    assert.equal(COLLECTIONS_AGENT.id, 'COLL-001');
    assert.equal(COLLECTIONS_AGENT.division, 'FIN');
    assert.equal(COLLECTIONS_AGENT.reportsTo, 'MCCO-000 Master Orchestrator');
    assert.equal(COLLECTIONS_AGENT.status, 'PRODUCTION_LIVE');
  });

  it('fixes the incoming diff bugs in voice config', () => {
    assert.notEqual(VOICE_CONFIG.prompt.max_tokens, 10, 'max_tokens=10 would truncate responses');
    assert.equal(VOICE_CONFIG.prompt.max_tokens, -1);
    assert.deepEqual(VOICE_CONFIG.dynamic_variables.dynamic_variable_placeholders, {},
      'customer_name placeholder must not be hard-coded');
    assert.equal(VOICE_CONFIG.timezone, 'America/New_York');
    assert.equal(VOICE_CONFIG.prompt.temperature, 0.2);
    assert.equal(VOICE_CONFIG.prompt.reasoning_effort, 'medium');
  });

  it('embeds Coastal Key first-party positioning in prompt', () => {
    const p = VOICE_CONFIG.prompt.prompt;
    assert.ok(p.includes('Coastal Key Property Management'));
    assert.ok(p.includes('first-party'));
    assert.ok(p.includes('Guardrails'));
    assert.ok(!p.includes('Fortune 500'), 'generic Fortune 500 framing removed');
  });

  it('defines all 7 compliance controls', () => {
    assert.equal(COMPLIANCE_CONTROLS.length, 7);
    const ids = COMPLIANCE_CONTROLS.map(c => c.id);
    assert.deepEqual(ids, ['CTL-001','CTL-002','CTL-003','CTL-004','CTL-005','CTL-006','CTL-007']);
  });

  it('enforces call time window 8am to 9pm', () => {
    assert.equal(checkCallEligibility({ localTimeHour: 7 }).eligible, false);
    assert.equal(checkCallEligibility({ localTimeHour: 21 }).eligible, false);
    assert.equal(checkCallEligibility({ localTimeHour: 8 }).eligible, true);
    assert.equal(checkCallEligibility({ localTimeHour: 20 }).eligible, true);
  });

  it('enforces frequency cap at 7 attempts per 7 days', () => {
    assert.equal(checkCallEligibility({ localTimeHour: 10, attemptsLast7Days: 7 }).eligible, false);
    assert.equal(checkCallEligibility({ localTimeHour: 10, attemptsLast7Days: 6 }).eligible, true);
  });

  it('honors do-not-call list immediately', () => {
    const r = checkCallEligibility({ localTimeHour: 10, onDoNotCallList: true });
    assert.equal(r.eligible, false);
    assert.equal(r.reason, 'do_not_call_list');
    assert.equal(r.control, 'CTL-006');
  });

  it('validates session outcomes against taxonomy', () => {
    assert.equal(validateSession({ account_id: 'A1', outcome: 'paid_in_full' }).valid, true);
    assert.equal(validateSession({ account_id: 'A1', outcome: 'not_a_thing' }).valid, false);
    assert.equal(validateSession({ account_id: 'A1' }).valid, false);
    assert.equal(validateSession(null).valid, false);
  });

  it('requires plan_schedule when outcome is payment_plan', () => {
    const r = validateSession({ account_id: 'A1', outcome: 'payment_plan' });
    assert.equal(r.valid, false);
    assert.ok(r.errors.includes('plan_schedule_required_for_payment_plan'));
  });

  it('requires dispute_reason when outcome is disputed', () => {
    const r = validateSession({ account_id: 'A1', outcome: 'disputed' });
    assert.equal(r.valid, false);
    assert.ok(r.errors.includes('dispute_reason_required_for_disputed'));
  });

  it('exposes all 8 outcome types', () => {
    assert.equal(OUTCOME_TYPES.length, 8);
    assert.ok(OUTCOME_TYPES.includes('paid_in_full'));
    assert.ok(OUTCOME_TYPES.includes('disputed'));
    assert.ok(OUTCOME_TYPES.includes('do_not_call'));
  });

  it('surfaces KPI baseline for FIN dashboard', () => {
    assert.ok(KPI_BASELINE.rightPartyContactRate.target > KPI_BASELINE.rightPartyContactRate.industryP50);
    assert.ok(KPI_BASELINE.complaintRate.target < KPI_BASELINE.complaintRate.industryMax);
  });

  it('builds orchestrator status payload', () => {
    const s = getCollectionsAgentStatus();
    assert.equal(s.id, 'COLL-001');
    assert.equal(s.status, 'PRODUCTION_LIVE');
    assert.equal(s.complianceControls, 7);
    assert.equal(s.endpoints, 5);
    assert.ok(s.governance.includes('First-party'));
  });
});

describe('Collections Agent Routes', async () => {
  const {
    handleCollectionsConfig,
    handleCollectionsGuardrails,
    handleCollectionsStatus,
    handleCollectionsEligibility,
    handleCollectionsSession,
  } = await import('../routes/collections.js');

  const env = {};
  const ctx = { waitUntil: () => {} };

  async function body(res) { return JSON.parse(await res.text()); }

  function req(payload) {
    return new Request('http://test/', { method: 'POST', body: JSON.stringify(payload) });
  }

  it('GET /v1/collections/config returns bug-fixed config', async () => {
    const b = await body(handleCollectionsConfig());
    assert.equal(b.agent, 'COLL-001');
    assert.equal(b.config.prompt.max_tokens, -1);
  });

  it('GET /v1/collections/guardrails returns 7 controls', async () => {
    const b = await body(handleCollectionsGuardrails());
    assert.equal(b.count, 7);
  });

  it('GET /v1/collections/status returns PRODUCTION_LIVE', async () => {
    const b = await body(handleCollectionsStatus());
    assert.equal(b.status, 'PRODUCTION_LIVE');
  });

  it('POST /v1/collections/eligibility blocks outside window', async () => {
    const b = await body(await handleCollectionsEligibility(req({ localTimeHour: 22 }), env, ctx));
    assert.equal(b.eligible, false);
    assert.equal(b.reason, 'outside_call_window');
  });

  it('POST /v1/collections/eligibility allows in-window', async () => {
    const b = await body(await handleCollectionsEligibility(req({ localTimeHour: 14, attemptsLast7Days: 2 }), env, ctx));
    assert.equal(b.eligible, true);
  });

  it('POST /v1/collections/session rejects invalid outcome', async () => {
    const res = await handleCollectionsSession(req({ account_id: 'A1', outcome: 'bad' }), env, ctx);
    assert.equal(res.status, 400);
  });

  it('POST /v1/collections/session logs paid_in_full', async () => {
    const b = await body(await handleCollectionsSession(req({ account_id: 'A1', outcome: 'paid_in_full' }), env, ctx));
    assert.equal(b.logged, true);
    assert.equal(b.routing, 'billing_portal_payment_confirmation');
  });

  it('POST /v1/collections/session routes disputed to billing review', async () => {
    const b = await body(await handleCollectionsSession(
      req({ account_id: 'A1', outcome: 'disputed', dispute_reason: 'billed for non-service' }),
      env, ctx,
    ));
    assert.equal(b.routing, 'billing_team_dispute_resolution');
  });
});
