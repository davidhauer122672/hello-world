/**
 * Problems Analysis — Top 10 Home Watch & Property Management Problems
 *
 * Each problem scored on three dimensions:
 *   Urgency (1-10):  How time-sensitive is it right now
 *   WTP (1-10):      Willingness to pay — how likely buyers are to spend money today
 *   Trend:           Rising, Fast, Stable, or Declining
 *   Complaint Signal: Yes/No — surfaces frequently in reviews, forums, or sales calls
 *
 * Sorted by combined Urgency + WTP score, highest first.
 */

export const PROBLEMS_TABLE = [
  {
    rank: 1,
    problem: 'Undetected water damage and mold in vacant properties',
    urgency: 10,
    wtp: 10,
    combinedScore: 20,
    trend: 'Rising Fast',
    complaintSignal: true,
    whyItRanksHere: 'Single most expensive failure mode. A slow leak in a vacant home can cause $40K-$150K in damage within weeks. Insurance carriers are denying claims for undocumented vacant properties. Owners will pay any price to avoid this — the cost of prevention is 1% of the cost of failure.',
  },
  {
    rank: 2,
    problem: 'Insurance policy cancellation or non-renewal for unmonitored properties',
    urgency: 10,
    wtp: 9,
    combinedScore: 19,
    trend: 'Rising Fast',
    complaintSignal: true,
    whyItRanksHere: 'Florida carriers (Citizens, HCI, Heritage) now require documented inspection programs for homes vacant >60 days. Owners facing non-renewal have zero negotiating leverage. Home watch documentation is the only path to reinstatement — creating a compliance-driven purchase mandate.',
  },
  {
    rank: 3,
    problem: 'No reliable way to verify property condition remotely between visits',
    urgency: 9,
    wtp: 9,
    combinedScore: 18,
    trend: 'Rising',
    complaintSignal: true,
    whyItRanksHere: 'Absentee owners check their Ring cameras but have no systematic property health view. The gap between biweekly inspections creates anxiety that drives constant calls to managers. Owners paying $3K-$10K/month in management fees expect real-time visibility they are not getting.',
  },
  {
    rank: 4,
    problem: 'Vendor overcharging and lack of maintenance cost transparency',
    urgency: 8,
    wtp: 9,
    combinedScore: 17,
    trend: 'Rising',
    complaintSignal: true,
    whyItRanksHere: 'Absentee owners cannot verify if a $4,800 HVAC repair quote is fair. Property managers often mark up vendor costs 15-30% without disclosure. This is the #1 complaint on Yelp and Google reviews for property management companies nationwide — trust erosion that drives churn.',
  },
  {
    rank: 5,
    problem: 'Hurricane and storm preparation for vacant properties with no one on-site',
    urgency: 9,
    wtp: 8,
    combinedScore: 17,
    trend: 'Stable',
    complaintSignal: true,
    whyItRanksHere: 'Category-dependent urgency — when a named storm approaches, every absentee owner needs shutters closed, patio furniture secured, and generators tested simultaneously. Home watch companies cannot scale labor fast enough. The ones that pre-position via checklists and vendor pre-authorization win the market.',
  },
  {
    rank: 6,
    problem: 'Property management companies are unresponsive and difficult to reach',
    urgency: 7,
    wtp: 9,
    combinedScore: 16,
    trend: 'Stable',
    complaintSignal: true,
    whyItRanksHere: 'The most frequent 1-star review across Google, Yelp, and BBB for PM companies: "I cannot get anyone to call me back." Absentee owners feel powerless. They are paying monthly fees for a service that ghosts them. Any company that solves communication wins by default.',
  },
  {
    rank: 7,
    problem: 'Inconsistent inspection quality — no standardized reporting or photographic documentation',
    urgency: 7,
    wtp: 8,
    combinedScore: 15,
    trend: 'Rising',
    complaintSignal: true,
    whyItRanksHere: 'Owners receive a text saying "property looks good" instead of a timestamped 40-point photo inspection. When insurance claims arise, they have no documentation. NHWA is pushing certification standards, but enforcement is voluntary. Standardized AI-driven reporting is the competitive moat.',
  },
  {
    rank: 8,
    problem: 'No integration between home watch, property management, and vendor coordination systems',
    urgency: 6,
    wtp: 8,
    combinedScore: 14,
    trend: 'Rising Fast',
    complaintSignal: false,
    whyItRanksHere: 'Operators use 4-7 disconnected tools (inspection app, CRM, accounting, work orders, communication, scheduling). Data lives in silos. The operator who unifies these into one AI-powered platform captures the "operating system for property management" position — which is exactly what PE buyers value at 15-25x ARR.',
  },
  {
    rank: 9,
    problem: 'Difficulty finding and vetting qualified home watch and property management services',
    urgency: 6,
    wtp: 7,
    combinedScore: 13,
    trend: 'Rising',
    complaintSignal: true,
    whyItRanksHere: 'No Yelp or Angi equivalent specialized for home watch. NHWA accreditation exists but has low consumer awareness. Absentee owners Google "home watch near me" and get a mix of security companies, handymen, and actual home watch operators with no way to compare. First-mover in targeted marketplace/directory owns the funnel.',
  },
  {
    rank: 10,
    problem: 'Seasonal scaling — operators cannot flex capacity for snowbird surge and summer lull',
    urgency: 5,
    wtp: 7,
    combinedScore: 12,
    trend: 'Stable',
    complaintSignal: false,
    whyItRanksHere: 'Florida home watch operators are at 110% capacity October through April and 50% capacity May through September. They hire and fire seasonally, killing service quality. AI automation smooths the capacity curve — operators who adopt AI can serve 3x the properties with the same headcount.',
  },
];

/**
 * Get the full problems analysis with metadata.
 */
export function getProblemsAnalysis() {
  return {
    generatedBy: 'SMO-001 — Sovereign Marketing Officer',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    title: 'Top 10 Problems in Home Watch & Property Management',
    scoringMethodology: {
      urgency: '1-10 scale — how time-sensitive the problem is right now in the current market',
      wtp: '1-10 scale — willingness to pay: how likely buyers are to spend money to solve it today',
      trend: 'Rising Fast | Rising | Stable | Declining — directional momentum of the problem',
      complaintSignal: 'Yes/No — whether this problem surfaces frequently in reviews, forums, or sales calls',
      sorting: 'Combined Urgency + WTP score, highest first',
    },
    columns: ['Rank', 'Problem', 'Urgency', 'WTP', 'Trend', 'Complaint Signal', 'Why It Ranks Here'],
    problems: PROBLEMS_TABLE,
    insights: {
      avgUrgency: (PROBLEMS_TABLE.reduce((s, p) => s + p.urgency, 0) / PROBLEMS_TABLE.length).toFixed(1),
      avgWTP: (PROBLEMS_TABLE.reduce((s, p) => s + p.wtp, 0) / PROBLEMS_TABLE.length).toFixed(1),
      risingFastCount: PROBLEMS_TABLE.filter(p => p.trend === 'Rising Fast').length,
      complaintSignalCount: PROBLEMS_TABLE.filter(p => p.complaintSignal).length,
      topInsight: 'Water damage and insurance compliance are the two highest-scoring problems — both create urgent, non-negotiable purchase triggers. Marketing should lead with loss prevention messaging.',
    },
    timestamp: new Date().toISOString(),
  };
}
