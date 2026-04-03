import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateCondition, resolveValue, resolveParams } from '../engine/executor.js';
import { getAllWorkflows, getWorkflow, getWorkflowsByTrigger, getWorkflowSummary, getWorkflowCount } from '../engine/registry.js';

// ── Condition Evaluator Tests ────────────────────────────────────────────────

describe('Condition Evaluator', () => {
  const context = {
    trigger: {
      recordId: 'recABC123',
      fields: {
        'Lead Name': 'John Doe',
        'Status': 'New',
        'Sentinel Segment': 'Investor',
        'Property Value': 750000,
        'Investor Flag': true,
        'WF-3 Sent': false,
      },
    },
    outputs: {
      'fetch-lead': {
        fields: { 'Lead Name': 'Jane Smith', 'Email': 'jane@example.com' },
      },
    },
  };

  it('evaluates equals condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Status', equals: 'New' }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Status', equals: 'Old' }, context), false);
  });

  it('evaluates notEquals condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Status', notEquals: 'Old' }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Status', notEquals: 'New' }, context), false);
  });

  it('evaluates gt/gte/lt/lte conditions', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Property Value', gt: 500000 }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Property Value', gte: 750000 }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Property Value', lt: 1000000 }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Property Value', lte: 750000 }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Property Value', gt: 750000 }, context), false);
  });

  it('evaluates in condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Sentinel Segment', in: ['Investor', 'Luxury'] }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Sentinel Segment', in: ['Budget', 'Standard'] }, context), false);
  });

  it('evaluates contains condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Lead Name', contains: 'John' }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Lead Name', contains: 'Jane' }, context), false);
  });

  it('evaluates exists condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Lead Name', exists: true }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.MissingField', exists: true }, context), false);
    assert.equal(evaluateCondition({ field: 'trigger.fields.MissingField', exists: false }, context), true);
  });

  it('evaluates all (AND) conditions', () => {
    assert.equal(evaluateCondition({
      all: [
        { field: 'trigger.fields.Investor Flag', equals: true },
        { field: 'trigger.fields.WF-3 Sent', equals: false },
      ],
    }, context), true);

    assert.equal(evaluateCondition({
      all: [
        { field: 'trigger.fields.Investor Flag', equals: true },
        { field: 'trigger.fields.Status', equals: 'Closed' },
      ],
    }, context), false);
  });

  it('evaluates any (OR) conditions', () => {
    assert.equal(evaluateCondition({
      any: [
        { field: 'trigger.fields.Status', equals: 'New' },
        { field: 'trigger.fields.Status', equals: 'Active' },
      ],
    }, context), true);

    assert.equal(evaluateCondition({
      any: [
        { field: 'trigger.fields.Status', equals: 'Closed' },
        { field: 'trigger.fields.Status', equals: 'Archived' },
      ],
    }, context), false);
  });

  it('evaluates matches (regex) condition', () => {
    assert.equal(evaluateCondition({ field: 'trigger.fields.Lead Name', matches: '^John' }, context), true);
    assert.equal(evaluateCondition({ field: 'trigger.fields.Lead Name', matches: '^Jane' }, context), false);
  });

  it('resolves cross-step references', () => {
    assert.equal(evaluateCondition({
      field: 'outputs.fetch-lead.fields.Email',
      equals: 'jane@example.com',
    }, context), true);
  });
});

// ── Value Resolver Tests ─────────────────────────────────────────────────────

describe('Value Resolver', () => {
  const context = {
    trigger: { recordId: 'recXYZ', fields: { 'Lead Name': 'Test Lead' } },
    outputs: { step1: { data: 'result123' } },
  };

  it('resolves simple dot paths', () => {
    assert.equal(resolveValue('trigger.recordId', context), 'recXYZ');
    assert.equal(resolveValue('trigger.fields.Lead Name', context), 'Test Lead');
    assert.equal(resolveValue('outputs.step1.data', context), 'result123');
  });

  it('returns undefined for missing paths', () => {
    assert.equal(resolveValue('trigger.missing.path', context), undefined);
  });

  it('handles null/empty input', () => {
    assert.equal(resolveValue(null, context), null);
    assert.equal(resolveValue('', context), '');
  });
});

// ── Parameter Resolution Tests ───────────────────────────────────────────────

