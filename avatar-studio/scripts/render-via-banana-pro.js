#!/usr/bin/env node
'use strict';

// Render submission — reads built specs (avatar-studio/specs/built/*.json)
// plus their companion pasteable prompt blocks (avatar-studio/prompts/*.prompt.md),
// and submits each to the Banana Pro API. Transport fields (base URL, two
// paths, auth header, three body field names) are env-var or config-driven
// and must be populated once the Banana Pro account is provisioned. Until
// then, use `--dry-run` for payload preview.
//
// Self-likeness specs trigger the CEO preflight gate; if preflight fails,
// the spec is skipped (rather than failing the whole render).
//
// Public API (exported for tests):
//   parseArgs(argv)        -> { dryRun, only }
//   buildRequestPayload(spec, promptText, config)
//   run({ dryRun, only, apiKey, specs, prompts, config, fetchImpl, preflightImpl })
//
// No network calls are made unless transport config is complete AND --dry-run
// is absent. Tests exercise run() directly with fake specs.

const fs = require('fs');
const path = require('path');
const { buildRequestPayload } = require('../lib/build-payload');
const { runPreflight } = require('./preflight-ceo');

const STUDIO_ROOT = path.resolve(__dirname, '..');
const BUILT_DIR = path.join(STUDIO_ROOT, 'specs', 'built');
const PROMPTS_DIR = path.join(STUDIO_ROOT, 'prompts');
const CONFIG_PATH = path.join(STUDIO_ROOT, 'config.json');

const SPEC_FILENAME_TO_PROMPT = {
  '01-executive-communications-avatar.json': '01-executive-communications-avatar.prompt.md',
  '02-executive-administrator-avatar.json':  '02-executive-administrator-avatar.prompt.md',
  '03-treasure-coast-dawn-wallpaper.json':   '03-treasure-coast-dawn-wallpaper.prompt.md',
  '04-ceo-avatar.json':                      '04-ceo-avatar.prompt.md',
  '05-claude-live-production.json':          '05-claude-live-production.prompt.md',
};

function parseArgs(argv) {
  const args = { dryRun: false, only: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--only') { args.only = argv[i + 1] || null; i += 1; }
    else if (a.startsWith('--only=')) { args.only = a.slice('--only='.length); }
  }
  return args;
}

