#!/usr/bin/env node
/**
 * render-via-vertex.js
 *
 * Operator-side script that submits each built avatar spec to Google
 * Vertex AI Veo and prints the resulting GCS URIs.
 *
 * Endpoint pattern (verified from Google Cloud docs):
 *   POST https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}
 *        /locations/{LOCATION}/publishers/google/models/{MODEL}:predictLongRunning
 *
 * Request body:
 *   {
 *     "instances":  [{ "prompt": "<text prompt>" }],
 *     "parameters": {
 *       "storageUri":       "gs://<bucket>/<prefix>/",
 *       "sampleCount":      1,
 *       "aspectRatio":      "9:16",
 *       "durationSeconds":  4,
 *       "personGeneration": "allow_adult"
 *     }
 *   }
 *
 * The response returns a long-running operation name; poll:
 *   GET https://{LOCATION}-aiplatform.googleapis.com/v1/{operation_name}
 *
 * When the operation completes, the output GCS URIs appear in the
 * operation response. Vertex writes the .mp4 file(s) directly to the
 * `storageUri` bucket — we print the URIs; the operator downloads with
 * gsutil or the Cloud Console.
 *
 * Why not .mov?  Vertex Veo outputs .mp4 (H.264/H.265). If you need .mov
 * for iOS Live Photo, transcode with:
 *   ffmpeg -i in.mp4 -c:v hevc_videotoolbox -tag:v hvc1 out.mov
 *
 * Usage:
 *   export GOOGLE_CLOUD_PROJECT=coastal-key-soe
 *   export VERTEX_LOCATION=us-central1
 *   export VERTEX_MODEL=veo-3.0-generate-preview
 *   export VERTEX_STORAGE_URI=gs://ck-avatar-renders/
 *   export GOOGLE_ACCESS_TOKEN=$(gcloud auth print-access-token)
 *   node avatar-studio/scripts/render-via-vertex.js
 *
 * Flags:
 *   --only <id>     Render a single build
 *   --dry-run       Print the request payload; do not call the API
 *   --probe         Submit one minimal call and print raw response
 *   --no-poll       Submit only; skip polling and print the operation name
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildAvatarSpec, renderPrompt } = require('../../lib/avatar-spec');

const SPEC_DIR = path.join(__dirname, '..', 'specs');
const RENDER_DIR = path.join(__dirname, '..', 'renders');

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const MODEL = process.env.VERTEX_MODEL || 'veo-3.0-generate-preview';
const STORAGE_URI = process.env.VERTEX_STORAGE_URI;

const OUTPUT_PARAMETERS = Object.freeze({
  sampleCount: 1,
  aspectRatio: '9:16',
  durationSeconds: 4,
  personGeneration: 'allow_adult',
});

function parseArgs(argv) {
  const args = { only: null, dryRun: false, probe: false, noPoll: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--only' && argv[i + 1]) { args.only = argv[++i]; }
    else if (argv[i] === '--dry-run') { args.dryRun = true; }
    else if (argv[i] === '--probe') { args.probe = true; }
    else if (argv[i] === '--no-poll') { args.noPoll = true; }
  }
  return args;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function requireEnv() {
  const missing = [];
  if (!PROJECT) missing.push('GOOGLE_CLOUD_PROJECT');
  if (!STORAGE_URI) missing.push('VERTEX_STORAGE_URI');
  if (!process.env.GOOGLE_ACCESS_TOKEN) missing.push('GOOGLE_ACCESS_TOKEN');
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}.\n` +
      'GOOGLE_ACCESS_TOKEN can be obtained with: gcloud auth print-access-token',
    );
  }
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
  return {
    instances: [{ prompt }],
    parameters: {
      ...OUTPUT_PARAMETERS,
      storageUri: `${STORAGE_URI.replace(/\/+$/, '')}/${spec.id}/`,
    },
  };
}

function generateUrl() {
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}` +
    `/locations/${LOCATION}/publishers/google/models/${MODEL}:predictLongRunning`;
}

function operationUrl(operationName) {
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/${operationName}`;
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function submit(payload) {
  const res = await fetch(generateUrl(), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vertex submit failed: ${res.status} ${text}`);
  }
  return JSON.parse(text);
}

async function pollOperation(operationName, { timeoutMs = 10 * 60 * 1000, intervalMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(operationUrl(operationName), { headers: authHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Vertex poll failed: ${res.status} ${text}`);
    }
    const body = await res.json();
    if (body.done) {
      if (body.error) {
        throw new Error(`Vertex operation failed: ${JSON.stringify(body.error)}`);
      }
      return body.response || body;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Vertex operation timed out after ${timeoutMs}ms: ${operationName}`);
}

/**
 * Extract video GCS URIs from a completed operation response. Veo returns
 * them under response.videos[*].gcsUri per current docs.
 */
