const fs = require('fs');
const path = require('path');

let anthropicClient = null;

function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.warn('[objection-handler] ANTHROPIC_API_KEY not set, AI classification disabled');
    return null;
  }
  const Anthropic = require('@anthropic-ai/sdk');
  anthropicClient = new Anthropic({ apiKey: key });
  return anthropicClient;
}

// ---------------------------------------------------------------------------
// Objection library — Coastal Key orchestrator reframes
// ---------------------------------------------------------------------------
const OBJECTION_LIBRARY = {
  competition_neighbor: "A neighbor's verbal account will not hold up the way a timestamped, photographic inspection report will. We protect your claim position.",
  price: "A single AC failure undetected for two weeks runs $4K-$12K in remediation. Our service is $195-$395/month. That is risk transfer at a fraction of exposure.",
  urgency_absence: "Mold can establish in 48 hours after a roof leak. The risk is from the months you are not there.",
  delay_think: "Let us do the complimentary baseline inspection first. Full documented risk report regardless of decision.",
  delay_next_season: "Hurricane season runs June through November. I can hold your spot at today's rate.",
  competition_pm_company: "They focus on tenant placement and rent collection, not property condition oversight. We are the institutional check on the system."
};

// ---------------------------------------------------------------------------
// Keyword trigger map for fast-path classification (<50ms)
// ---------------------------------------------------------------------------
const KEYWORD_MAP = [
  { type: 'competition_neighbor',   triggers: ['neighbor', 'friend checks'] },
  { type: 'price',                  triggers: ['expensive', 'too much', 'cost', 'price'] },
  { type: 'urgency_absence',        triggers: ['not there', 'few times a year', 'only come down'] },
  { type: 'delay_think',            triggers: ['think about it', 'need to think', 'talk to my'] },
  { type: 'delay_next_season',      triggers: ['next season', 'next year', 'not right now'] },
  { type: 'competition_pm_company', triggers: ['property manager', 'management company', 'already have someone'] }
];

// ---------------------------------------------------------------------------
// Call log persistence
// ---------------------------------------------------------------------------
const CALL_LOG_PATH = path.join(__dirname, '..', 'data', 'call-logs.json');

function readCallLogs() {
  try {
    const raw = fs.readFileSync(CALL_LOG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCallLogs(logs) {
  const dir = path.dirname(CALL_LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CALL_LOG_PATH, JSON.stringify(logs, null, 2), 'utf8');
}

function appendCallLog(entry) {
  const logs = readCallLogs();
  logs.push(entry);
  writeCallLogs(logs);
}

function updateCallLog(callId, updates) {
  const logs = readCallLogs();
  const idx = logs.findIndex((l) => l.callId === callId);
  if (idx !== -1) {
    Object.assign(logs[idx], updates);
    writeCallLogs(logs);
  }
  return idx !== -1;
}

// ---------------------------------------------------------------------------
// classifyObjection — keyword fast path, Claude fallback
// ---------------------------------------------------------------------------
async function classifyObjection(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return { objectionType: 'unknown', confidence: 0 };
  }

  const lower = transcript.toLowerCase();

  // Fast-path keyword match
  for (const entry of KEYWORD_MAP) {
    for (const trigger of entry.triggers) {
      if (lower.includes(trigger)) {
        return { objectionType: entry.type, confidence: 0.9 };
      }
    }
  }

  // Fallback — Claude API classification
  try {
    const cl = getAnthropicClient();
    if (!cl) return { objectionType: 'unknown', confidence: 0 };
    const message = await cl.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      temperature: 0.3,
      system: `You are an objection classifier for Coastal Key Treasure Coast Asset Management sales calls.
Classify the prospect objection into exactly one of these types:
competition_neighbor, price, urgency_absence, delay_think, delay_next_season, competition_pm_company, unknown.
Respond with ONLY a JSON object: {"objectionType":"<type>","confidence":<0-1>}`,
      messages: [{ role: 'user', content: transcript }]
    });

    const text = message.content[0].text.trim();
    const result = JSON.parse(text);
    return {
      objectionType: result.objectionType || 'unknown',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5
    };
  } catch (err) {
    console.error('[objection-handler] Claude classification error:', err.message);
    return { objectionType: 'unknown', confidence: 0 };
  }
}

// ---------------------------------------------------------------------------
// getReframe — scripted reframe for known objection types
// ---------------------------------------------------------------------------
function getReframe(objectionType) {
  const reframe = OBJECTION_LIBRARY[objectionType];
  if (!reframe) return null;
  return { objectionType, reframe };
}

