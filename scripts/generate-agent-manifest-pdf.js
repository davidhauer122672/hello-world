#!/usr/bin/env node
/**
 * Coastal Key Enterprise — Agent Manifest PDF Generator
 *
 * Generates a Ferrari-standard PDF document listing every agent in the
 * 383-unit autonomous fleet with ID, name, division, title, description,
 * and creation date.
 *
 * Usage: node scripts/generate-agent-manifest-pdf.js
 * Output: coastal-key-agent-manifest.pdf
 */

import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const agentsDir = join(__dirname, '..', 'ck-api-gateway', 'src', 'agents');
const routesDir = join(__dirname, '..', 'ck-api-gateway', 'src', 'routes');
const enginesDir = join(__dirname, '..', 'ck-api-gateway', 'src', 'engines');

// Import all agent definitions
const { MCCO_AGENTS } = await import(join(agentsDir, 'agents-mcco.js'));
const { EXC_AGENTS } = await import(join(agentsDir, 'agents-exc.js'));
const { SEN_AGENTS } = await import(join(agentsDir, 'agents-sen.js'));
const { OPS_AGENTS } = await import(join(agentsDir, 'agents-ops.js'));
const { INT_AGENTS } = await import(join(agentsDir, 'agents-int.js'));
const { MKT_AGENTS } = await import(join(agentsDir, 'agents-mkt.js'));
const { FIN_AGENTS } = await import(join(agentsDir, 'agents-fin.js'));
const { VEN_AGENTS } = await import(join(agentsDir, 'agents-ven.js'));
const { TEC_AGENTS } = await import(join(agentsDir, 'agents-tec.js'));
const { WEB_AGENTS } = await import(join(agentsDir, 'agents-web.js'));
const { AI_TRADER_AGENT } = await import(join(enginesDir, 'ai-trader.js'));

// Import IO and Email agents from routes (they export the arrays inline)
const ioModule = await import(join(routesDir, 'intelligence-officers.js'));
const emailModule = await import(join(routesDir, 'email-agents.js'));

// Extract IO agents — they're defined as INTELLIGENCE_OFFICERS const inside the module
// We'll read them from the file directly since they may not be exported
import { readFileSync } from 'fs';

function extractIOAgents() {
  const src = readFileSync(join(routesDir, 'intelligence-officers.js'), 'utf-8');
  const agents = [];
  // Parse each object in the INTELLIGENCE_OFFICERS array
  const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*squad:\s*'([^']+)',\s*role:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(src)) !== null) {
    agents.push({
      id: match[1],
      name: match[2],
      division: `IO-${match[3]}`,
      role: match[4],
      description: match[5],
      status: 'active',
    });
  }
  return agents;
}

function extractEmailAgents() {
  const src = readFileSync(join(routesDir, 'email-agents.js'), 'utf-8');
  const agents = [];
  const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*squad:\s*'([^']+)',\s*role:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(src)) !== null) {
    agents.push({
      id: match[1],
      name: match[2],
      division: `EMAIL-${match[3]}`,
      role: match[4],
      description: match[5],
      status: 'active',
    });
  }
  return agents;
}

const ioAgents = extractIOAgents();
const emailAgents = extractEmailAgents();

// ── Division metadata ─────────────────────────────────────────────────────────

const divisionMeta = {
  MCCO: { name: 'MCCO — Sovereign Command', color: [220, 38, 38], created: '2026-04-01' },
  EXC: { name: 'Executive Division (EXC)', color: [99, 102, 241], created: '2026-03-20' },
  SEN: { name: 'Sentinel Sales Division (SEN)', color: [239, 68, 68], created: '2026-03-20' },
  OPS: { name: 'Operations Division (OPS)', color: [245, 158, 11], created: '2026-03-20' },
  INT: { name: 'Intelligence Division (INT)', color: [16, 185, 129], created: '2026-03-20' },
  MKT: { name: 'Marketing Division (MKT)', color: [139, 92, 246], created: '2026-03-20' },
  FIN: { name: 'Finance Division (FIN)', color: [6, 182, 212], created: '2026-03-20' },
  VEN: { name: 'Vendor Management Division (VEN)', color: [249, 115, 22], created: '2026-03-20' },
  TEC: { name: 'Technology Division (TEC)', color: [100, 116, 139], created: '2026-03-20' },
  WEB: { name: 'Website Development Division (WEB)', color: [14, 165, 233], created: '2026-03-20' },
  IO: { name: 'Intelligence Officer Fleet', color: [34, 197, 94], created: '2026-03-28' },
  EMAIL: { name: 'Email AI Agents', color: [168, 85, 247], created: '2026-03-31' },
  TRADER: { name: 'AI Trader Agent', color: [234, 179, 8], created: '2026-04-04' },
};

