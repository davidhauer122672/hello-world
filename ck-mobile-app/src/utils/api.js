/**
 * Coastal Key Mobile App — API Client
 * Communicates with the ck-api-gateway for all data operations.
 */

const API_BASE = 'https://ck-api-gateway.david-e59.workers.dev';

let authToken = localStorage.getItem('ck_token') || '';

export function setToken(token) {
  authToken = token;
  localStorage.setItem('ck_token', token);
}

export function getToken() {
  return authToken;
}

export function clearToken() {
  authToken = '';
  localStorage.removeItem('ck_token');
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ── Health ────────────────────────────────────────────────────────────────────

export const health = () => request('/v1/health');
export const healthDeep = () => request('/v1/health?deep=true');

// ── Agents ───────────────────────────────────────────────────────────────────

export const getAgents = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/v1/agents${qs ? `?${qs}` : ''}`);
};

export const getAgent = (id) => request(`/v1/agents/${id}`);
export const agentAction = (id, action) => request(`/v1/agents/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) });
export const getAgentMetrics = () => request('/v1/agents/metrics');
export const getDashboard = () => request('/v1/dashboard');

// ── Leads ────────────────────────────────────────────────────────────────────

export const getLeads = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/v1/leads${qs ? `?${qs}` : ''}`);
};

export const getLead = (id) => request(`/v1/leads/${id}`);
export const createLead = (data) => request('/v1/leads', { method: 'POST', body: JSON.stringify(data) });
export const enrichLead = (id) => request(`/v1/leads/enrich`, { method: 'POST', body: JSON.stringify({ leadId: id }) });

// ── Inference ────────────────────────────────────────────────────────────────

export const inference = (prompt, options = {}) =>
  request('/v1/inference', { method: 'POST', body: JSON.stringify({ prompt, ...options }) });

// ── Workflows ────────────────────────────────────────────────────────────────

export const battlePlan = (leadId) =>
  request('/v1/workflows/scaa1', { method: 'POST', body: JSON.stringify({ leadId }) });

export const investorEscalation = (leadId) =>
  request('/v1/workflows/wf3', { method: 'POST', body: JSON.stringify({ leadId }) });

export const nurtureLead = (leadId) =>
  request('/v1/workflows/wf4', { method: 'POST', body: JSON.stringify({ leadId }) });

// ── Content ──────────────────────────────────────────────────────────────────

export const generateContent = (data) =>
  request('/v1/content/generate', { method: 'POST', body: JSON.stringify(data) });

// ── Intelligence Officers ────────────────────────────────────────────────────

export const getIntelOfficers = () => request('/v1/intel/officers');
export const getIntelDashboard = () => request('/v1/intel/dashboard');
export const fleetScan = () => request('/v1/intel/fleet-scan', { method: 'POST' });

// ── Email ────────────────────────────────────────────────────────────────────

export const getEmailAgents = () => request('/v1/email/agents');
export const composeEmail = (data) => request('/v1/email/compose', { method: 'POST', body: JSON.stringify(data) });
export const getEmailDashboard = () => request('/v1/email/dashboard');

// ── Pricing ──────────────────────────────────────────────────────────────────

export const getPricingRecommendation = (data) =>
  request('/v1/pricing/recommend', { method: 'POST', body: JSON.stringify(data) });

export const getPricingZones = () => request('/v1/pricing/zones');

// ── Property Intel ───────────────────────────────────────────────────────────

export const searchProperties = (query) =>
  request('/v1/property-intel/search', { method: 'POST', body: JSON.stringify(query) });

export const getPropertyStats = () => request('/v1/property-intel/stats');

// ── Campaign ─────────────────────────────────────────────────────────────────

export const getCampaignDashboard = () => request('/v1/campaign/dashboard');
export const getCampaignAnalytics = () => request('/v1/campaign/analytics');

// ── Audit ────────────────────────────────────────────────────────────────────

export const getAuditLog = () => request('/v1/audit');

// ── New Mobile Endpoints ─────────────────────────────────────────────────────

export const getGovernance = () => request('/v1/governance/compendium');
export const getMission = () => request('/v1/governance/mission');
export const getMarketBrief = () => request('/v1/market/daily-brief');
export const getSubscriptionTiers = () => request('/v1/subscriptions/tiers');
export const executeSkill = (skillId, params = {}) =>
  request('/v1/skills/execute', { method: 'POST', body: JSON.stringify({ skillId, ...params }) });
export const getSystemStatus = () => request('/v1/systems/status');
export const triggerRepair = (systemId) =>
  request('/v1/systems/repair', { method: 'POST', body: JSON.stringify({ systemId }) });
