/**
 * Podcast Channel Routes — /v1/podcast/*
 *
 * Manages the Coastal Key Property Management podcast channel:
 *   GET  /v1/podcast/episodes       — List published episodes
 *   GET  /v1/podcast/episodes/:id   — Get single episode
 *   POST /v1/podcast/episodes       — Create/generate a new episode
 *   GET  /v1/podcast/feed.xml       — Public RSS feed (no auth)
 *   GET  /v1/podcast/stats          — Podcast analytics
 */

import { inference } from '../services/anthropic.js';
import { createRecord, listRecords, getRecord, updateRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse, corsHeaders } from '../utils/response.js';

// ── Channel Metadata ────────────────────────────────────────────────────────

const CHANNEL = {
  title: 'Coastal Key Insights',
  subtitle: 'AI-Powered Property Management on the Treasure Coast',
  description: 'The official podcast of Coastal Key Property Management. Weekly episodes covering luxury property management, real estate investment strategies, market intelligence, and AI-driven operations on Florida\'s Treasure Coast — from Vero Beach to Jupiter.',
  language: 'en-us',
  author: 'Coastal Key Property Management',
  email: 'podcast@coastalkey-pm.com',
  website: 'https://coastalkey-pm.com/podcast',
  copyright: `© ${new Date().getFullYear()} Coastal Key Property Management. All rights reserved.`,
  category: 'Business',
  subcategory: 'Investing',
  explicit: false,
  image: 'https://coastalkey-pm.com/assets/podcast-cover.jpg',
  keywords: [
    'property management', 'real estate', 'Treasure Coast', 'Florida',
    'luxury homes', 'AI', 'investment', 'Vero Beach', 'Stuart', 'Jupiter',
  ],
};

// ── Episode Series ──────────────────────────────────────────────────────────

const SERIES = [
  { id: 'market-pulse', name: 'Market Pulse', desc: 'Weekly Treasure Coast market data, trends, and forecasts.' },
  { id: 'owner-spotlight', name: 'Owner Spotlight', desc: 'Conversations with property owners about their investment journey.' },
  { id: 'ai-ops', name: 'AI & Operations', desc: 'How 290 AI agents power modern property management.' },
  { id: 'treasure-coast-living', name: 'Treasure Coast Living', desc: 'Lifestyle, neighborhoods, and what makes the Treasure Coast special.' },
  { id: 'investor-edge', name: 'Investor Edge', desc: 'ROI strategies, portfolio analysis, and market opportunities.' },
];

// ── System Prompt for Episode Generation ────────────────────────────────────

const EPISODE_SYSTEM_PROMPT = `You are the Coastal Key Podcast Production AI. You create professional, engaging podcast episode content for "Coastal Key Insights" — a property management thought leadership podcast.

Channel focus: Luxury property management on Florida's Treasure Coast (Vero Beach to Jupiter). Audience: property owners, real estate investors, and luxury homebuyers.

When generating an episode, produce a complete JSON object with these fields:
- title: Compelling episode title (under 80 chars)
- subtitle: One-line episode teaser (under 150 chars)
- description: 2-3 paragraph episode description for show notes
- duration_estimate: Estimated runtime in "MM:SS" format
- talking_points: Array of 5-8 key talking points
- intro_script: Word-for-word intro script (30-45 seconds)
- outro_script: Word-for-word outro with CTA (20-30 seconds)
- guest_questions: Array of 3-5 interview questions (if guest episode, otherwise empty array)
- show_notes: Markdown-formatted show notes with links and references
- keywords: Array of 5-10 SEO keywords

Respond ONLY with valid JSON. No markdown fencing.`;

// ── Handlers ────────────────────────────────────────────────────────────────

/**
 * GET /v1/podcast/episodes — List published episodes
 */
export async function handleListEpisodes(url, env) {
  const series = url.searchParams.get('series') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  const status = url.searchParams.get('status') || '';

  let filterParts = [];
  if (series) filterParts.push(`{Series} = '${series}'`);
  if (status) filterParts.push(`{Status} = '${status}'`);

  const filterByFormula = filterParts.length > 1
    ? `AND(${filterParts.join(', ')})`
    : filterParts[0] || '';

  try {
    const records = await listRecords(env, TABLES.PODCAST_PRODUCTION, {
      maxRecords: limit,
      filterByFormula,
      sort: 'Episode Number',
    });

    const episodes = records.map(r => ({
      id: r.id,
      episodeNumber: r.fields['Episode Number'] || null,
      title: r.fields['Episode Title'] || 'Untitled',
      subtitle: r.fields['Subtitle'] || '',
      series: r.fields['Series'] || null,
      status: r.fields['Status'] || 'Draft',
      duration: r.fields['Duration Estimate'] || null,
      publishDate: r.fields['Publish Date'] || null,
      audioUrl: r.fields['Audio URL'] || null,
      description: r.fields['Description'] || '',
    }));

    return jsonResponse({
      channel: {
        title: CHANNEL.title,
        description: CHANNEL.description,
        website: CHANNEL.website,
        series: SERIES,
      },
      episodes,
      total: episodes.length,
    });
  } catch (err) {
    return errorResponse(`Failed to list episodes: ${err.message}`, 500);
  }
}

