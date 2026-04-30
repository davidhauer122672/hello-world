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
      id: 'ck-avatar-01-exec-comms',
      title: 'Coastal Key Executive Communications Avatar',
      version: '1.0.0',
      renderer: 'banana_pro_ai',
      targetPlatforms: ['iphone_16_pro_wallpaper'],
      technicalStandards: {
        resolution: { width: 1179, height: 2556, label: 'iPhone 16 Pro native portrait' },
        frameRate: 60,
        container: 'mov',
        codec: 'H.265/HEVC',
        colorSpace: 'Display P3',
        dynamicRange: 'HDR10',
      },
      subject: { name: 'Avery North', kind: 'fictional', contentRating: 'PG' },
    },
    overrides || {},
  );
}

const PROMPT_TEXT = '# Avatar prompt\nRole: Executive communications.';

function fakeEntry(overrides) {
  const spec = fakeSpec(overrides);
  return { filename: spec.id + '.json', spec };
}

describe('parseArgs', () => {
  it('defaults to no dry-run and no filter', () => {
    const a = parseArgs([]);
    assert.equal(a.dryRun, false);
    assert.equal(a.only, null);
  });
  it('recognizes --dry-run', () => { assert.equal(parseArgs(['--dry-run']).dryRun, true); });
  it('recognizes --only <id>', () => { assert.equal(parseArgs(['--only', 'ck-avatar-04-ceo-self']).only, 'ck-avatar-04-ceo-self'); });
  it('recognizes --only=<id>', () => { assert.equal(parseArgs(['--only=ck-avatar-04-ceo-self']).only, 'ck-avatar-04-ceo-self'); });
});

describe('buildRequestPayload', () => {
  const config = { fields: { promptField: 'prompt', metadataField: 'metadata', outputFormatField: 'output_format' } };

  it('returns exactly the configured three field names', () => {
    const payload = buildRequestPayload(fakeSpec(), PROMPT_TEXT, config);
    assert.equal(Object.keys(payload).length, 3);
    assert.ok('prompt' in payload);
    assert.ok('metadata' in payload);
    assert.ok('output_format' in payload);
  });

  it('honors custom field names from config', () => {
    const custom = { fields: { promptField: 'text', metadataField: 'meta', outputFormatField: 'fmt' } };
    const payload = buildRequestPayload(fakeSpec(), PROMPT_TEXT, custom);
    assert.ok('text' in payload);
    assert.ok('meta' in payload);
    assert.ok('fmt' in payload);
    assert.ok(!('prompt' in payload));
  });

  it('carries required metadata from the spec', () => {
    const payload = buildRequestPayload(fakeSpec(), PROMPT_TEXT, config);
    assert.equal(payload.metadata.id, 'ck-avatar-01-exec-comms');
    assert.equal(payload.metadata.resolution, '1179x2556');
    assert.equal(payload.metadata.frame_rate, 60);
    assert.equal(payload.metadata.subject_kind, 'fictional');
    assert.equal(payload.metadata.content_rating, 'PG');
    assert.equal(payload.metadata.renderer, 'banana_pro_ai');
  });

  it('uses technicalStandards.container as the output format', () => {
    assert.equal(buildRequestPayload(fakeSpec(), PROMPT_TEXT, config).output_format, 'mov');
  });

  it('throws when promptText is missing', () => {
    assert.throws(() => buildRequestPayload(fakeSpec(), '', config), /promptText is missing/);
  });
});

describe('run() dry-run path', () => {
  it('builds payloads for every spec and makes no network calls', async () => {
    let fetchCalls = 0;
    const specs = [
      fakeEntry({ id: 'ck-avatar-01-exec-comms' }),
      fakeEntry({ id: 'ck-avatar-02-exec-admin' }),
    ];
    const prompts = {
      'ck-avatar-01-exec-comms.prompt.md': PROMPT_TEXT,
      'ck-avatar-02-exec-admin.prompt.md': PROMPT_TEXT,
    };
    const result = await run({
      dryRun: true, only: null, apiKey: null, specs, prompts,
      config: { fields: {} },
      fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
      preflightImpl: () => ({ ok: true }),
    });
    assert.equal(fetchCalls, 0, 'fetch must not be called in dry-run');
    assert.equal(result.dryRun, true);
    assert.equal(result.count, 2);
    assert.ok(result.results.every((r) => r.dryRun === true));
    assert.ok(result.results[0].payload);
  });
});

