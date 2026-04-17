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
