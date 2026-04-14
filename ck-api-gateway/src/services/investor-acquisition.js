/**
 * Investment Acquisition Questions — V1
 *
 * 35 elite due diligence questions organized in 5 sections.
 * Designed to survive a PE firm interrogation.
 * Buy-side narrative: protect the acquirer from hidden risk.
 *
 * Every question has a purpose, a red flag indicator, and a scoring weight.
 */

const DOCUMENT_META = {
  id: 'CK-INV-ACQ-V1',
  title: 'Investment Acquisition Due Diligence — Elite Question Framework',
  version: '1.0.0',
  perspective: 'Buy-side — protect the acquirer',
  totalQuestions: 35,
  totalSections: 5,
  usableBy: 'PE firms, family offices, strategic acquirers, HNWI investors',
  scoringModel: 'Each question scored 1-10. Section averages weighted. Overall score determines deal grade.',
};

const SECTIONS = [
  {
    id: 'SEC-01',
    name: 'Financial Integrity',
    weight: 0.30,
    purpose: 'Verify the numbers are real, the margins are sustainable, and the cash flow is defensible.',
    questions: [
      {
        id: 'Q-01',
        question: 'Provide 3 years of audited P&L, balance sheet, and cash flow statements. If unaudited, explain why.',
        purpose: 'Baseline financial verification',
        redFlag: 'Refusal to provide or "we don\'t have audited financials" on a business > $2M revenue',
        weight: 10,
      },
      {
        id: 'Q-02',
        question: 'What is the gross margin trend over the past 12 quarters? Explain any quarter with > 5% variance.',
        purpose: 'Margin stability and predictability',
        redFlag: 'Declining margins without clear seasonal explanation',
        weight: 9,
      },
      {
        id: 'Q-03',
        question: 'Break down revenue by customer. What percentage comes from the top 5 clients?',
        purpose: 'Revenue concentration risk',
        redFlag: 'Top 5 clients > 60% of revenue = single-point-of-failure risk',
        weight: 9,
      },
      {
        id: 'Q-04',
        question: 'What is the monthly cash burn rate and current runway? Include all committed but unpaid obligations.',
        purpose: 'Liquidity and survival timeline',
        redFlag: 'Less than 6 months runway without clear path to profitability',
        weight: 8,
      },
      {
        id: 'Q-05',
        question: 'List all debt instruments, interest rates, covenants, and maturity dates. Include personal guarantees.',
        purpose: 'Hidden leverage and covenant risk',
        redFlag: 'Personal guarantees by departing owner or covenant violations',
        weight: 8,
      },
      {
        id: 'Q-06',
        question: 'What is the owner compensation package (salary, distributions, perks, related-party transactions)?',
        purpose: 'True owner economics — many owners hide income in expenses',
        redFlag: 'Owner comp + related-party transactions > 30% of net income',
        weight: 7,
      },
      {
        id: 'Q-07',
        question: 'Provide a detailed add-back schedule with supporting documentation for each adjustment.',
        purpose: 'Verify EBITDA adjustments are legitimate, not manufactured',
        redFlag: 'Add-backs > 40% of stated EBITDA or unsupported adjustments',
        weight: 9,
      },
    ],
  },
  {
    id: 'SEC-02',
    name: 'Operational Risk',
    weight: 0.25,
    purpose: 'Identify operational fragility — what breaks when the owner leaves?',
    questions: [
      {
        id: 'Q-08',
        question: 'If the owner disappeared tomorrow, what would stop working within 7 days?',
        purpose: 'Owner dependency — the #1 acquisition killer',
        redFlag: 'More than 3 critical functions depend solely on the owner',
        weight: 10,
      },
      {
        id: 'Q-09',
        question: 'Map every key process. Which ones have documented SOPs? Which exist only in someone\'s head?',
        purpose: 'Institutional knowledge vs. tribal knowledge',
        redFlag: '> 50% of processes undocumented',
        weight: 8,
      },
      {
        id: 'Q-10',
        question: 'What is the average employee tenure? List all departures in the past 24 months with reasons.',
        purpose: 'Team stability and culture health',
        redFlag: 'Average tenure < 18 months or cluster departures',
        weight: 7,
      },
      {
        id: 'Q-11',
        question: 'Identify the 3 most critical employees (not the owner). What happens if each leaves?',
        purpose: 'Key-person risk below the owner level',
        redFlag: 'No succession plan for any critical role',
        weight: 8,
      },
      {
        id: 'Q-12',
        question: 'What technology systems run the business? Are they owned, licensed, or built on free tiers?',
        purpose: 'Tech stack fragility and migration cost',
        redFlag: 'Critical systems on free tiers, end-of-life software, or shadow IT',
        weight: 7,
      },
      {
        id: 'Q-13',
        question: 'What is the vendor/supplier concentration? Could any single vendor disruption halt operations?',
        purpose: 'Supply chain single-point-of-failure',
        redFlag: 'Single-source dependency for > 30% of deliverables',
        weight: 7,
      },
      {
        id: 'Q-14',
        question: 'Describe the last operational crisis (past 24 months). How was it handled? What changed afterward?',
        purpose: 'Crisis resilience and learning culture',
        redFlag: '"We haven\'t had any crises" = either lying or not looking',
        weight: 6,
      },
    ],
  },
  {
    id: 'SEC-03',
    name: 'Market Position',
    weight: 0.20,
    purpose: 'Determine if the business has a moat or is a commodity playing defense.',
    questions: [
      {
        id: 'Q-15',
        question: 'Define your competitive advantage in one sentence. Now prove it with data.',
        purpose: 'Force clarity — most businesses cannot articulate their moat',
        redFlag: 'Answer is "customer service" or "quality" without quantifiable proof',
        weight: 9,
      },
      {
        id: 'Q-16',
        question: 'Who are your top 5 competitors? What do they do better than you?',
        purpose: 'Self-awareness and honest competitive assessment',
        redFlag: '"We don\'t really have competitors" or inability to name weaknesses',
        weight: 7,
      },
      {
        id: 'Q-17',
        question: 'What is your customer acquisition cost by channel? Which channel has the best LTV:CAC ratio?',
        purpose: 'Marketing efficiency and scalability of growth',
        redFlag: 'No CAC tracking or LTV:CAC < 3:1',
        weight: 8,
      },
      {
        id: 'Q-18',
        question: 'What is your Net Promoter Score? When was it last measured? What is the trend?',
        purpose: 'Customer satisfaction as a leading indicator',
        redFlag: 'Never measured or NPS < 30',
        weight: 6,
      },
      {
        id: 'Q-19',
        question: 'What percentage of revenue is recurring vs. one-time? What is the contract renewal rate?',
        purpose: 'Revenue quality and predictability',
        redFlag: '< 40% recurring or renewal rate < 80%',
        weight: 9,
      },
      {
        id: 'Q-20',
        question: 'What market trends could make this business irrelevant within 5 years?',
        purpose: 'Existential threat assessment',
        redFlag: 'Cannot identify any threats = lack of strategic thinking',
        weight: 8,
      },
      {
        id: 'Q-21',
        question: 'Provide customer churn data: monthly, by segment, by tenure cohort. What is the primary churn reason?',
        purpose: 'Retention health and improvement trajectory',
        redFlag: 'No churn tracking or monthly churn > 5%',
        weight: 8,
      },
    ],
  },
  {
    id: 'SEC-04',
    name: 'Scalability',
    weight: 0.15,
    purpose: 'Can this business 3x without 3x the cost? Or does growth = proportional pain?',
    questions: [
      {
        id: 'Q-22',
        question: 'If revenue doubled in 12 months, what would break first? What investment is required?',
        purpose: 'Growth bottleneck identification',
        redFlag: 'Answer is "we\'d need to hire proportionally" = linear scaling = bad',
        weight: 8,
      },
      {
        id: 'Q-23',
        question: 'What is the incremental cost to serve one additional customer?',
        purpose: 'Marginal economics — the core of scalability',
        redFlag: 'Marginal cost > 50% of marginal revenue',
        weight: 8,
      },
      {
        id: 'Q-24',
        question: 'What automation exists today? What could be automated but isn\'t? Why not?',
        purpose: 'Automation maturity and low-hanging fruit',
        redFlag: '"We prefer the personal touch" for automatable tasks = scaling ceiling',
        weight: 7,
      },
      {
        id: 'Q-25',
        question: 'Is the business geographically constrained? What would expansion to a new market require?',
        purpose: 'Expansion friction and replicability',
        redFlag: 'Requires owner presence or hyper-local relationships to operate',
        weight: 7,
      },
      {
        id: 'Q-26',
        question: 'What is the technology roadmap for the next 24 months? Budget allocated?',
        purpose: 'Tech investment as a growth enabler',
        redFlag: 'No roadmap or "$0 budget for technology"',
        weight: 6,
      },
      {
        id: 'Q-27',
        question: 'Describe the management layer below the owner. Can they run the business independently for 90 days?',
        purpose: 'Management depth — critical for post-acquisition transition',
        redFlag: 'No management layer or "I do everything"',
        weight: 9,
      },
      {
        id: 'Q-28',
        question: 'What is the maximum capacity of current infrastructure (physical, digital, human)?',
        purpose: 'Ceiling identification before capex is required',
        redFlag: 'Currently operating at > 85% capacity with no expansion plan',
        weight: 7,
      },
    ],
  },
  {
    id: 'SEC-05',
    name: 'Exit & Legal',
    weight: 0.10,
    purpose: 'Uncover legal landmines, regulatory exposure, and exit complications.',
    questions: [
      {
        id: 'Q-29',
        question: 'List all pending, threatened, or settled litigation in the past 5 years. Include regulatory actions.',
        purpose: 'Legal liability exposure',
        redFlag: 'Active litigation with potential damages > 10% of enterprise value',
        weight: 9,
      },
      {
        id: 'Q-30',
        question: 'Are there any change-of-control provisions in contracts, leases, or licenses?',
        purpose: 'Acquisition-triggered termination clauses',
        redFlag: 'Key contracts terminate on ownership change without consent',
        weight: 8,
      },
      {
        id: 'Q-31',
        question: 'What intellectual property does the business own? Is it registered, documented, and defensible?',
        purpose: 'IP valuation and protection',
        redFlag: 'No IP registration, or IP created by contractors without assignment agreements',
        weight: 7,
      },
      {
        id: 'Q-32',
        question: 'What regulatory licenses or permits are required? Are all current? Any compliance gaps?',
        purpose: 'Regulatory risk assessment',
        redFlag: 'Operating without required licenses or expired permits',
        weight: 8,
      },
      {
        id: 'Q-33',
        question: 'What is the owner\'s desired post-acquisition role and timeline for transition?',
        purpose: 'Transition planning and earn-out structure',
        redFlag: '"I want to leave immediately" with no transition plan',
        weight: 7,
      },
      {
        id: 'Q-34',
        question: 'Are there any undisclosed liabilities, off-balance-sheet obligations, or verbal agreements?',
        purpose: 'Hidden risk discovery — the question that catches lies',
        redFlag: 'Hesitation or "not that I can think of"',
        weight: 9,
      },
      {
        id: 'Q-35',
        question: 'What would make you walk away from this deal if you were the buyer?',
        purpose: 'Seller self-awareness — the most revealing question in due diligence',
        redFlag: '"Nothing" = either dishonest or lacks self-awareness',
        weight: 10,
      },
    ],
  },
];

