import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { INDUSTRY_TEMPLATES, getTemplate, getTemplateModules } from '../utils/templates.js';

describe('Industry Templates', () => {
  it('exports an array of templates', () => {
    assert.ok(Array.isArray(INDUSTRY_TEMPLATES));
    assert.ok(INDUSTRY_TEMPLATES.length >= 4, `Expected 4+ templates, got ${INDUSTRY_TEMPLATES.length}`);
  });

  it('each template has required fields', () => {
    for (const t of INDUSTRY_TEMPLATES) {
      assert.ok(t.id, `Template missing id`);
      assert.ok(t.name, `Template ${t.id} missing name`);
      assert.ok(t.icon, `Template ${t.id} missing icon`);
      assert.ok(t.description, `Template ${t.id} missing description`);
      assert.ok(t.branding, `Template ${t.id} missing branding`);
      assert.ok(t.branding.primaryColor, `Template ${t.id} missing branding.primaryColor`);
      assert.ok(t.branding.background, `Template ${t.id} missing branding.background`);
    }
  });

  it('has a default template marked', () => {
    const defaults = INDUSTRY_TEMPLATES.filter(t => t.isDefault);
    assert.ok(defaults.length >= 1, 'No default template found');
  });

  it('default template exists and is marked', () => {
    const def = INDUSTRY_TEMPLATES.find(t => t.isDefault);
    assert.ok(def, 'No default template found');
    assert.equal(def.isDefault, true);
  });
});

describe('getTemplate()', () => {
  it('returns the correct template by ID', () => {
    const def = INDUSTRY_TEMPLATES.find(t => t.isDefault);
    const result = getTemplate(def.id);
    assert.ok(result);
    assert.equal(result.id, def.id);
  });

  it('handles unknown IDs gracefully', () => {
    const result = getTemplate('nonexistent-industry');
    // May return undefined or a fallback — either is acceptable
    assert.ok(result === undefined || typeof result === 'object');
  });

  it('returns correct template for each known ID', () => {
    for (const t of INDUSTRY_TEMPLATES) {
      const result = getTemplate(t.id);
      assert.ok(result);
      assert.equal(result.id, t.id);
    }
  });
});

describe('getTemplateModules()', () => {
  it('returns modules for property-management', () => {
    const mods = getTemplateModules('property-management');
    assert.ok(Array.isArray(mods));
    assert.ok(mods.length >= 4, `Expected 4+ modules, got ${mods.length}`);
  });

  it('each module has required fields', () => {
    const mods = getTemplateModules('property-management');
    for (const m of mods) {
      assert.ok(m.id, 'Module missing id');
      assert.ok(m.label, `Module ${m.id} missing label`);
      assert.ok(Array.isArray(m.kpis), `Module ${m.id} missing kpis array`);
      assert.equal(typeof m.enabled, 'boolean', `Module ${m.id} missing enabled boolean`);
    }
  });

  it('returns modules for all known templates', () => {
    for (const t of INDUSTRY_TEMPLATES) {
      const mods = getTemplateModules(t.id);
      assert.ok(Array.isArray(mods), `No modules for template ${t.id}`);
      assert.ok(mods.length >= 1, `Expected at least 1 module for ${t.id}`);
    }
  });
});
