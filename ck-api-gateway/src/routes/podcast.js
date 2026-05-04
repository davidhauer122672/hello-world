/**
 * Podcast Routes — Coastal Key AI-Powered Podcast Engine
 *
 * Endpoints:
 *   GET  /v1/podcast/episodes        — List all podcast episodes
 *   GET  /v1/podcast/episodes/:id    — Get single episode by ID
 *   POST /v1/podcast/generate        — Generate podcast episode outline via Claude
 *   POST /v1/podcast/script          — Generate full podcast script from outline
 *   GET  /v1/podcast/dashboard       — Podcast analytics dashboard
 *   POST /v1/podcast/distribute      — Create distribution plan for episode
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

// ── Podcast Series Configuration ───────────────────────────────────────────

const PODCAST_SERIES = {
  id: 'CK-PODCAST-001',
  title: 'The Coastal Key Podcast',
  subtitle: 'AI-Powered Property Management for the Treasure Coast',
  host: 'David Hauer — CEO, Coastal Key Property Management',
  format: 'Solo + Guest Episodes',
  cadence: 'Weekly',
  platforms: ['Spotify', 'Apple Podcasts', 'YouTube', 'Google Podcasts', 'Amazon Music'],
  themes: [
    'Property management innovation',
    'AI in real estate',
    'Treasure Coast market insights',
    'Home watch and seasonal care',
    'Investor strategies for South Florida',
    'Entrepreneurship and business automation',
  ],
};

// ── Episode Catalog ────────────────────────────────────────────────────────

const EPISODES = [
  {
    id: 'EP-001',
    title: 'Why AI Property Management Changes Everything',
    description: 'David breaks down how 384 AI agents are transforming property management on the Treasure Coast.',
    duration: '28:00',
    status: 'planned',
    series: 'foundation',
    publishDate: null,
    tags: ['ai', 'property-management', 'launch'],
  },
  {
    id: 'EP-002',
    title: 'The Home Watch Opportunity Nobody Talks About',
    description: 'Seasonal residents need Home Watch services — here is why this $2B market is wide open.',
    duration: '22:00',
    status: 'planned',
    series: 'market-insights',
    publishDate: null,
    tags: ['home-watch', 'market-opportunity', 'seasonal'],
  },
  {
    id: 'EP-003',
    title: 'Building a 384-Agent AI Fleet from Zero',
    description: 'The engineering story behind Coastal Key\'s autonomous AI fleet — from concept to 384 live agents.',
    duration: '35:00',
    status: 'planned',
    series: 'behind-the-scenes',
    publishDate: null,
    tags: ['ai-fleet', 'engineering', 'startup'],
  },
  {
    id: 'EP-004',
    title: 'Treasure Coast Real Estate: 2026 Market Pulse',
    description: 'Data-driven analysis of Vero Beach to Jupiter — pricing trends, demand signals, and investor opportunities.',
    duration: '25:00',
    status: 'planned',
    series: 'market-insights',
    publishDate: null,
    tags: ['market-analysis', 'treasure-coast', 'investing'],
  },
  {
    id: 'EP-005',
    title: 'From Zero to First Client: The Launch Playbook',
    description: 'Real talk about starting a property management company from scratch with AI as your co-founder.',
    duration: '30:00',
    status: 'planned',
    series: 'founder-journey',
    publishDate: null,
    tags: ['startup', 'first-client', 'founder-journey'],
  },
];

const _byId = new Map(EPISODES.map(e => [e.id, e]));

// ── Route Handlers ─────────────────────────────────────────────────────────

export function handleListEpisodes(url) {
  const params = new URL(url).searchParams;
  const series = params.get('series');
  const status = params.get('status');

  let filtered = EPISODES;
  if (series) filtered = filtered.filter(e => e.series === series);
  if (status) filtered = filtered.filter(e => e.status === status);

  return jsonResponse({
    series: PODCAST_SERIES,
    episodes: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
}

export function handleGetEpisode(id) {
  const episode = _byId.get(id);
  if (!episode) {
    return errorResponse(`Episode not found: "${id}"`, 404);
  }
  return jsonResponse({
    ...episode,
    series: PODCAST_SERIES,
    timestamp: new Date().toISOString(),
  });
}

export async function handleGenerateOutline(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { topic, targetAudience, duration, style } = body;
  if (!topic) {
    return errorResponse('Missing required field: topic', 400);
  }

  // Generate outline using Claude if ANTHROPIC_API_KEY is available
  if (env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Generate a podcast episode outline for "The Coastal Key Podcast" hosted by David Hauer, CEO of Coastal Key Property Management.

Topic: ${topic}
Target Audience: ${targetAudience || 'Property investors and seasonal residents on the Treasure Coast'}
Target Duration: ${duration || '25 minutes'}
Style: ${style || 'Conversational, data-driven, with actionable insights'}

Format the outline as JSON with: title, hook, segments (array of {title, duration, keyPoints}), callToAction, suggestedGuests.`,
          }],
        }),
      });

      const result = await response.json();
      const content = result.content?.[0]?.text || '';

      return jsonResponse({
        type: 'podcast_outline',
        topic,
        generated: true,
        content,
        model: 'claude-sonnet-4-20250514',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return errorResponse(`Claude inference failed: ${err.message}`, 502);
    }
  }

  // Fallback: return template outline
  return jsonResponse({
    type: 'podcast_outline',
    topic,
    generated: false,
    outline: {
      title: `${topic} — The Coastal Key Podcast`,
      hook: `Opening hook about ${topic} and why it matters for Treasure Coast property owners`,
      segments: [
        { title: 'Introduction', duration: '3:00', keyPoints: ['Welcome and topic introduction', 'Why this matters now'] },
        { title: 'Deep Dive', duration: '12:00', keyPoints: ['Core analysis', 'Data and examples', 'AI-powered insights'] },
        { title: 'Actionable Takeaways', duration: '7:00', keyPoints: ['What listeners can do today', 'Resources and next steps'] },
        { title: 'Wrap-Up', duration: '3:00', keyPoints: ['Summary', 'Call to action', 'Next episode preview'] },
      ],
      callToAction: 'Visit coastalkey-pm.com or call for a free property consultation',
      suggestedGuests: [],
    },
    timestamp: new Date().toISOString(),
  });
}

export async function handleGenerateScript(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { episodeId, outline, tone } = body;
  if (!outline && !episodeId) {
    return errorResponse('Provide either episodeId or outline', 400);
  }

  const episode = episodeId ? _byId.get(episodeId) : null;
  const scriptTopic = episode ? episode.title : (outline?.title || 'Untitled Episode');

  if (env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Write a full podcast script for "The Coastal Key Podcast" hosted by David Hauer.

Episode: ${scriptTopic}
${episode ? `Description: ${episode.description}` : ''}
${outline ? `Outline: ${JSON.stringify(outline)}` : ''}
Tone: ${tone || 'Professional but conversational, data-driven, authoritative yet approachable'}

Include: intro, segment transitions, key talking points with specific data, outro with CTA to coastalkey-pm.com.`,
          }],
        }),
      });

      const result = await response.json();
      const content = result.content?.[0]?.text || '';

      return jsonResponse({
        type: 'podcast_script',
        episode: scriptTopic,
        generated: true,
        content,
        model: 'claude-sonnet-4-20250514',
        wordCount: content.split(/\s+/).length,
        estimatedDuration: `${Math.round(content.split(/\s+/).length / 150)} minutes`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return errorResponse(`Claude inference failed: ${err.message}`, 502);
    }
  }

  return jsonResponse({
    type: 'podcast_script',
    episode: scriptTopic,
    generated: false,
    message: 'ANTHROPIC_API_KEY not configured — script generation requires Claude API',
    timestamp: new Date().toISOString(),
  });
}

export function handlePodcastDashboard() {
  const statusCounts = { planned: 0, recording: 0, editing: 0, published: 0 };
  for (const ep of EPISODES) {
    if (ep.status in statusCounts) statusCounts[ep.status]++;
  }

  const seriesCounts = {};
  for (const ep of EPISODES) {
    seriesCounts[ep.series] = (seriesCounts[ep.series] || 0) + 1;
  }

  return jsonResponse({
    series: PODCAST_SERIES,
    metrics: {
      totalEpisodes: EPISODES.length,
      byStatus: statusCounts,
      bySeries: seriesCounts,
      platforms: PODCAST_SERIES.platforms.length,
    },
    recentEpisodes: EPISODES.slice(0, 5),
    contentCalendar: {
      nextRecording: null,
      nextPublish: null,
      cadence: PODCAST_SERIES.cadence,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function handleDistribute(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { episodeId } = body;
  if (!episodeId) {
    return errorResponse('Missing required field: episodeId', 400);
  }

  const episode = _byId.get(episodeId);
  if (!episode) {
    return errorResponse(`Episode not found: "${episodeId}"`, 404);
  }

  writeAudit(env, ctx, {
    route: '/v1/podcast/distribute',
    action: 'podcast_distribute',
    episodeId,
  });

  return jsonResponse({
    type: 'distribution_plan',
    episode: {
      id: episode.id,
      title: episode.title,
    },
    distribution: PODCAST_SERIES.platforms.map(platform => ({
      platform,
      status: 'queued',
      scheduledAt: null,
    })),
    socialAtoms: [
      { platform: 'LinkedIn', type: 'long-form-post', status: 'draft' },
      { platform: 'Twitter/X', type: 'thread', status: 'draft' },
      { platform: 'Instagram', type: 'audiogram-reel', status: 'draft' },
      { platform: 'YouTube', type: 'shorts-clip', status: 'draft' },
      { platform: 'Facebook', type: 'share-post', status: 'draft' },
    ],
    emailBlast: {
      subject: `New Episode: ${episode.title}`,
      status: 'draft',
      targetList: 'podcast-subscribers',
    },
    timestamp: new Date().toISOString(),
  });
}
