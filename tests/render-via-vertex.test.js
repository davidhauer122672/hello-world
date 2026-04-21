const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// The Vertex renderer reads env vars at module load time for defaults, so
// set known values before requiring it.
process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
process.env.VERTEX_LOCATION = 'us-central1';
process.env.VERTEX_MODEL = 'veo-3.0-generate-preview';
process.env.VERTEX_STORAGE_URI = 'gs://test-bucket/avatars/';

const {
  OUTPUT_PARAMETERS,
  buildRequestPayload,
  generateUrl,
  operationUrl,
  extractGcsUris,
  loadSpecs,
} = require('../avatar-studio/scripts/render-via-vertex');

describe('vertex: OUTPUT_PARAMETERS', () => {
  it('locks 9:16 aspect ratio and 4-second duration', () => {
    assert.equal(OUTPUT_PARAMETERS.aspectRatio, '9:16');
    assert.equal(OUTPUT_PARAMETERS.durationSeconds, 4);
    assert.equal(OUTPUT_PARAMETERS.sampleCount, 1);
  });
});

describe('vertex: generateUrl', () => {
  it('builds the predictLongRunning URL with project, location, model', () => {
    const url = generateUrl();
    assert.match(url, /^https:\/\/us-central1-aiplatform\.googleapis\.com/);
    assert.match(url, /projects\/test-project/);
    assert.match(url, /locations\/us-central1/);
    assert.match(url, /models\/veo-3\.0-generate-preview:predictLongRunning$/);
  });
});

describe('vertex: operationUrl', () => {
  it('builds the operation polling URL from an operation name', () => {
    const name = 'projects/p/locations/us-central1/operations/abc123';
    const url = operationUrl(name);
    assert.equal(url, 'https://us-central1-aiplatform.googleapis.com/v1/' + name);
  });
});

describe('vertex: buildRequestPayload', () => {
  const { spec, prompt } = loadSpecs()[0];

  it('puts prompt under instances[0].prompt', () => {
    const p = buildRequestPayload(spec, prompt);
    assert.equal(p.instances.length, 1);
    assert.equal(typeof p.instances[0].prompt, 'string');
    assert.ok(p.instances[0].prompt.length > 100);
  });

  it('scopes storageUri per build id', () => {
    const p = buildRequestPayload(spec, prompt);
    assert.match(p.parameters.storageUri, /^gs:\/\/test-bucket\/avatars\//);
    assert.ok(p.parameters.storageUri.endsWith(`/${spec.id}/`));
  });

  it('carries the locked OUTPUT_PARAMETERS', () => {
    const p = buildRequestPayload(spec, prompt);
    assert.equal(p.parameters.aspectRatio, '9:16');
    assert.equal(p.parameters.durationSeconds, 4);
    assert.equal(p.parameters.sampleCount, 1);
    assert.equal(p.parameters.personGeneration, 'allow_adult');
  });
});

describe('vertex: extractGcsUris', () => {
  it('pulls gcsUri from videos array', () => {
    const uris = extractGcsUris({ videos: [{ gcsUri: 'gs://a/x.mp4' }, { gcsUri: 'gs://a/y.mp4' }] });
    assert.deepEqual(uris, ['gs://a/x.mp4', 'gs://a/y.mp4']);
  });
  it('falls back to uri field', () => {
    const uris = extractGcsUris({ generatedSamples: [{ uri: 'gs://a/z.mp4' }] });
    assert.deepEqual(uris, ['gs://a/z.mp4']);
  });
  it('returns empty array when no recognized shape', () => {
    assert.deepEqual(extractGcsUris({}), []);
    assert.deepEqual(extractGcsUris({ videos: [] }), []);
  });
});

describe('vertex: loadSpecs', () => {
  it('loads all four authored avatar-studio configs', () => {
    const entries = loadSpecs();
    assert.ok(entries.length >= 4, `expected >=4 specs, got ${entries.length}`);
    for (const e of entries) {
      assert.ok(e.spec.id);
      assert.ok(typeof e.prompt === 'string');
    }
  });
});
