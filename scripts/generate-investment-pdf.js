#!/usr/bin/env node
/**
 * Coastal Key Enterprise — Investment Acquisition Questions PDF Generator
 *
 * Generates an investor-grade PDF document with 40 elite due diligence
 * questions across 5 sections: Financial Integrity, Operational Risk,
 * Market Position, Scalability, and Exit Strategy.
 *
 * Usage: node scripts/generate-investment-pdf.js
 * Output: docs/investment-acquisition-questions-v1.pdf
 */

import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = join(__dirname, '..', 'docs', 'investment-acquisition-questions-v1.pdf');

// Brand palette
const COLORS = {
  navy: '#1B2A4A',
  white: '#FFFFFF',
  sand: '#D2C4A0',
  ocean: '#2E86AB',
  charcoal: '#2D2D2D',
  lightGray: '#F5F0EB',
  accent: '#C4A265',
};

const SECTIONS = [
  {
    title: 'Section 1: Financial Integrity',
    subtitle: 'Revenue & Cash Flow',
    questions: [
      { num: 1, text: 'What is the trailing 12-month (TTM) revenue, and how does it compare to the prior 3 fiscal years?', note: 'Require audited financials. If unaudited, discount credibility by 30%.' },
      { num: 2, text: 'What percentage of revenue is recurring vs. one-time?', note: 'Recurring revenue >60% = strong. Below 40% = red flag.' },
      { num: 3, text: 'What is the gross margin by service line?', note: 'Margins below 35% on core services require explanation.' },
      { num: 4, text: 'Provide a 24-month cash flow statement with actual vs. projected.', note: 'Variance >15% in any quarter = weak forecasting discipline.' },
      { num: 5, text: 'What are the top 5 clients by revenue concentration?', note: 'Any single client >20% of total revenue = dependency risk.' },
      { num: 6, text: 'What is the current debt structure?', note: 'Detail all notes payable, lines of credit, SBA loans, equipment financing.' },
      { num: 7, text: 'Are there any off-balance-sheet liabilities?', note: 'Pending litigation, personal guarantees, deferred maintenance obligations.' },
      { num: 8, text: 'What is the owner\'s actual compensation (salary + distributions + perks)?', note: 'Recast earnings to determine true EBITDA. Most small businesses understate by 25-40%.' },
      { num: 9, text: 'What is the accounts receivable aging?', note: 'AR >90 days exceeding 15% of total = collections problem.' },
      { num: 10, text: 'What is the customer lifetime value (LTV) to customer acquisition cost (CAC) ratio?', note: 'LTV:CAC below 3:1 = unsustainable. Above 5:1 = strong.' },
    ],
  },
  {
    title: 'Section 2: Operational Risk',
    subtitle: 'Process & Dependency',
    questions: [
      { num: 11, text: 'If the owner disappeared tomorrow, could the business operate for 90 days without revenue decline?', note: 'If no, you\'re buying a job, not a company.' },
      { num: 12, text: 'Document every process that currently lives in the owner\'s head.', note: 'Verbal knowledge = zero enterprise value.' },
      { num: 13, text: 'What is the employee turnover rate for the last 3 years?', note: 'Turnover >25% annually = culture or compensation problem.' },
      { num: 14, text: 'Are there any key-person dependencies beyond the owner?', note: 'Identify anyone whose departure would cause >10% revenue loss.' },
      { num: 15, text: 'What is the current insurance coverage?', note: 'Underinsured businesses are ticking time bombs.' },
      { num: 16, text: 'What pending or historical legal actions exist?', note: 'Include settled cases — terms may restrict future operations.' },
      { num: 17, text: 'What is the technology stack and what would it cost to replace?', note: 'If the business runs on spreadsheets, modernization cost must be priced in.' },
      { num: 18, text: 'What licenses, certifications, or regulatory requirements exist, and are they transferable?', note: 'Non-transferable licenses can kill a deal at closing.' },
    ],
  },
  {
    title: 'Section 3: Market Position',
    subtitle: 'Competitive Landscape & Moat',
    questions: [
      { num: 19, text: 'What is the total addressable market (TAM) within the operating geography?', note: 'Define the ceiling: residential units, commercial properties, HOAs.' },
      { num: 20, text: 'What is current market share by property count and by revenue?', note: 'Market share <5% = participant, not leader.' },
      { num: 21, text: 'Who are the top 3 competitors, and what do they do better?', note: 'If the owner says "nobody," they don\'t know their market.' },
      { num: 22, text: 'What is the Net Promoter Score (NPS) or equivalent client satisfaction metric?', note: 'NPS >50 = strong. NPS <20 = retention risk. No measurement = flying blind.' },
      { num: 23, text: 'What is the client retention rate over 3 years?', note: 'Annual retention below 85% = leaking bucket.' },
      { num: 24, text: 'What proprietary advantages does the business possess?', note: 'If the answer is "our service is better" — that\'s not a moat.' },
      { num: 25, text: 'What is the average contract duration and renewal process?', note: 'Month-to-month = maximum vulnerability.' },
      { num: 26, text: 'What geographic or demographic trends affect this market over the next 5 years?', note: 'Population growth, migration patterns, regulatory changes.' },
    ],
  },
  {
    title: 'Section 4: Scalability',
    subtitle: 'Growth Mechanics',
    questions: [
      { num: 27, text: 'What would it take to double revenue in 24 months without doubling headcount?', note: 'Linear headcount growth = doesn\'t scale.' },
      { num: 28, text: 'What is the current capacity utilization?', note: 'Identify the first bottleneck that breaks at +50% volume.' },
      { num: 29, text: 'What is the cost to acquire a new client (fully loaded)?', note: 'Include marketing, sales time, onboarding, first-month ramp.' },
      { num: 30, text: 'Is there a repeatable sales process, or is growth dependent on owner relationships?', note: 'Referral-only = no scalable acquisition channel.' },
      { num: 31, text: 'What adjacent services could be cross-sold to existing clients?', note: 'Concierge, renovation, insurance brokerage, investment advisory.' },
      { num: 32, text: 'What is the technology roadmap for the next 12 months?', note: 'No roadmap = outcompeted by tech-enabled operators in 3 years.' },
      { num: 33, text: 'Can the business operate in multiple geographies with the current model?', note: 'Single-market businesses have a ceiling.' },
      { num: 34, text: 'What are the unit economics per property under management?', note: 'Revenue, cost, margin per property — the atomic unit.' },
    ],
  },
  {
    title: 'Section 5: Exit Strategy & Valuation',
    subtitle: 'Deal Structure & Terminal Value',
    questions: [
      { num: 35, text: 'What is the seller\'s expected valuation, and what methodology supports it?', note: 'If the seller can\'t articulate methodology, they\'re guessing.' },
      { num: 36, text: 'What is the recast EBITDA after normalizing owner compensation and one-time expenses?', note: 'This is the only number that matters for valuation.' },
      { num: 37, text: 'What are the proposed deal terms?', note: 'Asset vs. stock sale, earnout, seller financing, non-compete, escrow.' },
      { num: 38, text: 'What is the seller\'s motivation and timeline?', note: 'Motivation drives negotiation leverage. Urgency = discount.' },
      { num: 39, text: 'What would a 12-month post-acquisition integration plan look like?', note: 'Day 1, Day 30, Day 90, Day 180, Day 365 milestones.' },
      { num: 40, text: 'What kills this deal?', note: 'If they say "nothing," they\'re not being honest.' },
    ],
  },
];