describe('Parameter Resolution', () => {
  const context = {
    trigger: { recordId: 'recABC', fields: { 'Lead Name': 'Alice' } },
    outputs: { step1: { content: 'Generated text' } },
  };

  it('resolves template strings', () => {
    assert.equal(
      resolveParams('Hello {{trigger.fields.Lead Name}}', context),
      'Hello Alice'
    );
  });

  it('resolves object parameters', () => {
    const result = resolveParams({
      name: '{{trigger.fields.Lead Name}}',
      id: '{{trigger.recordId}}',
    }, context);
    assert.deepEqual(result, { name: 'Alice', id: 'recABC' });
  });

  it('resolves nested objects', () => {
    const result = resolveParams({
      fields: { 'Task Name': 'Follow up: {{trigger.fields.Lead Name}}' },
    }, context);
    assert.deepEqual(result, {
      fields: { 'Task Name': 'Follow up: Alice' },
    });
  });

  it('resolves arrays', () => {
    const result = resolveParams(['{{trigger.recordId}}', '{{outputs.step1.content}}'], context);
    assert.deepEqual(result, ['recABC', 'Generated text']);
  });

  it('handles missing variables gracefully', () => {
    assert.equal(resolveParams('Value: {{trigger.missing}}', context), 'Value: ');
  });

  it('passes through non-template values', () => {
    assert.equal(resolveParams(42, context), 42);
    assert.equal(resolveParams(true, context), true);
    assert.equal(resolveParams(null, context), null);
  });
});

// ── Workflow Registry Tests ──────────────────────────────────────────────────

describe('Workflow Registry', () => {
  it('returns all workflows', () => {
    const all = getAllWorkflows();
    assert.ok(all.length >= 8, `Expected at least 8 workflows, got ${all.length}`);
  });

  it('retrieves workflow by ID', () => {
    const wf = getWorkflow('scaa1-battle-plan');
    assert.ok(wf, 'SCAA-1 workflow should exist');
    assert.equal(wf.name, 'SCAA-1 Battle Plan Pipeline');
    assert.ok(wf.steps.length > 0, 'Should have steps');
  });

  it('returns null for unknown workflow', () => {
    assert.equal(getWorkflow('nonexistent'), null);
  });

  it('filters workflows by trigger type', () => {
    const polled = getWorkflowsByTrigger('poll');
    assert.ok(polled.length >= 3, 'Should have at least 3 poll-triggered workflows');
    polled.forEach(w => assert.equal(w.trigger.type, 'poll'));

    const scheduled = getWorkflowsByTrigger('schedule');
    assert.ok(scheduled.length >= 3, 'Should have at least 3 scheduled workflows');
    scheduled.forEach(w => assert.equal(w.trigger.type, 'schedule'));

    const webhook = getWorkflowsByTrigger('webhook');
    assert.ok(webhook.length >= 2, 'Should have at least 2 webhook-triggered workflows');
    webhook.forEach(w => assert.equal(w.trigger.type, 'webhook'));
  });

  it('generates workflow summary', () => {
    const summary = getWorkflowSummary();
    assert.ok(summary.length > 0);
    const first = summary[0];
    assert.ok(first.id, 'Summary should include id');
    assert.ok(first.name, 'Summary should include name');
    assert.ok(first.trigger, 'Summary should include trigger type');
    assert.ok(first.stepCount > 0, 'Summary should include step count');
  });

  it('counts workflows correctly', () => {
    const count = getWorkflowCount();
    assert.equal(count, getAllWorkflows().length);
  });

  it('verifies migrated workflows have correct structure', () => {
    const migrated = ['scaa1-battle-plan', 'wf3-investor-escalation', 'wf4-long-tail-nurture'];
    for (const id of migrated) {
      const wf = getWorkflow(id);
      assert.ok(wf, `${id} should exist`);
      assert.ok(wf.enabled, `${id} should be enabled`);
      assert.ok(wf.steps.length >= 3, `${id} should have at least 3 steps`);
      assert.ok(wf.description, `${id} should have a description`);

      // Each step must have id and action
      for (const step of wf.steps) {
        assert.ok(step.id, `Step in ${id} missing id`);
        assert.ok(step.action, `Step ${step.id} in ${id} missing action`);
      }
    }
  });

  it('verifies new workflows have correct trigger types', () => {
    assert.equal(getWorkflow('wf5-website-welcome').trigger.type, 'webhook');
    assert.equal(getWorkflow('wf6-daily-digest').trigger.type, 'schedule');
    assert.equal(getWorkflow('wf7-stale-lead-check').trigger.type, 'schedule');
    assert.equal(getWorkflow('wf8-missed-call-followup').trigger.type, 'webhook');
    assert.equal(getWorkflow('wf9-property-import').trigger.type, 'schedule');
    assert.equal(getWorkflow('wf10-health-monitor').trigger.type, 'schedule');
  });
});
