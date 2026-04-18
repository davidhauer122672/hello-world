/**
 * Spec 1 — Executive Communications Avatar
 *
 * Original fictional character. Primary on-screen presenter for CEO
 * communications delivered through the Coastal Key Grok companion.
 */

'use strict';

module.exports = {
  id: 'ck-avatar-01-exec-comms',
  title: 'Coastal Key Executive Communications Avatar',
  role: 'Delivers CEO-approved executive communications, briefings, and investor-facing updates.',
  version: '1.0.0',
  renderer: 'banana_pro_ai',
  targetPlatforms: ['iphone_16_pro_wallpaper', 'grok_companion', 'command_center_briefing_panel'],

  subject: {
    name: 'Avery North',
    kind: 'fictional',
    contentRating: 'PG',
    description: [
      'Composite original character; no real-person likeness',
      'Age appearance: early 30s',
      'Medium-length chestnut hair, shoulder-grazing, soft natural waves',
      'Warm hazel eyes with neutral gaze',
      'Fair-olive skin with natural tonal variation, light freckling across nose',
      'Balanced bone structure, strong jawline, approachable expression',
      'Neutral resting expression with subtle, trustworthy half-smile',
    ],
  },

  wardrobe: [
    'Tailored navy double-breasted blazer over white silk shell',
    'Simple brushed-steel stud earrings',
    'One thin brushed-steel cuff bracelet on left wrist',
    'No logos, no brand marks',
    'Fabric drapes cleanly; wool-silk blend rendered at cloth-sim level',
  ],

  environment: [
    'Clean executive studio set, soft neutral backdrop (warm gray)',
    'Subtle daylight key from camera-left at 45 degrees',
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
      'breathing cycle at 14 breaths per minute',
      'natural blink rate 16 per minute with varied timing',
      'micro weight-shift every 4-6 seconds',
      'subtle brow micro-movement synchronized with breathing',
      'eyes track viewer with 2-degree range',
    ],
  },

  voice: {
    persona: 'executive-composed',
    tone: 'measured, authoritative, warm but precise',
    pace: 'moderate, deliberate',
    accent: 'neutral North American',
    prohibited: ['filler words', 'upspeak', 'casual slang'],
    ttsProfileHint: 'ElevenLabs: professional-female-executive-neutral',
  },

  deliveryProfile: {
    tone: 'strictly professional, CEO-level, data-driven',
    cadence: 'measured, deliberate, pause before key metric',
    prohibited: ['casual filler', 'slang', 'sexualized framing'],
  },
};
