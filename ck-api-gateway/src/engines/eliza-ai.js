/**
 * Eliza AI Engine — CEO Digital Avatar System
 *
 * Integrates: HeyGen (avatar), ElevenLabs (voice clone), Retell (conversational AI)
 *
 * Pipeline: ElevenLabs Voice ID → Retell Agent → HeyGen Avatar → Live Deployment
 *
 * Closes S1-003: 16 days overdue.
 */

// ── Voice Configuration (ElevenLabs) ───────────────────────────────────────

export const VOICE_CONFIG = {
  provider: 'ElevenLabs',
  voiceName: 'David Hauer — Coastal Key CEO',
  voiceDescription: 'Deep, warm male voice, early 50s, Southern Florida coastal inflection. Grounded baritone with executive authority and approachable warmth. Deliberate pacing with micro-pauses before key points. Calm conviction — no filler, no hedging. Tightens on data, opens with warmth on personal content. Seasoned real estate executive and AI enterprise operator on Florida\'s Treasure Coast. Commanding enough for boardrooms, human enough to build instant trust. Professional, clear, composed.',
  characterCount: 482,
  styleTags: ['professional', 'executive', 'warm', 'authoritative', 'confident', 'conversational', 'clear', 'composed', 'trustworthy', 'refined', 'male', 'baritone'],
  setup: {
    step1: 'Go to elevenlabs.io → Voices → Add Generative or Cloned Voice',
    step2: 'Select Professional Voice Clone (requires 30+ min audio samples)',
    step3: 'Upload CEO audio samples: calls, presentations, briefings',
    step4: 'Paste the 482-char voice description in the description field',
    step5: 'Generate Voice ID → copy the voice_id string',
    step6: 'Store as ELEVENLABS_VOICE_ID secret in Cloudflare Workers',
  },
  apiEndpoint: 'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
  modelId: 'eleven_multilingual_v2',
};

// ── Avatar Configuration (HeyGen) ──────────────────────────────────────────

export const AVATAR_CONFIG = {
  provider: 'HeyGen',
  avatarType: 'Photo Avatar v2 (Instant Avatar)',
  setup: {
    step1: 'Go to heygen.com → Avatars → Create Photo Avatar',
    step2: 'Upload CEO headshot (high-res, neutral background, good lighting)',
    step3: 'Select voice: connect ElevenLabs Voice ID via API key integration',
    step4: 'Configure: business attire, professional setting, eye contact',
    step5: 'Generate avatar_id → store as HEYGEN_AVATAR_ID secret',
    step6: 'Test with sample CEO briefing text before production use',
  },
  apiEndpoint: 'https://api.heygen.com/v2/video/generate',
  outputFormat: '1080p MP4, 30fps',
  useCases: [
    'CEO daily standup video briefings',
    'Client welcome messages',
    'Investor update presentations',
    'Training content for inspectors',
    'Social media thought leadership',
    'Website greeting video',
  ],
};

// ── Conversational AI Configuration (Retell) ───────────────────────────────

export const RETELL_CONFIG = {
  provider: 'Retell AI',
  agentName: 'Eliza — Coastal Key AI Assistant',
  agentType: 'inbound + outbound',
  voiceSource: 'ElevenLabs Voice ID (CEO clone)',
  setup: {
    step1: 'Go to retellai.com → Agents → Create New Agent',
    step2: 'Set agent name: Eliza — Coastal Key AI Assistant',
    step3: 'Connect ElevenLabs: Settings → Voice → Custom → paste Voice ID',
    step4: 'Configure webhook: https://ck-api-gateway.david-e59.workers.dev/v1/webhook/retell',
    step5: 'Set call_analyzed webhook for post-call processing',
    step6: 'Deploy agent → copy agent_id → store as RETELL_AGENT_ID secret',
  },
  webhookUrl: 'https://ck-api-gateway.david-e59.workers.dev/v1/webhook/retell',
  prompt: `You are Eliza, the AI assistant for Coastal Key Property Management on Florida's Treasure Coast. You speak with the authority and warmth of the CEO.

CORE IDENTITY:
- Company: Coastal Key Property Management
- Service area: Treasure Coast, Florida (Vero Beach, Sebastian, Stuart, Port St. Lucie, Jupiter)
- Services: Home Watch, Property Management, Concierge Services
- Differentiator: AI-powered predictive home watch at a fraction of traditional cost

CALL HANDLING:
- Greet warmly: "Thank you for calling Coastal Key Property Management. This is Eliza. How can I help you today?"
- Qualify leads using SCAA-1 framework: property type, location, current management, timeline, budget
- For qualified leads: book a consultation appointment
- For existing clients: route to appropriate department
- For emergencies: escalate immediately to on-call team

PRICING TIERS:
- Select ($195/mo): Standard home watch, weekly visits
- Premier ($295/mo): Enhanced management with concierge
- Platinum ($395/mo): Full luxury management with 24/7 coverage

NEVER: Give legal advice, make promises about specific outcomes, discuss competitor pricing specifics, share internal operations details.

ALWAYS: Be warm, professional, knowledgeable about Treasure Coast real estate, and focused on scheduling consultations.`,
};

