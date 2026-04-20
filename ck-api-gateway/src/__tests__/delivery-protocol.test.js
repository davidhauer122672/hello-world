/**
 * Delivery Protocol + SGR-001 Tests
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function body(res) { return JSON.parse(await res.text()); }

describe('Delivery Protocol Engine', async () => {
  const { TASK_CATEGORIES, GOVERNANCE_MATRIX, PIPELINE_STAGES, generateTCR, generateClaudeMasterPrompt, executePipeline, getDeliveryProtocolDashboard } = await import('../engines/delivery-protocol.js');

  it('defines 10 task categories', () => {
    assert.equal(TASK_CATEGORIES.length, 10);
    assert.ok(TASK_CATEGORIES.includes('Build'));
    assert.ok(TASK_CATEGORIES.includes('Deployment'));
  });

  it('governance matrix has 7 validation points', () => {
    assert.equal(Object.keys(GOVERNANCE_MATRIX).length, 7);
    assert.ok(GOVERNANCE_MATRIX.mission);
    assert.ok(GOVERNANCE_MATRIX.ceoFreedom);
  });

  it('pipeline has 7 stages', () => {
    assert.equal(PIPELINE_STAGES.length, 7);
  });

  it('generates TCR from valid task data', () => {
    const r = generateTCR({ taskId: 'TSK-001', title: 'Test Build', category: 'Build' });
    assert.ok(r.tcr);
    assert.equal(r.tcr.taskId, 'TSK-001');
    assert.equal(r.tcr.status, 'COMPLETE');
  });

  it('rejects TCR with invalid category', () => {
    const r = generateTCR({ taskId: 'X', title: 'X', category: 'Fake' });
    assert.ok(r.error);
  });

  it('generates Claude Master Prompt from TCR', () => {
    const tcr = generateTCR({ taskId: 'TSK-002', title: 'Deploy Widget', category: 'Deployment' }).tcr;
    const prompt = generateClaudeMasterPrompt(tcr);
    assert.ok(prompt.coastal_key_delivery);
    assert.equal(prompt.coastal_key_delivery.task_id, 'TSK-002');
    assert.ok(prompt.coastal_key_delivery.checksum.startsWith('CK-'));
  });

  it('executes full pipeline successfully', () => {
    const r = executePipeline({ taskId: 'TSK-003', title: 'Full Pipeline Test', category: 'Test', deliverables: ['file1.js', 'file2.js'] });
    assert.equal(r.success, true);
    assert.equal(r.pipelineLog.length, 7);
    assert.ok(r.pipelineLog.every(s => s.status === 'PASS'));
    assert.equal(r.ruleId, 'SGR-001');
  });

  it('fails pipeline with missing required fields', () => {
    const r = executePipeline({ title: 'No ID', category: 'Build' });
    assert.equal(r.success, false);
  });

  it('dashboard returns SGR-001 rule', () => {
    const d = getDeliveryProtocolDashboard();
    assert.equal(d.ruleId, 'SGR-001');
    assert.equal(d.status, 'ACTIVE');
    assert.equal(d.classification, 'Sovereign Governance Rule (Permanent)');
  });
});

describe('Delivery Protocol Routes', async () => {
  const { handleDeliveryDashboard, handleDeliveryTemplate, handleDeliveryGovernance } = await import('../routes/delivery-protocol.js');

  it('GET /v1/delivery/dashboard returns protocol', async () => {
    const b = await body(handleDeliveryDashboard());
    assert.equal(b.ruleId, 'SGR-001');
    assert.equal(b.pipelineStages.length, 7);
  });

  it('GET /v1/delivery/template returns JSON schema', async () => {
    const b = await body(handleDeliveryTemplate());
    assert.ok(b.template.coastal_key_delivery);
    assert.equal(b.taskCategories.length, 10);
  });

  it('GET /v1/delivery/governance returns matrix', async () => {
    const b = await body(handleDeliveryGovernance());
    assert.equal(b.ruleId, 'SGR-001');
    assert.ok(b.governanceMatrix.mission);
  });
});
