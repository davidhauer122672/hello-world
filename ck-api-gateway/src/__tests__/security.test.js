import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Sovereign Shield Security Tests
 *
 * Tests injection detection, security headers, PII redaction,
 * security routes, and the SEC agent division.
 */

import {
  detectInjection,
  deepScanObject,
  redactPII,
  SECURITY_HEADERS,
} from '../middleware/security.js';

import {
  handleSecurityDashboard,
  handleSecurityCompliance,
  handleSecurityScan,
  handleSecurityIncident,
} from '../routes/security-ops.js';

import { SEC_AGENTS } from '../agents/agents-sec.js';

// ── Mock helpers ──

function createMockEnv() {
  const kvStore = new Map();
  return {
    WORKER_AUTH_TOKEN: 'test-token',
    AIRTABLE_BASE_ID: 'appUSnNgpDkcEOzhN',
    AIRTABLE_API_KEY: 'test-key',
    AUDIT_LOG: {
      get: async (key, type) => {
        const val = kvStore.get(key);
        if (!val) return null;
        return type === 'json' ? JSON.parse(val) : val;
      },
      put: async (key, value) => {
        kvStore.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      },
      list: async ({ prefix, limit }) => ({
        keys: [...kvStore.keys()].filter(k => k.startsWith(prefix)).slice(0, limit).map(k => ({ name: k })),
        cursor: null,
      }),
    },
  };
}

function createMockCtx() {
  return { waitUntil: () => {} };
}

function createMockRequest(body) {
  return { json: async () => body };
}

// ── Injection Detection Tests ──

describe('Sovereign Shield — SQL Injection Detection', () => {
  it('detects SELECT FROM pattern', () => {
    assert.equal(detectInjection("' OR 1=1 --"), 'sql_injection');
  });

  it('detects UNION SELECT', () => {
    assert.equal(detectInjection('UNION ALL SELECT * FROM users'), 'sql_injection');
  });

  it('allows normal text', () => {
    assert.equal(detectInjection('John Smith, 123 Main St, Stuart FL'), null);
  });

  it('allows normal property descriptions', () => {
    assert.equal(detectInjection('Beautiful 3BR/2BA waterfront property in Palm City'), null);
  });
});

describe('Sovereign Shield — XSS Detection', () => {
  it('detects script tags', () => {
    assert.equal(detectInjection('<script>alert("xss")</script>'), 'xss');
  });

  it('detects javascript: protocol', () => {
    assert.equal(detectInjection('javascript:alert(1)'), 'xss');
  });

  it('detects event handlers', () => {
    assert.equal(detectInjection('<img onerror=alert(1)>'), 'xss');
  });

  it('detects iframe injection', () => {
    assert.equal(detectInjection('<iframe src="evil.com">'), 'xss');
  });
});

describe('Sovereign Shield — Path Traversal Detection', () => {
  it('detects ../ traversal', () => {
    assert.equal(detectInjection('../../etc/passwd'), 'path_traversal');
  });

  it('detects encoded traversal', () => {
    assert.equal(detectInjection('%2e%2e/etc/passwd'), 'path_traversal');
  });
});

describe('Sovereign Shield — Command Injection Detection', () => {
  it('detects command chaining', () => {
    assert.equal(detectInjection('; rm -rf /'), 'command_injection');
  });

  it('detects backtick execution', () => {
    assert.equal(detectInjection('`whoami`'), 'command_injection');
  });
});

describe('Sovereign Shield — SSRF Detection', () => {
  it('detects localhost SSRF', () => {
    assert.equal(detectInjection('http://127.0.0.1/admin'), 'ssrf');
  });

  it('detects metadata endpoint', () => {
    assert.equal(detectInjection('http://169.254.169.254/latest/meta-data'), 'ssrf');
  });
});

// ── Deep Object Scanning Tests ──

describe('Sovereign Shield — Deep Object Scan', () => {
  it('detects injection in nested objects', () => {
    const obj = {
      lead: {
        name: 'John',
        notes: "'; DROP TABLE leads; --",
      },
    };
    const result = deepScanObject(obj);
    assert.ok(result);
    assert.equal(result.threat, 'sql_injection');
    assert.equal(result.path, 'lead.notes');
  });

  it('detects injection in arrays', () => {
    const obj = { tags: ['normal', '<script>alert(1)</script>'] };
    const result = deepScanObject(obj);
    assert.ok(result);
    assert.equal(result.threat, 'xss');
  });

  it('returns null for clean objects', () => {
    const obj = {
      name: 'Coastal Key Property Management',
      address: '1407 SE Legacy Cove Circle',
      value: 750000,
    };
    assert.equal(deepScanObject(obj), null);
  });
});

// ── PII Redaction Tests ──

describe('Sovereign Shield — PII Redaction', () => {
  it('redacts SSN patterns', () => {
    const input = 'SSN: 123-45-6789';
    const result = redactPII(input);
    assert.ok(result.includes('[REDACTED:ssn]'));
    assert.ok(!result.includes('123-45-6789'));
  });

  it('redacts credit card numbers', () => {
    const input = 'Card: 4111111111111111';
    const result = redactPII(input);
    assert.ok(result.includes('[REDACTED:credit_card]'));
  });

  it('preserves non-PII text', () => {
    const input = 'Property at 1407 SE Legacy Cove Circle';
    assert.equal(redactPII(input), input);
  });
});

// ── Security Headers Tests ──

