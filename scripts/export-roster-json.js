/**
 * Export AI Agent Roster as JSON
 * Run: node scripts/export-roster-json.js
 */

import { MCCO_AGENTS } from '../ck-api-gateway/src/agents/agents-mcco.js';
import { EXC_AGENTS } from '../ck-api-gateway/src/agents/agents-exc.js';
import { SEN_AGENTS } from '../ck-api-gateway/src/agents/agents-sen.js';
import { OPS_AGENTS } from '../ck-api-gateway/src/agents/agents-ops.js';
import { INT_AGENTS } from '../ck-api-gateway/src/agents/agents-int.js';
import { MKT_AGENTS } from '../ck-api-gateway/src/agents/agents-mkt.js';
import { FIN_AGENTS } from '../ck-api-gateway/src/agents/agents-fin.js';
import { VEN_AGENTS } from '../ck-api-gateway/src/agents/agents-ven.js';
import { TEC_AGENTS } from '../ck-api-gateway/src/agents/agents-tec.js';
import { WEB_AGENTS } from '../ck-api-gateway/src/agents/agents-web.js';
import { COOP_AGENTS } from '../ck-api-gateway/src/agents/agents-coop.js';
import { AI_TRADER_AGENT } from '../ck-api-gateway/src/engines/ai-trader.js';
import fs from 'fs';

const ioSquads = {
  ALPHA: { name: 'Infrastructure Monitoring', agents: ['Sentinel Prime','Vanguard','Overwatch','Pathfinder','Cipher','Echo Base','Throttle','Pulse','Redline','Pipeline'] },
  BRAVO: { name: 'Data Integrity', agents: ['Archivist','Census','Gatekeeper','Mirror','Orphan Hunter','Chronicle','Tracer','Funnel','Freshness','Vault'] },
  CHARLIE: { name: 'Security & Compliance', agents: ['Watchdog','Bouncer','Shield','Rotator','Anomaly','Compliance','Auditor','Signature','Scanner','Permissions'] },
  DELTA: { name: 'Revenue Operations', agents: ['Pipeline','Campaign','Content Engine','Price Watch','Escalation','Nurture','Property Intel','Deliverability','Bookings','Attribution'] },
  ECHO: { name: 'Performance & Optimization', agents: ['Token Watch','Airtable Quota','CPU Guard','Cache Optimizer','Fleet Utilization','Quality','Prompt Lab','Workflow Timer','Recovery','Cost Optimizer'] },
};

const emSquads = {
  INTAKE: { prefix: 'I', agents: ['Classifier','Priority','Extractor','Responder','Sentinel Link'] },
  COMPOSE: { prefix: 'C', agents: ['Architect','Wordsmith','Personalizer','Subject Line','Compliance Check'] },
  NURTURE: { prefix: 'N', agents: ['Sequencer','Follow-Up','Re-Engage','Milestone','Scheduler'] },
  MONITOR: { prefix: 'M', agents: ['Deliverability','Bounce Handler','Spam Guard','Analytics','Unsubscribe'] },
};

function buildIO() {
  const agents = [];
  for (const [squad, data] of Object.entries(ioSquads)) {
    data.agents.forEach((name, i) => {
      agents.push({ id: 'IO-' + squad[0] + String(i+1).padStart(2,'0'), name, role: data.name + ' Officer', division: 'IO', squad, tier: 'active', status: 'active', description: 'Autonomous monitoring officer. ' + data.name + ' specialist.' });
    });
  }
  return agents;
}

function buildEmail() {
  const agents = [];
  for (const [squad, data] of Object.entries(emSquads)) {
    data.agents.forEach((name, i) => {
      agents.push({ id: 'EM-' + data.prefix + String(i+1).padStart(2,'0'), name, role: squad + ' Squad', division: 'EM', squad, tier: 'standard', status: 'active', description: 'Email operations specialist in ' + squad + ' squad.' });
    });
  }
  return agents;
}

const roster = {
  metadata: {
    title: 'Coastal Key Enterprise — AI Agent Roster',
    classification: 'Sovereign Governance',
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalAgents: 0,
    divisions: 14,
  },
  divisions: [
    { code: 'MCCO', name: 'Master Chief Commanding Officer', count: MCCO_AGENTS.length, agents: MCCO_AGENTS },
    { code: 'EXC', name: 'Executive Division', count: EXC_AGENTS.length, agents: EXC_AGENTS },
    { code: 'SEN', name: 'Sentinel Sales Division', count: SEN_AGENTS.length, agents: SEN_AGENTS },
    { code: 'OPS', name: 'Operations Division', count: OPS_AGENTS.length, agents: OPS_AGENTS },
    { code: 'INT', name: 'Intelligence Division', count: INT_AGENTS.length, agents: INT_AGENTS },
    { code: 'MKT', name: 'Marketing Division', count: MKT_AGENTS.length, agents: MKT_AGENTS },
    { code: 'FIN', name: 'Finance Division', count: FIN_AGENTS.length, agents: FIN_AGENTS },
    { code: 'VEN', name: 'Vendor Management Division', count: VEN_AGENTS.length, agents: VEN_AGENTS },
    { code: 'TEC', name: 'Technology Division', count: TEC_AGENTS.length, agents: TEC_AGENTS },
    { code: 'WEB', name: 'Website Development Division', count: WEB_AGENTS.length, agents: WEB_AGENTS },
    { code: 'COOP', name: 'Cooperations Committee', count: COOP_AGENTS.length, agents: COOP_AGENTS },
    { code: 'IO', name: 'Intelligence Officers', count: 50, agents: buildIO() },
    { code: 'EM', name: 'Email AI Agents', count: 20, agents: buildEmail() },
    { code: 'TRADER', name: 'AI Trading Intelligence', count: 1, agents: [AI_TRADER_AGENT] },
  ],
};

roster.metadata.totalAgents = roster.divisions.reduce((s, d) => s + d.count, 0);

fs.writeFileSync('ck-command-center/coastal-key-agent-roster.json', JSON.stringify(roster, null, 2));
console.log('JSON exported: ' + roster.metadata.totalAgents + ' agents');
console.log('Output: ck-command-center/coastal-key-agent-roster.json');
