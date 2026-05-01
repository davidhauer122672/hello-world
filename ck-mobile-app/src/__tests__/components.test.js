import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage and fetch for Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({}) });
}

describe('Home Screen', async () => {
  const { renderHome } = await import('../components/home.js');

  it('renders without throwing', () => {
    const html = renderHome();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains mission statement', () => {
    const html = renderHome();
    assert.ok(html.includes('Service'));
    assert.ok(html.includes('Stewardship'));
    assert.ok(html.includes('Security'));
  });

  it('contains revenue counter element', () => {
    const html = renderHome();
    assert.ok(html.includes('id="revenue-counter"'));
  });

  it('contains fleet status section', () => {
    const html = renderHome();
    assert.ok(html.includes('Fleet Status'));
    assert.ok(html.includes('AI Agents'));
    assert.ok(html.includes('Intel Officers'));
  });

  it('contains governance footer', () => {
    const html = renderHome();
    assert.ok(html.includes('Truth Over Convenience'));
  });
});

describe('Leads Screen', async () => {
  const { renderLeads } = await import('../components/leads.js');

  it('renders without throwing', () => {
    const html = renderLeads();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains pipeline metrics', () => {
    const html = renderLeads();
    assert.ok(html.includes('pipeline-hot'));
    assert.ok(html.includes('pipeline-warm'));
  });

  it('renders sample leads', () => {
    const html = renderLeads();
    assert.ok(html.includes('Victoria Harrington'));
    assert.ok(html.includes('Marcus Chen'));
  });

  it('contains automation controls', () => {
    const html = renderLeads();
    assert.ok(html.includes('Score All Leads'));
    assert.ok(html.includes('Generate Battle Plans'));
  });
});

describe('Systems Screen', async () => {
  const { renderSystems } = await import('../components/systems.js');

  it('renders without throwing', () => {
    const html = renderSystems();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains all 9 divisions', () => {
    const html = renderSystems();
    const divisions = ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB'];
    for (const div of divisions) {
      assert.ok(html.includes(div), `Missing division: ${div}`);
    }
  });

  it('contains intelligence officer squads', () => {
    const html = renderSystems();
    assert.ok(html.includes('ALPHA'));
    assert.ok(html.includes('CHARLIE'));
    assert.ok(html.includes('ECHO'));
  });

  it('contains email agent squads', () => {
    const html = renderSystems();
    assert.ok(html.includes('INTAKE'));
    assert.ok(html.includes('COMPOSE'));
    assert.ok(html.includes('NURTURE'));
    assert.ok(html.includes('MONITOR'));
  });

  it('contains fleet scan button', () => {
    const html = renderSystems();
    assert.ok(html.includes('btn-fleet-scan'));
  });
});

describe('Market Screen', async () => {
  const { renderMarket } = await import('../components/market.js');

  it('renders without throwing', () => {
    const html = renderMarket();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains daily briefing', () => {
    const html = renderMarket();
    assert.ok(html.includes('Daily AI Briefing'));
    assert.ok(html.includes('Treasure Coast Market Overview'));
  });

  it('contains all 7 regional zones', () => {
    const html = renderMarket();
    const zones = ['Stuart', 'Jupiter', 'Hobe Sound', 'Palm City', 'Jensen Beach', 'Port St. Lucie', 'Vero Beach'];
    for (const zone of zones) {
      assert.ok(html.includes(zone), `Missing zone: ${zone}`);
    }
  });

  it('contains predictive timeline', () => {
    const html = renderMarket();
    assert.ok(html.includes('Seasonal Surge'));
    assert.ok(html.includes('Hurricane Season'));
    assert.ok(html.includes('Snowbird Return'));
  });
});

describe('AI Skills Screen', async () => {
  const { renderAISkills } = await import('../components/ai-skills.js');

  it('renders without throwing', () => {
    const html = renderAISkills();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains skill categories', () => {
    const html = renderAISkills();
    assert.ok(html.includes('Lead Conversion'));
    assert.ok(html.includes('Content Generation'));
    assert.ok(html.includes('Market Intelligence'));
    assert.ok(html.includes('Operations'));
  });

  it('contains SCAA-1 featured skill', () => {
    const html = renderAISkills();
    assert.ok(html.includes('SCAA-1 Battle Plan Generator'));
  });
});

describe('Content Screen', async () => {
  const { renderContent } = await import('../components/content.js');

  it('renders without throwing', () => {
    const html = renderContent();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains email campaigns', () => {
    const html = renderContent();
    assert.ok(html.includes('Snowbird Welcome Sequence'));
    assert.ok(html.includes('Investor Quarterly Report'));
  });
});

describe('Settings Screen', async () => {
  const { renderSettings } = await import('../components/settings.js');

  it('renders without throwing', () => {
    const html = renderSettings();
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 100);
  });

  it('contains governance principles', () => {
    const html = renderSettings();
    assert.ok(html.includes('GOV-001'));
    assert.ok(html.includes('Truth'));
  });
});