describe('Sovereign Shield — Security Headers', () => {
  it('includes HSTS', () => {
    assert.ok(SECURITY_HEADERS['Strict-Transport-Security'].includes('max-age=31536000'));
  });

  it('includes CSP', () => {
    assert.ok(SECURITY_HEADERS['Content-Security-Policy'].includes("default-src 'none'"));
  });

  it('includes X-Frame-Options DENY', () => {
    assert.equal(SECURITY_HEADERS['X-Frame-Options'], 'DENY');
  });

  it('includes nosniff', () => {
    assert.equal(SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff');
  });

  it('includes no-cache for security responses', () => {
    assert.ok(SECURITY_HEADERS['Cache-Control'].includes('no-store'));
  });
});

// ── SEC Agent Division Tests ──

describe('Sovereign Shield — SEC Division Agents', () => {
  it('has exactly 25 agents', () => {
    assert.equal(SEC_AGENTS.length, 25);
  });

  it('all agents belong to SEC division', () => {
    for (const agent of SEC_AGENTS) {
      assert.equal(agent.division, 'SEC');
    }
  });

  it('has Shield Commander as CSO (SEC-001)', () => {
    const cso = SEC_AGENTS.find(a => a.id === 'SEC-001');
    assert.ok(cso);
    assert.ok(cso.role.includes('Chief Security Officer'));
  });

  it('covers all three breach vectors', () => {
    const apiAgents = SEC_AGENTS.filter(a => ['SEC-003', 'SEC-004', 'SEC-005', 'SEC-006'].includes(a.id));
    const middlewareAgents = SEC_AGENTS.filter(a => ['SEC-007', 'SEC-008', 'SEC-009', 'SEC-010'].includes(a.id));
    const cloudAgents = SEC_AGENTS.filter(a => ['SEC-011', 'SEC-012', 'SEC-013', 'SEC-014'].includes(a.id));

    assert.ok(apiAgents.length >= 4, 'API security agents');
    assert.ok(middlewareAgents.length >= 4, 'Middleware security agents');
    assert.ok(cloudAgents.length >= 4, 'Cloud security agents');
  });

  it('has incident response team', () => {
    const irTeam = SEC_AGENTS.filter(a => ['SEC-015', 'SEC-016', 'SEC-017'].includes(a.id));
    assert.equal(irTeam.length, 3);
  });
});

// ── Security Route Tests ──

describe('Sovereign Shield — Security Dashboard', () => {
  it('returns security posture with score', async () => {
    const res = await handleSecurityDashboard(createMockEnv());
    const body = await res.json();

    assert.ok(body.posture);
    assert.ok(body.posture.score >= 0 && body.posture.score <= 100);
    assert.ok(['GOLD', 'SILVER', 'BRONZE'].includes(body.posture.rating));
    assert.ok(body.threat_vectors.api_security);
    assert.ok(body.threat_vectors.middleware_security);
    assert.ok(body.threat_vectors.infrastructure_security);
  });
});

describe('Sovereign Shield — Compliance', () => {
  it('returns all compliance frameworks', async () => {
    const res = handleSecurityCompliance();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.frameworks);
    assert.ok(body.controls);
    assert.ok(body.summary);
    assert.ok(body.summary.total_frameworks >= 7);
    assert.ok(body.summary.total_controls >= 26);
  });
});

describe('Sovereign Shield — Security Scan', () => {
  it('detects threats in payload', async () => {
    const req = createMockRequest({ payload: "'; DROP TABLE leads; --" });
    const res = await handleSecurityScan(req, createMockEnv(), createMockCtx());
    const body = await res.json();

    assert.equal(body.verdict, 'THREATS_DETECTED');
    assert.ok(body.findings.length > 0);
    assert.equal(body.findings[0].type, 'sql_injection');
  });

  it('returns CLEAN for safe payload', async () => {
    const req = createMockRequest({ payload: { name: 'John Smith', address: '123 Main St' } });
    const res = await handleSecurityScan(req, createMockEnv(), createMockCtx());
    const body = await res.json();

    assert.equal(body.verdict, 'CLEAN');
    assert.equal(body.findings.length, 0);
  });

  it('scans nested objects', async () => {
    const req = createMockRequest({
      payload: { user: { bio: '<script>document.cookie</script>' } },
    });
    const res = await handleSecurityScan(req, createMockEnv(), createMockCtx());
    const body = await res.json();

    assert.equal(body.verdict, 'THREATS_DETECTED');
    assert.equal(body.findings[0].type, 'xss');
  });

  it('rejects missing payload and url', async () => {
    const req = createMockRequest({});
    const res = await handleSecurityScan(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });
});

describe('Sovereign Shield — Incident Reporting', () => {
  it('creates an incident with correct severity', async () => {
    const req = createMockRequest({
      severity: 'critical',
      title: 'Unauthorized API access detected',
      vector: 'api_exploitation',
      affected_systems: ['ck-api-gateway'],
    });
    const res = await handleSecurityIncident(req, createMockEnv(), createMockCtx());
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.ok(body.incident_id.startsWith('INC-'));
    assert.equal(body.severity, 'critical');
    assert.equal(body.status, 'open');
    assert.equal(body.assigned_to, 'SEC-015 Incident Commander');
    assert.ok(body.sla.sla_response);
  });

  it('rejects invalid severity', async () => {
    const req = createMockRequest({ severity: 'extreme', title: 'test' });
    const res = await handleSecurityIncident(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects missing title', async () => {
    const req = createMockRequest({ severity: 'high' });
    const res = await handleSecurityIncident(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });

  it('rejects malformed JSON', async () => {
    const req = { json: async () => { throw new Error('bad'); } };
    const res = await handleSecurityIncident(req, createMockEnv(), createMockCtx());
    assert.equal(res.status, 400);
  });
});
