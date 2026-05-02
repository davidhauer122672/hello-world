import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// Inline worker for testing
let worker;

before(async () => {
  worker = (await import('../index.js')).default;
});

function makeRequest(path, options = {}) {
  const url = `https://test.worker.dev${path}`;
  return new Request(url, options);
}

const env = {
  WORKER_AUTH_TOKEN: 'test-token',
  MODEL_ID: 'nvidia/nemotron-4-340b-instruct',
  NVIDIA_API_KEY: 'test-nvidia-key',
};

describe('ck-nemotron-worker', () => {
  it('returns health check', async () => {
    const req = makeRequest('/v1/health');
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'operational');
    assert.equal(body.service, 'ck-nemotron-worker');
  });

  it('returns 404 for unknown routes', async () => {
    const req = makeRequest('/unknown');
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 404);
  });

  it('returns 401 without auth token', async () => {
    const req = makeRequest('/v1/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test' }),
    });
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 401);
  });

  it('returns 400 when prompt is missing', async () => {
    const req = makeRequest('/v1/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({}),
    });
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Missing or invalid required field: prompt');
  });

  it('handles CORS preflight', async () => {
    const req = makeRequest('/v1/inference', { method: 'OPTIONS' });
    const res = await worker.fetch(req, env);
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  });
});