// ── Retell Campaign Configuration ─────────────────────────────────────────

export const RETELL_CAMPAIGNS = {
  provider: 'Retell AI',
  platform: 'https://retellai.com',
  campaigns: {
    deadLeadRevival: {
      name: 'Dead Lead Revival',
      description: 'Re-engage leads with no activity for 30+ days',
      sequence: 'Outbound call → voicemail if no answer → retry 3x/72h',
      cadence: 'Day 1, 4, 7',
    },
    appointmentConfirmation: {
      name: 'Appointment Confirmation',
      description: 'Confirm scheduled consultations 24h before',
      sequence: 'Outbound call → retry if no answer',
    },
    speedToLead: {
      name: 'Speed-to-Lead',
      description: 'Contact new leads within 60 seconds of opt-in',
      sequence: 'Immediate outbound call → retry 3x/24h',
    },
  },
  integration: {
    webhook: 'POST /v1/webhook/retell — receives call_analyzed events',
    leadSync: 'Airtable Leads table — auto-create via sentinel-webhook',
    slackNotify: '#sentinel-leads — qualified lead notifications',
  },
};

// ── Eliza System Dashboard ─────────────────────────────────────────────────

export function getElizaDashboard() {
  return {
    system: 'Eliza AI — Coastal Key Digital CEO Assistant',
    status: 'CONFIGURATION_READY',
    components: {
      voice: {
        provider: VOICE_CONFIG.provider,
        status: 'PROMPT_READY',
        voiceDescription: VOICE_CONFIG.voiceDescription,
        characterCount: VOICE_CONFIG.characterCount,
        nextStep: 'Upload CEO audio samples to ElevenLabs and generate Voice ID',
      },
      avatar: {
        provider: AVATAR_CONFIG.provider,
        status: 'AWAITING_VOICE_ID',
        nextStep: 'Create HeyGen Photo Avatar with ElevenLabs voice integration',
      },
      conversational: {
        provider: RETELL_CONFIG.provider,
        status: 'PROMPT_READY',
        webhookUrl: RETELL_CONFIG.webhookUrl,
        nextStep: 'Create Retell agent with ElevenLabs voice, configure webhook',
      },
      campaigns: {
        provider: RETELL_CAMPAIGNS.provider,
        status: 'CAMPAIGNS_DEFINED',
        campaignCount: Object.keys(RETELL_CAMPAIGNS.campaigns).length,
        nextStep: 'Configure outbound campaigns in Retell dashboard',
      },
    },
    deploymentSequence: [
      '1. Generate ElevenLabs Voice ID from CEO audio samples',
      '2. Store ELEVENLABS_VOICE_ID as Cloudflare Worker secret',
      '3. Create Retell agent with Voice ID + system prompt',
      '4. Store RETELL_AGENT_ID as Cloudflare Worker secret',
      '5. Create HeyGen avatar with Voice ID integration',
      '6. Store HEYGEN_AVATAR_ID as Cloudflare Worker secret',
      '7. Configure Retell outbound campaigns (revival, speed-to-lead, confirmation)',
      '8. Test end-to-end: inbound call → qualification → lead record → Slack alert',
    ],
    secretsRequired: [
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_VOICE_ID',
      'RETELL_AGENT_ID',
      'HEYGEN_API_KEY',
      'HEYGEN_AVATAR_ID',
      'RETELL_API_KEY',
    ],
    timestamp: new Date().toISOString(),
  };
}

// ── Generate Video Briefing Request ────────────────────────────────────────

export function generateVideoBriefingRequest(text, options = {}) {
  return {
    type: 'video_briefing',
    avatar: {
      provider: 'HeyGen',
      avatarId: '{HEYGEN_AVATAR_ID}',
      voiceId: '{ELEVENLABS_VOICE_ID}',
    },
    content: {
      text,
      style: options.style || 'professional',
      duration: options.duration || 'auto',
    },
    output: {
      format: 'mp4',
      resolution: '1080p',
      fps: 30,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      purpose: options.purpose || 'ceo-briefing',
      agent: 'ELIZA-AI-ENGINE',
    },
  };
}
