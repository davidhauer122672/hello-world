/**
 * Atlas Service — MongoDB Atlas Data API client for Cloudflare Workers.
 *
 * Uses the Atlas Data API (HTTP/JSON) instead of the MongoDB driver,
 * which is not compatible with Cloudflare Workers' V8 runtime.
 *
 * Databases:
 *   - ckpm_operations:    Call transcripts, analytics, agent performance history
 *   - ckpm_property_intel: Property records, market snapshots, competitive intel
 *   - ckpm_ai_ops:        Inference logs, fleet telemetry, audit trails
 */

const DATABASES = {
  OPERATIONS: 'ckpm_operations',
  PROPERTY_INTEL: 'ckpm_property_intel',
  AI_OPS: 'ckpm_ai_ops',
};

const COLLECTIONS = {
  // ckpm_operations
  CALL_TRANSCRIPTS: 'call_transcripts',
  CALL_ANALYTICS: 'call_analytics',
  AGENT_PERFORMANCE_HISTORY: 'agent_performance_history',
  PROMPT_VERSIONS: 'prompt_versions',
  // ckpm_property_intel
  PROPERTIES: 'properties',
  MARKET_SNAPSHOTS: 'market_snapshots',
  COMPETITIVE_INTEL: 'competitive_intel',
  // ckpm_ai_ops
  INFERENCE_LOGS: 'inference_logs',
  FLEET_TELEMETRY: 'fleet_telemetry',
  AUDIT_TRAIL: 'audit_trail',
};

/**
 * Execute an Atlas Data API action.
 * @param {object} env — Worker env bindings
 * @param {string} action — findOne | find | insertOne | insertMany | updateOne | aggregate
 * @param {string} database — Database name
 * @param {string} collection — Collection name
 * @param {object} body — Action-specific payload (filter, document, pipeline, etc.)
 * @returns {object} — API response data
 */
async function atlasRequest(env, action, database, collection, body = {}) {
  if (!env.ATLAS_DATA_API_URL || !env.ATLAS_DATA_API_KEY) {
    throw new Error('Atlas Data API not configured. Set ATLAS_DATA_API_URL and ATLAS_DATA_API_KEY.');
  }

  const url = `${env.ATLAS_DATA_API_URL}/action/${action}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.ATLAS_DATA_API_KEY,
    },
    body: JSON.stringify({
      dataSource: env.ATLAS_CLUSTER_NAME || 'ckpm-production',
      database,
      collection,
      ...body,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Atlas ${action} error (${response.status}): ${err}`);
  }

  return response.json();
}

// ── Call Transcript Operations ──

/**
 * Store a call transcript from Retell webhook data.
 */
export async function storeCallTranscript(env, callData) {
  const doc = {
    call_id: callData.call_id,
    agent_id: callData.agent_id || null,
    agent_name: callData.agent_name || null,
    campaign: callData.campaign || 'th-sentinel',
    phone_number: callData.phone_number,
    contact_name: callData.contact_name || null,
    direction: callData.direction || 'outbound',
    start_timestamp: callData.start_timestamp ? { $date: new Date(callData.start_timestamp).toISOString() } : null,
    end_timestamp: callData.end_timestamp ? { $date: new Date(callData.end_timestamp).toISOString() } : null,
    duration_seconds: callData.duration_seconds || 0,
    disconnection_reason: callData.disconnection_reason,
    disposition: callData.disposition,
    transcript_raw: callData.transcript_raw || [],
    transcript_text: callData.transcript_text || '',
    service_zone: callData.service_zone || null,
    sentinel_segment: callData.sentinel_segment || null,
    property_address: callData.property_address || null,
    dynamic_variables: callData.dynamic_variables || {},
    metadata: callData.metadata || {},
    quality_score: null,
    airtable_lead_id: callData.airtable_lead_id || null,
    airtable_call_log_id: callData.airtable_call_log_id || null,
    created_at: { $date: new Date().toISOString() },
  };

  return atlasRequest(env, 'insertOne', DATABASES.OPERATIONS, COLLECTIONS.CALL_TRANSCRIPTS, { document: doc });
}

