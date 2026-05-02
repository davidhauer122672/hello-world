/**
 * Avatar Spec Generator — Coastal Key Avatar Studio
 *
 * Produces structured, renderer-agnostic specifications for photorealistic
 * 3D avatars and live wallpapers. Specs are emitted in two forms:
 *
 *   1. JSON  — machine-readable payload for the Orchestrator and rendering
 *              pipelines (Banana Pro, Runway, Gaussian-splat tooling, etc.).
 *   2. Prompt — human-readable prompt block that can be pasted into a
 *              generative video/image tool.
 *
 * Scope rules enforced by this module:
 *
 *   • Every subject must be either an ORIGINAL FICTIONAL CHARACTER or a
 *     SELF subject (authorized likeness of the operator, whose inputs are
 *     provided by the operator themselves).
 *   • Subjects tagged as `real_person_likeness` are rejected at generation
 *     time. There is no "5% different" bypass — likeness-of-real-person
 *     requests fail fast with a descriptive error.
 *   • Subjects must declare a `contentRating`. Only `G`, `PG`, and `PG-13`
 *     are accepted. Nudity, sexualized framing, and fetishized descriptors
 *     are rejected.
 */

'use strict';

const TECHNICAL_STANDARDS = Object.freeze({
  resolution: { width: 1179, height: 2556, label: 'iPhone 16 Pro native portrait' },
  frameRate: 60,
  loopDurationSeconds: { min: 3, max: 5 },
  container: 'mov',
  codec: 'H.265/HEVC',
  colorSpace: 'Display P3',
  dynamicRange: 'HDR10',
  pipeline: {
    skin: [
      'multi-layer subsurface scattering (epidermis, dermis, subcutaneous)',
      'pore-level albedo and normal maps',
      'vellus hair / peach fuzz visible in rim lighting',
    ],
    eyes: [
      'corneal refraction with environment reflection',
      'scleral vein network at natural density',
      'iris caustics from key light',
      'tear film moisture on lower lid',
    ],
    hair: [
      'strand-level simulation (>= 100,000 strands)',
      'wind and gravity dynamics',
      'specular highlights from key light',
    ],
    motion: [
      'natural breathing cycle (12-16 breaths/min)',
      'micro-expressions (brow, lip corner, nostril)',
      'blink cycle (15-20/min, varied timing)',
      'subtle weight shift / idle sway',
    ],
    lighting: [
      'three-point cinematic (warm key, cool fill, soft rim)',
      'global illumination for skin bounce',
    ],
  },
  referenceStandards: [
    'Weta FX digital-human pipeline',
    'ILM facial animation standards',
    'DNEG photorealistic compositing',
    'Digital Domain real-time digital humans',
  ],
});

const ALLOWED_CONTENT_RATINGS = new Set(['G', 'PG', 'PG-13']);

const DISALLOWED_DESCRIPTORS = [
  'nude', 'naked', 'topless', 'bikini-clinging', 'cling to',
  'pelvic', 'crotch', 'cleavage-focus', 'seductive hip', 'seductive sway',
  'sultry', 'tease', 'teasing fabric', 'arousal', 'fetish',
  'fabric shifting over', 'every curve', 'husky sex',
];

/**
 * Validate a subject block. Returns the subject unchanged on success, throws
 * a descriptive Error on rejection. No silent fallbacks.
 */
function validateSubject(subject) {
  if (!subject || typeof subject !== 'object') {
    throw new Error('avatar-spec: subject is required');
  }
  if (!subject.name || typeof subject.name !== 'string') {
    throw new Error('avatar-spec: subject.name is required');
  }
  if (!subject.kind) {
    throw new Error('avatar-spec: subject.kind is required (fictional | self | non_human)');
  }

  const allowedKinds = new Set(['fictional', 'self', 'non_human']);
  if (!allowedKinds.has(subject.kind)) {
    throw new Error(
      `avatar-spec: subject.kind must be one of ${[...allowedKinds].join(', ')}`,
    );
  }

  if (subject.kind === 'self') {
    if (!subject.selfInputs || !subject.selfInputs.consentStatement) {
      throw new Error(
        'avatar-spec: self subjects require selfInputs.consentStatement',
      );
    }
    if (!Array.isArray(subject.selfInputs.sourceFiles) ||
        subject.selfInputs.sourceFiles.length === 0) {
      throw new Error(
        'avatar-spec: self subjects require selfInputs.sourceFiles listing authorized media',
      );
    }
  }

  if (subject.realPersonLikeness === true || subject.basedOn) {
    throw new Error(
      'avatar-spec: subjects based on a real third party are rejected. ' +
      'Use kind="fictional" for originals or kind="self" for the operator.',
    );
  }

  const contentRating = subject.contentRating;
  if (!ALLOWED_CONTENT_RATINGS.has(contentRating)) {
    throw new Error(
      `avatar-spec: contentRating must be one of ${[...ALLOWED_CONTENT_RATINGS].join(', ')}`,
    );
  }

  return subject;
}

/**
 * Scan all descriptor strings in a spec for disallowed content. Throws on
 * match. Checks are case-insensitive and whole-field.
 */
