/**
 * Social Media Integration Routes — Buffer + Platform Connectors
 *
 *   POST /v1/social/publish      — Queue content to Buffer for multi-platform publish
 *   GET  /v1/social/profiles     — List connected social media profiles
 *   GET  /v1/social/queue        — View scheduled posts in Buffer queue
 *   POST /v1/social/generate     — AI-generate social content for fundraising/marketing
 */

import { inference } from '../services/anthropic.js';
import { createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { BUFFER_PROFILES } from '../config/zapier-workflows.js';

// ── POST /v1/social/publish ────────────────────────────────────────────────

/**
 * Queues content for publishing via Buffer to Instagram Business,
 * Facebook Business Page, and LinkedIn Company Page.
 *
 * Body: {
 *   text: "Post caption text",
 *   mediaUrl: "https://..." (optional),
 *   platforms: ["instagram", "facebook", "linkedin"] (optional, defaults to all),
 *   scheduledAt: "2026-04-05T14:00:00Z" (optional),
 *   campaign: "CEO RISE Campaign" (optional),
 *   type: "fundraising" | "marketing" | "engagement" (optional)
 * }
 */
export async function handleSocialPublish(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { text, mediaUrl, platforms, scheduledAt, campaign, type } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return errorResponse('"text" is required.', 400);
  }

  // Determine target platforms
  const targetPlatforms = platforms || ['instagram', 'facebook', 'linkedin'];
  const validPlatforms = targetPlatforms.filter(p => BUFFER_PROFILES[p]);

  if (validPlatforms.length === 0) {
    return errorResponse('No valid platforms specified. Use: instagram, facebook, linkedin.', 400);
  }

  const timestamp = new Date().toISOString();
  const publishTime = scheduledAt || null; // null = publish immediately

  // Build Buffer-compatible payload
  const bufferPayload = {
    profiles: validPlatforms.map(p => BUFFER_PROFILES[p]),
    text: text.trim(),
    media: mediaUrl ? [{ link: mediaUrl, type: 'image' }] : [],
    scheduledAt: publishTime,
    metadata: {
      source: 'ck-api-gateway',
      campaign: campaign || null,
      type: type || 'marketing',
      createdAt: timestamp,
    },
  };

  // Log to Content Calendar in Airtable
  let contentRecord;
  try {
    contentRecord = await createRecord(env, TABLES.CONTENT_CALENDAR, {
      'Content Title': `Social Post — ${campaign || type || 'General'}`,
      'Post Caption': text.trim().slice(0, 5000),
      'Platform': validPlatforms.join(', '),
      'Media URL': mediaUrl || '',
      'Status': { name: publishTime ? 'Scheduled' : 'Published' },
      'Publish Date': publishTime || timestamp,
      'Buffer Payload': JSON.stringify(bufferPayload).slice(0, 10000),
    });
  } catch (err) {
    console.error('Content Calendar record creation failed:', err);
    contentRecord = null;
  }

  writeAudit(env, ctx, {
    route: '/v1/social/publish',
    action: 'social_publish',
    platforms: validPlatforms.join(','),
    campaign: campaign || 'none',
    scheduled: !!publishTime,
  });

  return jsonResponse({
    queued: true,
    platforms: validPlatforms,
    scheduledAt: publishTime,
    bufferPayload,
    contentRecordId: contentRecord?.id || null,
  });
}

// ── GET /v1/social/profiles ────────────────────────────────────────────────

/**
 * Returns the configured social media profiles and their connection status.
 */
export function handleSocialProfiles() {
  const profiles = Object.entries(BUFFER_PROFILES).map(([key, profile]) => ({
    key,
    ...profile,
    connected: profile.profileId !== null,
    connectionStatus: profile.profileId ? 'connected' : 'pending_setup',
  }));

  return jsonResponse({
    profiles,
    bufferConnected: profiles.some(p => p.connected),
    totalProfiles: profiles.length,
    connectedProfiles: profiles.filter(p => p.connected).length,
    setupInstructions: {
      step1: 'Connect Buffer to Zapier via OAuth in Zapier dashboard',
      step2: 'Link Instagram Business account in Buffer → Channels',
      step3: 'Link Facebook Business Page in Buffer → Channels',
      step4: 'Link LinkedIn Company Page in Buffer → Channels',
      step5: 'Update profileId values in zapier-workflows.js config after connection',
    },
  });
}

