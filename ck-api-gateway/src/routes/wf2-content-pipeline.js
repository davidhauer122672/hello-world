/**
 * WF-2 Content Engagement Pipeline & WF-4 Alignable Alert Branch
 *
 *   POST /v1/workflows/wf2         — Content Engagement Pipeline
 *   POST /v1/workflows/wf4-alignable — Alignable Community Alert Branch
 *
 * WF-2: Generates content, optimizes via Claude AI, updates Content Calendar in Airtable.
 * WF-4 Alignable: Extends WF-4 nurture with Alignable community engagement alerts.
 */

import { inference } from '../services/anthropic.js';
import { createRecord, updateRecord, listRecords, TABLES } from '../services/airtable.js';
import { generateSocialContent } from '../services/banana-pro.js';
import { schedulePost } from '../engines/campaign/claude-ai-publisher.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Helpers ──

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().split('T')[0];
}

function sendSlack(env, ctx, channel, text) {
  if (!env.SLACK_WEBHOOK_URL) return;
  ctx.waitUntil(
    fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text }),
    }).catch(err => console.error('Slack notification failed:', err))
  );
}

// ── WF-2: Content Engagement Pipeline ────────────────────────────────────────

/**
 * POST /v1/workflows/wf2 — Content Engagement Pipeline.
 *
 * Flow:
 *  1. Receive content brief (topic, platforms, tone, schedule)
 *  2. Generate content via Claude AI + Banana Pro
 *  3. Create Content Calendar entry in Airtable
 *  4. Optimize via Claude AI for multi-platform publishing
 *  5. Create follow-up engagement task
 *  6. Log to AI Log + Slack notification
 *
 * Body: {
 *   topic: string,
 *   platforms: string[],       // ['instagram', 'facebook', 'linkedin']
 *   tone?: string,             // 'professional' | 'casual' | 'luxury'
 *   scheduledAt?: string,      // ISO 8601 — defaults to next available slot
 *   contentType?: string,      // 'social' | 'blog' | 'email' | 'video-script'
 *   propertyData?: string,     // Optional property context
 *   campaignId?: string,       // Optional campaign link
 *   publishNow?: boolean       // Skip scheduling, publish immediately
 * }
 */
