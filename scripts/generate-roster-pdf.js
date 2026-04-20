/**
 * Generate AI Agent Roster as PDF
 * Run: node scripts/generate-roster-pdf.js
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';

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

const divisions = [
  { code: 'MCCO', name: 'Master Chief Commanding Officer', agents: MCCO_AGENTS, color: [124,58,237] },
  { code: 'EXC', name: 'Executive Division', agents: EXC_AGENTS, color: [30,64,175] },
  { code: 'SEN', name: 'Sentinel Sales Division', agents: SEN_AGENTS, color: [220,38,38] },
  { code: 'OPS', name: 'Operations Division', agents: OPS_AGENTS, color: [5,150,105] },
  { code: 'INT', name: 'Intelligence Division', agents: INT_AGENTS, color: [124,92,252] },
  { code: 'MKT', name: 'Marketing Division', agents: MKT_AGENTS, color: [234,88,12] },
  { code: 'FIN', name: 'Finance Division', agents: FIN_AGENTS, color: [202,138,4] },
  { code: 'VEN', name: 'Vendor Management Division', agents: VEN_AGENTS, color: [8,145,178] },
  { code: 'TEC', name: 'Technology Division', agents: TEC_AGENTS, color: [79,70,229] },
  { code: 'WEB', name: 'Website Development Division', agents: WEB_AGENTS, color: [190,24,93] },
  { code: 'COOP', name: 'Cooperations Committee', agents: COOP_AGENTS, color: [13,148,136] },
];

// IO squads
const ioSquads = [
  { squad: 'ALPHA', name: 'Infrastructure Monitoring', agents: ['Sentinel Prime','Vanguard','Overwatch','Pathfinder','Cipher','Echo Base','Throttle','Pulse','Redline','Pipeline'] },
  { squad: 'BRAVO', name: 'Data Integrity', agents: ['Archivist','Census','Gatekeeper','Mirror','Orphan Hunter','Chronicle','Tracer','Funnel','Freshness','Vault'] },
  { squad: 'CHARLIE', name: 'Security & Compliance', agents: ['Watchdog','Bouncer','Shield','Rotator','Anomaly','Compliance','Auditor','Signature','Scanner','Permissions'] },
  { squad: 'DELTA', name: 'Revenue Operations', agents: ['Pipeline','Campaign','Content Engine','Price Watch','Escalation','Nurture','Property Intel','Deliverability','Bookings','Attribution'] },
  { squad: 'ECHO', name: 'Performance & Optimization', agents: ['Token Watch','Airtable Quota','CPU Guard','Cache Optimizer','Fleet Utilization','Quality','Prompt Lab','Workflow Timer','Recovery','Cost Optimizer'] },
];

const emSquads = [
  { squad: 'INTAKE', prefix: 'I', agents: ['Classifier','Priority','Extractor','Responder','Sentinel Link'] },
  { squad: 'COMPOSE', prefix: 'C', agents: ['Architect','Wordsmith','Personalizer','Subject Line','Compliance Check'] },
  { squad: 'NURTURE', prefix: 'N', agents: ['Sequencer','Follow-Up','Re-Engage','Milestone','Scheduler'] },
  { squad: 'MONITOR', prefix: 'M', agents: ['Deliverability','Bounce Handler','Spam Guard','Analytics','Unsubscribe'] },
];

const divAgentCount = divisions.reduce((s, d) => s + d.agents.length, 0);
const totalAgents = divAgentCount + 50 + 20 + 1;

const doc = new PDFDocument({ size: 'letter', margins: { top: 50, bottom: 50, left: 50, right: 50 }, bufferPages: true });
const out = fs.createWriteStream('ck-command-center/coastal-key-agent-roster.pdf');
doc.pipe(out);

const W = 512; // usable width
const purple = [124, 58, 237];
const dark = [15, 23, 42];
const gray = [100, 116, 139];
const lightBg = [248, 250, 252];

// ── COVER PAGE ─────────────────────────────────────────────────────────────
doc.rect(0, 0, 612, 792).fill('#0f172a');

doc.fontSize(11).fillColor('#94a3b8').text('COASTAL KEY ENTERPRISE', 50, 200, { align: 'center', characterSpacing: 6 });
doc.fontSize(36).fillColor('#ffffff').text('AI AGENT ROSTER', 50, 240, { align: 'center' });
doc.fontSize(14).fillColor('#7c3aed').text('Sovereign Governance Standard', 50, 290, { align: 'center' });

doc.fontSize(42).fillColor('#7c3aed').text(String(totalAgents), 140, 360, { align: 'center', width: 100 });
doc.fontSize(9).fillColor('#94a3b8').text('TOTAL AGENTS', 140, 405, { align: 'center', width: 100 });

doc.fontSize(42).fillColor('#7c3aed').text('14', 260, 360, { align: 'center', width: 100 });
doc.fontSize(9).fillColor('#94a3b8').text('DIVISIONS', 260, 405, { align: 'center', width: 100 });

doc.fontSize(42).fillColor('#7c3aed').text('5', 380, 360, { align: 'center', width: 100 });
doc.fontSize(9).fillColor('#94a3b8').text('INTEL SQUADS', 380, 405, { align: 'center', width: 100 });

doc.roundedRect(100, 470, 412, 80, 6).stroke('#334155');
doc.fontSize(8).fillColor('#94a3b8').text('MISSION', 120, 480);
doc.fontSize(9).fillColor('#cbd5e1').text(
  'AI-powered, predictive home watch and property management that eliminates risk and creates total peace of mind for Treasure Coast property owners at a fraction of traditional cost with zero preventable incidents.',
  120, 495, { width: 372, lineGap: 3 }
);

doc.fontSize(9).fillColor('#475569').text('Classification: CEO Executive Asset | Generated: ' + new Date().toISOString().split('T')[0], 50, 600, { align: 'center' });
doc.fontSize(9).fillColor('#475569').text('coastalkey-pm.com', 50, 618, { align: 'center' });

// ── TABLE OF CONTENTS ──────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, 612, 792).fill('#ffffff');

doc.fontSize(22).fillColor(dark).text('Table of Contents', 50, 50);
doc.moveTo(50, 78).lineTo(200, 78).strokeColor(purple).lineWidth(2).stroke();

let tocY = 100;
const allDivs = [
  ...divisions.map((d, i) => ({ num: i + 1, code: d.code, name: d.name, count: d.agents.length })),
  { num: 12, code: 'IO', name: 'Intelligence Officers (5 Squads)', count: 50 },
  { num: 13, code: 'EM', name: 'Email AI Agents (4 Squads)', count: 20 },
  { num: 14, code: 'TRADER', name: 'AI Trading Intelligence', count: 1 },
];

for (const d of allDivs) {
  doc.circle(66, tocY + 7, 10).fill(purple);
  doc.fontSize(8).fillColor('#ffffff').text(String(d.num), 59, tocY + 3, { width: 14, align: 'center' });
  doc.fontSize(11).fillColor(dark).text(d.code + ' — ' + d.name, 85, tocY);
  doc.fontSize(10).fillColor(gray).text(d.count + ' agents', 440, tocY, { width: 80, align: 'right' });
  tocY += 24;
}

doc.fontSize(11).fillColor(purple).text('Total: ' + totalAgents + ' Autonomous AI Agents', 85, tocY + 20);

// ── HELPER: Draw agent table ───────────────────────────────────────────────
function drawDivisionHeader(divCode, divName, agentCount, color, pageNum) {
  const y = doc.y;
  doc.rect(50, y, W, 36).fill(lightBg);
  doc.rect(50, y, 4, 36).fill(color);
  doc.circle(72, y + 18, 12).fill(purple);
  doc.fontSize(8).fillColor('#ffffff').text(String(pageNum), 65, y + 14, { width: 14, align: 'center' });
  doc.fontSize(14).fillColor(dark).text(divCode + ' — ' + divName, 92, y + 5);
  doc.fontSize(9).fillColor(purple).text(agentCount + ' Agents', 92, y + 22);
  doc.y = y + 44;
}

function drawTableHeader() {
  const y = doc.y;
  doc.rect(50, y, W, 18).fill(dark);
  doc.fontSize(7).fillColor('#ffffff');
  doc.text('ID', 54, y + 5, { width: 55 });
  doc.text('NAME', 109, y + 5, { width: 80 });
  doc.text('TITLE / ROLE', 189, y + 5, { width: 120 });
  doc.text('FUNCTION', 309, y + 5, { width: 203 });
  doc.y = y + 20;
}

function drawAgentRow(agent, idx) {
  const desc = (agent.description || '').substring(0, 120);
  const role = (agent.role || '').substring(0, 40);
  const rowH = Math.max(24, Math.ceil(desc.length / 38) * 10 + 8);

  if (doc.y + rowH > 740) {
    doc.addPage();
    drawTableHeader();
  }

  const y = doc.y;
  if (idx % 2 === 0) doc.rect(50, y, W, rowH).fill(lightBg);

  doc.fontSize(7).fillColor(purple).text(agent.id, 54, y + 4, { width: 55 });
  doc.fontSize(7).fillColor(dark).text(agent.name, 109, y + 4, { width: 78 });
  doc.fontSize(6.5).fillColor(gray).text(role, 189, y + 4, { width: 118 });
  doc.fontSize(6).fillColor([51, 65, 85]).text(desc, 309, y + 4, { width: 200, lineGap: 1.5 });

  doc.y = y + rowH;
}

// ── RENDER ALL DIVISIONS ───────────────────────────────────────────────────
for (let i = 0; i < divisions.length; i++) {
  const div = divisions[i];
  doc.addPage();
  drawDivisionHeader(div.code, div.name, div.agents.length, div.color, i + 1);
  drawTableHeader();
  div.agents.forEach((a, idx) => drawAgentRow(a, idx));
}

// ── INTELLIGENCE OFFICERS ──────────────────────────────────────────────────
doc.addPage();
drawDivisionHeader('IO', 'Intelligence Officers — 5 Squads', 50, [245, 158, 11], 12);
for (const sq of ioSquads) {
  if (doc.y > 680) doc.addPage();
  doc.fontSize(9).fillColor(purple).text('Squad ' + sq.squad + ' — ' + sq.name, 54, doc.y + 4);
  doc.y += 16;
  drawTableHeader();
  sq.agents.forEach((name, idx) => {
    const letter = sq.squad[0];
    const num = String(idx + 1).padStart(2, '0');
    drawAgentRow({
      id: 'IO-' + letter + num,
      name: name,
      role: sq.name + ' Officer',
      description: 'Autonomous monitoring officer. ' + sq.name + ' specialist. Scans infrastructure, data, security, revenue, or performance metrics and generates findings with auto-remediation capability.',
    }, idx);
  });
}

// ── EMAIL AGENTS ───────────────────────────────────────────────────────────
doc.addPage();
drawDivisionHeader('EM', 'Email AI Agents — 4 Squads', 20, [16, 185, 129], 13);
for (const sq of emSquads) {
  if (doc.y > 680) doc.addPage();
  doc.fontSize(9).fillColor(purple).text('Squad ' + sq.squad, 54, doc.y + 4);
  doc.y += 16;
  drawTableHeader();
  sq.agents.forEach((name, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    drawAgentRow({
      id: 'EM-' + sq.prefix + num,
      name: name,
      role: sq.squad + ' Squad — Email Ops',
      description: 'Email operations specialist in the ' + sq.squad + ' squad. Handles ' + sq.squad.toLowerCase() + ' email workflows including classification, composition, nurture sequences, and deliverability monitoring.',
    }, idx);
  });
}

// ── AI TRADER ──────────────────────────────────────────────────────────────
doc.addPage();
drawDivisionHeader('TRADER', 'AI Trading Intelligence', 1, [234, 179, 8], 14);
drawTableHeader();
drawAgentRow(AI_TRADER_AGENT, 0);

// ── FLEET SUMMARY PAGE ─────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, 612, 792).fill('#0f172a');

doc.fontSize(22).fillColor('#ffffff').text('Fleet Summary', 50, 50, { align: 'center' });
doc.moveTo(250, 78).lineTo(362, 78).strokeColor(purple).lineWidth(2).stroke();

let sumY = 110;
for (const d of allDivs) {
  const barW = (d.count / totalAgents) * 400;
  doc.rect(130, sumY, barW, 14).fill(purple);
  doc.fontSize(8).fillColor('#94a3b8').text(d.code, 60, sumY + 2, { width: 60, align: 'right' });
  doc.fontSize(8).fillColor('#ffffff').text(String(d.count), 135, sumY + 2);
  sumY += 22;
}

doc.fontSize(14).fillColor('#7c3aed').text(totalAgents + ' Agents | 14 Divisions | Zero Preventable Incidents', 50, sumY + 30, { align: 'center' });
doc.fontSize(10).fillColor('#64748b').text('Coastal Key Enterprise — Sovereign Governance Standard', 50, sumY + 55, { align: 'center' });
doc.fontSize(9).fillColor('#475569').text('Generated ' + new Date().toISOString().split('T')[0] + ' | coastalkey-pm.com', 50, sumY + 75, { align: 'center' });

// ── FINALIZE ───────────────────────────────────────────────────────────────
doc.end();

out.on('finish', () => {
  const stats = fs.statSync('ck-command-center/coastal-key-agent-roster.pdf');
  const pages = doc.bufferedPageRange().count;
  console.log('PDF generated: ck-command-center/coastal-key-agent-roster.pdf');
  console.log('Pages: ' + pages + ' | Size: ' + (stats.size / 1024).toFixed(0) + ' KB');
  console.log('Agents: ' + totalAgents + ' across 14 divisions');
});
