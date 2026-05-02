import { describe, it, expect } from 'vitest';
import { AI_AGENTS, SERVICE_AREAS, MARKET_DATA_DEFAULTS } from '../src/config/agents.js';

// ─── AI Agent Definitions ────────────────────────────────────────────

describe('AI Agent Definitions', () => {
  const requiredAgents = ['scout', 'compass', 'beacon', 'harbor'];

  it('exports all 4 required agents', () => {
    const keys = Object.keys(AI_AGENTS);
    expect(keys).toEqual(expect.arrayContaining(requiredAgents));
    expect(keys.length).toBe(4);
  });

  requiredAgents.forEach((key) => {
    describe(`Agent: ${key}`, () => {
      const agent = AI_AGENTS[key];

      it('has a name', () => {
        expect(agent.name).toBeTruthy();
        expect(typeof agent.name).toBe('string');
      });

      it('has a subtitle', () => {
        expect(agent.subtitle).toBeTruthy();
      });

      it('has a role description', () => {
        expect(agent.role).toBeTruthy();
        expect(agent.role.length).toBeGreaterThan(5);
      });

      it('has a greeting message', () => {
        expect(agent.greeting).toBeTruthy();
        expect(agent.greeting.length).toBeGreaterThan(50);
      });

      it('has a CSS gradient avatar', () => {
        expect(agent.avatar).toMatch(/linear-gradient|radial-gradient|conic-gradient/);
      });

      it('has a CSS gradient background', () => {
        expect(agent.bg).toMatch(/linear-gradient|radial-gradient/);
      });

      it('has at least 3 demo responses', () => {
        expect(Array.isArray(agent.responses)).toBe(true);
        expect(agent.responses.length).toBeGreaterThanOrEqual(3);
      });

      it('responses are substantive (>50 chars each)', () => {
        agent.responses.forEach((r) => {
          expect(r.length).toBeGreaterThan(50);
        });
      });

      it('greeting does not contain hardcoded API keys or secrets', () => {
        expect(agent.greeting).not.toMatch(/sk-|api[_-]?key|secret|token|password/i);
      });
    });
  });

  // Scout-specific tests
  describe('Scout (CSR) specifics', () => {
    it('has subtitle "Your CSR"', () => {
      expect(AI_AGENTS.scout.subtitle).toBe('Your CSR');
    });

    it('role includes "Customer Service"', () => {
      expect(AI_AGENTS.scout.role).toMatch(/Customer Service/i);
    });

    it('greeting mentions scheduling and Tracey', () => {
      expect(AI_AGENTS.scout.greeting).toMatch(/Tracey/);
    });

    it('has gold-themed avatar gradient', () => {
      expect(AI_AGENTS.scout.avatar).toMatch(/#d4a828|#f2d06b|#c5961e/);
    });
  });

  // Compass-specific tests
  describe('Compass (Market Analyst) specifics', () => {
    it('has subtitle "Market Analyst"', () => {
      expect(AI_AGENTS.compass.subtitle).toBe('Market Analyst');
    });

    it('role includes "Market Intelligence"', () => {
      expect(AI_AGENTS.compass.role).toMatch(/Market Intelligence/i);
    });

    it('responses contain market data references', () => {
      const allResponses = AI_AGENTS.compass.responses.join(' ');
      expect(allResponses).toMatch(/median|price|inventory|rate|market/i);
    });

    it('has blue-themed avatar gradient', () => {
      expect(AI_AGENTS.compass.avatar).toMatch(/#2196F3|#1976D2|#64B5F6/);
    });
  });
});

// ─── Service Areas ───────────────────────────────────────────────────

describe('Service Areas', () => {
  it('exports exactly 12 service areas', () => {
    expect(SERVICE_AREAS.length).toBe(12);
  });

  it('includes Stuart as first area', () => {
    expect(SERVICE_AREAS[0]).toBe('Stuart');
  });

  it('includes all key Treasure Coast areas', () => {
    const required = ['Stuart', 'Palm City', 'Jensen Beach', 'Port St. Lucie', 'Hobe Sound'];
    required.forEach((area) => {
      expect(SERVICE_AREAS).toContain(area);
    });
  });

  it('contains no duplicates', () => {
    const unique = new Set(SERVICE_AREAS);
    expect(unique.size).toBe(SERVICE_AREAS.length);
  });

  it('all entries are non-empty strings', () => {
    SERVICE_AREAS.forEach((area) => {
      expect(typeof area).toBe('string');
      expect(area.trim().length).toBeGreaterThan(0);
    });
  });
});

// ─── Market Data Defaults ────────────────────────────────────────────

describe('Market Data Defaults', () => {
  it('has all required fields', () => {
    const requiredFields = [
      'fedRate', 'mortgage30yr', 'mortgage15yr',
      'medianPrice', 'daysOnMarket', 'inventoryMonths',
    ];
    requiredFields.forEach((field) => {
      expect(MARKET_DATA_DEFAULTS).toHaveProperty(field);
    });
  });

  it('fedRate is a percentage string', () => {
    expect(MARKET_DATA_DEFAULTS.fedRate).toMatch(/^\d+\.\d+%$/);
  });

  it('mortgage30yr is a percentage string', () => {
    expect(MARKET_DATA_DEFAULTS.mortgage30yr).toMatch(/^\d+\.\d+%$/);
  });

  it('medianPrice starts with $', () => {
    expect(MARKET_DATA_DEFAULTS.medianPrice).toMatch(/^\$/);
  });

  it('daysOnMarket is a numeric string', () => {
    expect(Number(MARKET_DATA_DEFAULTS.daysOnMarket)).toBeGreaterThan(0);
  });

  it('inventoryMonths is a numeric string', () => {
    expect(Number(MARKET_DATA_DEFAULTS.inventoryMonths)).toBeGreaterThan(0);
  });

  it('does not contain any API keys or secrets', () => {
    const allValues = Object.values(MARKET_DATA_DEFAULTS).join(' ');
    expect(allValues).not.toMatch(/sk-|api[_-]?key|secret|token/i);
  });
});

// ─── Mortgage Calculator Logic ───────────────────────────────────────

describe('Mortgage Calculator Logic', () => {
  function calculateMonthly(price, downPct, rate, termYears) {
    const p = parseFloat(price);
    const d = parseFloat(downPct);
    const r = parseFloat(rate);
    const t = parseFloat(termYears);

    if ([p, d, r, t].some((v) => isNaN(v) || !isFinite(v))) return 0;
    if (p <= 0 || t <= 0) return 0;

    const clampedDown = Math.max(0, Math.min(100, d));
    const principal = p * (1 - clampedDown / 100);
    if (principal <= 0) return 0;

    const clampedRate = Math.max(0, Math.min(30, r));
    if (clampedRate === 0) return principal / (t * 12);

    const monthlyRate = clampedRate / 100 / 12;
    const payments = t * 12;
    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1);

    return isNaN(monthly) || !isFinite(monthly) ? 0 : Math.round(monthly * 100) / 100;
  }

  it('calculates a standard 30yr mortgage correctly', () => {
    const result = calculateMonthly(400000, 20, 6.65, 30);
    expect(result).toBeGreaterThan(2000);
    expect(result).toBeLessThan(2200);
  });

  it('calculates a 15yr mortgage correctly', () => {
    const result = calculateMonthly(400000, 20, 5.89, 15);
    expect(result).toBeGreaterThan(2600);
    expect(result).toBeLessThan(2800);
  });

  it('handles 0% interest rate', () => {
    const result = calculateMonthly(360000, 0, 0, 30);
    expect(result).toBe(1000);
  });

  it('handles 100% down payment', () => {
    const result = calculateMonthly(400000, 100, 6.65, 30);
    expect(result).toBe(0);
  });

  it('returns 0 for NaN inputs', () => {
    expect(calculateMonthly('abc', 20, 6.65, 30)).toBe(0);
    expect(calculateMonthly(400000, 'xyz', 6.65, 30)).toBe(0);
  });

  it('returns 0 for negative price', () => {
    expect(calculateMonthly(-100000, 20, 6.65, 30)).toBe(0);
  });

  it('returns 0 for zero price', () => {
    expect(calculateMonthly(0, 20, 6.65, 30)).toBe(0);
  });

  it('clamps down payment to 0-100 range', () => {
    const result = calculateMonthly(400000, 150, 6.65, 30);
    expect(result).toBe(0);
  });

  it('clamps interest rate to 0-30 range', () => {
    const result = calculateMonthly(400000, 20, 50, 30);
    expect(result).toBeGreaterThan(0);
  });

  it('handles Infinity inputs', () => {
    expect(calculateMonthly(Infinity, 20, 6.65, 30)).toBe(0);
  });

  it('handles very small amounts', () => {
    const result = calculateMonthly(1000, 0, 5, 30);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });
});

// ─── Airtable Service (unit-level) ───────────────────────────────────

describe('Airtable Service Utilities', () => {
  it('generateSessionId produces unique IDs', async () => {
    const { generateSessionId } = await import('../src/services/airtable.js');
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });

  it('session IDs have thg- prefix', async () => {
    const { generateSessionId } = await import('../src/services/airtable.js');
    const id = generateSessionId();
    expect(id).toMatch(/^thg-/);
  });

  it('session IDs contain timestamp', async () => {
    const { generateSessionId } = await import('../src/services/airtable.js');
    const id = generateSessionId();
    const parts = id.split('-');
    const timestamp = parseInt(parts[1], 10);
    expect(timestamp).toBeGreaterThan(1700000000000);
  });
});

// ─── Security Tests ──────────────────────────────────────────────────

describe('Security: No secrets in client code', () => {
  it('agents.js contains no API keys', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../src/config/agents.js'), 'utf-8');
    expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    expect(content).not.toMatch(/AIRTABLE_API_KEY|ANTHROPIC_API_KEY|WORKER_AUTH_TOKEN/);
  });

  it('airtable service does not expose API keys', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../src/services/airtable.js'), 'utf-8');
    expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    expect(content).not.toMatch(/pat[a-zA-Z0-9]{14}\.[a-zA-Z0-9]{64}/);
  });
});

// ─── 426 Error Regression Test ───────────────────────────────────────

describe('426 Error Regression: SPA routing', () => {
  it('_redirects file exists with SPA fallback rule', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../public/_redirects'), 'utf-8');
    expect(content).toMatch(/\/\*\s+\/index\.html\s+200/);
  });

  it('_headers file exists with security headers', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../public/_headers'), 'utf-8');
    expect(content).toMatch(/X-Content-Type-Options/);
    expect(content).toMatch(/X-Frame-Options/);
  });

  it('service worker file exists', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../public/sw.js'), 'utf-8');
    expect(content).toMatch(/addEventListener.*install/);
    expect(content).toMatch(/addEventListener.*fetch/);
  });

  it('manifest.json has correct PWA config', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../public/manifest.json'), 'utf-8');
    const manifest = JSON.parse(content);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('deploy script copies _redirects and _headers to dist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
    expect(pkg.scripts.deploy).toMatch(/_redirects/);
    expect(pkg.scripts.deploy).toMatch(/_headers/);
    expect(pkg.scripts.deploy).toMatch(/sw\.js/);
  });
});
