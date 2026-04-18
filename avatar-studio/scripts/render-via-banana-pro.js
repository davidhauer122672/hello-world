#!/usr/bin/env node
/**
 * render-via-banana-pro.js
 *
 * Operator-side script that submits each built avatar spec to Banana Pro AI
 * and downloads the returned .mov files into avatar-studio/renders/.
 *
 * THIS SCRIPT IS A SCAFFOLD. The Banana Pro API endpoint, auth shape, and
 * response schema are NOT set here because I have not verified them. Fill in
 * the three TODO blocks below before running.
 *
 * Usage (after filling TODOs):
 *   export BANANA_PRO_API_KEY=sk_...
 *   node avatar-studio/scripts/render-via-banana-pro.js
 *
 * Optional flags:
 *   --only <id>    Render a single build by id (e.g. ck-avatar-01-exec-comms)
 *   --dry-run      Print the request payload; do not call the API
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildAvatarSpec, renderPrompt } = require('../../lib/avatar-spec');

const SPEC_DIR = path.join(__dirname, '..', 'specs');
const RENDER_DIR = path.join(__dirname, '..', 'renders');

// ─────────────────────────────────────────────────────────────────────────
// TODO 1 — Banana Pro endpoint and auth.
// Replace with the real values from Banana Pro's documentation. I won't
// invent these; guessing the endpoint would mean requests either fail or hit
// the wrong URL.
// ─────────────────────────────────────────────────────────────────────────
const BANANA_PRO_BASE_URL = process.env.BANANA_PRO_BASE_URL || 'https://api.bananapro.ai'; // TODO: confirm
const BANANA_PRO_GENERATE_PATH = '/v1/video/generate'; // TODO: confirm
const BANANA_PRO_STATUS_PATH = '/v1/video/status';     // TODO: confirm

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
  const args = { only: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--only' && argv[i + 1]) { args.only = argv[++i]; }
    else if (argv[i] === '--dry-run') { args.dryRun = true; }
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
  // ───────────────────────────────────────────────────────────────────────
  // TODO 2 — Shape this payload to match Banana Pro's generate endpoint.
  // The fields below are what I'd expect based on common video-gen APIs; the
  // real field names may differ.
  // ───────────────────────────────────────────────────────────────────────
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
      'Authorization': `Bearer ${apiKey}`, // TODO: confirm auth scheme
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
    // ─────────────────────────────────────────────────────────────────────
    // TODO 3 — Adjust these field names to match Banana Pro's status schema.
    // Expect something like { status: 'completed', output_url: '...' } but
    // verify in their docs before trusting.
    // ─────────────────────────────────────────────────────────────────────
    if (body.status === 'completed' && body.output_url) return body.output_url;
    if (body.status === 'failed') throw new Error(`render failed: ${body.error || 'unknown'}`);
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

async function main() {
  const args = parseArgs(process.argv);
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
    // TODO 3 (cont.) — adjust field name to match Banana Pro's response.
    const jobId = submitted.job_id || submitted.id;
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
