/**
 * Spec 4 — CEO Avatar (Operator Self-Likeness)
 *
 * Authorized self-likeness avatar of the Coastal Key CEO. This spec only
 * declares the pipeline; the actual face/voice/bio inputs must be supplied
 * by the operator from authorized source files under their control.
 *
 * The `selfInputs.sourceFiles` paths below are the expected locations. If a
 * file is missing at render time the pipeline must abort and report it;
 * DO NOT substitute likeness from any other person or generator.
 */

'use strict';

module.exports = {
  id: 'ck-avatar-04-ceo-self',
  title: 'Coastal Key CEO Avatar (Self-Likeness)',
  role: 'Delivers CEO-voiced addresses, investor updates, and internal directives using the operator\'s authorized likeness and voice.',
  version: '1.0.0',
  renderer: 'banana_pro_ai',
  targetPlatforms: ['iphone_16_pro_wallpaper', 'grok_companion', 'command_center_ceo_panel'],

  subject: {
    name: 'Coastal Key CEO',
    kind: 'self',
    contentRating: 'PG',
    description: [
      'Photorealistic reconstruction driven entirely by authorized source files listed in selfInputs.',
      'Renderer must derive facial geometry, skin albedo, and hair from source footage only.',
      'Renderer must derive voice from source voice samples only.',
      'No descriptive features are declared in this spec; the pipeline is identity-preserving.',
    ],
    selfInputs: {
      consentStatement: 'Operator is the subject and authorizes use of their own likeness and voice for Coastal Key executive communications only.',
      sourceFiles: [
        'manus-documents/ceo/bio.md',
        'manus-documents/ceo/video-reference/*.mov',
        'manus-documents/ceo/voice-samples/*.wav',
        'notebooklm-exports/ceo-profile.md',
      ],
      usageScope: [
        'Coastal Key CEO Daily Standup briefings',
        'Investor-facing video updates',
        'Internal directives to the 404-agent fleet',
        'Command Center CEO panel live overlay',
      ],
      prohibitedUses: [
        'Any non-Coastal-Key context',
        'Any third-party platform without explicit additional authorization',
        'Any content rated above PG-13',
        'Any sexualized or objectifying framing',
      ],
    },
  },

  wardrobe: [
    'Derived from source footage; renderer must match operator\'s standard executive wardrobe',
    'Default fallback if wardrobe is ambiguous: navy tailored blazer, white shirt, no tie',
  ],

  environment: [
    'Clean executive studio set, soft neutral backdrop (warm gray)',
    'Daylight key from camera-left at 45 degrees',
    'Shallow depth of field, backdrop reads as soft gradient',
  ],

  camera: {
    framing: 'medium close-up, collarbone to slightly above head',
    angle: 'straight-on, eye-level',
    orientation: 'portrait 1179 x 2556',
  },

  animation: {
    loopSeconds: 5,
    idleBehaviors: [
      'breathing cycle derived from source footage',
      'blink rate derived from source footage (target 15-18/min)',
      'micro-expressions derived from source footage',
      'eyes track viewer with 2-degree range',
    ],
  },

  voice: {
    persona: 'operator-self',
    tone: 'derived from voice samples only',
    pace: 'derived from voice samples only',
    accent: 'derived from voice samples only',
    prohibited: ['voice cloning of any third party', 'accent swap', 'age shift'],
    ttsProfileHint: 'Voice must be cloned exclusively from sourceFiles/voice-samples; if samples are missing, abort.',
  },

  deliveryProfile: {
    tone: 'strictly professional, CEO-level, data-driven',
    cadence: 'measured, deliberate, pause before key metric',
    prohibited: ['casual filler', 'slang', 'sexualized framing', 'content not authored or approved by the CEO'],
  },

  preflightChecks: [
    'All selfInputs.sourceFiles exist and are readable',
    'consentStatement is present and non-empty',
    'Voice samples total at least 30 seconds of clean speech',
    'At least one video reference >= 10 seconds of frontal-facing footage',
  ],
};
