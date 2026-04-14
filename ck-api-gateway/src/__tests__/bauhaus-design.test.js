import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getDesignSystem, getDesignPrinciples, getDesignTokens, getAssetSpecs, getMasterPrompt } from '../services/bauhaus-design.js';

describe('Bauhaus Design System Service', () => {
  describe('getDesignSystem()', () => {
    it('returns system overview', () => {
      const ds = getDesignSystem();
      assert.equal(ds.id, 'CK-BAUHAUS-DS');
      assert.equal(ds.status, 'active');
      assert.equal(ds.principleCount, 6);
    });

    it('references Walter Gropius and Bauhaus origin', () => {
      const ds = getDesignSystem();
      assert.ok(ds.origin.includes('Walter Gropius'));
      assert.ok(ds.origin.includes('1919'));
    });

    it('core philosophy is form follows function', () => {
      const ds = getDesignSystem();
      assert.ok(ds.corePhilosophy.includes('Form follows function'));
    });
  });

  describe('getDesignPrinciples()', () => {
    it('returns all 6 principles', () => {
      const p = getDesignPrinciples();
      assert.equal(p.totalPrinciples, 6);
      assert.equal(p.principles.length, 6);
    });

    it('every principle has origin, rule, application, violation', () => {
      const p = getDesignPrinciples();
      for (const pr of p.principles) {
        assert.ok(pr.id, 'Missing id');
        assert.ok(pr.principle, 'Missing principle');
        assert.ok(pr.origin, `${pr.id} missing origin`);
        assert.ok(pr.rule, `${pr.id} missing rule`);
        assert.ok(pr.application, `${pr.id} missing application`);
        assert.ok(pr.violation, `${pr.id} missing violation`);
      }
    });

    it('principle IDs are BP-01 through BP-06', () => {
      const p = getDesignPrinciples();
      const ids = p.principles.map(pr => pr.id);
      assert.deepEqual(ids, ['BP-01', 'BP-02', 'BP-03', 'BP-04', 'BP-05', 'BP-06']);
    });

    it('references Gropius, Kandinsky, Bayer, Moholy-Nagy, Breuer', () => {
      const p = getDesignPrinciples();
      const allOrigins = p.principles.map(pr => pr.origin).join(' ');
      assert.ok(allOrigins.includes('Gropius'));
      assert.ok(allOrigins.includes('Kandinsky'));
      assert.ok(allOrigins.includes('Bayer'));
      assert.ok(allOrigins.includes('Moholy-Nagy'));
      assert.ok(allOrigins.includes('Breuer'));
    });
  });

  describe('getDesignTokens()', () => {
    it('returns color tokens with Bauhaus mappings', () => {
      const t = getDesignTokens();
      assert.ok(t.tokens.colors.primary);
      assert.ok(t.tokens.colors.accent);
      assert.ok(t.tokens.colors.highlight);
      assert.ok(t.tokens.colors.black);
      assert.ok(t.tokens.colors.white);
      assert.ok(t.tokens.colors.primary.bauhausMapping);
    });

    it('primary color is Coastal Navy #1B365D', () => {
      const t = getDesignTokens();
      assert.equal(t.tokens.colors.primary.hex, '#1B365D');
    });

    it('typography uses Montserrat and Inter', () => {
      const t = getDesignTokens();
      assert.equal(t.tokens.typography.heading.family, 'Montserrat');
      assert.equal(t.tokens.typography.body.family, 'Inter');
    });

    it('shapes limited to rectangle, circle, triangle', () => {
      const t = getDesignTokens();
      assert.deepEqual(t.tokens.shapes.allowed, ['rectangle', 'circle', 'triangle']);
    });

    it('grid is 12 columns', () => {
      const t = getDesignTokens();
      assert.equal(t.tokens.spacing.gridColumns, 12);
    });
  });

  describe('getAssetSpecs()', () => {
    it('returns 6 asset categories', () => {
      const a = getAssetSpecs();
      assert.equal(a.totalCategories, 6);
    });

    it('includes logo, property photos, marketing, signage, website, reports', () => {
      const a = getAssetSpecs();
      assert.ok(a.specifications.logo);
      assert.ok(a.specifications.propertyPhotos);
      assert.ok(a.specifications.marketing);
      assert.ok(a.specifications.signage);
      assert.ok(a.specifications.website);
      assert.ok(a.specifications.reports);
    });

    it('logo specifies geometric primitives only', () => {
      const a = getAssetSpecs();
      assert.ok(a.specifications.logo.construction.toLowerCase().includes('geometric'));
    });

    it('website forbids animations', () => {
      const a = getAssetSpecs();
      assert.ok(a.specifications.website.animations.includes('None'));
    });
  });

  describe('getMasterPrompt()', () => {
    it('returns master prompt with 7 rules', () => {
      const mp = getMasterPrompt();
      assert.equal(mp.id, 'CK-BAUHAUS-PROMPT');
      assert.ok(mp.prompt.includes('FORM FOLLOWS FUNCTION'));
      assert.ok(mp.prompt.includes('GEOMETRIC SHAPES ONLY'));
      assert.ok(mp.prompt.includes('PRIMARY COLOR DISCIPLINE'));
      assert.ok(mp.prompt.includes('UNIVERSAL TYPOGRAPHY'));
      assert.ok(mp.prompt.includes('ASYMMETRICAL BALANCE'));
      assert.ok(mp.prompt.includes('MATERIAL HONESTY'));
      assert.ok(mp.prompt.includes('ZERO ORNAMENTATION'));
    });

    it('applies to 10+ asset types', () => {
      const mp = getMasterPrompt();
      assert.ok(mp.applicableTo.length >= 10);
    });
  });
});

// ── Route Handlers ──
import { handleDesignSystem, handleDesignPrinciples, handleDesignTokens, handleAssetSpecs, handleMasterPrompt } from '../routes/bauhaus-design.js';

describe('Bauhaus Design System Routes', () => {
  it('GET /v1/design/system returns 200', async () => {
    const res = handleDesignSystem();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 'CK-BAUHAUS-DS');
    assert.equal(body.status, 'active');
  });

  it('GET /v1/design/principles returns 6 principles', async () => {
    const res = handleDesignPrinciples();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalPrinciples, 6);
  });

  it('GET /v1/design/tokens returns color and type tokens', async () => {
    const res = handleDesignTokens();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.tokens.colors);
    assert.ok(body.tokens.typography);
  });

  it('GET /v1/design/assets returns 6 categories', async () => {
    const res = handleAssetSpecs();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalCategories, 6);
  });

  it('GET /v1/design/master-prompt returns prompt', async () => {
    const res = handleMasterPrompt();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.prompt.includes('FORM FOLLOWS FUNCTION'));
  });
});
