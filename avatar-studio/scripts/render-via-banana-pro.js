#!/usr/bin/env node
/**
 * render-via-banana-pro.js
 *
 * Operator-side script that submits each built avatar spec to Banana Pro AI
 * and downloads the returned .mov files into avatar-studio/renders/.
 *
 * Endpoint facts (sourced 2026-04-21):
 *   VERIFIED from published curl examples:
 *     - Host:   https://gateway.bananapro.site
 *     - Auth:   Authorization: Bearer <key>
 *     - Image:  POST /api/v1/images/generate
 *   INFERRED (pattern-matched from the image endpoint; not confirmed from
 *   a primary source at scaffold time. Official docs at api.bananapro.site
 *   returned 403 to automated fetch.):
 *     - Video submit: POST /api/v1/videos/generate
 *     - Video status: GET  /api/v1/videos/status/{id}
 *     - Response shape: { task_id | id, status, output_url | url }
 *
 * Every inferred path is overridable via env var. Use --probe to submit a
 * minimal call and dump the raw response so any mismatch surfaces as a
 * concrete 4xx/5xx body rather than a silent misparse.
 *
 * Usage:
 *   export BANANA_PRO_API_KEY=sk_...
 *   node avatar-studio/scripts/render-via-banana-pro.js
 *
 * Flags:
 *   --only <id>    Render a single build (e.g. ck-avatar-01-exec-comms)
 *   --dry-run      Print the request payload; do not call the API
 *   --probe        Submit one minimal generate call and print raw response.
 *                  Use this first to verify the endpoint + auth + schema
 *                  against your account before doing a real render run.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildAvatarSpec, renderPrompt } = require('../../lib/avatar-spec');

const SPEC_DIR = path.join(__dirname, '..', 'specs');
const RENDER_DIR = path.join(__dirname, '..', 'renders');

// Banana Pro endpoint and auth (see header comment for source).
const BANANA_PRO_BASE_URL =
  process.env.BANANA_PRO_BASE_URL || 'https://gateway.bananapro.site';
const BANANA_PRO_GENERATE_PATH =
  process.env.BANANA_PRO_GENERATE_PATH || '/api/v1/videos/generate';
const BANANA_PRO_STATUS_PATH =
  process.env.BANANA_PRO_STATUS_PATH || '/api/v1/videos/status';

// Response field names (override via env if your account uses different keys).
const FIELD_JOB_ID = process.env.BANANA_PRO_FIELD_JOB_ID || 'task_id';
const FIELD_STATUS = process.env.BANANA_PRO_FIELD_STATUS || 'status';
const FIELD_OUTPUT_URL = process.env.BANANA_PRO_FIELD_OUTPUT_URL || 'output_url';
const STATUS_COMPLETED_VALUE =
  process.env.BANANA_PRO_STATUS_COMPLETED || 'completed';

// ─────────────────────────────────────────────────────────────────────────
// Output settings — these are fixed by the avatar-studio technical standard.
// ─────────────────────────────────────────────────────────────────────────
const OUTPUT_SETTINGS = Object.freeze({
  width: 1179,
  height: 2556,
  fps: 60,
  durationSeconds: 4,
  seamlessLoop: true,
  container: 'mov',
  codec: 'hevc',
  colorSpace: 'display-p3',
  dynamicRange: 'hdr10',
});

function parseArgs(argv) {
  const args = { only: null, dryRun: false, probe: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--only' && argv[i + 1]) { args.only = argv[++i]; }
    else if (argv[i] === '--dry-run') { args.dryRun = true; }
    else if (argv[i] === '--probe') { args.probe = true; }
  }
  return args;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function loadSpecs() {
  return fs.readdirSync(SPEC_DIR)
    .filter((f) => f.endsWith('.config.js'))
    .sort()
    .map((f) => {
      const cfg = require(path.join(SPEC_DIR, f));
      const spec = buildAvatarSpec(cfg);
      return { file: f, spec, prompt: renderPrompt(spec) };
    });
}

function buildRequestPayload(spec, prompt) {
  // Request shape mirrors the gateway.bananapro.site images/generate body.
  // Video-specific field names may differ. Override FIELD_* env vars if so.
  return {
    prompt,
    output: OUTPUT_SETTINGS,
    metadata: {
      build_id: spec.id,
      role: spec.role,
      subject_kind: spec.subject.kind,
      content_rating: spec.subject.contentRating,
    },
  };
}

async function submitToBananaPro(payload) {
  const apiKey = process.env.BANANA_PRO_API_KEY;
  if (!apiKey) {
    throw new Error('BANANA_PRO_API_KEY not set in environment');
  }

  const res = await fetch(`${BANANA_PRO_BASE_URL}${BANANA_PRO_GENERATE_PATH}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Banana Pro generate failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function pollForCompletion(jobId, { timeoutMs = 10 * 60 * 1000, intervalMs = 5000 } = {}) {
  const apiKey = process.env.BANANA_PRO_API_KEY;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${BANANA_PRO_BASE_URL}${BANANA_PRO_STATUS_PATH}/${jobId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`status poll failed: ${res.status}`);
    const body = await res.json();
    if (body[FIELD_STATUS] === STATUS_COMPLETED_VALUE && body[FIELD_OUTPUT_URL]) {
      return body[FIELD_OUTPUT_URL];
    }
    if (body[FIELD_STATUS] === 'failed') throw new Error(`render failed: ${body.error || 'unknown'}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`render timed out after ${timeoutMs}ms`);
}

async function downloadMov(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function probe() {
  const entries = loadSpecs();
  const { spec, prompt } = entries[0];
  const payload = buildRequestPayload(spec, prompt);
  console.log(`[probe] POST ${BANANA_PRO_BASE_URL}${BANANA_PRO_GENERATE_PATH}`);
  console.log(`[probe] build_id=${spec.id}`);
  const apiKey = process.env.BANANA_PRO_API_KEY;
  if (!apiKey) throw new Error('BANANA_PRO_API_KEY not set in environment');
  const res = await fetch(`${BANANA_PRO_BASE_URL}${BANANA_PRO_GENERATE_PATH}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log(`[probe] HTTP ${res.status}`);
  console.log(`[probe] response body:\n${text}`);
  if (!res.ok) {
    console.log('\n[probe] non-2xx. Inspect the body. Common fixes:');
    console.log('  - 401/403: BANANA_PRO_API_KEY invalid or missing.');
    console.log('  - 404: path mismatch. Set BANANA_PRO_GENERATE_PATH to the real video path.');
    console.log('  - 400: payload shape mismatch. Compare above body against Banana Pro docs.');
    process.exit(1);
  }
  try {
    const json = JSON.parse(text);
    const id = json[FIELD_JOB_ID] || json.job_id || json.id;
    console.log(`[probe] parsed job id (field="${FIELD_JOB_ID}"): ${id || 'NOT FOUND'}`);
    if (!id) {
      console.log('[probe] response did not contain the expected job id field.');
      console.log('        Set BANANA_PRO_FIELD_JOB_ID env var to the correct key.');
    }
  } catch {
    console.log('[probe] response was not JSON. Endpoint may be wrong.');
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.probe) {
    await probe();
    return;
  }

  ensureDir(RENDER_DIR);

  const entries = loadSpecs().filter((e) => !args.only || e.spec.id === args.only);
  if (entries.length === 0) {
    console.error(args.only ? `No spec matched --only ${args.only}` : 'No specs found');
    process.exit(1);
  }

  for (const { spec, prompt } of entries) {
    const payload = buildRequestPayload(spec, prompt);
    const outPath = path.join(RENDER_DIR, `${spec.id}.mov`);

    if (args.dryRun) {
      console.log(`[dry-run] ${spec.id}`);
      console.log(JSON.stringify(payload, null, 2));
      continue;
    }

    console.log(`[submit] ${spec.id}`);
    const submitted = await submitToBananaPro(payload);
    const jobId = submitted[FIELD_JOB_ID] || submitted.job_id || submitted.id;
    if (!jobId) throw new Error(`no job id in response: ${JSON.stringify(submitted)}`);

    console.log(`[poll]   ${spec.id} job=${jobId}`);
    const outputUrl = await pollForCompletion(jobId);

    console.log(`[fetch]  ${spec.id} <- ${outputUrl}`);
    await downloadMov(outputUrl, outPath);
    console.log(`[saved]  ${outPath}`);
  }

  console.log('\nAll renders complete. Transfer to iPhone via AirDrop or Files app,');
  console.log('then follow avatar-studio/DEPLOY.md for the Live Photo / Wallpaper steps.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = {
  OUTPUT_SETTINGS,
  buildRequestPayload,
  loadSpecs,
};
