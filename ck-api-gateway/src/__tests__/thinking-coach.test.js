import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Import service ──
import { listFrameworks, getFramework, FRAMEWORKS } from '../services/thinking-coach.js';

// ── Import routes ──
import {
  handleListThinkingFrameworks,
  handleGetThinkingFramework,
  handleThinkingDashboard,
} from '../routes/thinking-coach.js';

// ── Helper: parse JSON response ──
async function parseResponse(response) {
  const text = await response.text();
  return JSON.parse(text);
}

// ── Helper: mock URL ──
function mockUrl(path, params = {}) {
  const url = new URL(`https://test.workers.dev${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url;
}

// ══════════════════════════════════════════════════════════════════════════════
// Service Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('Thinking Coach Service', () => {
  describe('listFrameworks()', () => {
    it('returns all 7 frameworks', () => {
      const frameworks = listFrameworks();
      assert.equal(frameworks.length, 7);
    });

    it('each framework has required fields', () => {
      const required = ['id', 'name', 'codename', 'inspired_by', 'description', 'domains', 'complexity', 'output_structure'];
      for (const f of listFrameworks()) {
        for (const field of required) {
          assert.ok(f[field] !== undefined, `Framework ${f.id} missing field: ${field}`);
        }
      }
    });

    it('all framework IDs are unique', () => {
      const ids = listFrameworks().map(f => f.id);
      assert.equal(new Set(ids).size, ids.length);
    });

    it('all codenames are unique', () => {
      const codenames = listFrameworks().map(f => f.codename);
      assert.equal(new Set(codenames).size, codenames.length);
    });

    it('complexity is either standard or advanced', () => {
      for (const f of listFrameworks()) {
        assert.ok(['standard', 'advanced'].includes(f.complexity), `Invalid complexity for ${f.id}: ${f.complexity}`);
      }
    });

    it('each framework has at least 2 domains', () => {
      for (const f of listFrameworks()) {
        assert.ok(f.domains.length >= 2, `Framework ${f.id} has ${f.domains.length} domains`);
      }
    });

    it('each framework has at least 2 inspirations', () => {
      for (const f of listFrameworks()) {
        assert.ok(f.inspired_by.length >= 2, `Framework ${f.id} has ${f.inspired_by.length} inspirations`);
      }
    });
  });

  describe('getFramework()', () => {
    it('returns framework by valid ID', () => {
      const f = getFramework('first-principles');
      assert.ok(f);
      assert.equal(f.id, 'first-principles');
      assert.equal(f.codename, 'GROUND TRUTH');
    });

    it('returns null for invalid ID', () => {
      assert.equal(getFramework('nonexistent'), null);
    });

    it('returns each framework correctly', () => {
      const expectedIds = [
        'first-principles', 'mental-models', 'systems-thinking',
        'asymmetric-outcomes', 'neuro-learning', 'competitive-warfare', 'ceo-decision'
      ];
      for (const id of expectedIds) {
        const f = getFramework(id);
        assert.ok(f, `Framework ${id} not found`);
        assert.equal(f.id, id);
      }
    });
  });

  describe('FRAMEWORKS constant', () => {
    it('contains first-principles framework', () => {
      const f = FRAMEWORKS.find(fw => fw.id === 'first-principles');
      assert.ok(f);
      assert.ok(f.inspired_by.includes('Elon Musk'));
    });

    it('contains mental-models framework', () => {
      const f = FRAMEWORKS.find(fw => fw.id === 'mental-models');
      assert.ok(f);
      assert.ok(f.inspired_by.includes('Charlie Munger'));
    });

    it('contains ceo-decision framework', () => {
      const f = FRAMEWORKS.find(fw => fw.id === 'ceo-decision');
      assert.ok(f);
      assert.equal(f.codename, 'SOVEREIGN MIND');
    });

    it('contains neuro-learning framework', () => {
      const f = FRAMEWORKS.find(fw => fw.id === 'neuro-learning');
      assert.ok(f);
      assert.ok(f.inspired_by.includes('Richard Feynman'));
    });

    it('contains competitive-warfare framework', () => {
      const f = FRAMEWORKS.find(fw => fw.id === 'competitive-warfare');
      assert.ok(f);
      assert.equal(f.codename, 'WAR ROOM');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Route Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('Thinking Coach Routes', () => {
  describe('GET /v1/thinking/frameworks', () => {
    it('returns all frameworks', async () => {
      const url = mockUrl('/v1/thinking/frameworks');
      const response = handleListThinkingFrameworks(url);
      const data = await parseResponse(response);
      assert.equal(data.count, 7);
      assert.equal(data.governance, 'sovereign');
      assert.equal(data.executionStandard, 'ferrari');
      assert.ok(Array.isArray(data.frameworks));
    });

    it('filters by domain', async () => {
      const url = mockUrl('/v1/thinking/frameworks', { domain: 'innovation' });
      const response = handleListThinkingFrameworks(url);
      const data = await parseResponse(response);
      assert.ok(data.count > 0);
      assert.ok(data.count < 7);
      for (const f of data.frameworks) {
        assert.ok(f.domains.includes('innovation'));
      }
    });

    it('filters by complexity', async () => {
      const url = mockUrl('/v1/thinking/frameworks', { complexity: 'advanced' });
      const response = handleListThinkingFrameworks(url);
      const data = await parseResponse(response);
      assert.ok(data.count > 0);
      for (const f of data.frameworks) {
        assert.equal(f.complexity, 'advanced');
      }
    });

    it('returns empty for non-matching domain', async () => {
      const url = mockUrl('/v1/thinking/frameworks', { domain: 'nonexistent-domain' });
      const response = handleListThinkingFrameworks(url);
      const data = await parseResponse(response);
      assert.equal(data.count, 0);
    });
  });

  describe('GET /v1/thinking/frameworks/:id', () => {
    it('returns specific framework', async () => {
      const response = handleGetThinkingFramework('first-principles');
      const data = await parseResponse(response);
      assert.ok(data.framework);
      assert.equal(data.framework.id, 'first-principles');
      assert.equal(data.framework.codename, 'GROUND TRUTH');
    });

    it('returns 404 for invalid ID', async () => {
      const response = handleGetThinkingFramework('nonexistent');
      assert.equal(response.status, 404);
      const data = await parseResponse(response);
      assert.ok(data.error);
    });
  });

  describe('GET /v1/thinking/dashboard', () => {
    it('returns operational dashboard', async () => {
      const response = handleThinkingDashboard();
      const data = await parseResponse(response);
      assert.equal(data.status, 'operational');
      assert.equal(data.governance, 'sovereign');
      assert.equal(data.executionStandard, 'ferrari');
      assert.equal(data.frameworks.total, 7);
      assert.ok(data.capabilities);
      assert.ok(data.domain_coverage);
      assert.ok(data.inspired_by);
      assert.ok(data.inspired_by.length >= 10);
    });

    it('includes all capability endpoints', async () => {
      const response = handleThinkingDashboard();
      const data = await parseResponse(response);
      assert.equal(data.capabilities.single_framework_session, '/v1/thinking/session');
      assert.equal(data.capabilities.multi_framework_analysis, '/v1/thinking/multi');
      assert.equal(data.capabilities.learning_blueprint, '/v1/thinking/learning-blueprint');
      assert.equal(data.capabilities.daily_mental_models, '/v1/thinking/daily-models');
    });

    it('includes framework complexity breakdown', async () => {
      const response = handleThinkingDashboard();
      const data = await parseResponse(response);
      assert.ok(data.frameworks.by_complexity.advanced > 0);
      assert.ok(data.frameworks.by_complexity.standard > 0);
      assert.equal(
        data.frameworks.by_complexity.advanced + data.frameworks.by_complexity.standard,
        7
      );
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Integration Tests (route validation)
// ══════════════════════════════════════════════════════════════════════════════

describe('Thinking Coach Route Validation', () => {
  it('POST /v1/thinking/session rejects missing framework', async () => {
    const { handleThinkingSession } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ problem: 'test problem' }),
    };
    const response = await handleThinkingSession(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
    const data = await parseResponse(response);
    assert.ok(data.error.includes('framework'));
  });

  it('POST /v1/thinking/session rejects missing problem', async () => {
    const { handleThinkingSession } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ framework: 'first-principles' }),
    };
    const response = await handleThinkingSession(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
    const data = await parseResponse(response);
    assert.ok(data.error.includes('problem'));
  });

  it('POST /v1/thinking/session rejects invalid framework', async () => {
    const { handleThinkingSession } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ framework: 'invalid', problem: 'test' }),
    };
    const response = await handleThinkingSession(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
    const data = await parseResponse(response);
    assert.ok(data.error.includes('invalid'));
  });

  it('POST /v1/thinking/session rejects invalid JSON', async () => {
    const { handleThinkingSession } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => { throw new Error('bad json'); },
    };
    const response = await handleThinkingSession(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
  });

  it('POST /v1/thinking/multi rejects missing frameworks', async () => {
    const { handleMultiFramework } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ problem: 'test' }),
    };
    const response = await handleMultiFramework(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
    const data = await parseResponse(response);
    assert.ok(data.error.includes('frameworks'));
  });

  it('POST /v1/thinking/multi rejects empty frameworks array', async () => {
    const { handleMultiFramework } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ frameworks: [], problem: 'test' }),
    };
    const response = await handleMultiFramework(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
  });

  it('POST /v1/thinking/multi rejects more than 7 frameworks', async () => {
    const { handleMultiFramework } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({ frameworks: ['a','b','c','d','e','f','g','h'], problem: 'test' }),
    };
    const response = await handleMultiFramework(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
  });

  it('POST /v1/thinking/learning-blueprint rejects missing skill', async () => {
    const { handleLearningBlueprint } = await import('../routes/thinking-coach.js');
    const request = {
      json: async () => ({}),
    };
    const response = await handleLearningBlueprint(request, {}, { waitUntil: () => {} });
    assert.equal(response.status, 400);
    const data = await parseResponse(response);
    assert.ok(data.error.includes('skill'));
  });
});