// Combine all agents into ordered groups
const allGroups = [
  { division: 'MCCO', agents: MCCO_AGENTS },
  { division: 'EXC', agents: EXC_AGENTS },
  { division: 'SEN', agents: SEN_AGENTS },
  { division: 'OPS', agents: OPS_AGENTS },
  { division: 'INT', agents: INT_AGENTS },
  { division: 'MKT', agents: MKT_AGENTS },
  { division: 'FIN', agents: FIN_AGENTS },
  { division: 'VEN', agents: VEN_AGENTS },
  { division: 'TEC', agents: TEC_AGENTS },
  { division: 'WEB', agents: WEB_AGENTS },
  { division: 'IO', agents: ioAgents },
  { division: 'EMAIL', agents: emailAgents },
  { division: 'TRADER', agents: [AI_TRADER_AGENT] },
];

const totalAgents = allGroups.reduce((sum, g) => sum + g.agents.length, 0);

// ── PDF Generation ────────────────────────────────────────────────────────────

const outputPath = join(__dirname, '..', 'coastal-key-agent-manifest.pdf');
const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: 'Coastal Key Enterprise — Agent Manifest',
    Author: 'Coastal Key AI CEO',
    Subject: `Complete registry of ${totalAgents} autonomous units`,
    Creator: 'TEC-018 Documentation Bot',
  },
});

const stream = createWriteStream(outputPath);
doc.pipe(stream);

// ── Helper functions ──────────────────────────────────────────────────────────

function drawHeader() {
  // Navy bar
  doc.rect(0, 0, doc.page.width, 100).fill('#1a2744');

  // Title
  doc.fontSize(28).fillColor('#ffffff')
    .text('COASTAL KEY ENTERPRISE', 50, 25, { align: 'left' });
  doc.fontSize(14).fillColor('#8cb4e0')
    .text('Agent Manifest — Autonomous Fleet Registry', 50, 60, { align: 'left' });

  // Right side info
  doc.fontSize(9).fillColor('#a0b4cc')
    .text(`${totalAgents} Units | ${allGroups.length} Divisions | v2.0.0`, 400, 30, { align: 'right', width: 160 })
    .text(`Generated: 2026-04-05`, 400, 45, { align: 'right', width: 160 })
    .text(`Authority: Coastal Key AI CEO`, 400, 60, { align: 'right', width: 160 });

  doc.y = 115;
}

function drawDivisionHeader(divKey, agentCount) {
  const meta = divisionMeta[divKey] || { name: divKey, color: [100, 100, 100], created: '2026-03-20' };
  const [r, g, b] = meta.color;

  // Check if we need a new page (need at least 120px for header + first agent)
  if (doc.y > 620) {
    doc.addPage();
    drawPageFooter();
  }

  // Division bar
  doc.rect(50, doc.y, 512, 28).fill(`rgb(${r}, ${g}, ${b})`);
  doc.fontSize(13).fillColor('#ffffff')
    .text(meta.name.toUpperCase(), 60, doc.y + 7, { width: 350 });
  doc.fontSize(10).fillColor('#ffffff')
    .text(`${agentCount} agents | Created: ${meta.created}`, 350, doc.y + 9, { align: 'right', width: 200 });

  doc.y += 35;
}

function drawAgentRow(agent, divKey) {
  const meta = divisionMeta[divKey] || { color: [100, 100, 100], created: '2026-03-20' };
  const created = meta.created;

  // Check if we need a new page
  if (doc.y > 680) {
    doc.addPage();
    drawPageFooter();
    doc.y = 50;
  }

  const startY = doc.y;

  // Agent ID badge
  const [r, g, b] = meta.color;
  doc.rect(50, startY, 70, 16).fill(`rgba(${r}, ${g}, ${b}, 0.15)`);
  doc.fontSize(8).fillColor(`rgb(${r}, ${g}, ${b})`)
    .text(agent.id, 53, startY + 3, { width: 65 });

  // Agent name (bold)
  doc.fontSize(10).fillColor('#1a1a1a')
    .text(agent.name || 'Unnamed', 125, startY, { width: 180 });

  // Title/Role
  doc.fontSize(8).fillColor('#555555')
    .text(agent.role || '', 310, startY + 1, { width: 160 });

  // Date
  doc.fontSize(7).fillColor('#888888')
    .text(created, 480, startY + 2, { width: 80 });

  // Description (truncated)
  const desc = (agent.description || '').slice(0, 200) + ((agent.description || '').length > 200 ? '...' : '');
  doc.fontSize(7).fillColor('#666666')
    .text(desc, 125, startY + 14, { width: 400, lineGap: 1 });

  // Calculate height used
  const descHeight = doc.heightOfString(desc, { width: 400, fontSize: 7 });
  doc.y = startY + 16 + descHeight + 6;

  // Separator line
  doc.moveTo(50, doc.y - 3).lineTo(562, doc.y - 3).strokeColor('#e5e5e5').lineWidth(0.5).stroke();
}