const SCORING_MODEL = {
  method: 'Weighted section average → overall deal grade',
  grades: [
    { grade: 'A', range: '8.0–10.0', action: 'Proceed to LOI — strong acquisition candidate' },
    { grade: 'B', range: '6.5–7.9', action: 'Proceed with conditions — address identified risks' },
    { grade: 'C', range: '5.0–6.4', action: 'Caution — significant risks require mitigation before proceeding' },
    { grade: 'D', range: '3.0–4.9', action: 'High risk — recommend restructuring deal terms or walking away' },
    { grade: 'F', range: '0.0–2.9', action: 'Walk away — fundamental issues that cannot be mitigated' },
  ],
  sectionWeights: SECTIONS.map(s => ({ section: s.name, weight: `${s.weight * 100}%` })),
};

// ── Public API ──

export function getInvestorFramework() {
  return {
    ...DOCUMENT_META,
    sections: SECTIONS.map(s => ({
      id: s.id,
      name: s.name,
      weight: `${s.weight * 100}%`,
      questionCount: s.questions.length,
    })),
    scoringModel: SCORING_MODEL,
    status: 'production-ready',
  };
}

export function getInvestorSection(sectionId) {
  return SECTIONS.find(s => s.id === sectionId) || null;
}

export function getInvestorSections() {
  return {
    document: DOCUMENT_META.title,
    totalSections: SECTIONS.length,
    totalQuestions: DOCUMENT_META.totalQuestions,
    sections: SECTIONS,
    scoringModel: SCORING_MODEL,
  };
}

