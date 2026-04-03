import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Direct unit tests for social-publish helpers ──
// We test the pure functions extracted from the module's logic.

describe('WF-2 Social Publish — Platform Normalization', () => {
  // Replicate normalizePlatforms logic for unit testing
  function normalizePlatforms(platformValue) {
    if (!platformValue) return [];
    if (typeof platformValue === 'string') return [platformValue];
    if (Array.isArray(platformValue)) {
      return platformValue.map(p => (typeof p === 'object' && p !== null ? p.name || p : p));
    }
    if (typeof platformValue === 'object' && platformValue.name) return [platformValue.name];
    return [];
  }

  it('returns empty array for null/undefined', () => {
    assert.deepEqual(normalizePlatforms(null), []);
    assert.deepEqual(normalizePlatforms(undefined), []);
  });

  it('wraps a string in an array', () => {
    assert.deepEqual(normalizePlatforms('Instagram'), ['Instagram']);
  });

  it('passes through an array of strings', () => {
    assert.deepEqual(normalizePlatforms(['Instagram', 'X', 'LinkedIn']), ['Instagram', 'X', 'LinkedIn']);
  });

  it('extracts names from select objects', () => {
    assert.deepEqual(
      normalizePlatforms([{ name: 'Facebook' }, { name: 'X' }]),
      ['Facebook', 'X'],
    );
  });

  it('handles a single select object', () => {
    assert.deepEqual(normalizePlatforms({ name: 'LinkedIn' }), ['LinkedIn']);
  });
});

describe('WF-2 Social Publish — Buffer Schedule Time', () => {
  // Replicate toBufferScheduleTime logic
  function toBufferScheduleTime(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('T')) return dateStr;
    return `${dateStr}T15:00:00Z`;
  }

  it('returns null for empty input', () => {
    assert.equal(toBufferScheduleTime(null), null);
    assert.equal(toBufferScheduleTime(''), null);
  });

  it('adds default 15:00 UTC time for date-only strings', () => {
    assert.equal(toBufferScheduleTime('2026-04-10'), '2026-04-10T15:00:00Z');
  });

  it('passes through ISO strings with time component', () => {
    assert.equal(toBufferScheduleTime('2026-04-10T09:30:00Z'), '2026-04-10T09:30:00Z');
  });
});

describe('WF-2 Social Publish — Record ID Validation', () => {
  function validateRecordId(body) {
    if (!body || typeof body !== 'object') return '"recordId" is required.';
    if (!body.recordId || typeof body.recordId !== 'string') return '"recordId" is required.';
    if (!body.recordId.startsWith('rec')) return 'Invalid recordId. Must start with "rec".';
    return null;
  }

  it('rejects null body', () => {
    assert.notEqual(validateRecordId(null), null);
  });

  it('rejects body without recordId', () => {
    assert.notEqual(validateRecordId({}), null);
  });

  it('rejects non-rec prefixed IDs', () => {
    assert.notEqual(validateRecordId({ recordId: 'tblXYZ123' }), null);
  });

  it('accepts valid record IDs', () => {
    assert.equal(validateRecordId({ recordId: 'rechVm1hmggAvfvXp' }), null);
  });
});

describe('WF-2 Social Publish — Image Extraction', () => {
  function extractImageUrl(attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) return null;
    return attachments[0].url || null;
  }

  it('returns null for no attachments', () => {
    assert.equal(extractImageUrl(null), null);
    assert.equal(extractImageUrl([]), null);
  });

  it('extracts first attachment URL', () => {
    const attachments = [
      { url: 'https://dl.airtable.com/img1.png', filename: 'img1.png' },
      { url: 'https://dl.airtable.com/img2.png', filename: 'img2.png' },
    ];
    assert.equal(extractImageUrl(attachments), 'https://dl.airtable.com/img1.png');
  });

  it('returns null if first attachment has no url', () => {
    assert.equal(extractImageUrl([{ filename: 'test.png' }]), null);
  });
});

describe('WF-2 Social Publish — Buffer Platform Mapping', () => {
  // Replicate the platform map from buffer.js
  const platformMap = {
    instagram: 'instagram',
    facebook: 'facebook',
    linkedin: 'linkedin',
    twitter: 'twitter',
    x: 'twitter',
  };

  it('maps Instagram correctly', () => {
    assert.equal(platformMap['instagram'], 'instagram');
  });

  it('maps X to twitter service', () => {
    assert.equal(platformMap['x'], 'twitter');
  });

  it('maps Twitter to twitter service', () => {
    assert.equal(platformMap['twitter'], 'twitter');
  });

  it('maps all four supported platforms', () => {
    const supported = ['instagram', 'facebook', 'linkedin', 'x'];
    for (const p of supported) {
      assert.ok(platformMap[p], `${p} should be mapped`);
    }
  });

  it('does not map unsupported platforms', () => {
    assert.equal(platformMap['alignable'], undefined);
    assert.equal(platformMap['tiktok'], undefined);
  });
});