function loadBuiltSpecs(dir = BUILT_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .sort()
    .map((f) => ({ filename: f, spec: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function loadPrompts(dir = PROMPTS_DIR) {
  if (!fs.existsSync(dir)) return {};
  const byFile = {};
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.prompt.md')) {
      byFile[f] = fs.readFileSync(path.join(dir, f), 'utf8');
    }
  }
  return byFile;
}

function loadConfigFromEnv(env, base) {
  const cfg = JSON.parse(JSON.stringify(base || {}));
  cfg.baseUrl      = env.BANANA_PRO_BASE_URL      || cfg.baseUrl      || null;
  cfg.generatePath = env.BANANA_PRO_GENERATE_PATH || cfg.generatePath || null;
  cfg.statusPath   = env.BANANA_PRO_STATUS_PATH   || cfg.statusPath   || null;
  cfg.authHeader   = env.BANANA_PRO_AUTH_HEADER   || cfg.authHeader   || null;
  cfg.fields = cfg.fields || {};
  cfg.fields.promptField       = env.BANANA_PRO_PROMPT_FIELD        || cfg.fields.promptField       || 'prompt';
  cfg.fields.metadataField     = env.BANANA_PRO_METADATA_FIELD      || cfg.fields.metadataField     || 'metadata';
  cfg.fields.outputFormatField = env.BANANA_PRO_OUTPUT_FORMAT_FIELD || cfg.fields.outputFormatField || 'output_format';
  return cfg;
}

function missingTransportConfig(config) {
  const missing = [];
  if (!config.baseUrl)      missing.push('BANANA_PRO_BASE_URL');
  if (!config.generatePath) missing.push('BANANA_PRO_GENERATE_PATH');
  if (!config.statusPath)   missing.push('BANANA_PRO_STATUS_PATH');
  if (!config.authHeader)   missing.push('BANANA_PRO_AUTH_HEADER');
  return missing;
}

async function run(options) {
  const opts = options || {};
  const dryRun = !!opts.dryRun;
  const only = opts.only || null;
  const apiKey = opts.apiKey || null;
  const specs = Array.isArray(opts.specs) ? opts.specs : [];
  const prompts = opts.prompts || {};
  const config = opts.config || { fields: {} };
  const fetchImpl = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  const preflightImpl = opts.preflightImpl || runPreflight;

  if (!dryRun && !apiKey) {
    const err = new Error('BANANA_PRO_API_KEY is required unless --dry-run is passed');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const selected = only ? specs.filter((s) => s.spec && s.spec.id === only) : specs;
  if (selected.length === 0) {
    return { dryRun, count: 0, skipped: [], results: [] };
  }

  const results = [];
  const skipped = [];
  let preflightReport = null;

  for (const { filename, spec } of selected) {
    if (spec.subject && spec.subject.kind === 'self') {
      if (!preflightReport) preflightReport = preflightImpl();
      if (!preflightReport.ok) {
        skipped.push({ id: spec.id, reason: 'preflight-ceo: required source files missing' });
        continue;
      }
    }
    const promptFilename = SPEC_FILENAME_TO_PROMPT[filename] || filename.replace(/\.json$/, '.prompt.md');
    const promptText = prompts[promptFilename];
    if (!promptText) {
      skipped.push({ id: spec.id, reason: `prompt file not found: ${promptFilename}` });
      continue;
    }
    const payload = buildRequestPayload(spec, promptText, config);

    if (dryRun) {
      results.push({ id: spec.id, dryRun: true, payload });
      continue;
    }

    const missing = missingTransportConfig(config);
    if (missing.length > 0) {
      const err = new Error(`Banana Pro transport config missing: ${missing.join(', ')}`);
      err.code = 'MISSING_TRANSPORT_CONFIG';
      throw err;
    }
    if (!fetchImpl) {
      const err = new Error('No fetch implementation available');
      err.code = 'NO_FETCH';
      throw err;
    }
    const url = config.baseUrl.replace(/\/$/, '') + config.generatePath;
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: config.authHeader },
      body: JSON.stringify(payload),
    });
    results.push({ id: spec.id, status: res && res.status, ok: !!(res && res.ok) });
  }

  return { dryRun, count: results.length, skipped, results };
}

async function main(argv, env) {
  const { dryRun, only } = parseArgs(argv);
  const baseConfig = fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) : {};
  const config = loadConfigFromEnv(env, baseConfig);
  const apiKey = env.BANANA_PRO_API_KEY || null;
  const specs = loadBuiltSpecs();
  const prompts = loadPrompts();
  if (specs.length === 0) {
    process.stderr.write('No built specs found. Run `npm run avatar:build` first.\n');
    return 1;
  }
  try {
    const result = await run({ dryRun, only, apiKey, specs, prompts, config });
    process.stdout.write(`avatar-studio render: ${result.count} spec(s), dryRun=${result.dryRun}\n`);
    for (const s of result.skipped) process.stdout.write(`  SKIPPED ${s.id}: ${s.reason}\n`);
    for (const r of result.results) {
      if (r.dryRun) {
        process.stdout.write(`  [dry-run] ${r.id} (${Object.keys(r.payload).length} payload fields)\n`);
      } else {
        process.stdout.write(`  ${r.ok ? 'OK' : 'FAIL'} ${r.id} (HTTP ${r.status})\n`);
      }
    }
    return 0;
  } catch (err) {
    process.stderr.write(`avatar-studio render: ${err.message}\n`);
    return 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2), process.env).then((code) => process.exit(code));
}

module.exports = {
  parseArgs,
  buildRequestPayload,
  run,
  main,
  loadBuiltSpecs,
  loadPrompts,
  loadConfigFromEnv,
  missingTransportConfig,
  BUILT_DIR,
  PROMPTS_DIR,
  SPEC_FILENAME_TO_PROMPT,
};