// ---------------------------------------------------------------------------
// generateReframe — Claude-powered custom reframe for unknown objections
// ---------------------------------------------------------------------------
async function generateReframe(transcript, context = {}) {
  try {
    const cl = getAnthropicClient();
    if (!cl) return { objectionType: 'unknown', confidence: 0 };
    const message = await cl.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      temperature: 0.3,
      system: `You are a real-time sales reframe assistant for Coastal Key Treasure Coast Asset Management.

Brand voice rules:
- Professional, calm, risk-first framing
- Never aggressive or pushy
- Cite concrete numbers when possible

Pricing: $195-$395/month depending on property size and service tier.
Service zones: Southwest Florida coastal properties, primarily second-home and investment owners.

Services: Weekly property inspections with timestamped photography, hurricane prep and post-storm assessments, vendor coordination, insurance documentation support.

Return ONLY the reframe text. No preamble, no quotes, no labels.
Maximum 2 sentences. Use risk-first framing.`,
      messages: [
        {
          role: 'user',
          content: `Prospect objection transcript: "${transcript}"${
            context.propertyType ? `\nProperty type: ${context.propertyType}` : ''
          }${context.location ? `\nLocation: ${context.location}` : ''}${
            context.notes ? `\nAdditional context: ${context.notes}` : ''
          }\n\nGenerate a reframe.`
        }
      ]
    });

    return { reframe: message.content[0].text.trim(), source: 'generated' };
  } catch (err) {
    console.error('[objection-handler] Claude reframe error:', err.message);
    return { reframe: null, source: 'error', error: err.message };
  }
}

// ---------------------------------------------------------------------------
// handleRetellWebhook — processes Retell AI webhook events
// ---------------------------------------------------------------------------
async function handleRetellWebhook(payload) {
  if (!payload || !payload.event) {
    return { status: 'ignored', reason: 'missing event' };
  }

  const { event, call } = payload;

  switch (event) {
    case 'call.started': {
      const entry = {
        callId: call.call_id,
        startedAt: new Date().toISOString(),
        endedAt: null,
        transcriptSnippets: [],
        objectionsDetected: [],
        reframesProvided: [],
        disposition: null
      };
      appendCallLog(entry);
      console.log(`[objection-handler] Call started: ${call.call_id}`);
      return { status: 'ok', event: 'call.started', callId: call.call_id };
    }

    case 'call.transcript_update': {
      const transcript = call.transcript || '';
      const classification = await classifyObjection(transcript);

      let reframe = null;
      if (classification.objectionType !== 'unknown' && classification.confidence >= 0.5) {
        const scripted = getReframe(classification.objectionType);
        reframe = scripted ? scripted.reframe : null;

        if (!reframe) {
          const generated = await generateReframe(transcript);
          reframe = generated.reframe;
        }
      }

      // Update call log
      const logs = readCallLogs();
      const idx = logs.findIndex((l) => l.callId === call.call_id);
      if (idx !== -1) {
        logs[idx].transcriptSnippets.push(transcript);
        if (classification.objectionType !== 'unknown') {
          logs[idx].objectionsDetected.push({
            type: classification.objectionType,
            confidence: classification.confidence,
            detectedAt: new Date().toISOString()
          });
        }
        if (reframe) {
          logs[idx].reframesProvided.push({
            objectionType: classification.objectionType,
            reframe,
            providedAt: new Date().toISOString()
          });
        }
        writeCallLogs(logs);
      }

      console.log(`[objection-handler] Transcript update for ${call.call_id}: ${classification.objectionType} (${classification.confidence})`);
      return {
        status: 'ok',
        event: 'call.transcript_update',
        callId: call.call_id,
        classification,
        reframe
      };
    }

    case 'call.ended': {
      updateCallLog(call.call_id, {
        endedAt: new Date().toISOString(),
        disposition: call.disposition || 'completed'
      });
      console.log(`[objection-handler] Call ended: ${call.call_id} — ${call.disposition || 'completed'}`);
      return { status: 'ok', event: 'call.ended', callId: call.call_id };
    }

    default:
      return { status: 'ignored', reason: `unhandled event: ${event}` };
  }
}

// ---------------------------------------------------------------------------
// getCallLog — returns recent call logs
// ---------------------------------------------------------------------------
function getCallLog() {
  return readCallLogs();
}

module.exports = {
  classifyObjection,
  getReframe,
  generateReframe,
  handleRetellWebhook,
  getCallLog
};
