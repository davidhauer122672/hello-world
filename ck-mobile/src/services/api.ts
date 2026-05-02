/**
 * CK API Client — Connects to ck-api-gateway (Cloudflare Worker).
 *
 * Base URL: https://ck-api-gateway.<account>.workers.dev (or custom domain)
 * Auth: Bearer token via WORKER_AUTH_TOKEN
 */

import { store } from '../store/app-store';

const API_BASE = 'https://api.coastalkey-pm.com';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  skipAuth?: boolean;
}

class CKApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return store.getState().authToken;
  }

  async request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, params, skipAuth = false } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText, endpoint);
    }

    return response.json();
  }

  // ── Health ──
  async health(deep = false) {
    return this.request('/v1/health', {
      params: deep ? { deep: 'true' } : undefined,
    });
  }

  // ── Dashboard ──
  async getDashboard() {
    return this.request<DashboardResponse>('/v1/dashboard');
  }

  // ── Agents ──
  async listAgents(filters?: { division?: string; status?: string; search?: string }) {
    return this.request<AgentsResponse>('/v1/agents', { params: filters as Record<string, string> });
  }

  async getAgent(id: string) {
    return this.request(`/v1/agents/${id}`);
  }

  async agentAction(id: string, action: string, params?: Record<string, unknown>) {
    return this.request(`/v1/agents/${id}/action`, {
      method: 'POST',
      body: { action, params },
    });
  }

  async getAgentMetrics() {
    return this.request('/v1/agents/metrics');
  }

  // ── Leads ──
  async createLead(fields: Record<string, unknown>) {
    return this.request('/v1/leads', { method: 'POST', body: { fields } });
  }

  async getLead(id: string) {
    return this.request(`/v1/leads/${id}`);
  }

  async enrichLead(recordId: string, type: 'battle_plan' | 'investor_analysis' | 'segment_analysis') {
    return this.request('/v1/leads/enrich', { method: 'POST', body: { recordId, type } });
  }

  async submitPublicLead(data: { name: string; email: string; phone?: string; zone?: string; message?: string }) {
    return this.request('/v1/leads/public', { method: 'POST', body: data, skipAuth: true });
  }

  // ── Content ──
  async generateContent(params: { type: string; topic: string; tone?: string }) {
    return this.request('/v1/content/generate', { method: 'POST', body: params });
  }

  // ── Inference ──
  async inference(system: string, prompt: string, tier: 'fast' | 'standard' | 'advanced' = 'standard') {
    return this.request<InferenceResponse>('/v1/inference', {
      method: 'POST',
      body: { system, prompt, tier },
    });
  }

  // ── Workflows ──
  async runBattlePlan(leadId: string) {
    return this.request('/v1/workflows/scaa1', { method: 'POST', body: { recordId: leadId } });
  }

  async runInvestorEscalation(leadId: string) {
    return this.request('/v1/workflows/wf3', { method: 'POST', body: { recordId: leadId } });
  }

  async runLongTailNurture(leadId: string) {
    return this.request('/v1/workflows/wf4', { method: 'POST', body: { recordId: leadId } });
  }

  // ── Pricing ──
  async getPricingRecommendation(params: Record<string, unknown>) {
    return this.request('/v1/pricing/recommend', { method: 'POST', body: params });
  }

  async getPricingZones() {
    return this.request('/v1/pricing/zones');
  }

  // ── Audit ──
  async getAuditLog() {
    return this.request('/v1/audit');
  }
}

export class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(status: number, message: string, endpoint: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

// ── Response Types ──
export interface DashboardResponse {
  agents: { total: number; byStatus: Record<string, number> };
  divisions: Array<{ id: string; name: string; agentCount: number; activeCount: number }>;
  recentAudit: Array<Record<string, unknown>>;
  systemHealth: { status: string; activeRatio: number; timestamp: string };
}

export interface AgentsResponse {
  agents: Agent[];
  count: number;
  divisions: Division[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  division: string;
  tier: string;
  status: 'active' | 'standby' | 'training' | 'maintenance';
}

export interface Division {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface InferenceResponse {
  content: string;
  model: string;
  cached: boolean;
  usage: { input_tokens: number; output_tokens: number };
}

export const api = new CKApiClient(API_BASE);