/**
 * Search call transcripts with optional filters.
 */
export async function searchTranscripts(env, filters = {}, limit = 50) {
  const filter = {};
  if (filters.agent_id) filter.agent_id = filters.agent_id;
  if (filters.campaign) filter.campaign = filters.campaign;
  if (filters.disposition) filter.disposition = filters.disposition;
  if (filters.service_zone) filter.service_zone = filters.service_zone;
  if (filters.since) filter.created_at = { $gte: { $date: new Date(filters.since).toISOString() } };

  return atlasRequest(env, 'find', DATABASES.OPERATIONS, COLLECTIONS.CALL_TRANSCRIPTS, {
    filter,
    sort: { created_at: -1 },
    limit,
  });
}

/**
 * Get a single transcript by call_id.
 */
export async function getTranscript(env, callId) {
  return atlasRequest(env, 'findOne', DATABASES.OPERATIONS, COLLECTIONS.CALL_TRANSCRIPTS, {
    filter: { call_id: callId },
  });
}

// ── Call Analytics Operations ──

/**
 * Store daily aggregated analytics.
 */
export async function storeDailyAnalytics(env, analyticsData) {
  const doc = {
    date: { $date: new Date(analyticsData.date).toISOString() },
    campaign: analyticsData.campaign || 'th-sentinel',
    agent_id: analyticsData.agent_id || null,
    service_zone: analyticsData.service_zone || null,
    total_calls: analyticsData.total_calls || 0,
    connections: analyticsData.connections || 0,
    qualified_leads: analyticsData.qualified_leads || 0,
    transfers: analyticsData.transfers || 0,
    appointments: analyticsData.appointments || 0,
    avg_duration_seconds: analyticsData.avg_duration_seconds || 0,
    connection_rate: analyticsData.connection_rate || 0,
    qualification_rate: analyticsData.qualification_rate || 0,
    transfer_success_rate: analyticsData.transfer_success_rate || 0,
    top_objections: analyticsData.top_objections || [],
    top_dispositions: analyticsData.top_dispositions || [],
    hourly_breakdown: analyticsData.hourly_breakdown || [],
    created_at: { $date: new Date().toISOString() },
  };

  return atlasRequest(env, 'insertOne', DATABASES.OPERATIONS, COLLECTIONS.CALL_ANALYTICS, { document: doc });
}

/**
 * Get analytics for a date range.
 */
export async function getAnalytics(env, startDate, endDate, campaign = 'th-sentinel') {
  return atlasRequest(env, 'find', DATABASES.OPERATIONS, COLLECTIONS.CALL_ANALYTICS, {
    filter: {
      campaign,
      date: {
        $gte: { $date: new Date(startDate).toISOString() },
        $lte: { $date: new Date(endDate).toISOString() },
      },
    },
    sort: { date: -1 },
    limit: 200,
  });
}

// ── Agent Performance History ──

/**
 * Store a daily agent performance snapshot.
 */
export async function storeAgentSnapshot(env, snapshot) {
  const doc = {
    agent_id: snapshot.agent_id,
    agent_name: snapshot.agent_name,
    date: { $date: new Date(snapshot.date).toISOString() },
    campaign: snapshot.campaign || 'th-sentinel',
    calls_made: snapshot.calls_made || 0,
    connections: snapshot.connections || 0,
    qualified_leads: snapshot.qualified_leads || 0,
    transfers_completed: snapshot.transfers_completed || 0,
    avg_call_duration: snapshot.avg_call_duration || 0,
    connection_rate: snapshot.connection_rate || 0,
    qualification_rate: snapshot.qualification_rate || 0,
    transfer_rate: snapshot.transfer_rate || 0,
    sentiment_score: snapshot.sentiment_score || null,
    objection_handling_score: snapshot.objection_handling_score || null,
    prompt_version: snapshot.prompt_version || null,
    created_at: { $date: new Date().toISOString() },
  };

  return atlasRequest(env, 'insertOne', DATABASES.OPERATIONS, COLLECTIONS.AGENT_PERFORMANCE_HISTORY, { document: doc });
}

// ── Prompt Version Management ──

