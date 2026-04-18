'use strict';

// Content policy for Coastal Key avatar specs.
//
// Only the CEO's own likeness is permitted. Third-party real-person likeness,
// sexualized/seductive framing, and identity sourcing outside the sanctioned
// `ceo-self-likeness` channel are rejected at build time.

const FORBIDDEN_NAME_PATTERNS = [
  // Real-world individuals that must never appear as identity subjects.
  /\bstephanie\s+gilmore\b/i,
  /\beliza\s+keys\b/i,
  /\balicia\s+keys\b/i,
  /\btaylor\s+swift\b/i,
  /\bgisele\s+b[uü]ndchen\b/i,
  /\bkate\s+moss\b/i,
  /\bmargot\s+robbie\b/i,
];

const FORBIDDEN_DESCRIPTOR_PATTERNS = [
  /\bseductive\b/i,
  /\bsultry\b/i,
  /\bteasing\b/i,
  /\bsensual\b/i,
  /\bflirt(?:y|ation|ing|atious)?\b/i,
  /\btiny\s+bikini\b/i,
  /\bstring\s+bikini\b/i,
  /\bpelvic\b/i,
  /\bhip\s+roll\b/i,
  /\bhips?\s+sway(?:ing)?\b/i,
  /\bbreath(?:ing)?\s+through\s+fabric\b/i,
];

const ALLOWED_IDENTITY_SOURCES = new Set(['ceo-self-likeness']);

const REQUIRED_FIELDS = [
  'id',
  'title',
  'filename',
  'identity',
  'persona',
  'wardrobe',
  'environment',
  'animation',
  'technical',
  'governance',
  'prompt',
];

function missingFields(spec) {
  return REQUIRED_FIELDS.filter((f) => !(f in spec));
}

function violationsInText(text, label) {
  if (typeof text !== 'string' || text.length === 0) return [];
  const found = [];
  for (const pat of FORBIDDEN_NAME_PATTERNS) {
    const m = text.match(pat);
    if (m) found.push({ kind: 'forbidden-name', label, match: m[0], pattern: String(pat) });
  }
  for (const pat of FORBIDDEN_DESCRIPTOR_PATTERNS) {
    const m = text.match(pat);
    if (m) found.push({ kind: 'forbidden-descriptor', label, match: m[0], pattern: String(pat) });
  }
  return found;
}

function walkStrings(node, prefix, visitor) {
  if (node == null) return;
  if (typeof node === 'string') {
    visitor(node, prefix);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkStrings(v, `${prefix}[${i}]`, visitor));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      walkStrings(v, prefix ? `${prefix}.${k}` : k, visitor);
    }
  }
}

function checkSpec(spec) {
  const violations = [];

  const missing = missingFields(spec);
  if (missing.length > 0) {
    violations.push({ kind: 'schema', label: 'spec', missing });
  }

  const identitySource = spec && spec.identity && spec.identity.source;
  if (!identitySource || !ALLOWED_IDENTITY_SOURCES.has(identitySource)) {
    violations.push({
      kind: 'identity-source',
      label: 'identity.source',
      got: identitySource || null,
      allowed: [...ALLOWED_IDENTITY_SOURCES],
    });
  }

  walkStrings(spec, '', (text, path) => {
    for (const v of violationsInText(text, path)) violations.push(v);
  });

  return violations;
}

function formatViolations(violations) {
  return violations
    .map((v) => {
      if (v.kind === 'schema') {
        return `  - schema: missing fields: ${v.missing.join(', ')}`;
      }
      if (v.kind === 'identity-source') {
        return `  - identity-source: got ${JSON.stringify(v.got)}, allowed ${JSON.stringify(v.allowed)}`;
      }
      return `  - ${v.kind} at ${v.label}: matched ${JSON.stringify(v.match)}`;
    })
    .join('\n');
}

module.exports = {
  FORBIDDEN_NAME_PATTERNS,
  FORBIDDEN_DESCRIPTOR_PATTERNS,
  ALLOWED_IDENTITY_SOURCES,
  REQUIRED_FIELDS,
  checkSpec,
  formatViolations,
};
