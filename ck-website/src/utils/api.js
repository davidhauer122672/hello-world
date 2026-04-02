/**
 * API Client — Typed wrappers around the CK Gateway endpoints.
 */

import { apiCall } from './auth.js';

// ── Dashboard ────────────────────────────────────────────────────────────────
export const fetchDashboard = () => apiCall('/v1/dashboard');

// ── Agents ───────────────────────────────────────────────────────────────────
export const fetchAgents = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiCall(`/v1/agents${qs ? '?' + qs : ''}`);
};
export const fetchAgent = (id) => apiCall(`/v1/agents/${id}`);
export const fetchAgentMetrics = () => apiCall('/v1/agents/metrics');
export const executeAgentAction = (id, action, params = {}) =>
  apiCall(`/v1/agents/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, params }),
  });

// ── Leads ────────────────────────────────────────────────────────────────────
export const createLead = (data) =>
  apiCall('/v1/leads', { method: 'POST', body: JSON.stringify(data) });
export const fetchLead = (id) => apiCall(`/v1/leads/${id}`);
export const enrichLead = (data) =>
  apiCall('/v1/leads/enrich', { method: 'POST', body: JSON.stringify(data) });

// ── Content ──────────────────────────────────────────────────────────────────
export const generateContent = (data) =>
  apiCall('/v1/content/generate', { method: 'POST', body: JSON.stringify(data) });

// ── Workflows ────────────────────────────────────────────────────────────────
export const runScaa1 = (data) =>
  apiCall('/v1/workflows/scaa1', { method: 'POST', body: JSON.stringify(data) });
export const runWf3 = (data) =>
  apiCall('/v1/workflows/wf3', { method: 'POST', body: JSON.stringify(data) });
export const runWf4 = (data) =>
  apiCall('/v1/workflows/wf4', { method: 'POST', body: JSON.stringify(data) });

// ── Inference ────────────────────────────────────────────────────────────────
export const runInference = (data) =>
  apiCall('/v1/inference', { method: 'POST', body: JSON.stringify(data) });

// ── Pricing ─────────────────────────────────────────────────────────────────
export const getPricingRecommendation = (data) =>
  apiCall('/v1/pricing/recommend', { method: 'POST', body: JSON.stringify(data) });
export const getPricingZones = () => apiCall('/v1/pricing/zones');

// ── Podcast ─────────────────────────────────────────────────────────────────
export const fetchPodcastEpisodes = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiCall(`/v1/podcast/episodes${qs ? '?' + qs : ''}`);
};
export const fetchPodcastEpisode = (id) => apiCall(`/v1/podcast/episodes/${id}`);
export const generatePodcastEpisode = (data) =>
  apiCall('/v1/podcast/episodes', { method: 'POST', body: JSON.stringify(data) });
export const fetchPodcastStats = () => apiCall('/v1/podcast/stats');

// ── Audit ────────────────────────────────────────────────────────────────────
export const fetchAuditLog = (limit = 50) =>
  apiCall(`/v1/audit?limit=${limit}`);