/**
 * Store a new prompt version for A/B testing.
 */
export async function storePromptVersion(env, promptData) {
  const doc = {
    version: promptData.version,
    prompt_text: promptData.prompt_text,
    campaign: promptData.campaign || 'th-sentinel',
    created_by: promptData.created_by || 'SEN-034',
    ab_test_group: promptData.ab_test_group || null,
    performance_metrics: promptData.performance_metrics || {},
    status: promptData.status || 'draft',
    deployed_to_agents: promptData.deployed_to_agents || [],
    created_at: { $date: new Date().toISOString() },
    retired_at: null,
  };

  return atlasRequest(env, 'insertOne', DATABASES.OPERATIONS, COLLECTIONS.PROMPT_VERSIONS, { document: doc });
}

/**
 * Get the active prompt version for a campaign.
 */
export async function getActivePrompt(env, campaign = 'th-sentinel') {
  return atlasRequest(env, 'findOne', DATABASES.OPERATIONS, COLLECTIONS.PROMPT_VERSIONS, {
    filter: { campaign, status: 'active' },
    sort: { created_at: -1 },
  });
}

// ── AI Ops: Inference Logging ──

/**
 * Log a Claude API inference call.
 */
export async function logInference(env, inferenceData) {
  const doc = {
    request_id: inferenceData.request_id || crypto.randomUUID(),
    agent_id: inferenceData.agent_id || null,
    model: inferenceData.model,
    route: inferenceData.route,
    prompt_tokens: inferenceData.prompt_tokens || 0,
    completion_tokens: inferenceData.completion_tokens || 0,
    total_tokens: inferenceData.total_tokens || 0,
    cost_usd: inferenceData.cost_usd || 0,
    latency_ms: inferenceData.latency_ms || 0,
    cache_hit: inferenceData.cache_hit || false,
    status: inferenceData.status || 'success',
    error: inferenceData.error || null,
    created_at: { $date: new Date().toISOString() },
  };

  return atlasRequest(env, 'insertOne', DATABASES.AI_OPS, COLLECTIONS.INFERENCE_LOGS, { document: doc });
}

// ── Property Intelligence ──

/**
 * Store or update a property record.
 */
export async function upsertProperty(env, propertyData) {
  return atlasRequest(env, 'updateOne', DATABASES.PROPERTY_INTEL, COLLECTIONS.PROPERTIES, {
    filter: { parcel_id: propertyData.parcel_id },
    update: {
      $set: {
        ...propertyData,
        updated_at: { $date: new Date().toISOString() },
      },
      $setOnInsert: {
        created_at: { $date: new Date().toISOString() },
      },
    },
    upsert: true,
  });
}

/**
 * Search properties by zone and filters.
 */
export async function searchProperties(env, filters = {}, limit = 100) {
  const filter = {};
  if (filters.service_zone) filter.service_zone = filters.service_zone;
  if (filters.property_type) filter.property_type = filters.property_type;
  if (filters.is_absentee !== undefined) filter.is_absentee = filters.is_absentee;
  if (filters.min_value) filter.estimated_value = { $gte: filters.min_value };
  if (filters.city) filter.city = filters.city;

  return atlasRequest(env, 'find', DATABASES.PROPERTY_INTEL, COLLECTIONS.PROPERTIES, {
    filter,
    sort: { estimated_value: -1 },
    limit,
  });
}

// ── Persistent Audit Trail ──

/**
 * Write an audit event to Atlas (long-term storage).
 */
export async function writeAuditEvent(env, eventData) {
  const doc = {
    event_id: eventData.event_id || crypto.randomUUID(),
    timestamp: { $date: new Date().toISOString() },
    route: eventData.route,
    action: eventData.action,
    actor: eventData.actor || 'system',
    details: eventData.details || {},
    ip_address: eventData.ip_address || null,
    user_agent: eventData.user_agent || null,
    created_at: { $date: new Date().toISOString() },
  };

  return atlasRequest(env, 'insertOne', DATABASES.AI_OPS, COLLECTIONS.AUDIT_TRAIL, { document: doc });
}

export { DATABASES, COLLECTIONS, atlasRequest };