function extractGcsUris(response) {
  const uris = [];
  const videos = response?.videos || response?.generatedSamples || response?.predictions;
  if (Array.isArray(videos)) {
    for (const v of videos) {
      const uri = v.gcsUri || v.uri || v.storageUri || v.videoUri;
      if (uri) uris.push(uri);
    }
  }
  return uris;
}

async function probe() {
  requireEnv();
  const entries = loadSpecs();
  const { spec, prompt } = entries[0];
  const payload = buildRequestPayload(spec, prompt);
  console.log(`[probe] POST ${generateUrl()}`);
  console.log(`[probe] build_id=${spec.id}`);
  console.log(`[probe] storageUri=${payload.parameters.storageUri}`);
  const res = await fetch(generateUrl(), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log(`[probe] HTTP ${res.status}`);
  console.log(`[probe] response body:\n${text}`);
  if (!res.ok) {
    console.log('\n[probe] non-2xx. Common fixes:');
    console.log('  - 401: GOOGLE_ACCESS_TOKEN expired. Re-run: gcloud auth print-access-token');
    console.log('  - 403: service account lacks roles/aiplatform.user');
    console.log('  - 404: check GOOGLE_CLOUD_PROJECT, VERTEX_LOCATION, VERTEX_MODEL');
    console.log('  - 400: payload shape mismatch. Inspect error body above.');
    process.exit(1);
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

  if (!args.dryRun) requireEnv();

  for (const { spec, prompt } of entries) {
    const payload = buildRequestPayload(spec, prompt);

    if (args.dryRun) {
      console.log(`[dry-run] ${spec.id}`);
      console.log(`[dry-run] POST ${generateUrl()}`);
      console.log(JSON.stringify(payload, null, 2));
      continue;
    }

    console.log(`[submit] ${spec.id}`);
    const submitted = await submit(payload);
    const operationName = submitted.name;
    if (!operationName) {
      throw new Error(`No operation name in response: ${JSON.stringify(submitted)}`);
    }
    console.log(`[op]     ${operationName}`);

    if (args.noPoll) continue;

    console.log(`[poll]   ${spec.id}`);
    const response = await pollOperation(operationName);
    const uris = extractGcsUris(response);
    if (uris.length === 0) {
      console.log(`[warn]   no video URI found in response; full body:`);
      console.log(JSON.stringify(response, null, 2));
      continue;
    }
    for (const uri of uris) {
      console.log(`[gcs]    ${spec.id} <- ${uri}`);
    }

    const manifest = path.join(RENDER_DIR, `${spec.id}.vertex.json`);
    fs.writeFileSync(manifest, JSON.stringify({ build_id: spec.id, operation: operationName, uris }, null, 2));
    console.log(`[saved]  ${path.relative(process.cwd(), manifest)}`);
  }

  console.log('\nSubmissions complete. Download the .mp4 files from GCS:');
  console.log(`  gsutil -m cp -r ${STORAGE_URI || '<VERTEX_STORAGE_URI>'} ./avatar-studio/renders/`);
  console.log('\nTranscode to .mov (HEVC) for iPhone Live Photo:');
  console.log('  ffmpeg -i input.mp4 -c:v hevc_videotoolbox -tag:v hvc1 output.mov');
  console.log('\nThen follow avatar-studio/DEPLOY.md for the Live Photo / Wallpaper steps.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = {
  OUTPUT_PARAMETERS,
  buildRequestPayload,
  generateUrl,
  operationUrl,
  extractGcsUris,
  loadSpecs,
};
