/**
 * Content Generation Route — POST /v1/content/generate
 *
 * Generates social media posts, email sequences, video scripts,
 * and podcast outlines via Claude, then writes to the Content Calendar
 * or Video/Podcast Production tables.
 *
 * Request body:
 *   type       (string, required) — "social_post" | "email" | "video_script" | "podcast_outline"
 *   brief      (string, required) — Content brief / topic
 *   segment    (string, optional) — Target audience segment
 *   platform   (string, optional) — Target platform (instagram, youtube, linkedin, etc.)
 *   properties (object, optional) — Additional context (property data, campaign info)
 */

import { inference } from '../services/anthropic.js';
import { createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const SYSTEM_PROMPTS = {
  social_post: `You are the Coastal Key Social Media AI. You create luxury property management content for the Treasure Coast market. Your tone is professional, warm, and authoritative. Every post should reinforce Coastal Key's position as the premium property management provider. Include a caption, 5-8 relevant hashtags, and a suggested call-to-action.`,

  email: `You are the Coastal Key Email Marketing AI. You write high-converting email sequences for luxury property owners on the Treasure Coast. Focus on pain points (absentee owner anxiety, maintenance concerns, property value protection) and position Coastal Key as the trusted solution. Write in a professional but personal tone.`,

  video_script: `You are the Coastal Key Video Production AI. You create scripts for property showcase videos, educational content, and brand storytelling. Scripts should be conversational, visually descriptive (include B-roll suggestions), and optimized for the target platform. Include intro hook, main content, and CTA.`,

  podcast_outline: `You are the Coastal Key Podcast Production AI. You create episode outlines for a property management thought leadership podcast targeting luxury homeowners and real estate investors on the Treasure Coast. Include talking points, guest questions if applicable, intro/outro scripts, and show notes.`,
};

export async function handleContentGenerate(request, env, ctx) {
  const body = await request.json();

  if (!body.type || !body.brief) {
    return errorResponse('"type" and "brief" are required.', 400);
  }

  const systemPrompt = SYSTEM_PROMPTS[body.type];
  if (!systemPrompt) {
    return errorResponse(`Unknown content type "${body.type}". Valid: social_post, email, video_script, podcast_outline`, 400);
  }

  const contextParts = [`Content Brief: ${body.brief}`];
  if (body.segment) contextParts.push(`Target Segment: ${body.segment}`);
  if (body.platform) contextParts.push(`Target Platform: ${body.platform}`);
  if (body.properties) contextParts.push(`Additional Context: ${JSON.stringify(body.properties)}`);

  const result = await inference(env, {
    system: systemPrompt,
    prompt: contextParts.join('\n'),
    tier: body.type === 'video_script' ? 'advanced' : 'standard',
    maxTokens: body.type === 'podcast_outline' ? 4000 : 2500,
    cacheKey: `content:${body.type}:${simpleHash(body.brief)}`,
    cacheTtl: 1800,
  });

  // ── Write to appropriate Airtable table ──
  let airtableRecord = null;

  if (body.type === 'social_post') {
    airtableRecord = await createRecord(env, TABLES.CONTENT_CALENDAR, {
      'Post Title': body.brief.slice(0, 100),
      'Caption': result.content,
      'Status': { name: 'Draft' },
      'Source': { name: 'AI Generated' },
      'Post Date': new Date().toISOString().split('T')[0],
      ...(body.platform ? { 'Platform': [body.platform] } : {}),
    }).catch(err => { console.error('Content Calendar write failed:', err); return null; });
  }

  if (body.type === 'video_script') {
    airtableRecord = await createRecord(env, TABLES.VIDEO_PRODUCTION, {
      'Episode / Video Title': body.brief.slice(0, 100),
      'Script': result.content,
      'Status': { name: 'Draft' },
      'Content Type': { name: 'Short Form Video' },
      ...(body.segment ? { 'Target Segment': { name: body.segment } } : {}),
    }).catch(err => { console.error('Video Production write failed:', err); return null; });
  }

  if (body.type === 'podcast_outline') {
    airtableRecord = await createRecord(env, TABLES.PODCAST_PRODUCTION, {
      'Episode Title': body.brief.slice(0, 100),
      'Episode Outline': result.content,
      'Status': { name: 'Draft' },
      ...(body.segment ? { 'Target Audience Segment': { name: body.segment } } : {}),
    }).catch(err => { console.error('Podcast Production write failed:', err); return null; });
  }

  // ── AI Log ──
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `Social: ${body.type} — ${new Date().toISOString()}`,
      'Module': { name: 'Social' },
      'Request Type': { name: body.type },
      'Input Brief': body.brief.slice(0, 10000),
      'Output Text': result.content.slice(0, 10000),
      'Model Used': { name: result.model },
      'Timestamp': new Date().toISOString(),
      'Status': { name: 'Completed' },
      ...(airtableRecord ? { 'Content Calendar': [airtableRecord.id] } : {}),
    }).catch(err => console.error('AI Log write failed:', err))
  );

  writeAudit(env, ctx, {
    route: '/v1/content/generate',
    contentType: body.type,
    model: result.model,
    cached: result.cached,
    airtableRecordId: airtableRecord?.id,
  });

  return jsonResponse({
    content: result.content,
    type: body.type,
    model: result.model,
    cached: result.cached,
    airtable_record_id: airtableRecord?.id || null,
  });
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