/**
 * GET /v1/podcast/episodes/:id — Get single episode
 */
export async function handleGetEpisode(recordId, env) {
  try {
    const record = await getRecord(env, TABLES.PODCAST_PRODUCTION, recordId);

    return jsonResponse({
      id: record.id,
      episodeNumber: record.fields['Episode Number'] || null,
      title: record.fields['Episode Title'] || 'Untitled',
      subtitle: record.fields['Subtitle'] || '',
      series: record.fields['Series'] || null,
      status: record.fields['Status'] || 'Draft',
      duration: record.fields['Duration Estimate'] || null,
      publishDate: record.fields['Publish Date'] || null,
      audioUrl: record.fields['Audio URL'] || null,
      description: record.fields['Description'] || '',
      outline: record.fields['Episode Outline'] || '',
      introScript: record.fields['Intro Script'] || '',
      outroScript: record.fields['Outro Script'] || '',
      talkingPoints: record.fields['Talking Points'] || '',
      showNotes: record.fields['Show Notes'] || '',
      guestQuestions: record.fields['Guest Questions'] || '',
      targetAudience: record.fields['Target Audience Segment'] || null,
      keywords: record.fields['Keywords'] || '',
    });
  } catch (err) {
    return errorResponse(`Failed to get episode: ${err.message}`, 500);
  }
}

/**
 * POST /v1/podcast/episodes — Generate a new episode via Claude
 *
 * Body:
 *   topic    (string, required) — Episode topic/brief
 *   series   (string, optional) — Series ID from SERIES list
 *   guest    (string, optional) — Guest name if interview episode
 *   segment  (string, optional) — Target audience segment
 */
export async function handleCreateEpisode(request, env, ctx) {
  const body = await request.json();

  if (!body.topic) {
    return errorResponse('"topic" is required.', 400);
  }

  const seriesInfo = body.series
    ? SERIES.find(s => s.id === body.series)
    : null;

  const promptParts = [`Episode Topic: ${body.topic}`];
  if (seriesInfo) promptParts.push(`Series: ${seriesInfo.name} — ${seriesInfo.desc}`);
  if (body.guest) promptParts.push(`Guest: ${body.guest} (create interview-style episode with questions)`);
  if (body.segment) promptParts.push(`Target Audience: ${body.segment}`);
  promptParts.push('Generate a complete podcast episode. Respond with valid JSON only.');

  const result = await inference(env, {
    system: EPISODE_SYSTEM_PROMPT,
    prompt: promptParts.join('\n'),
    tier: 'advanced',
    maxTokens: 4000,
    cacheKey: `podcast:${simpleHash(body.topic)}`,
    cacheTtl: 1800,
  });

  // Parse AI output
  let episode;
  try {
    episode = JSON.parse(result.content);
  } catch {
    // If parsing fails, use raw content as outline
    episode = {
      title: body.topic.slice(0, 80),
      subtitle: '',
      description: result.content,
      duration_estimate: '25:00',
      talking_points: [],
      intro_script: '',
      outro_script: '',
      guest_questions: [],
      show_notes: '',
      keywords: [],
    };
  }

  // Write to Airtable Podcast Production table
  let airtableRecord = null;
  try {
    airtableRecord = await createRecord(env, TABLES.PODCAST_PRODUCTION, {
      'Episode Title': episode.title || body.topic.slice(0, 100),
      'Subtitle': (episode.subtitle || '').slice(0, 150),
      'Description': (episode.description || '').slice(0, 10000),
      'Episode Outline': result.content.slice(0, 10000),
      'Duration Estimate': episode.duration_estimate || '25:00',
      'Intro Script': (episode.intro_script || '').slice(0, 5000),
      'Outro Script': (episode.outro_script || '').slice(0, 5000),
      'Talking Points': Array.isArray(episode.talking_points)
        ? episode.talking_points.join('\n• ')
        : '',
      'Show Notes': (episode.show_notes || '').slice(0, 10000),
      'Guest Questions': Array.isArray(episode.guest_questions)
        ? episode.guest_questions.join('\n• ')
        : '',
      'Keywords': Array.isArray(episode.keywords)
        ? episode.keywords.join(', ')
        : '',
      'Status': { name: 'Draft' },
      ...(seriesInfo ? { 'Series': { name: seriesInfo.name } } : {}),
      ...(body.segment ? { 'Target Audience Segment': { name: body.segment } } : {}),
      ...(body.guest ? { 'Guest Name': body.guest } : {}),
    });
  } catch (err) {
    console.error('Podcast Production write failed:', err);
  }

  // Audit log
  writeAudit(env, ctx, {
    route: '/v1/podcast/episodes',
    action: 'generate_episode',
    topic: body.topic,
    series: body.series || null,
    model: result.model,
    cached: result.cached,
    airtableRecordId: airtableRecord?.id,
  });

  return jsonResponse({
    episode: {
      id: airtableRecord?.id || null,
      title: episode.title,
      subtitle: episode.subtitle,
      description: episode.description,
      duration: episode.duration_estimate,
      talkingPoints: episode.talking_points,
      introScript: episode.intro_script,
      outroScript: episode.outro_script,
      guestQuestions: episode.guest_questions,
      showNotes: episode.show_notes,
      keywords: episode.keywords,
    },
    channel: { title: CHANNEL.title, website: CHANNEL.website },
    model: result.model,
    cached: result.cached,
  }, 201);
}