// ── GET /v1/social/queue ───────────────────────────────────────────────────

/**
 * Returns the current social media post queue.
 * In production, this would query Buffer's API. For now, returns
 * scheduled posts from the Content Calendar.
 */
export async function handleSocialQueue(url, env) {
  try {
    const result = await listRecords(env, TABLES.CONTENT_CALENDAR, {
      filterByFormula: `{Status} = 'Scheduled'`,
      sort: [{ field: 'Publish Date', direction: 'asc' }],
      maxRecords: 20,
    });

    const queue = (result.records || []).map(r => ({
      id: r.id,
      title: r.fields['Content Title'] || r.fields['Title'] || 'Untitled',
      caption: (r.fields['Post Caption'] || r.fields['Caption'] || '').slice(0, 200),
      platform: r.fields['Platform'] || 'all',
      publishDate: r.fields['Publish Date'] || r.fields['Scheduled Date'],
      status: 'scheduled',
    }));

    return jsonResponse({ queue, count: queue.length });
  } catch (err) {
    return jsonResponse({ queue: [], count: 0, error: err.message });
  }
}

// ── POST /v1/social/generate ───────────────────────────────────────────────

/**
 * AI-generates social media content for fundraising or marketing.
 *
 * Body: {
 *   topic: "CEO RISE Campaign milestone",
 *   type: "fundraising" | "marketing" | "engagement" | "announcement",
 *   platform: "instagram" | "facebook" | "linkedin" | "all",
 *   tone: "inspiring" | "professional" | "urgent" | "celebratory" (optional),
 *   includeHashtags: true (optional, default true)
 * }
 */
export async function handleSocialGenerate(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const { topic, type, platform, tone, includeHashtags } = body;

  if (!topic) {
    return errorResponse('"topic" is required.', 400);
  }

  const platformGuide = {
    instagram: 'Instagram: Visual-first, use emojis, 2200 char max, 30 hashtags max. Focus on storytelling.',
    facebook: 'Facebook: Longer form OK, encourage sharing, use calls to action. Link-friendly.',
    linkedin: 'LinkedIn: Professional tone, focus on business value, industry insights. Use 3-5 hashtags.',
    all: 'Create a universal post that works across Instagram, Facebook, and LinkedIn. Keep under 280 chars for maximum compatibility.',
  };

  let aiResult;
  try {
    aiResult = await inference(env, {
      system: `You are the social media content creator for Coastal Key Property Management and the Coastal Key Foundation. Create engaging, platform-optimized social media content.`,
      prompt: [
        `Generate a social media post for:`,
        `Topic: ${topic}`,
        `Type: ${type || 'marketing'}`,
        `Platform: ${platform || 'all'}`,
        `Tone: ${tone || 'professional'}`,
        `Include hashtags: ${includeHashtags !== false ? 'yes' : 'no'}`,
        ``,
        `Platform guidance: ${platformGuide[platform || 'all']}`,
        ``,
        `Return the post text only. Make it compelling and action-oriented.`,
      ].join('\n'),
      tier: 'fast',
      maxTokens: 500,
    });
  } catch (err) {
    return errorResponse(`AI generation failed: ${err.message}`, 502);
  }

  writeAudit(env, ctx, {
    route: '/v1/social/generate',
    action: 'social_generate',
    topic,
    type: type || 'marketing',
    platform: platform || 'all',
  });

  return jsonResponse({
    content: aiResult.content,
    topic,
    type: type || 'marketing',
    platform: platform || 'all',
    tone: tone || 'professional',
    charCount: aiResult.content.length,
    model: aiResult.model,
  });
}