let pageNumber = 0;
function drawPageFooter() {
  pageNumber++;
  const bottom = doc.page.height - 30;
  doc.fontSize(7).fillColor('#aaaaaa')
    .text('Coastal Key Property Management | Treasure Coast, Florida | coastalkey-pm.com', 50, bottom, { align: 'center', width: 512 });
}

// ── Build the document ────────────────────────────────────────────────────────

// Page 1: Cover / Header
drawHeader();
drawPageFooter();

// Fleet summary box
doc.rect(50, doc.y, 512, 80).fill('#f8fafc').stroke('#e2e8f0');
doc.fontSize(11).fillColor('#1a2744')
  .text('Fleet Composition', 60, doc.y + 10);
doc.fontSize(9).fillColor('#374151');

const summaryLines = [
  `15 MCCO Sovereign Command  |  20 Executive  |  40 Sentinel Sales  |  45 Operations`,
  `30 Intelligence  |  47 Marketing  |  25 Finance  |  25 Vendor Management`,
  `25 Technology  |  40 Website Development  |  50 Intelligence Officers  |  20 Email Agents  |  1 AI Trader`,
];
let sy = doc.y + 28;
for (const line of summaryLines) {
  doc.text(line, 60, sy, { width: 490 });
  sy += 14;
}
doc.y += 90;

// Column headers
doc.rect(50, doc.y, 512, 18).fill('#374151');
doc.fontSize(8).fillColor('#ffffff');
doc.text('AGENT ID', 53, doc.y + 4, { width: 70 });
doc.text('NAME', 125, doc.y + 4, { width: 180 });
doc.text('TITLE / ROLE', 310, doc.y + 4, { width: 160 });
doc.text('CREATED', 480, doc.y + 4, { width: 80 });
doc.y += 25;

// Render each division
for (const group of allGroups) {
  drawDivisionHeader(group.division, group.agents.length);

  for (const agent of group.agents) {
    drawAgentRow(agent, group.division);
  }

  doc.y += 5;
}

// Final page — Summary
doc.addPage();
drawPageFooter();
doc.rect(0, 0, doc.page.width, 60).fill('#1a2744');
doc.fontSize(20).fillColor('#ffffff')
  .text('MANIFEST SUMMARY', 50, 18, { align: 'center', width: 512 });
doc.y = 80;

doc.fontSize(11).fillColor('#1a1a1a');
const stats = [
  ['Total Fleet Units', `${totalAgents}`],
  ['Operational Divisions', '10 (MCCO, EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB)'],
  ['Intelligence Officer Squads', '5 (ALPHA, BRAVO, CHARLIE, DELTA, ECHO)'],
  ['Email Agent Squads', '4 (INTAKE, COMPOSE, NURTURE, MONITOR)'],
  ['Sovereign-Tier Agents', '2 (MCCO-000 Sovereign, FIN-TRADER-001 Apex Trader)'],
  ['API Endpoints', '90+'],
  ['Slack Apps', '3 (Coastal Key, CK Gateway, Coastal Key Content)'],
  ['Slack Channels', '33'],
  ['Slash Commands', '10'],
  ['Airtable Tables', '59'],
  ['Cloudflare Workers', '3'],
  ['Cloudflare Pages', '2'],
  ['Platform Domain', 'coastalkey-pm.com'],
  ['Workspace', 'Coastal Key Treasure Coast Asset Management'],
  ['Authority', 'Coastal Key AI CEO'],
];

for (const [label, value] of stats) {
  doc.fontSize(9).fillColor('#555555').text(label, 60, doc.y, { continued: true, width: 200 });
  doc.fillColor('#1a1a1a').text(`  ${value}`, { width: 300 });
  doc.y += 4;
}

doc.y += 20;
doc.fontSize(8).fillColor('#888888')
  .text('This manifest is the definitive source of truth for the Coastal Key autonomous fleet.', 60, doc.y, { width: 450, align: 'center' })
  .text('Generated by TEC-018 Documentation Bot under Coastal Key AI CEO authority.', 60, doc.y + 12, { width: 450, align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
  console.log(`Agent Manifest PDF generated: ${outputPath}`);
  console.log(`Total agents rendered: ${totalAgents}`);
  console.log(`Divisions: ${allGroups.length}`);
});