/**
 * GET /v1/podcast/feed.xml — RSS 2.0 feed (public, no auth)
 */
export async function handlePodcastFeed(env) {
  let episodes = [];

  try {
    const records = await listRecords(env, TABLES.PODCAST_PRODUCTION, {
      filterByFormula: "{Status} = 'Published'",
      maxRecords: 50,
      sort: 'Publish Date',
    });

    episodes = records.map(r => r.fields);
  } catch (err) {
    console.error('Failed to fetch podcast episodes for feed:', err);
  }

  const escXml = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const itemsXml = episodes.map(ep => {
    const pubDate = ep['Publish Date']
      ? new Date(ep['Publish Date']).toUTCString()
      : new Date().toUTCString();

    return `    <item>
      <title>${escXml(ep['Episode Title'])}</title>
      <description><![CDATA[${ep['Description'] || ep['Episode Outline'] || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <itunes:subtitle>${escXml(ep['Subtitle'] || '')}</itunes:subtitle>
      <itunes:duration>${escXml(ep['Duration Estimate'] || '25:00')}</itunes:duration>
      <itunes:keywords>${escXml(ep['Keywords'] || '')}</itunes:keywords>
      ${ep['Audio URL'] ? `<enclosure url="${escXml(ep['Audio URL'])}" type="audio/mpeg" />` : ''}
      <itunes:explicit>no</itunes:explicit>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(CHANNEL.title)}</title>
    <description>${escXml(CHANNEL.description)}</description>
    <link>${CHANNEL.website}</link>
    <language>${CHANNEL.language}</language>
    <copyright>${escXml(CHANNEL.copyright)}</copyright>
    <itunes:author>${escXml(CHANNEL.author)}</itunes:author>
    <itunes:subtitle>${escXml(CHANNEL.subtitle)}</itunes:subtitle>
    <itunes:summary>${escXml(CHANNEL.description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escXml(CHANNEL.author)}</itunes:name>
      <itunes:email>${CHANNEL.email}</itunes:email>
    </itunes:owner>
    <itunes:image href="${CHANNEL.image}" />
    <itunes:category text="${CHANNEL.category}">
      <itunes:category text="${CHANNEL.subcategory}" />
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    <atom:link href="${CHANNEL.website}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders(),
    },
  });
}

/**
 * GET /v1/podcast/stats — Podcast channel analytics
 */
export async function handlePodcastStats(env) {
  try {
    const allEpisodes = await listRecords(env, TABLES.PODCAST_PRODUCTION, {
      maxRecords: 100,
    });

    const stats = {
      totalEpisodes: allEpisodes.length,
      published: 0,
      draft: 0,
      recording: 0,
      editing: 0,
      bySeries: {},
    };

    for (const r of allEpisodes) {
      const status = r.fields['Status'] || 'Draft';
      if (status === 'Published') stats.published++;
      else if (status === 'Draft') stats.draft++;
      else if (status === 'Recording') stats.recording++;
      else if (status === 'Editing') stats.editing++;

      const series = r.fields['Series'] || 'Uncategorized';
      stats.bySeries[series] = (stats.bySeries[series] || 0) + 1;
    }

    return jsonResponse({
      channel: {
        title: CHANNEL.title,
        description: CHANNEL.subtitle,
        website: CHANNEL.website,
        feedUrl: `${CHANNEL.website}/feed.xml`,
        series: SERIES,
      },
      stats,
    });
  } catch (err) {
    return errorResponse(`Failed to get podcast stats: ${err.message}`, 500);
  }
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
