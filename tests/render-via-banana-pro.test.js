'use strict';

// Unit tests for avatar-studio/scripts/render-via-banana-pro.js
// Pure tests — no filesystem mutation, no network.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseArgs,
  buildRequestPayload,
  run,
  loadConfigFromEnv,
  missingTransportConfig,
} = require('../avatar-studio/scripts/render-via-banana-pro');

function fakeSpec(overrides) {
  return Object.assign(
    {
      id: '01-ceo-governance',
      title: 'CEO Governance Administrator',
      filename: 'CoastalKey_CEO_Governance.mov',
      prompt: 'Render executive avatar with CEO self-likeness.',
      technical: { resolution: '1179x2556', fps: 60, loop_duration_s: 15, format: 'mov', color_space: 'Display P3', hdr: 'HDR10' },
      identity: { source: 'ceo-self-likeness' },
      governance: { content_policy: 'ceo-self-likeness-only' },
    },
    overrides || {},
  );
}

describe('parseArgs', () => {
  it('defaults to no dry-run and no filter', () => {
    const a = parseArgs([]);
    assert.equal(a.dryRun, false);
    assert.equal(a.only, null);
  });
  it('recognizes --dry-run', () => {
    assert.equal(parseArgs(['--dry-run']).dryRun, true);
  });
  it('recognizes --only <name>', () => {
    assert.equal(parseArgs(['--only', '02-ceo-operations']).only, '02-ceo-operations');
  });
  it('recognizes --only=<name>', () => {
    assert.equal(parseArgs(['--only=04-ceo-orchestrator']).only, '04-ceo-orchestrator');
  });
});

describe('buildRequestPayload', () => {
  const config = { fields: { promptField: 'prompt', metadataField: 'metadata', outputFormatField: 'output_format' } };

  it('returns the configured three field names', () => {
    const payload = buildRequestPayload(fakeSpec(), config);
    assert.equal(Object.keys(payload).length, 3);
    assert.ok('prompt' in payload);
    assert.ok('metadata' in payload);
    assert.ok('output_format' in payload);
  });

  it('honors custom field names from config', () => {
    const custom = { fields: { promptField: 'text', metadataField: 'meta', outputFormatField: 'fmt' } };
    const payload = buildRequestPayload(fakeSpec(), custom);
    assert.ok('text' in payload);
    assert.ok('meta' in payload);
    assert.ok('fmt' in payload);
    assert.ok(!('prompt' in payload));
  });

  it('carries required metadata from the spec', () => {
    const payload = buildRequestPayload(fakeSpec(), config);
    assert.equal(payload.metadata.id, '01-ceo-governance');
    assert.equal(payload.metadata.filename, 'CoastalKey_CEO_Governance.mov');
    assert.equal(payload.metadata.resolution, '1179x2556');
    assert.equal(payload.metadata.fps, 60);
    assert.equal(payload.metadata.identity_source, 'ceo-self-likeness');
  });

  it('uses the spec technical.format as output_format', () => {
    const payload = buildRequestPayload(fakeSpec(), config);
    assert.equal(payload.output_format, 'mov');
  });

  it('throws when spec.prompt is missing', () => {
    assert.throws(() => buildRequestPayload(fakeSpec({ prompt: '' }), config), /prompt is missing/);
  });
});

describe('run() dry-run path', () => {
  it('builds payloads for every spec and makes no network calls', async () => {
    let fetchCalls = 0;
    const specs = [fakeSpec(), fakeSpec({ id: '02-ceo-operations', filename: 'CoastalKey_CEO_Operations.mov' })];
    const result = await run({
      dryRun: true,
      only: null,
      apiKey: null,
      specs,
      config: { fields: {} },
      fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
    });
    assert.equal(fetchCalls, 0, 'fetch must not be called in dry-run');
    assert.equal(result.dryRun, true);
    assert.equal(result.count, 2);
    assert.equal(result.results.length, 2);
    assert.ok(result.results.every((r) => r.dryRun === true));
    assert.ok(result.results[0].payload);
  });
});

describe('run() --only filter', () => {
  it('selects only the named spec', async () => {
    const specs = [
      fakeSpec({ id: '01-ceo-governance' }),
      fakeSpec({ id: '02-ceo-operations' }),
      fakeSpec({ id: '04-ceo-orchestrator' }),
    ];
    const result = await run({ dryRun: true, only: '04-ceo-orchestrator', specs, config: { fields: {} } });
    assert.equal(result.count, 1);
    assert.equal(result.results[0].id, '04-ceo-orchestrator');
  });

  it('returns zero results when --only matches nothing', async () => {
    const result = await run({ dryRun: true, only: 'does-not-exist', specs: [fakeSpec()], config: { fields: {} } });
    assert.equal(result.count, 0);
    assert.equal(result.results.length, 0);
  });
});

describe('run() missing API key path', () => {
  it('throws MISSING_API_KEY when not dry-run and no apiKey', async () => {
    let fetchCalls = 0;
    await assert.rejects(
      () => run({
        dryRun: false,
        apiKey: null,
        specs: [fakeSpec()],
        config: { fields: {} },
        fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
      }),
      (err) => err.code === 'MISSING_API_KEY',
    );
    assert.equal(fetchCalls, 0, 'must not touch fetch when API key is missing');
  });

  it('throws MISSING_TRANSPORT_CONFIG when apiKey present but transport fields unset', async () => {
    let fetchCalls = 0;
    await assert.rejects(
      () => run({
        dryRun: false,
        apiKey: 'fake-key',
        specs: [fakeSpec()],
        config: { fields: {} },
        fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
      }),
      (err) => err.code === 'MISSING_TRANSPORT_CONFIG',
    );
    assert.equal(fetchCalls, 0);
  });
});

describe('loadConfigFromEnv', () => {
  it('overlays env vars on top of base config', () => {
    const cfg = loadConfigFromEnv(
      {
        BANANA_PRO_BASE_URL: 'https://example.test',
        BANANA_PRO_GENERATE_PATH: '/v1/generate',
        BANANA_PRO_STATUS_PATH: '/v1/status',
        BANANA_PRO_AUTH_HEADER: 'Bearer xyz',
        BANANA_PRO_PROMPT_FIELD: 'text',
      },
      { fields: { promptField: 'prompt' } },
    );
    assert.equal(cfg.baseUrl, 'https://example.test');
    assert.equal(cfg.generatePath, '/v1/generate');
    assert.equal(cfg.statusPath, '/v1/status');
    assert.equal(cfg.authHeader, 'Bearer xyz');
    assert.equal(cfg.fields.promptField, 'text');
  });
});

describe('missingTransportConfig', () => {
  it('lists every unset transport field', () => {
    const missing = missingTransportConfig({});
    assert.deepEqual(missing.sort(), [
      'BANANA_PRO_AUTH_HEADER',
      'BANANA_PRO_BASE_URL',
      'BANANA_PRO_GENERATE_PATH',
      'BANANA_PRO_STATUS_PATH',
    ].sort());
  });
  it('returns empty when all fields are set', () => {
    const missing = missingTransportConfig({
      baseUrl: 'https://example.test',
      generatePath: '/g',
      statusPath: '/s',
      authHeader: 'Bearer x',
    });
    assert.deepEqual(missing, []);
  });
});
