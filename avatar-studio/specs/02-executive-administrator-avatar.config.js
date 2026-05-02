/**
 * Spec 2 — Executive Administrator Avatar
 *
 * Original fictional character. Operations counterpart to Avatar 01.
 * Delivers ops status, incident summaries, and workflow reports.
 */

'use strict';

module.exports = {
  id: 'ck-avatar-02-exec-admin',
  title: 'Coastal Key Executive Administrator Avatar',
  role: 'Delivers operations status, incident summaries, and workflow reports to the CEO.',
  version: '1.0.0',
  renderer: 'banana_pro_ai',
  targetPlatforms: ['iphone_16_pro_wallpaper', 'grok_companion', 'command_center_ops_panel'],

  subject: {
    name: 'Marcus Reyes',
    kind: 'fictional',
    contentRating: 'PG',
    description: [
      'Composite original character; no real-person likeness',
      'Age appearance: late 30s',
      'Short dark-brown hair, side-parted, lightly textured',
      'Warm brown eyes with direct, focused gaze',
      'Medium-brown skin tone with natural variation',
      'Strong bone structure, cleanly shaved, subtle 5-o-clock shadow visible in rim light',
      'Neutral resting expression with confident micro-smile',
    ],
  },

  wardrobe: [
    'Charcoal three-piece wool suit, single-button waistcoat visible',
    'Crisp white cotton shirt, no tie',
    'Brushed-steel chronograph-style watch on left wrist (generic, no brand)',
    'No logos, no brand marks',
    'Suit fabric drapes naturally with shoulder motion',
  ],

  environment: [
    'Clean executive studio set, soft neutral backdrop (warm gray, slightly darker than Avatar 01 for contrast)',
    'Daylight key from camera-right at 45 degrees',
    'Shallow depth of field, backdrop reads as soft gradient',
    'No windows, no text, no on-screen graphics',
  ],

  camera: {
    framing: 'medium close-up, collarbone to slightly above head',
    angle: 'straight-on, eye-level',
    orientation: 'portrait 1179 x 2556',
  },

  animation: {
    loopSeconds: 5,
    idleBehaviors: [
      'breathing cycle at 13 breaths per minute',
      'natural blink rate 15 per minute with varied timing',
      'occasional chin-lift micro-movement, 1-degree, every 6-8 seconds',
      'eyes track viewer with 2-degree range',
      'subtle jaw-set micro-movement reinforcing authority cue',
    ],
  },

  voice: {
    persona: 'operations-controlled',
    tone: 'baritone, calm, declarative',
    pace: 'steady, measured',
    accent: 'neutral North American',
    prohibited: ['filler words', 'apology phrasing without cause', 'casual slang'],
    ttsProfileHint: 'ElevenLabs: professional-male-operations-baritone',
  },

  deliveryProfile: {
    tone: 'strictly professional, operations-authoritative, incident-aware',
    cadence: 'steady; incident language delivered flat and factual',
    prohibited: ['casual filler', 'slang', 'sexualized framing'],
  },
};