function generatePDF() {
  const doc = new PDFDocument({
    size: 'letter',
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title: 'Investment Acquisition Due Diligence — Elite Question Framework',
      Author: 'Coastal Key Enterprise',
      Subject: 'Buy-Side Acquisition Analysis',
      Keywords: 'due diligence, acquisition, investment, property management',
    },
  });

  const stream = createWriteStream(outputPath);
  doc.pipe(stream);

  // --- Cover Page ---
  doc.rect(0, 0, 612, 792).fill(COLORS.navy);

  doc.fillColor(COLORS.white)
    .fontSize(32)
    .font('Helvetica-Bold')
    .text('Investment Acquisition', 60, 240, { align: 'center' });

  doc.fontSize(28)
    .text('Due Diligence', { align: 'center' });

  doc.moveDown(0.5);
  doc.rect(206, doc.y, 200, 2).fill(COLORS.accent);

  doc.fillColor(COLORS.sand)
    .fontSize(16)
    .font('Helvetica')
    .text('Elite Question Framework', 60, doc.y + 20, { align: 'center' });

  doc.moveDown(2);
  doc.fillColor(COLORS.accent)
    .fontSize(11)
    .text('40 Questions | 5 Sections | Investor-Grade', { align: 'center' });

  doc.fillColor(COLORS.white)
    .fontSize(10)
    .font('Helvetica')
    .text('Buy-Side Acquisition Analysis', 60, 580, { align: 'center' });

  doc.moveDown(0.5);
  doc.fillColor(COLORS.sand)
    .fontSize(9)
    .text('Coastal Key Enterprise — Sovereign Governance', { align: 'center' });

  doc.fillColor(COLORS.accent)
    .fontSize(8)
    .text('Version 1.0.0 — April 2026', { align: 'center' });

  // --- Sections ---
  for (const section of SECTIONS) {
    doc.addPage();

    // Section header
    doc.rect(0, 0, 612, 80).fill(COLORS.navy);
    doc.fillColor(COLORS.white)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(section.title, 60, 25);
    doc.fillColor(COLORS.sand)
      .fontSize(11)
      .font('Helvetica')
      .text(section.subtitle, 60, 50);

    doc.y = 100;

    for (const q of section.questions) {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 60;
      }

      // Question number badge
      doc.fillColor(COLORS.navy)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Q${q.num}`, 60, doc.y, { continued: false });

      // Question text
      doc.fillColor(COLORS.charcoal)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(q.text, 90, doc.y - 12, { width: 440 });

      doc.moveDown(0.3);

      // Guidance note
      doc.fillColor(COLORS.ocean)
        .fontSize(8.5)
        .font('Helvetica-Oblique')
        .text(q.note, 90, doc.y, { width: 440 });

      doc.moveDown(0.8);

      // Separator
      doc.rect(90, doc.y, 430, 0.5).fill('#E0E0E0');
      doc.moveDown(0.6);
    }
  }

  // --- Scoring Page ---
  doc.addPage();
  doc.rect(0, 0, 612, 80).fill(COLORS.navy);
  doc.fillColor(COLORS.white)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('Scoring Framework', 60, 25);
  doc.fillColor(COLORS.sand)
    .fontSize(11)
    .font('Helvetica')
    .text('Quantified Decision Matrix', 60, 50);

  const scoreData = [
    ['Financial Integrity', '30%', '7/10 satisfactory'],
    ['Operational Risk', '25%', '6/8 satisfactory'],
    ['Market Position', '20%', '6/8 satisfactory'],
    ['Scalability', '15%', '6/8 satisfactory'],
    ['Exit Strategy', '10%', '4/6 satisfactory'],
  ];

  doc.y = 110;

  // Table header
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(10);
  doc.text('Section', 60, doc.y, { width: 200 });
  doc.text('Weight', 280, doc.y, { width: 80 });
  doc.text('Pass Threshold', 380, doc.y, { width: 160 });
  doc.moveDown(0.5);
  doc.rect(60, doc.y, 470, 1).fill(COLORS.navy);
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(10);
  for (const [section, weight, threshold] of scoreData) {
    doc.fillColor(COLORS.charcoal);
    doc.text(section, 60, doc.y, { width: 200 });
    doc.text(weight, 280, doc.y, { width: 80 });
    doc.text(threshold, 380, doc.y, { width: 160 });
    doc.moveDown(0.8);
  }

  doc.moveDown(1);
  doc.rect(60, doc.y, 470, 1).fill(COLORS.navy);
  doc.moveDown(1);

  // Decision rules
  doc.fillColor(COLORS.navy).font('Helvetica-Bold').fontSize(12);
  doc.text('Decision Rules', 60, doc.y);
  doc.moveDown(0.8);

  const rules = [
    { score: 'Score < 70%', action: 'WALK', color: '#CC0000' },
    { score: 'Score 70–85%', action: 'NEGOTIATE HARD', color: COLORS.accent },
    { score: 'Score > 85%', action: 'MOVE FAST', color: '#228B22' },
  ];

  for (const rule of rules) {
    doc.fillColor(rule.color).font('Helvetica-Bold').fontSize(11);
    doc.text(`${rule.score}  →  ${rule.action}`, 80, doc.y);
    doc.moveDown(0.8);
  }

  // Footer on every page
  const pages = doc.bufferedPageRange();
  for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(COLORS.sand)
      .fontSize(7)
      .font('Helvetica')
      .text(
        'Coastal Key Enterprise — Investment Acquisition Due Diligence v1.0.0',
        60,
        750,
        { width: 492, align: 'center' }
      );
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`PDF generated: ${outputPath}`);
    console.log('Version: 1.0.0 | 40 questions | 5 sections | Investor-grade');
  });
}

generatePDF();