export function getInvestorQuestion(questionId) {
  for (const section of SECTIONS) {
    const q = section.questions.find(q => q.id === questionId);
    if (q) return { ...q, section: section.name, sectionId: section.id };
  }
  return null;
}

export function scoreAcquisition(answers) {
  const sectionScores = SECTIONS.map(section => {
    const sectionAnswers = section.questions.map(q => {
      const answer = answers?.[q.id];
      return typeof answer === 'number' ? Math.min(10, Math.max(0, answer)) : 5;
    });
    const avg = sectionAnswers.reduce((a, b) => a + b, 0) / sectionAnswers.length;
    return { sectionId: section.id, name: section.name, weight: section.weight, score: Math.round(avg * 10) / 10 };
  });

  const overall = sectionScores.reduce((sum, s) => sum + (s.score * s.weight), 0);
  const rounded = Math.round(overall * 10) / 10;
  const grade = SCORING_MODEL.grades.find(g => {
    const [min, max] = g.range.split('–').map(Number);
    return rounded >= min && rounded <= max;
  }) || SCORING_MODEL.grades[SCORING_MODEL.grades.length - 1];

  return {
    document: DOCUMENT_META.id,
    sectionScores,
    overallScore: rounded,
    grade: grade.grade,
    action: grade.action,
    redFlags: sectionScores.filter(s => s.score < 5).map(s => s.name),
  };
}
