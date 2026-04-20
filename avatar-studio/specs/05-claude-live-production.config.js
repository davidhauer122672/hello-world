/**
 * Spec 5 — Claude Live Production Master Avatar
 *
 * System-level orchestration avatar for live desktop production.
 * Bridges Banana Pro visual rendering with Claude LLM intelligence
 * for real-time conversational avatar sessions.
 */

'use strict';

module.exports = {
  id: 'ck-avatar-05-claude-live',
  title: 'Coastal Key Claude Live Production Avatar',
  role: 'Real-time conversational avatar system bridging Banana Pro AI rendering with Claude LLM intelligence for live desktop production.',
  version: '1.0.0',
  renderer: 'banana_pro_ai',
  targetPlatforms: ['desktop_live_production', 'virtual_camera', 'command_center_live_panel'],

  subject: {
    name: 'Coastal Key Orchestrator',
    kind: 'non_human',
    contentRating: 'PG',
    description: [
      'AI system interface — non-human digital presence for orchestrator mode',
      'Rendered as abstract executive HUD: translucent waveform overlay on neutral backdrop',
      'Waveform amplitude driven by Claude response audio stream',
      'Status indicators: active avatar ID, model tier, session duration, token usage',
      'Transitions to human avatar (01, 02, or 04) on /avatar command',
    ],
  },

  wardrobe: [
    'Not applicable — non-human orchestrator interface',
    'Visual identity: Coastal Key brand gradient (deep navy to warm gold)',
    'Waveform color: warm gold (#D4A843) on dark navy (#0A1628) field',
  ],

  environment: [
    'Dark executive field, deep navy to black gradient',
    'Subtle grid lines at 5% opacity suggesting spatial depth',
    'Coastal Key logotype watermark at 8% opacity, lower-right',
    'No windows, no text overlays beyond status indicators',
  ],

  camera: {
    framing: 'full-frame, edge-to-edge',
    angle: 'straight-on, centered',
    orientation: 'landscape 1920 x 1080 (desktop default)',
  },

  animation: {
    loopSeconds: 5,
    idleBehaviors: [
      'waveform idle pulse at 0.5 Hz, 10% amplitude',
      'status indicator heartbeat blink every 3 seconds',
      'grid parallax drift at 0.2 degrees per second',
      'ambient particle field — sparse, warm gold, slow drift',
    ],
  },

  voice: {
    persona: 'orchestrator-system',
    tone: 'neutral system voice, clear, no personality affect',
    pace: 'moderate, even',
    accent: 'neutral North American',
    prohibited: ['personality affect', 'emotional coloring', 'casual register'],
    ttsProfileHint: 'ElevenLabs: professional-neutral-system or Coqui local VITS',
  },

  deliveryProfile: {
    tone: 'system-neutral, status-reporting, transition-announcing',
    cadence: 'even, predictable, no dramatic pauses',
    prohibited: ['casual filler', 'slang', 'sexualized framing', 'personality-driven banter'],
  },
};
