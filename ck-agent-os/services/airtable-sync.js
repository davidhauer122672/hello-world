/**
 * Coastal Key — Airtable Sync Service
 * Bidirectional sync between the Agent OS and Airtable CRM.
 * Handles all table operations for the 40-agent fleet.
 */

const BASE_ID = 'appUSnNgpDkcEOzhN';

const TABLES = {
  LEADS: 'tblpNasm0AxreRqLW',
  MISSED_CALLS_QA: 'tblWW25r6GmsQe3mQ',
  AI_LOG: 'tblZ0bgRmH7KQiZyf',
  TASKS: 'tbl5kGQ81WObMHTup',
  INVESTOR_PRESENTATIONS: 'tblJdcuwF1U2SK8PB',
  CONTENT_CALENDAR: 'tblEPr4f2lMz6ruxF',
  VIDEO_PRODUCTION: 'tbl8dvykC4yTiLDBa',
  PODCAST_PRODUCTION: 'tbl2nRbeo2vHjm1Qr',
  AGENT_PERFORMANCE: 'tblAgentPerformance',
  CAMPAIGN_ANALYTICS: 'tblCampaignAnalytics'
};

export class AirtableSyncService {
  constructor(env) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;
  }

  /** Create a record in the specified table */
  async createRecord(tableId, fields) {
    const response = await fetch(`${this.baseUrl}/${tableId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Airtable create failed: ${response.status} — ${error}`);
    }

    return response.json();
  }

  /** Update a record */
  async updateRecord(tableId, recordId, fields) {
    const response = await fetch(`${this.baseUrl}/${tableId}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Airtable update failed: ${response.status} — ${error}`);
    }

    return response.json();
  }

  /** Get a single record */
  async getRecord(tableId, recordId) {
    const response = await fetch(`${this.baseUrl}/${tableId}/${recordId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new Error(`Airtable get failed: ${response.status}`);
    }

    return response.json();
  }

  /** List records with optional filter and sort */
  async listRecords(tableId, options = {}) {
    const params = new URLSearchParams();
    if (options.filterByFormula) params.set('filterByFormula', options.filterByFormula);
    if (options.sort) options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction || 'asc');
    });
    if (options.maxRecords) params.set('maxRecords', options.maxRecords);
    if (options.view) params.set('view', options.view);
    if (options.fields) options.fields.forEach(f => params.append('fields[]', f));

    const response = await fetch(`${this.baseUrl}/${tableId}?${params}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new Error(`Airtable list failed: ${response.status}`);
    }

    return response.json();
  }

  /** Log an AI agent action to the AI_LOG table */
  async logAgentAction(agentId, action, input, output, tokensUsed) {
    return this.createRecord(TABLES.AI_LOG, {
      'Agent ID': agentId,
      'Action': action,
      'Input Summary': typeof input === 'string' ? input.slice(0, 1000) : JSON.stringify(input).slice(0, 1000),
      'Output Summary': typeof output === 'string' ? output.slice(0, 1000) : JSON.stringify(output).slice(0, 1000),
      'Tokens Used': tokensUsed || 0,
      'Timestamp': new Date().toISOString(),
      'Module': 'CK-Agent-OS'
    });
  }

  /** Create a task record */
  async createTask(assignedAgent, title, description, priority, dueDate) {
    return this.createRecord(TABLES.TASKS, {
      'Task Title': title,
      'Description': description,
      'Assigned Agent': assignedAgent,
      'Priority': priority,
      'Due Date': dueDate,
      'Status': 'Open',
      'Created By': 'Agent OS Dispatcher',
      'Created At': new Date().toISOString()
    });
  }

  /** Sync agent performance metrics */
  async syncAgentMetrics(agentId, metrics) {
    return this.createRecord(TABLES.AGENT_PERFORMANCE, {
      'Agent ID': agentId,
      'Tasks Completed': metrics.tasksCompleted || 0,
      'Success Rate': metrics.successRate || 0,
      'Avg Response Time': metrics.avgResponseTime || 0,
      'Uptime Percent': metrics.uptimePercent || 99.9,
      'Quality Score': metrics.qualityScore || 0,
      'Report Date': new Date().toISOString().split('T')[0]
    });
  }

  /** Create lead from agent-driven prospecting */
  async createLead(leadData) {
    return this.createRecord(TABLES.LEADS, {
      'Contact Name': leadData.name,
      'Phone': leadData.phone,
      'Email': leadData.email,
      'Source': leadData.source || 'AI Agent Prospecting',
      'Sentinel Segment': leadData.segment,
      'Service Zone': leadData.zone,
      'Lead Status': 'New',
      'Assigned Agent': leadData.assignedAgent,
      'Created At': new Date().toISOString()
    });
  }

  /** Create content calendar entry */
  async scheduleContent(contentData) {
    return this.createRecord(TABLES.CONTENT_CALENDAR, {
      'Title': contentData.title,
      'Content Type': contentData.type,
      'Platform': contentData.platform,
      'Scheduled Date': contentData.scheduledDate,
      'Content Body': contentData.body,
      'Status': 'Scheduled',
      'Created By Agent': contentData.agentId
    });
  }

  /** Create investor presentation record */
  async createInvestorPresentation(data) {
    return this.createRecord(TABLES.INVESTOR_PRESENTATIONS, {
      'Title': data.title,
      'Lead Record ID': data.leadRecordId,
      'Presentation Type': data.type,
      'Content': data.content,
      'Status': 'Draft',
      'Created By': data.agentId,
      'Created At': new Date().toISOString()
    });
  }
}

export { TABLES, BASE_ID };
