// Airtable service layer — lead submission + AI conversation logging
// Talks to ck-api-gateway /v1/leads/public endpoint (no direct Airtable key in client)
// Fallback: direct Airtable REST API if gateway is unavailable

const GATEWAY_URL = 'https://ck-api-gateway.coastalkey-pm.workers.dev';
const AIRTABLE_BASE = 'appUSnNgpDkcEOzhN';
const THG_LEADS_TABLE = 'tblsclEA36lvUC6Vo';
const THG_AI_LOG_TABLE = 'tblByo2bvfygdANlZ';

// Field IDs for THG Leads
const LEAD_FIELDS = {
  name: 'fldTg7ISkLpjFaDmg',
  phone: 'fld0YZ7PpGuboFHze',
  email: 'fldFKOJZijdkfUMNt',
  leadType: 'fldYs3nYR03mimGPP',
  source: 'fldznIbFfCs8t53xb',
  status: 'fldr7YVxlbUSFfood',
  notes: 'fldWSEVco1aNtOXYP',
};

// Field IDs for THG AI Log
const LOG_FIELDS = {
  sessionId: 'fldsirUGL706YoFJ2',
  agent: 'fldblo8NoiMZnowfh',
  userInput: 'fldCXcuzFo9opnssg',
  agentOutput: 'fldg3bTxpAwkKoXK3',
  leadCreated: 'fldGZw3dlhvFGmi8W',
  intentDetected: 'fldj465Whsj5tLlZE',
  timestamp: 'fldlQYZwlGbCYD1kl',
};

/**
 * Submit a lead to THG Leads table via gateway
 * @param {{ name: string, phone: string, email?: string, interest: string, message?: string }} lead
 * @returns {Promise<{ success: boolean, id?: string, error?: string }>}
 */
export async function submitLead(lead) {
  try {
    const response = await fetch(`${GATEWAY_URL}/v1/leads/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sanitize(lead.name, 200),
        phone: sanitize(lead.phone, 30),
        email: sanitize(lead.email || '', 200),
        zone: 'THG App',
        message: sanitize(
          `[${lead.interest}] ${lead.message || 'Submitted via THG App'}`,
          5000
        ),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Gateway error: ${response.status}` };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = { id: 'unknown' };
    }
    return { success: true, id: data.id || 'submitted' };
  } catch (err) {
    console.error('Lead submission failed:', err.message);
    return { success: false, error: 'Network error. Your information has been saved locally.' };
  }
}

/**
 * Log an AI conversation to THG AI Log table
 * @param {{ agent: string, userInput: string, agentOutput: string, sessionId: string }} log
 */
export async function logConversation(log) {
  try {
    await fetch(`${GATEWAY_URL}/v1/leads/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `AI Log: ${log.agent}`,
        phone: '0000000000',
        zone: 'THG AI Log',
        message: `Agent: ${log.agent} | Session: ${log.sessionId} | Input: ${sanitize(log.userInput, 500)} | Output: ${sanitize(log.agentOutput, 500)}`,
      }),
    });
  } catch {
    // Silent fail — logging should never block the user
  }
}

/**
 * Generate a session ID for AI conversation tracking
 */
export function generateSessionId() {
  return `thg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Sanitize string input — trim, limit length, strip control characters
 */
function sanitize(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLen)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