function enforceContentPolicy(spec) {
  const stack = [spec];
  while (stack.length) {
    const node = stack.pop();
    if (node === null || node === undefined) continue;
    if (typeof node === 'string') {
      const lowered = node.toLowerCase();
      for (const banned of DISALLOWED_DESCRIPTORS) {
        if (lowered.includes(banned)) {
          throw new Error(
            `avatar-spec: disallowed descriptor "${banned}" found in spec. ` +
            'Remove sexualized or objectifying framing.',
          );
        }
      }
      continue;
    }
    if (Array.isArray(node)) {
      for (const item of node) stack.push(item);
      continue;
    }
    if (typeof node === 'object') {
      for (const value of Object.values(node)) stack.push(value);
    }
  }
  return spec;
}

/**
 * Build a fully-validated avatar spec from an input config.
 */
function buildAvatarSpec(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('avatar-spec: config is required');
  }
  if (!config.id || !config.title || !config.role) {
    throw new Error('avatar-spec: config.id, config.title, and config.role are required');
  }

  const subject = validateSubject(config.subject);

  const spec = {
    id: config.id,
    title: config.title,
    role: config.role,
    version: config.version || '1.0.0',
    generated: new Date().toISOString().slice(0, 10),
    targetPlatforms: config.targetPlatforms || ['iphone_16_pro_wallpaper'],
    renderer: config.renderer || 'banana_pro_ai',
    technicalStandards: TECHNICAL_STANDARDS,
    subject,
    wardrobe: config.wardrobe || null,
    environment: config.environment || null,
    camera: config.camera || {
      framing: 'medium close-up, waist to slightly above head',
      angle: 'locked, slight low angle (5 degrees)',
      orientation: 'portrait 1179 x 2556',
    },
    animation: config.animation || {
      loopSeconds: 4,
      idleBehaviors: [
        'breathing cycle 14 bpm',
        'natural blink 18/min',
        'subtle weight shift',
        'micro-expressions',
      ],
    },
    voice: config.voice || null,
    deliveryProfile: config.deliveryProfile || {
      tone: 'strictly professional, CEO-level, data-driven',
      cadence: 'measured, deliberate',
      prohibited: ['casual filler', 'slang', 'sexualized framing'],
    },
    qualityGates: [
      'Skin: no waxy plastic appearance; visible pores; natural variation',
      'Eyes: visible corneal reflection; tear film on lower lid',
      'Hair: strand-level; no clumping artifacts',
      'Loop: first and last frames match perfectly',
      'Resolution: pixel-perfect 1179x2556; no upscaling artifacts',
      'Frame rate: steady 60 fps; no judder',
      'Content: no sexualized framing; PG-13 ceiling',
    ],
  };

  enforceContentPolicy(spec);
  return spec;
}

/**
 * Render a spec to a human-readable prompt block suitable for pasting into
 * a generative tool.
 */
function renderPrompt(spec) {
  const lines = [];
  lines.push(`# ${spec.title}`);
  lines.push('');
  lines.push(`Role: ${spec.role}`);
  lines.push(`Renderer: ${spec.renderer}`);
  lines.push(`Target: ${spec.targetPlatforms.join(', ')}`);
  lines.push('');
  lines.push('## Subject');
  lines.push(`Name: ${spec.subject.name}`);
  lines.push(`Kind: ${spec.subject.kind}`);
  lines.push(`Content rating: ${spec.subject.contentRating}`);
  if (spec.subject.description) {
    lines.push('');
    lines.push('Description:');
    for (const item of spec.subject.description) lines.push(`- ${item}`);
  }
  if (spec.subject.kind === 'self' && spec.subject.selfInputs) {
    lines.push('');
    lines.push('Authorized self-inputs:');
    for (const f of spec.subject.selfInputs.sourceFiles) lines.push(`- ${f}`);
    lines.push(`Consent: ${spec.subject.selfInputs.consentStatement}`);
  }

  if (spec.wardrobe) {
    lines.push('');
    lines.push('## Wardrobe');
    for (const item of spec.wardrobe) lines.push(`- ${item}`);
  }

  if (spec.environment) {
    lines.push('');
    lines.push('## Environment');
    for (const item of spec.environment) lines.push(`- ${item}`);
  }

  lines.push('');
  lines.push('## Technical pipeline (Weta-grade)');
  for (const [k, v] of Object.entries(spec.technicalStandards.pipeline)) {
    lines.push(`- ${k}:`);
    for (const item of v) lines.push(`    - ${item}`);
  }

  lines.push('');
  lines.push('## Animation');
  lines.push(`Loop: ${spec.animation.loopSeconds}s seamless @ ${spec.technicalStandards.frameRate} fps`);
  for (const b of spec.animation.idleBehaviors) lines.push(`- ${b}`);

  lines.push('');
  lines.push('## Delivery profile');
  lines.push(`Tone: ${spec.deliveryProfile.tone}`);
  lines.push(`Cadence: ${spec.deliveryProfile.cadence}`);

  lines.push('');
  lines.push('## Output');
  const r = spec.technicalStandards.resolution;
  lines.push(`- ${r.width} x ${r.height} (${r.label})`);
  lines.push(`- ${spec.technicalStandards.container} / ${spec.technicalStandards.codec}`);
  lines.push(`- ${spec.technicalStandards.colorSpace}, ${spec.technicalStandards.dynamicRange}`);

  return lines.join('\n') + '\n';
}

module.exports = {
  TECHNICAL_STANDARDS,
  DISALLOWED_DESCRIPTORS,
  buildAvatarSpec,
  renderPrompt,
  validateSubject,
  enforceContentPolicy,
};
