/**
 * Atlas Service — youratlas.com AI Campaign Platform API client.
 *
 * API Base: https://api.youratlas.com/v1/api
 * Docs: https://apidocs.youratlas.com
 * Dashboard: https://app.youratlas.com/dashboard/campaigns
 *
 * Atlas is an AI voice agent platform for:
 *   - Speed-to-Lead (60-second contact)
 *   - Dead Lead Revival (re-engage cold leads)
 *   - Appointment Confirmation (no-show reduction)
 *   - AI Receptionist (24/7 inbound handling)
 *   - Outbound Prospecting Campaigns
 *
 * Integrates with Retell AI pipeline — Atlas handles outbound campaigns,
 * Retell handles inbound call analysis. Both feed into Airtable via CKPM gateway.
 */

const ATLAS_API_BASE = 'https://api.youratlas.com/v1/api';

/**
 * Make an authenticated request to the Atlas API.
 * @param {object} env — Worker env bindings
 * @param {string} method — HTTP method
 * @param {string} path — API path (e.g. /campaigns)
 * @param {object} [body] — Request body for POST/PUT
 * @param {object} [queryParams] — URL query parameters
 * @returns {object} — API response data
 */
async function atlasRequest(env, method, path, body = null, queryParams = null) {
  if (!env.ATLAS_API_KEY) {
    throw new Error('ATLAS_API_KEY not configured. Set via wrangler secret put ATLAS_API_KEY.');
  }

  let url = `${ATLAS_API_BASE}${path}`;

  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== null && v !== undefined) params.set(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${env.ATLAS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Atlas API ${method} ${path} error (${response.status}): ${err}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return { status: response.status, ok: true };
}

// ── Campaign Management ──

/**
 * List all campaigns.
 */
export async function listCampaigns(env) {
  return atlasRequest(env, 'GET', '/campaigns');
}

/**
 * Get a single campaign by ID.
 */
export async function getCampaign(env, campaignId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}`);
}

/**
 * Create a new campaign.
 * @param {object} campaignData — Campaign configuration
 */
export async function createCampaign(env, campaignData) {
  return atlasRequest(env, 'POST', '/campaigns', campaignData);
}

/**
 * Update a campaign.
 */
export async function updateCampaign(env, campaignId, updates) {
  return atlasRequest(env, 'PUT', `/campaign/${campaignId}`, updates);
}

/**
 * Set campaign status (active, paused, etc.).
 */
export async function setCampaignStatus(env, campaignId, status) {
  return atlasRequest(env, 'PUT', `/campaign/${campaignId}/status`, { status });
}

/**
 * Delete a campaign.
 */
export async function deleteCampaign(env, campaignId) {
  return atlasRequest(env, 'DELETE', `/campaign/${campaignId}`);
}

// ── Campaign Statistics ──

/**
 * Get overview statistics across all campaigns.
 */
export async function getCampaignsOverviewStats(env) {
  return atlasRequest(env, 'GET', '/campaigns/statistics');
}

/**
 * Get statistics for a specific campaign.
 */
export async function getCampaignStats(env, campaignId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/statistics`);
}

/**
 * Get call records for a campaign.
 */
export async function getCallRecords(env, campaignId, queryParams = null) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/call-records`, null, queryParams);
}

/**
 * Get details for a specific call record.
 */
export async function getCallRecordDetail(env, campaignId, callId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/call-records/${callId}`);
}

/**
 * Delete a call record.
 */
export async function deleteCallRecord(env, campaignId, callId) {
  return atlasRequest(env, 'DELETE', `/campaign/${campaignId}/call-records/${callId}`);
}

// ── Scheduled Calls ──

/**
 * Get scheduled calls for a campaign.
 */
export async function getScheduledCalls(env, campaignId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/scheduled-calls`);
}

/**
 * Schedule a new call in a campaign (speed-to-lead, dead lead revival, etc.).
 * @param {object} callData — { phone_number, contact_name, metadata, ... }
 */
export async function createScheduledCall(env, campaignId, callData) {
  return atlasRequest(env, 'POST', `/campaign/${campaignId}/scheduled-calls`, callData);
}

// ── Bookings ──

/**
 * Get all bookings for a campaign.
 */
export async function getCampaignBookings(env, campaignId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/bookings`);
}

/**
 * Get bookings associated with a specific call.
 */
export async function getCallBookings(env, campaignId, callId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/bookings/callId/${callId}`);
}

// ── Knowledge Base ──

/**
 * List all knowledge base files.
 */
export async function listKnowledgeBaseFiles(env) {
  return atlasRequest(env, 'GET', '/knowledge-base/files');
}

/**
 * List knowledge base files attached to a campaign.
 */
export async function getCampaignKBFiles(env, campaignId) {
  return atlasRequest(env, 'GET', `/campaign/${campaignId}/knowledge-base/files`);
}

/**
 * Attach knowledge base files to a campaign.
 */
export async function attachKBFiles(env, campaignId, fileIds) {
  return atlasRequest(env, 'POST', `/campaign/${campaignId}/knowledge-base/attach`, { file_ids: fileIds });
}

/**
 * Detach knowledge base files from a campaign.
 */
export async function detachKBFiles(env, campaignId, fileIds) {
  return atlasRequest(env, 'POST', `/campaign/${campaignId}/knowledge-base/detach`, { file_ids: fileIds });
}

/**
 * Delete a knowledge base file.
 */
export async function deleteKBFile(env, fileId) {
  return atlasRequest(env, 'DELETE', `/knowledge-base/files/${fileId}`);
}

// ── Speed-to-Lead Helper ──

/**
 * Trigger a speed-to-lead call for a new inbound lead.
 * Schedules an immediate outbound call via the speed-to-lead campaign.
 */
export async function triggerSpeedToLead(env, campaignId, leadData) {
  return createScheduledCall(env, campaignId, {
    phone_number: leadData.phone_number,
    contact_name: leadData.contact_name || '',
    metadata: {
      lead_source: leadData.lead_source || 'website',
      property_address: leadData.property_address || '',
      service_zone: leadData.service_zone || '',
      segment: leadData.segment || '',
      airtable_lead_id: leadData.airtable_lead_id || '',
    },
  });
}

export { atlasRequest, ATLAS_API_BASE };
