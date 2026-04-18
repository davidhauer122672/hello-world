#!/usr/bin/env node
'use strict';

// Render submission — reads built specs from avatar-studio/build/ and submits
// each to the Banana Pro API using config values injected at runtime. The
// four Banana Pro fields (base URL, two paths, auth header, three field
// names) are env-var driven and must be populated once the Banana Pro
// account is provisioned. Until then, use `--dry-run` for payload preview.
//
// Public API (exported for tests):
//   parseArgs(argv)            -> { dryRun, only }
//   buildRequestPayload(spec, config)
//   run({ dryRun, only, apiKey, specs, config, fetchImpl })
//
// No network calls are made unless all four config fields are provided AND
// --dry-run is absent. Tests exercise run() directly with fake specs.

const fs = require('fs');
const path = require('path');
const { buildRequestPayload } = require('../lib/build-payload');

const STUDIO_ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(STUDIO_ROOT, 'build');
const CONFIG_PATH = path.join(STUDIO_ROOT, 'config.json');

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

function loadBuiltSpecs(dir = BUILD_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.prompt.json'))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function loadConfigFromEnv(env, base) {
  const cfg = JSON.parse(JSON.stringify(base || {}));
  cfg.baseUrl        = env.BANANA_PRO_BASE_URL        || cfg.baseUrl        || null;
  cfg.generatePath   = env.BANANA_PRO_GENERATE_PATH   || cfg.generatePath   || null;
  cfg.statusPath     = env.BANANA_PRO_STATUS_PATH     || cfg.statusPath     || null;
  cfg.authHeader     = env.BANANA_PRO_AUTH_HEADER     || cfg.authHeader     || null;
  cfg.fields = cfg.fields || {};
  cfg.fields.promptField       = env.BANANA_PRO_PROMPT_FIELD       || cfg.fields.promptField       || 'prompt';
  cfg.fields.metadataField     = env.BANANA_PRO_METADATA_FIELD     || cfg.fields.metadataField     || 'metadata';
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
  const config = opts.config || { fields: {} };
  const fetchImpl = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);

  if (!dryRun && !apiKey) {
    const err = new Error('BANANA_PRO_API_KEY is required unless --dry-run is passed');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const selected = only ? specs.filter((s) => s.id === only) : specs;
  if (selected.length === 0) {
    return { dryRun, count: 0, results: [] };
  }

  const results = [];

  if (dryRun) {
    for (const spec of selected) {
      const payload = buildRequestPayload(spec, config);
      results.push({ id: spec.id, dryRun: true, payload });
    }
    return { dryRun: true, count: results.length, results };
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
  for (const spec of selected) {
    const payload = buildRequestPayload(spec, config);
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.authHeader,
      },
      body: JSON.stringify(payload),
    });
    results.push({ id: spec.id, status: res && res.status, ok: !!(res && res.ok) });
  }
  return { dryRun: false, count: results.length, results };
}

async function main(argv, env) {
  const { dryRun, only } = parseArgs(argv);
  const baseConfig = fs.existsSync(CONFIG_PATH) ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) : {};
  const config = loadConfigFromEnv(env, baseConfig);
  const apiKey = env.BANANA_PRO_API_KEY || null;
  const specs = loadBuiltSpecs();
  if (specs.length === 0) {
    process.stderr.write('No built specs found. Run `npm run avatar:build` first.\n');
    return 1;
  }
  try {
    const result = await run({ dryRun, only, apiKey, specs, config });
    process.stdout.write(`avatar-studio render: ${result.count} spec(s), dryRun=${result.dryRun}\n`);
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
  loadConfigFromEnv,
  missingTransportConfig,
  BUILD_DIR,
};