describe('run() --only filter', () => {
  it('selects only the named spec', async () => {
    const specs = [
      fakeEntry({ id: 'ck-avatar-01-exec-comms' }),
      fakeEntry({ id: 'ck-avatar-02-exec-admin' }),
      fakeEntry({ id: 'ck-avatar-04-ceo-self', subject: { name: 'CEO', kind: 'self', contentRating: 'PG' } }),
    ];
    const prompts = {
      'ck-avatar-01-exec-comms.prompt.md': PROMPT_TEXT,
      'ck-avatar-02-exec-admin.prompt.md': PROMPT_TEXT,
      'ck-avatar-04-ceo-self.prompt.md': PROMPT_TEXT,
    };
    const result = await run({
      dryRun: true, only: 'ck-avatar-02-exec-admin', specs, prompts,
      config: { fields: {} }, preflightImpl: () => ({ ok: true }),
    });
    assert.equal(result.count, 1);
    assert.equal(result.results[0].id, 'ck-avatar-02-exec-admin');
  });

  it('returns zero results when --only matches nothing', async () => {
    const result = await run({
      dryRun: true, only: 'does-not-exist',
      specs: [fakeEntry()], prompts: {}, config: { fields: {} }, preflightImpl: () => ({ ok: true }),
    });
    assert.equal(result.count, 0);
    assert.equal(result.results.length, 0);
  });
});

describe('run() self-likeness preflight gate', () => {
  it('skips self-kind spec when preflight fails', async () => {
    const specs = [fakeEntry({ id: 'ck-avatar-04-ceo-self', subject: { name: 'CEO', kind: 'self', contentRating: 'PG' } })];
    const prompts = { 'ck-avatar-04-ceo-self.prompt.md': PROMPT_TEXT };
    const result = await run({
      dryRun: true, specs, prompts, config: { fields: {} },
      preflightImpl: () => ({ ok: false, missing: [{ pattern: 'manus-documents/ceo/bio.md' }] }),
    });
    assert.equal(result.count, 0);
    assert.equal(result.skipped.length, 1);
    assert.match(result.skipped[0].reason, /preflight-ceo/);
  });

  it('runs self-kind spec when preflight passes', async () => {
    const specs = [fakeEntry({ id: 'ck-avatar-04-ceo-self', subject: { name: 'CEO', kind: 'self', contentRating: 'PG' } })];
    const prompts = { 'ck-avatar-04-ceo-self.prompt.md': PROMPT_TEXT };
    const result = await run({
      dryRun: true, specs, prompts, config: { fields: {} }, preflightImpl: () => ({ ok: true }),
    });
    assert.equal(result.count, 1);
    assert.equal(result.skipped.length, 0);
  });
});

describe('run() missing API key path', () => {
  it('throws MISSING_API_KEY when not dry-run and no apiKey', async () => {
    let fetchCalls = 0;
    await assert.rejects(
      () => run({
        dryRun: false, apiKey: null,
        specs: [fakeEntry()], prompts: { [fakeEntry().filename.replace(/\.json$/, '.prompt.md')]: PROMPT_TEXT },
        config: { fields: {} },
        fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
        preflightImpl: () => ({ ok: true }),
      }),
      (err) => err.code === 'MISSING_API_KEY',
    );
    assert.equal(fetchCalls, 0, 'must not touch fetch when API key is missing');
  });

  it('throws MISSING_TRANSPORT_CONFIG when apiKey present but transport fields unset', async () => {
    let fetchCalls = 0;
    const entry = fakeEntry();
    await assert.rejects(
      () => run({
        dryRun: false, apiKey: 'fake-key',
        specs: [entry], prompts: { [entry.filename.replace(/\.json$/, '.prompt.md')]: PROMPT_TEXT },
        config: { fields: {} },
        fetchImpl: async () => { fetchCalls += 1; return { ok: true, status: 200 }; },
        preflightImpl: () => ({ ok: true }),
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
      baseUrl: 'https://example.test', generatePath: '/g', statusPath: '/s', authHeader: 'Bearer x',
    });
    assert.deepEqual(missing, []);
  });
});
