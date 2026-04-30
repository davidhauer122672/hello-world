const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const {
  buildAvatarSpec,
  renderPrompt,
  validateSubject,
  enforceContentPolicy,
  TECHNICAL_STANDARDS,
} = require('../lib/avatar-spec');

const SPEC_DIR = path.join(__dirname, '..', 'avatar-studio', 'specs');

function baseConfig(overrides = {}) {
  return {
    id: 'test-spec',
    title: 'Test Spec',
    role: 'Test role.',
    subject: {
      name: 'Test Subject',
      kind: 'fictional',
      contentRating: 'PG',
      description: ['original composite character'],
    },
    ...overrides,
  };
}

describe('avatar-spec: technical standards', () => {
  it('locks iPhone 16 Pro resolution at 1179x2556', () => {
    assert.equal(TECHNICAL_STANDARDS.resolution.width, 1179);
    assert.equal(TECHNICAL_STANDARDS.resolution.height, 2556);
  });

  it('locks frame rate at 60', () => {
    assert.equal(TECHNICAL_STANDARDS.frameRate, 60);
  });
});

describe('avatar-spec: validateSubject', () => {
  it('accepts fictional subjects with valid rating', () => {
    const s = { name: 'Fictional', kind: 'fictional', contentRating: 'PG' };
    assert.equal(validateSubject(s), s);
  });

  it('rejects subjects that are real-person likenesses', () => {
    assert.throws(
      () => validateSubject({
        name: 'Famous Athlete',
        kind: 'fictional',
        contentRating: 'PG',
        basedOn: 'Real Person',
      }),
      /real third party are rejected/,
    );
  });

  it('rejects subjects flagged realPersonLikeness:true', () => {
    assert.throws(
      () => validateSubject({
        name: 'X',
        kind: 'fictional',
        contentRating: 'PG',
        realPersonLikeness: true,
      }),
      /real third party are rejected/,
    );
  });

  it('rejects disallowed content ratings', () => {
    assert.throws(
      () => validateSubject({
        name: 'X',
        kind: 'fictional',
        contentRating: 'R',
      }),
      /contentRating must be one of/,
    );
  });

  it('requires selfInputs for self subjects', () => {
    assert.throws(
      () => validateSubject({
        name: 'CEO',
        kind: 'self',
        contentRating: 'PG',
      }),
      /consentStatement/,
    );
  });

  it('requires sourceFiles for self subjects', () => {
    assert.throws(
      () => validateSubject({
        name: 'CEO',
        kind: 'self',
        contentRating: 'PG',
        selfInputs: { consentStatement: 'yes' },
      }),
      /sourceFiles/,
    );
  });

  it('accepts valid self subjects', () => {
    const s = {
      name: 'CEO',
      kind: 'self',
      contentRating: 'PG',
      selfInputs: {
        consentStatement: 'Operator authorizes own likeness.',
        sourceFiles: ['path/to/voice.wav'],
      },
    };
    assert.equal(validateSubject(s), s);
  });

  it('rejects unknown subject kinds', () => {
    assert.throws(
      () => validateSubject({ name: 'X', kind: 'celebrity', contentRating: 'PG' }),
      /subject\.kind must be one of/,
    );
  });
});

describe('avatar-spec: enforceContentPolicy', () => {
  it('rejects specs containing disallowed descriptors', () => {
    const spec = {
      wardrobe: ['tiny bikini hugging every curve'],
    };
    assert.throws(() => enforceContentPolicy(spec), /disallowed descriptor/);
  });

  it('rejects nested disallowed descriptors', () => {
    const spec = {
      animation: {
        idleBehaviors: ['natural breathing', 'seductive hip roll'],
      },
    };
    assert.throws(() => enforceContentPolicy(spec), /disallowed descriptor/);
  });

  it('accepts clean specs', () => {
    const spec = {
      wardrobe: ['tailored navy blazer', 'white silk shell'],
      animation: { idleBehaviors: ['natural breathing cycle'] },
    };
    assert.equal(enforceContentPolicy(spec), spec);
  });
});

describe('avatar-spec: buildAvatarSpec', () => {
  it('builds a complete spec from a minimal config', () => {
    const spec = buildAvatarSpec(baseConfig());
    assert.equal(spec.id, 'test-spec');
    assert.equal(spec.subject.kind, 'fictional');
    assert.equal(spec.technicalStandards.resolution.width, 1179);
    assert.ok(Array.isArray(spec.qualityGates));
    assert.ok(spec.qualityGates.length > 0);
  });

  it('throws when required fields are missing', () => {
    assert.throws(() => buildAvatarSpec({}), /config\.id/);
    assert.throws(() => buildAvatarSpec({ id: 'x', title: 'x', role: 'x' }), /subject is required/);
  });

  it('fails fast if any descriptor violates content policy', () => {
    const cfg = baseConfig({
      wardrobe: ['fabric shifting over pelvic area'],
    });
    assert.throws(() => buildAvatarSpec(cfg), /disallowed descriptor/);
  });

  it('fails fast if subject claims real-person likeness', () => {
    const cfg = baseConfig({
      subject: {
        name: 'Copy Of Real Person',
        kind: 'fictional',
        contentRating: 'PG',
        basedOn: 'Real Athlete',
      },
    });
    assert.throws(() => buildAvatarSpec(cfg), /real third party/);
  });
});

describe('avatar-spec: renderPrompt', () => {
  it('produces a non-empty pasteable prompt', () => {
    const spec = buildAvatarSpec(baseConfig());
    const prompt = renderPrompt(spec);
    assert.match(prompt, /Test Spec/);
    assert.match(prompt, /1179 x 2556/);
    assert.match(prompt, /Weta/);
  });
});

describe('avatar-spec: all authored configs build cleanly', () => {
  it('builds every .config.js under avatar-studio/specs', () => {
    const files = fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.config.js'));
    assert.ok(files.length >= 4, `expected at least 4 configs, found ${files.length}`);

    for (const f of files) {
      const cfg = require(path.join(SPEC_DIR, f));
      const spec = buildAvatarSpec(cfg);
      assert.ok(spec.id, `${f}: missing id`);
      assert.ok(['fictional', 'self', 'non_human'].includes(spec.subject.kind),
        `${f}: invalid subject kind`);
      assert.ok(['G', 'PG', 'PG-13'].includes(spec.subject.contentRating),
        `${f}: invalid contentRating`);
      const prompt = renderPrompt(spec);
      assert.ok(prompt.length > 100, `${f}: prompt too short`);
    }
  });
});