export async function handleWf2ContentPipeline(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { topic, platforms, tone, scheduledAt, contentType, propertyData, campaignId, publishNow } = body;
  if (!topic) return errorResponse('"topic" is required.', 400);
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return errorResponse('"platforms" array is required.', 400);
  }

  const timestamp = new Date().toISOString();
  const todayStr = today();

  // ── 1. Generate content via Claude AI ──
  let aiContent;
  try {
    const aiResult = await inference(env, {
      system: `You are the Coastal Key Content AI. You create high-converting social media and marketing content for a luxury property management company on the Treasure Coast, FL. Your content is engaging, professional, and drives action. Always include relevant hashtags and a clear CTA.`,
      prompt: `Create ${contentType || 'social'} content for the following:
Topic: ${topic}
Platforms: ${platforms.join(', ')}
Tone: ${tone || 'professional'}
${propertyData ? `Property Context: ${propertyData}` : ''}

Generate platform-optimized content for each platform. Include:
- Primary content body
- Hashtags (platform-appropriate)
- Call-to-action
- Best posting time suggestion`,
      tier: 'standard',
      maxTokens: 2000,
      cacheKey: `wf2:${topic.slice(0, 30)}:${platforms.join(',')}`,
      cacheTtl: 1800,
    });
    aiContent = aiResult.content;
  } catch (err) {
    return errorResponse(`AI content generation failed: ${err.message}`, 502);
  }

  // ── 2. Enhance with Banana Pro (if available) ──
  let bananaContent = null;
  if (env.BANANA_PRO_API_KEY) {
    try {
      const bananaResult = await generateSocialContent(env, {
        topic, platform: platforms[0], tone: tone || 'professional', propertyData,
      });
      bananaContent = bananaResult.output;
    } catch (err) {
      console.error('Banana Pro enhancement failed (non-blocking):', err);
    }
  }

  // ── 3. Create Content Calendar entry in Airtable ──
  let calendarRecord;
  try {
    calendarRecord = await createRecord(env, TABLES.CONTENT_CALENDAR, {
      'Post Title': topic,
      'Caption': aiContent.slice(0, 10000),
      'Post Type': { name: contentType || 'Social Post' },
      'Platform': platforms.map(p => ({ name: p.charAt(0).toUpperCase() + p.slice(1) })),
      'Status': { name: publishNow ? 'Published' : 'Scheduled' },
      'Post Date': scheduledAt || addDays(todayStr, 1),
      'AI Generated': true,
      'AI Model': 'Claude + Banana Pro',
      'Tone': { name: (tone || 'professional').charAt(0).toUpperCase() + (tone || 'professional').slice(1) },
      'Banana Pro Enhanced': !!bananaContent,
      'CK-SPP Scheduled': false,
      'Created By': 'WF-2 Content Pipeline',
    });
  } catch (err) {
    console.error('Content Calendar creation failed:', err);
    calendarRecord = null;
  }

  // ── 4. Optimize via Claude AI Publishing Engine ──
  let publishResult = null;
  if (env.ANTHROPIC_API_KEY) {
    try {
      publishResult = await schedulePost(env, {
        platform: platforms[0],
        text: aiContent.slice(0, 2200),
        scheduledAt: new Date(scheduledAt || addDays(today(), 1)),
      });

      if (calendarRecord) {
        ctx.waitUntil(
          updateRecord(env, TABLES.CONTENT_CALENDAR, calendarRecord.id, {
            'CK-SPP Scheduled': true,
            'Platform Post ID': publishResult?.publishId || 'pending',
          }).catch(err => console.error('Calendar publish update failed:', err))
        );
      }
    } catch (err) {
      console.error('Claude AI publishing failed (non-blocking):', err);
    }
  }

  // ── 5. Create engagement follow-up task ──
  let taskRecord;
  try {
    const engagementDate = addDays(scheduledAt || todayStr, 1);
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Engagement check: ${topic.slice(0, 50)}`,
      'Type': { name: 'Content Engagement' },
      'Priority': { name: 'Medium' },
      'Due Date': engagementDate,
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Task creation failed:', err);
    taskRecord = null;
  }

  // ── 6. AI Log entry ──
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `WF-2: content_pipeline — ${topic.slice(0, 50)} — ${timestamp}`,
      'Module': { name: 'Content' },
      'Request Type': { name: 'content_pipeline' },
      'Input Brief': JSON.stringify({ topic, platforms, tone, contentType }).slice(0, 10000),
      'Output Text': aiContent.slice(0, 10000),
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  // ── 7. Slack notification ──
  sendSlack(env, ctx, '#content-alerts', [
    `*WF-2 Content Pipeline Complete*`,
    `*Topic:* ${topic}`,
    `*Platforms:* ${platforms.join(', ')}`,
    `*Status:* ${publishNow ? 'Published' : 'Scheduled'}`,
    `*Publishing:* ${publishResult ? 'Claude AI' : 'Manual'}`,
    `*Calendar:* ${calendarRecord ? 'Created' : 'Failed'}`,
  ].join('\n'));

  writeAudit(env, ctx, {
    route: '/v1/workflows/wf2',
    action: 'content_pipeline',
    topic: topic.slice(0, 100),
    platforms: platforms.join(','),
    publishScheduled: !!publishResult,
    calendarRecordId: calendarRecord?.id,
  });

  return jsonResponse({
    content: aiContent,
    bananaEnhanced: !!bananaContent,
    calendarRecordId: calendarRecord?.id || null,
    publishScheduled: !!publishResult,
    taskId: taskRecord?.id || null,
    platforms,
    status: publishNow ? 'published' : 'scheduled',
  });
}

// ── WF-4 Alignable Alert Branch ──────────────────────────────────────────────

/**
 * POST /v1/workflows/wf4-alignable — Alignable Community Alert Branch.
 *
 * Extends WF-4 Long-Tail Nurture with Alignable business community integration.
 * When a lead matches an Alignable business profile, this workflow:
 *  1. Generates a personalized Alignable connection message
 *  2. Creates a community engagement task
 *  3. Schedules local business network touchpoints
 *  4. Tracks Alignable engagement metrics in Airtable
 *
 * Body: {
 *   recordId: string,          // Airtable lead record ID
 *   alignableProfile?: string, // Optional Alignable business URL
 *   businessName?: string,     // Business name for matching
 *   businessCategory?: string, // Business category
 *   location?: string          // Business location
 * }
 */
export async function handleWf4AlignableBranch(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { recordId, alignableProfile, businessName, businessCategory, location } = body;
  if (!recordId || !recordId.startsWith('rec')) {
    return errorResponse('Valid "recordId" starting with "rec" is required.', 400);
  }

  const timestamp = new Date().toISOString();
  const todayStr = today();

  // ── 1. Fetch lead data ──
  let lead;
  try {
    const { getRecord } = await import('../services/airtable.js');
    lead = await getRecord(env, TABLES.LEADS, recordId);
  } catch (err) {
    return errorResponse(`Failed to fetch lead: ${err.message}`, 502);
  }

  const fields = lead.fields;
  const leadName = fields['Lead Name'] || 'Unknown';
  const leadEmail = fields['Email'] || null;
  const serviceZone = fields['Service Zone'] || 'Treasure Coast';

  // ── 2. Generate Alignable connection message via AI ──
  let aiResult;
  try {
    aiResult = await inference(env, {
      system: `You are the Coastal Key Community Engagement AI. You craft personalized business networking messages for the Alignable platform. Your messages are warm, professional, and focused on building genuine local business relationships on the Treasure Coast, FL. Never be salesy — focus on community value.`,
      prompt: `Create an Alignable connection strategy for this lead:

Lead: ${leadName}
Business: ${businessName || 'Unknown'}
Category: ${businessCategory || 'Property/Real Estate'}
Location: ${location || serviceZone}
Alignable Profile: ${alignableProfile || 'To be identified'}

Generate:
1. Initial connection request message (warm, community-focused, under 300 chars)
2. Follow-up message template (for 7 days after connection)
3. Business recommendation template (to share on Alignable)
4. Local event/networking suggestion
5. Three community engagement touchpoints (with timing)`,
      tier: 'standard',
      maxTokens: 1500,
      cacheKey: `wf4-alignable:${recordId}`,
      cacheTtl: 7200,
    });
  } catch (err) {
    return errorResponse(`AI inference failed: ${err.message}`, 502);
  }

  // ── 3. Create Alignable engagement task ──
  let taskRecord;
  try {
    taskRecord = await createRecord(env, TABLES.TASKS, {
      'Task Name': `Alignable: Connect with ${businessName || leadName}`,
      'Type': { name: 'Community Engagement' },
      'Priority': { name: 'Medium' },
      'Due Date': addDays(todayStr, 2),
      'Related Lead': [recordId],
      'Status': { name: 'Not Started' },
    });
  } catch (err) {
    console.error('Task creation failed:', err);
    taskRecord = null;
  }

  // ── 4. Create follow-up touchpoint tasks (Day 7, Day 14, Day 30) ──
  const touchpointTasks = [];
  const touchpoints = [
    { days: 7, name: 'Alignable follow-up message', priority: 'Medium' },
    { days: 14, name: 'Alignable business recommendation', priority: 'Low' },
    { days: 30, name: 'Alignable community event invite', priority: 'Low' },
  ];

  for (const tp of touchpoints) {
    try {
      const tpTask = await createRecord(env, TABLES.TASKS, {
        'Task Name': `${tp.name}: ${businessName || leadName}`,
        'Type': { name: 'Community Engagement' },
        'Priority': { name: tp.priority },
        'Due Date': addDays(todayStr, tp.days),
        'Related Lead': [recordId],
        'Status': { name: 'Not Started' },
      });
      touchpointTasks.push({ days: tp.days, taskId: tpTask.id });
    } catch (err) {
      console.error(`Touchpoint task (Day ${tp.days}) creation failed:`, err);
    }
  }

  // ── 5. Update lead audit trail ──
  const auditAppend = `\n[${timestamp}] WF-4 Alignable branch activated. Community engagement tasks created for ${businessName || leadName}.`;
  ctx.waitUntil(
    updateRecord(env, TABLES.LEADS, recordId, {
      'Audit Trail/Activity Log': (fields['Audit Trail/Activity Log'] || '') + auditAppend,
    }).catch(err => console.error('Lead audit trail update failed:', err))
  );

  // ── 6. AI Log entry ──
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `WF-4-Alignable: community_engagement — ${leadName} — ${timestamp}`,
      'Module': { name: 'Community' },
      'Request Type': { name: 'alignable_engagement' },
      'Input Brief': JSON.stringify({ recordId, businessName, businessCategory, location }).slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
      'Leads': [recordId],
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  // ── 7. Slack notification ──
  sendSlack(env, ctx, '#community-alerts', [
    `*ALIGNABLE ENGAGEMENT:* ${leadName}`,
    `*Business:* ${businessName || 'Pending identification'}`,
    `*Location:* ${location || serviceZone}`,
    `*Touchpoints:* ${touchpointTasks.length + 1} tasks created`,
  ].join('\n'));

  writeAudit(env, ctx, {
    route: '/v1/workflows/wf4-alignable',
    action: 'alignable_engagement',
    recordId,
    leadName,
    businessName,
    touchpointCount: touchpointTasks.length,
  });

  return jsonResponse({
    activated: true,
    connectionMessage: aiResult.content,
    taskId: taskRecord?.id || null,
    touchpointTasks,
    leadName,
    businessName: businessName || null,
  });
}
