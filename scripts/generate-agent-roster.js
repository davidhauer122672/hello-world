/**
 * AI Agent Roster Generator
 * Reads all agent source files and generates a professional HTML roster.
 * Run: node scripts/generate-agent-roster.js
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

// Import IO and Email from route files (they export inline)
// We'll handle these separately since they're in route files

const divisions = [
  { code: 'MCCO', name: 'Master Chief Commanding Officer', agents: MCCO_AGENTS, color: '#7c3aed', mission: 'Sovereign-level governance over all marketing and sales operations. Ferrari-Standard execution.' },
  { code: 'EXC', name: 'Executive Division', agents: EXC_AGENTS, color: '#1e40af', mission: 'C-suite strategy, board reporting, enterprise decision-making, governance.' },
  { code: 'SEN', name: 'Sentinel Sales Division', agents: SEN_AGENTS, color: '#dc2626', mission: 'Inbound/outbound sales, lead qualification, territory coverage, revenue pipeline.' },
  { code: 'OPS', name: 'Operations Division', agents: OPS_AGENTS, color: '#059669', mission: 'Property management, maintenance, inspections, concierge, guest services.' },
  { code: 'INT', name: 'Intelligence Division', agents: INT_AGENTS, color: '#7c5cfc', mission: 'Market research, competitive intel, data analysis, predictive modeling.' },
  { code: 'MKT', name: 'Marketing Division', agents: MKT_AGENTS, color: '#ea580c', mission: 'Content creation, social media, email campaigns, brand management, YouTube.' },
  { code: 'FIN', name: 'Finance Division', agents: FIN_AGENTS, color: '#ca8a04', mission: 'Revenue tracking, investor relations, budgeting, forecasting, compliance.' },
  { code: 'VEN', name: 'Vendor Management Division', agents: VEN_AGENTS, color: '#0891b2', mission: 'Vendor compliance, procurement, contract management, service quality.' },
  { code: 'TEC', name: 'Technology Division', agents: TEC_AGENTS, color: '#4f46e5', mission: 'Platform ops, API integrations, monitoring, CI/CD, infrastructure.' },
  { code: 'WEB', name: 'Website Development Division', agents: WEB_AGENTS, color: '#be185d', mission: 'Website architecture, deployment, performance, accessibility, security.' },
  { code: 'COOP', name: 'Cooperations Committee', agents: COOP_AGENTS, color: '#0d9488', mission: 'CEO real-time connections, strategic networking, relationship management.' },
];

const totalFromDivisions = divisions.reduce((s, d) => s + d.agents.length, 0);

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function agentRow(a) {
  const triggers = (a.triggers || []).slice(0, 3).join(', ') || 'On-demand';
  const outputs = (a.outputs || []).slice(0, 3).join(', ') || 'Reports';
  const kpis = (a.kpis || []).slice(0, 2).join(', ') || 'Performance metrics';
  return `<tr>
<td class="id">${escapeHtml(a.id)}</td>
<td class="name">${escapeHtml(a.name)}</td>
<td class="role">${escapeHtml(a.role)}</td>
<td class="desc">${escapeHtml(a.description)}</td>
<td class="meta">${escapeHtml(triggers)}</td>
<td class="meta">${escapeHtml(outputs)}</td>
<td class="tier">${escapeHtml(a.tier || a.severity || 'standard')}</td>
</tr>`;
}

function divisionSection(div, index) {
  const rows = div.agents.map(a => agentRow(a)).join('\n');
  return `
<div class="division" id="div-${div.code}">
<div class="div-header" style="border-left:5px solid ${div.color}">
<div class="div-num">${index + 1}</div>
<div class="div-info">
<h2>${div.code} — ${escapeHtml(div.name)}</h2>
<p class="div-mission">${escapeHtml(div.mission)}</p>
<span class="agent-count">${div.agents.length} Agents</span>
</div>
</div>
<table>
<thead><tr>
<th>ID</th><th>Name</th><th>Title</th><th>Function &amp; Description</th><th>Triggers</th><th>Outputs</th><th>Tier</th>
</tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>`;
}

// Build IO section from known data
const ioSquads = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO'];
const ioNames = {
  ALPHA: ['Sentinel Prime','Vanguard','Overwatch','Pathfinder','Cipher','Echo Base','Throttle','Pulse','Redline','Pipeline'],
  BRAVO: ['Archivist','Census','Gatekeeper','Mirror','Orphan Hunter','Chronicle','Tracer','Funnel','Freshness','Vault'],
  CHARLIE: ['Watchdog','Bouncer','Shield','Rotator','Anomaly','Compliance','Auditor','Signature','Scanner','Permissions'],
  DELTA: ['Pipeline','Campaign','Content Engine','Price Watch','Escalation','Nurture','Property Intel','Deliverability','Bookings','Attribution'],
  ECHO: ['Token Watch','Airtable Quota','CPU Guard','Cache Optimizer','Fleet Utilization','Quality','Prompt Lab','Workflow Timer','Recovery','Cost Optimizer'],
};
const ioRoles = {
  ALPHA: 'Infrastructure Monitoring', BRAVO: 'Data Integrity', CHARLIE: 'Security & Compliance', DELTA: 'Revenue Operations', ECHO: 'Performance & Optimization'
};

function ioSection() {
  let rows = '';
  for (const squad of ioSquads) {
    const letter = squad[0];
    ioNames[squad].forEach((name, i) => {
      const num = String(i+1).padStart(2,'0');
      rows += `<tr>
<td class="id">IO-${letter}${num}</td>
<td class="name">${escapeHtml(name)}</td>
<td class="role">Squad ${squad} — ${ioRoles[squad]}</td>
<td class="desc">Autonomous monitoring officer. ${ioRoles[squad].toLowerCase()} specialist.</td>
<td class="meta">Scan interval</td>
<td class="meta">Findings, alerts</td>
<td class="tier">active</td>
</tr>`;
    });
  }
  return `
<div class="division" id="div-IO">
<div class="div-header" style="border-left:5px solid #f59e0b">
<div class="div-num">12</div>
<div class="div-info">
<h2>IO — Intelligence Officers</h2>
<p class="div-mission">50-agent autonomous monitoring fleet. 5 squads x 10 officers. Real-time infrastructure, data, security, revenue, and performance surveillance.</p>
<span class="agent-count">50 Agents</span>
</div>
</div>
<table>
<thead><tr><th>ID</th><th>Name</th><th>Squad / Role</th><th>Function</th><th>Triggers</th><th>Outputs</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

// Email agents
const emSquads = {INTAKE:['Classifier','Priority','Extractor','Responder','Sentinel Link'],COMPOSE:['Architect','Wordsmith','Personalizer','Subject Line','Compliance Check'],NURTURE:['Sequencer','Follow-Up','Re-Engage','Milestone','Scheduler'],MONITOR:['Deliverability','Bounce Handler','Spam Guard','Analytics','Unsubscribe']};
function emailSection() {
  let rows = '';
  const prefixes = {INTAKE:'I',COMPOSE:'C',NURTURE:'N',MONITOR:'M'};
  for (const [squad, names] of Object.entries(emSquads)) {
    names.forEach((name, i) => {
      rows += `<tr>
<td class="id">EM-${prefixes[squad]}${String(i+1).padStart(2,'0')}</td>
<td class="name">${name}</td>
<td class="role">Squad ${squad}</td>
<td class="desc">Email operations specialist — ${squad.toLowerCase()} squad.</td>
<td class="meta">Email events</td>
<td class="meta">Email outputs</td>
<td class="tier">active</td>
</tr>`;
    });
  }
  return `
<div class="division" id="div-EM">
<div class="div-header" style="border-left:5px solid #10b981">
<div class="div-num">13</div>
<div class="div-info">
<h2>EM — Email AI Agents</h2>
<p class="div-mission">20-agent email operations fleet. 4 squads: Intake, Compose, Nurture, Monitor. Full email lifecycle automation.</p>
<span class="agent-count">20 Agents</span>
</div>
</div>
<table>
<thead><tr><th>ID</th><th>Name</th><th>Squad</th><th>Function</th><th>Triggers</th><th>Outputs</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

// Trader
function traderSection() {
  const a = AI_TRADER_AGENT;
  return `
<div class="division" id="div-TRADER">
<div class="div-header" style="border-left:5px solid #eab308">
<div class="div-num">14</div>
<div class="div-info">
<h2>TRADER — AI Trading Intelligence</h2>
<p class="div-mission">Sovereign-level trading agent. Direct CEO report. Capital calls, market intelligence, portfolio management.</p>
<span class="agent-count">1 Agent</span>
</div>
</div>
<table>
<thead><tr><th>ID</th><th>Name</th><th>Title</th><th>Function</th><th>Capabilities</th><th>KPIs</th><th>Tier</th></tr></thead>
<tbody><tr>
<td class="id">${a.id}</td>
<td class="name">${a.name}</td>
<td class="role">${a.role}</td>
<td class="desc">${escapeHtml(a.description)}</td>
<td class="meta">${a.capabilities.slice(0,3).join(', ')}</td>
<td class="meta">${a.kpis.join(', ')}</td>
<td class="tier">${a.tier}</td>
</tr></tbody>
</table>
</div>`;
}

const totalAgents = totalFromDivisions + 50 + 20 + 1; // divisions + IO + Email + Trader

const tocLinks = divisions.map((d,i) => `<a href="#div-${d.code}"><span class="toc-num">${i+1}</span>${d.code} — ${d.name} <span class="toc-count">${d.agents.length}</span></a>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Coastal Key Enterprise — AI Agent Roster</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#fff;line-height:1.5}
@media print{body{font-size:9pt}table{font-size:8pt}.division{page-break-inside:avoid}.cover,.toc{page-break-after:always}}
.cover{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);color:#fff;text-align:center;padding:60px 40px}
.cover h1{font-size:42px;font-weight:800;letter-spacing:-1px;margin-bottom:8px}
.cover .subtitle{font-size:20px;color:#94a3b8;margin-bottom:40px}
.cover .stat-row{display:flex;gap:40px;margin:30px 0}
.cover .stat{text-align:center}
.cover .stat-num{font-size:48px;font-weight:800;color:#7c3aed}
.cover .stat-label{font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
.cover .gov{margin-top:40px;padding:20px 40px;border:1px solid #334155;border-radius:8px;max-width:700px}
.cover .gov p{font-size:14px;color:#cbd5e1;line-height:1.7}
.toc{padding:40px;max-width:900px;margin:0 auto}
.toc h2{font-size:28px;margin-bottom:20px;border-bottom:3px solid #7c3aed;padding-bottom:10px}
.toc a{display:flex;align-items:center;padding:10px 12px;text-decoration:none;color:#1e293b;border-bottom:1px solid #e2e8f0;transition:background .15s}
.toc a:hover{background:#f1f5f9}
.toc-num{width:28px;height:28px;background:#7c3aed;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-right:12px;flex-shrink:0}
.toc-count{margin-left:auto;background:#f1f5f9;padding:2px 10px;border-radius:12px;font-size:13px;color:#64748b;font-weight:600}
.division{padding:30px 40px;border-bottom:1px solid #e2e8f0}
.div-header{display:flex;align-items:center;gap:16px;padding:16px 20px;background:#f8fafc;border-radius:8px;margin-bottom:20px}
.div-num{width:36px;height:36px;background:#7c3aed;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.div-info h2{font-size:20px;font-weight:700;margin-bottom:2px}
.div-mission{font-size:13px;color:#64748b;margin-bottom:4px}
.agent-count{font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px}
thead{background:#1e293b;color:#fff}
th{padding:8px 10px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:7px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}
tr:nth-child(even){background:#f8fafc}
tr:hover{background:#eff6ff}
.id{font-family:'Courier New',monospace;font-weight:700;font-size:11px;color:#7c3aed;white-space:nowrap;width:80px}
.name{font-weight:700;white-space:nowrap;width:130px}
.role{font-size:11px;color:#475569;width:160px}
.desc{font-size:11px;color:#334155;max-width:320px}
.meta{font-size:10px;color:#64748b;max-width:140px}
.tier{font-size:10px;text-transform:uppercase;font-weight:700;color:#7c3aed;white-space:nowrap}
.footer{text-align:center;padding:40px;color:#64748b;font-size:12px;border-top:2px solid #7c3aed}
.summary{padding:30px 40px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
.summary h2{font-size:22px;margin-bottom:16px}
.summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.summary-card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center}
.summary-card .num{font-size:28px;font-weight:800;color:#7c3aed}
.summary-card .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
</style>
</head>
<body>

<div class="cover">
<h1>COASTAL KEY ENTERPRISE</h1>
<div class="subtitle">Autonomous AI Agent Roster</div>
<div class="stat-row">
<div class="stat"><div class="stat-num">${totalAgents}</div><div class="stat-label">Total Agents</div></div>
<div class="stat"><div class="stat-num">14</div><div class="stat-label">Divisions</div></div>
<div class="stat"><div class="stat-num">5</div><div class="stat-label">Intel Squads</div></div>
<div class="stat"><div class="stat-num">4</div><div class="stat-label">Email Squads</div></div>
</div>
<div class="gov">
<p><strong>Mission:</strong> AI-powered, predictive home watch and property management that eliminates risk and creates total peace of mind for Treasure Coast property owners at a fraction of traditional cost with zero preventable incidents.</p>
</div>
<p style="margin-top:30px;color:#64748b;font-size:13px">Classification: Sovereign Governance | Generated: ${new Date().toISOString().split('T')[0]} | Standard: Ferrari Execution</p>
</div>

<div class="summary">
<h2>Fleet Composition</h2>
<div class="summary-grid">
${divisions.map(d => `<div class="summary-card"><div class="num">${d.agents.length}</div><div class="label">${d.code} — ${d.name.split(' ').slice(0,2).join(' ')}</div></div>`).join('\n')}
<div class="summary-card"><div class="num">50</div><div class="label">IO — Intelligence Officers</div></div>
<div class="summary-card"><div class="num">20</div><div class="label">EM — Email Agents</div></div>
<div class="summary-card"><div class="num">1</div><div class="label">TRADER — AI Trading</div></div>
</div>
</div>

<div class="toc">
<h2>Table of Contents</h2>
${tocLinks}
<a href="#div-IO"><span class="toc-num">12</span>IO — Intelligence Officers <span class="toc-count">50</span></a>
<a href="#div-EM"><span class="toc-num">13</span>EM — Email AI Agents <span class="toc-count">20</span></a>
<a href="#div-TRADER"><span class="toc-num">14</span>TRADER — AI Trading Intelligence <span class="toc-count">1</span></a>
</div>

${divisions.map((d, i) => divisionSection(d, i)).join('\n')}
${ioSection()}
${emailSection()}
${traderSection()}

<div class="footer">
<p><strong>Coastal Key Enterprise</strong> — Sovereign Governance Standard</p>
<p>${totalAgents} Autonomous AI Agents | 14 Divisions | Zero Preventable Incidents</p>
<p>Generated ${new Date().toISOString()} | coastalkey-pm.com</p>
</div>

</body>
</html>`;

fs.writeFileSync('ck-command-center/agent-roster.html', html);
console.log('Agent Roster generated: ' + totalAgents + ' agents across 14 divisions');
console.log('Output: ck-command-center/agent-roster.html');
