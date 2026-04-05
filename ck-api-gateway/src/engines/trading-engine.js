/**
 * Trading / Deal Engine — Real Estate Transaction Intelligence
 *
 * Handles deal scoring, negotiation strategy, comp analysis, closing cost
 * estimation, investor packaging, and portfolio evaluation for Coastal Key
 * Property Management's Treasure Coast operations.
 */

import { SERVICE_ZONES } from '../agents/constants.js';

// ── Deal Pipeline Stages ─────────────────────────────────────────────────────

export const DEAL_STAGES = [
  { id: 'prospect',        label: 'Prospect',        order: 1, description: 'Initial identification — property or client surfaced by fleet.' },
  { id: 'qualified',       label: 'Qualified',       order: 2, description: 'Lead qualified via Sentinel or manual review — meets investment criteria.' },
  { id: 'proposal',        label: 'Proposal',        order: 3, description: 'Management proposal or acquisition offer prepared and delivered.' },
  { id: 'negotiation',     label: 'Negotiation',     order: 4, description: 'Active negotiation on terms, pricing, or scope of management.' },
  { id: 'under-contract',  label: 'Under Contract',  order: 5, description: 'Signed contract — contingencies in effect.' },
  { id: 'due-diligence',   label: 'Due Diligence',   order: 6, description: 'Inspection, appraisal, title search, and financial verification.' },
  { id: 'closing',         label: 'Closing',         order: 7, description: 'Final walkthrough, document signing, fund transfer in progress.' },
  { id: 'closed-won',      label: 'Closed Won',      order: 8, description: 'Deal closed successfully — property onboarded or acquired.' },
  { id: 'closed-lost',     label: 'Closed Lost',     order: 9, description: 'Deal fell through — reason logged for pipeline analytics.' },
];

// ── Deal Scoring Weights ─────────────────────────────────────────────────────

export const DEAL_SCORING_WEIGHTS = {
  location:     0.25,  // 25% — Zone desirability, proximity to amenities, flood zone
  financials:   0.30,  // 30% — Cap rate, NOI, cash-on-cash return, debt coverage
  condition:    0.20,  // 20% — Property condition, age, deferred maintenance
  marketTiming: 0.15,  // 15% — Inventory levels, price trends, absorption rate
  clientFit:    0.10,  // 10% — Alignment with investor profile, portfolio diversification
};

// ── Deal Scoring ─────────────────────────────────────────────────────────────

/**
 * Score a potential deal on a 0-100 scale.
 *
 * @param {object} deal — Deal parameters
 * @param {string} [deal.zone] — SERVICE_ZONES id
 * @param {number} [deal.capRate] — Capitalization rate (e.g. 0.07 for 7%)
 * @param {number} [deal.noiAnnual] — Net Operating Income
 * @param {number} [deal.askingPrice] — Listed or asking price
 * @param {number} [deal.propertyAge] — Years since construction
 * @param {string} [deal.condition] — 'excellent', 'good', 'fair', 'poor'
 * @param {number} [deal.deferredMaintenance] — Estimated deferred maintenance cost
 * @param {number} [deal.inventoryMonths] — Months of inventory in the submarket
 * @param {string} [deal.priceTrend] — 'rising', 'stable', 'declining'
 * @param {number} [deal.clientFitScore] — 0-100 manual client fit assessment
 * @returns {object} Deal score with breakdown
 */
export function scoreDeal(deal = {}) {
  const scores = {};

  // Location (25%)
  if (deal.zone) {
    const zoneInfo = SERVICE_ZONES.find(z => z.id === deal.zone);
    // Premium zones score higher
    const premiumZones = new Set(['vero_beach', 'stuart', 'jupiter', 'hobe_sound', 'jensen_beach']);
    scores.location = zoneInfo
      ? (premiumZones.has(deal.zone) ? 85 : 70)
      : 50;
  } else {
    scores.location = 50;
  }

  // Financials (30%)
  if (deal.capRate != null) {
    // 8%+ cap rate = excellent, 4% = mediocre for Treasure Coast
    scores.financials = Math.max(0, Math.min(100, Math.round((deal.capRate / 0.10) * 100)));
  } else if (deal.noiAnnual != null && deal.askingPrice != null && deal.askingPrice > 0) {
    const impliedCap = deal.noiAnnual / deal.askingPrice;
    scores.financials = Math.max(0, Math.min(100, Math.round((impliedCap / 0.10) * 100)));
  } else {
    scores.financials = 50;
  }

  // Condition (20%)
  const conditionScores = { excellent: 95, good: 75, fair: 50, poor: 20 };
  if (deal.condition) {
    scores.condition = conditionScores[deal.condition.toLowerCase()] || 50;
  } else {
    scores.condition = 50;
  }
  if (deal.deferredMaintenance != null && deal.askingPrice != null && deal.askingPrice > 0) {
    const maintenanceRatio = deal.deferredMaintenance / deal.askingPrice;
    scores.condition = Math.max(0, scores.condition - Math.round(maintenanceRatio * 500));
  }

  // Market Timing (15%)
  let timingScore = 60;
  if (deal.inventoryMonths != null) {
    // Buyer's market (high inventory) = opportunity
    if (deal.inventoryMonths >= 6) timingScore += 15;
    else if (deal.inventoryMonths <= 3) timingScore -= 10;
  }
  if (deal.priceTrend) {
    if (deal.priceTrend === 'declining') timingScore += 10; // Buy low
    else if (deal.priceTrend === 'rising') timingScore -= 5;
  }
  scores.marketTiming = Math.max(0, Math.min(100, timingScore));

  // Client Fit (10%)
  scores.clientFit = deal.clientFitScore != null ? Math.min(100, Math.max(0, deal.clientFitScore)) : 50;

  // Weighted composite
  const compositeScore = Math.round(
    scores.location * DEAL_SCORING_WEIGHTS.location +
    scores.financials * DEAL_SCORING_WEIGHTS.financials +
    scores.condition * DEAL_SCORING_WEIGHTS.condition +
    scores.marketTiming * DEAL_SCORING_WEIGHTS.marketTiming +
    scores.clientFit * DEAL_SCORING_WEIGHTS.clientFit
  );

  let recommendation;
  if (compositeScore >= 80) recommendation = 'STRONG_PURSUE';
  else if (compositeScore >= 65) recommendation = 'PURSUE';
  else if (compositeScore >= 50) recommendation = 'EVALUATE_FURTHER';
  else if (compositeScore >= 35) recommendation = 'CAUTION';
  else recommendation = 'PASS';

  return {
    compositeScore,
    recommendation,
    breakdown: scores,
    weights: DEAL_SCORING_WEIGHTS,
    generatedAt: new Date().toISOString(),
  };
}

// ── Deal Strategy ────────────────────────────────────────────────────────────

/**
 * Generate a recommended deal strategy.
 *
 * @param {object} deal — Deal context
 * @param {number} [deal.askingPrice] — Listed price
 * @param {number} [deal.estimatedValue] — Estimated fair market value
 * @param {string} [deal.sellerMotivation] — 'high', 'medium', 'low'
 * @param {number} [deal.daysOnMarket] — Days the listing has been active
 * @param {string} [deal.stage] — Current DEAL_STAGES id
 * @param {string} [deal.propertyType] — 'single-family', 'multi-family', 'condo', 'commercial'
 * @returns {object} Strategy recommendations
 */
export function generateDealStrategy(deal = {}) {
  const strategy = {
    negotiation: {},
    pricing: {},
    timeline: {},
    risks: [],
    keyActions: [],
  };

  // Pricing approach
  if (deal.askingPrice != null && deal.estimatedValue != null) {
    const spread = (deal.askingPrice - deal.estimatedValue) / deal.estimatedValue;
    if (spread > 0.10) {
      strategy.pricing.approach = 'AGGRESSIVE_BELOW_ASK';
      strategy.pricing.suggestedOffer = Math.round(deal.estimatedValue * 0.95);
      strategy.pricing.rationale = `Asking price ${(spread * 100).toFixed(1)}% above estimated value — room to negotiate.`;
    } else if (spread > 0) {
      strategy.pricing.approach = 'MODERATE_BELOW_ASK';
      strategy.pricing.suggestedOffer = Math.round(deal.estimatedValue);
      strategy.pricing.rationale = 'Asking price slightly above value — offer at estimated value.';
    } else {
      strategy.pricing.approach = 'AT_OR_NEAR_ASK';
      strategy.pricing.suggestedOffer = Math.round(deal.askingPrice * 0.98);
      strategy.pricing.rationale = 'Priced at or below value — competitive offer warranted.';
    }
  }

  // Negotiation posture
  if (deal.sellerMotivation === 'high') {
    strategy.negotiation.posture = 'ASSERTIVE';
    strategy.negotiation.tactics = [
      'Request seller concessions (closing costs, repairs)',
      'Push for shorter inspection period to appear strong',
      'Negotiate personal property inclusions',
    ];
  } else if (deal.sellerMotivation === 'low') {
    strategy.negotiation.posture = 'COLLABORATIVE';
    strategy.negotiation.tactics = [
      'Lead with clean offer and minimal contingencies',
      'Offer flexible closing date to accommodate seller',
      'Demonstrate proof of funds early',
    ];
  } else {
    strategy.negotiation.posture = 'BALANCED';
    strategy.negotiation.tactics = [
      'Standard contingencies with reasonable timelines',
      'Escalation clause if multiple offers expected',
      'Request seller disclosure early in process',
    ];
  }

  // Timeline
  if (deal.daysOnMarket != null) {
    if (deal.daysOnMarket > 90) {
      strategy.timeline.urgency = 'LOW';
      strategy.timeline.recommendation = 'Take time — listing is stale, leverage favors buyer.';
    } else if (deal.daysOnMarket > 30) {
      strategy.timeline.urgency = 'MODERATE';
      strategy.timeline.recommendation = 'Standard pace — submit within 48 hours of touring.';
    } else {
      strategy.timeline.urgency = 'HIGH';
      strategy.timeline.recommendation = 'Move quickly — fresh listing, competing offers likely.';
    }
  }

  strategy.timeline.estimatedClose = {
    'under-contract-to-close': '30-45 days (Florida standard)',
    dueDiligence: '10-15 days',
    appraisal: '7-14 days',
    titleSearch: '5-10 days',
  };

  // Risk factors
  if (deal.propertyType === 'condo') {
    strategy.risks.push('HOA financials and reserves require review');
    strategy.risks.push('Florida condo inspection law (SB 4-D) compliance check needed');
  }
  strategy.risks.push('Florida property insurance market — verify insurability and premium costs');
  strategy.risks.push('Flood zone determination required for all Treasure Coast properties');

  // Key actions
  strategy.keyActions = [
    'Pull comparable sales within 0.5 mile radius',
    'Verify property tax assessment and potential reassessment on sale',
    'Confirm zoning allows intended use (STR restrictions in some zones)',
    'Order Phase I environmental if commercial',
  ];

  return {
    dealId: deal.id || null,
    stage: deal.stage || 'prospect',
    strategy,
    generatedAt: new Date().toISOString(),
  };
}

// ── Comparable Analysis ──────────────────────────────────────────────────────

/**
 * Build a comparable analysis framework for a property.
 *
 * @param {object} property — Subject property
 * @param {string} [property.zone] — SERVICE_ZONES id
 * @param {string} [property.type] — Property type
 * @param {number} [property.sqft] — Square footage
 * @param {number} [property.bedrooms] — Bedroom count
 * @param {number} [property.yearBuilt] — Year constructed
 * @param {number} [radius=0.5] — Search radius in miles
 * @returns {object} Comp analysis framework
 */
export function analyzeComparables(property = {}, radius = 0.5) {
  const zoneInfo = property.zone ? SERVICE_ZONES.find(z => z.id === property.zone) : null;

  return {
    subject: {
      zone: zoneInfo || { id: property.zone || 'unknown' },
      type: property.type || 'unknown',
      sqft: property.sqft || null,
      bedrooms: property.bedrooms || null,
      yearBuilt: property.yearBuilt || null,
    },
    searchCriteria: {
      radius: `${radius} miles`,
      timeframe: '6 months (recent sales), 3 months preferred',
      adjustments: {
        sqft: 'Adjust +/- $100-150/sqft variance from subject',
        bedrooms: 'Adjust +/- $10,000-25,000 per bedroom differential',
        yearBuilt: 'Adjust +/- $5,000-15,000 per decade age difference',
        condition: 'Adjust based on renovation level (cosmetic vs. full rehab)',
        lot: 'Adjust for lot size, waterfront, golf course, preserve views',
      },
    },
    compCategories: {
      recentSales: {
        description: 'Closed sales within radius and timeframe',
        priority: 'PRIMARY — strongest indicator of market value',
        minComps: 3,
        idealComps: 5,
      },
      activeListings: {
        description: 'Currently active listings in the submarket',
        priority: 'SECONDARY — indicates seller expectations and competition',
        note: 'Listings are aspirational — typically close 3-5% below list',
      },
      pricePerSqft: {
        description: 'Trend line for $/sqft over trailing 12 months',
        priority: 'SUPPORTING — validates or challenges comp-derived value',
      },
    },
    county: zoneInfo ? zoneInfo.county : null,
    generatedAt: new Date().toISOString(),
  };
}

// ── Closing Cost Calculator ──────────────────────────────────────────────────

/**
 * Estimate closing costs for a Florida real estate transaction.
 *
 * @param {number} salePrice — Transaction sale price
 * @param {string} [type='buyer'] — 'buyer' or 'seller'
 * @returns {object} Itemized closing cost estimate
 */
export function calculateClosingCosts(salePrice, type = 'buyer') {
  if (!salePrice || salePrice <= 0) {
    return { error: 'Valid sale price required.' };
  }

  if (type === 'seller') {
    const realtorCommission = salePrice * 0.05;
    const titleInsurance = calcFloridaTitleInsurance(salePrice);
    const docStamps = salePrice * 0.007; // Florida doc stamps on deed
    const titleSearch = 250;
    const estoppelFee = 250;
    const prorations = Math.round(salePrice * 0.003);

    const total = realtorCommission + titleInsurance + docStamps + titleSearch + estoppelFee + prorations;

    return {
      salePrice,
      side: 'seller',
      items: [
        { name: 'Realtor Commission (5%)', amount: Math.round(realtorCommission) },
        { name: 'Title Insurance (Owner\'s Policy)', amount: Math.round(titleInsurance) },
        { name: 'Documentary Stamps on Deed ($0.70/$100)', amount: Math.round(docStamps) },
        { name: 'Title Search & Exam', amount: titleSearch },
        { name: 'Estoppel Letter Fee', amount: estoppelFee },
        { name: 'Tax/HOA Prorations (estimated)', amount: prorations },
      ],
      estimatedTotal: Math.round(total),
      percentOfSale: +((total / salePrice) * 100).toFixed(2) + '%',
      generatedAt: new Date().toISOString(),
    };
  }

  // Buyer closing costs
  const loanOrigination = salePrice * 0.01;
  const appraisal = 500;
  const inspection = 400;
  const survey = 350;
  const titleInsurance = calcFloridaTitleInsurance(salePrice);
  const intangibleTax = salePrice * 0.8 * 0.002; // On mortgage amount (assuming 80% LTV)
  const docStampsMortgage = salePrice * 0.8 * 0.0035; // FL doc stamps on mortgage
  const recording = 150;
  const insurance = Math.round(salePrice * 0.01); // Estimated annual, varies widely
  const escrowReserves = Math.round((salePrice * 0.015 + insurance) / 4); // ~3 months taxes + insurance
  const prorations = Math.round(salePrice * 0.003);

  const total = loanOrigination + appraisal + inspection + survey + titleInsurance +
    intangibleTax + docStampsMortgage + recording + insurance + escrowReserves + prorations;

  return {
    salePrice,
    side: 'buyer',
    assumptions: { ltv: '80%', loanAmount: Math.round(salePrice * 0.8) },
    items: [
      { name: 'Loan Origination Fee (1%)', amount: Math.round(loanOrigination) },
      { name: 'Appraisal', amount: appraisal },
      { name: 'Home Inspection', amount: inspection },
      { name: 'Survey', amount: survey },
      { name: 'Title Insurance (Lender\'s Policy)', amount: Math.round(titleInsurance) },
      { name: 'Intangible Tax on Mortgage (0.2%)', amount: Math.round(intangibleTax) },
      { name: 'Documentary Stamps on Mortgage ($0.35/$100)', amount: Math.round(docStampsMortgage) },
      { name: 'Recording Fees', amount: recording },
      { name: 'Homeowner\'s Insurance (1st year, estimated)', amount: insurance },
      { name: 'Escrow Reserves (~3 months)', amount: escrowReserves },
      { name: 'Tax/HOA Prorations (estimated)', amount: prorations },
    ],
    estimatedTotal: Math.round(total),
    percentOfSale: +((total / salePrice) * 100).toFixed(2) + '%',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Florida title insurance premium calculation (promulgated rates).
 * Per $1,000 of sale price: $5.75 for first $100k, $5.00 thereafter.
 */
function calcFloridaTitleInsurance(salePrice) {
  if (salePrice <= 100_000) return (salePrice / 1000) * 5.75;
  return (100 * 5.75) + (((salePrice - 100_000) / 1000) * 5.00);
}

// ── Investor Package ─────────────────────────────────────────────────────────

/**
 * Generate an investor-ready analysis package for a property.
 *
 * @param {object} property — Property details
 * @param {string} [property.address] — Property address
 * @param {string} [property.zone] — SERVICE_ZONES id
 * @param {number} [property.askingPrice] — Asking or acquisition price
 * @param {number} [property.monthlyRent] — Expected monthly rent
 * @param {number} [property.annualExpenses] — Total annual operating expenses
 * @param {number} [property.sqft] — Square footage
 * @param {string} [property.type] — Property type
 * @param {number} [property.yearBuilt] — Year constructed
 * @returns {object} Investor package framework
 */
export function generateInvestorPackage(property = {}) {
  const monthlyRent = property.monthlyRent || 0;
  const annualGross = monthlyRent * 12;
  const annualExpenses = property.annualExpenses || annualGross * 0.40; // Default 40% expense ratio
  const noi = annualGross - annualExpenses;
  const askingPrice = property.askingPrice || 0;
  const capRate = askingPrice > 0 ? noi / askingPrice : 0;

  // Cash-on-cash with 80% LTV at 7% interest (30yr)
  const downPayment = askingPrice * 0.20;
  const loanAmount = askingPrice * 0.80;
  const monthlyPayment = loanAmount > 0
    ? loanAmount * (0.07 / 12) * Math.pow(1 + 0.07 / 12, 360) / (Math.pow(1 + 0.07 / 12, 360) - 1)
    : 0;
  const annualDebtService = monthlyPayment * 12;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = downPayment > 0 ? cashFlow / downPayment : 0;

  const zoneInfo = property.zone ? SERVICE_ZONES.find(z => z.id === property.zone) : null;

  return {
    propertyOverview: {
      address: property.address || 'TBD',
      zone: zoneInfo || { id: property.zone || 'unknown' },
      type: property.type || 'unknown',
      sqft: property.sqft || null,
      yearBuilt: property.yearBuilt || null,
    },
    proForma: {
      acquisitionPrice: askingPrice,
      annualGrossRent: annualGross,
      annualExpenses: Math.round(annualExpenses),
      expenseRatio: annualGross > 0 ? +((annualExpenses / annualGross) * 100).toFixed(1) + '%' : 'N/A',
      noi: Math.round(noi),
      capRate: +(capRate * 100).toFixed(2) + '%',
    },
    financing: {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(loanAmount),
      interestRate: '7.00%',
      term: '30 years',
      monthlyPayment: Math.round(monthlyPayment),
      annualDebtService: Math.round(annualDebtService),
    },
    returns: {
      annualCashFlow: Math.round(cashFlow),
      cashOnCashReturn: +(cashOnCash * 100).toFixed(2) + '%',
      debtCoverageRatio: annualDebtService > 0 ? +(noi / annualDebtService).toFixed(2) : 'N/A',
    },
    marketOverview: {
      region: 'Treasure Coast, Florida',
      county: zoneInfo ? zoneInfo.county : null,
      highlights: [
        'Growing population corridor between Palm Beach and Orlando',
        'Favorable landlord-tenant laws in Florida',
        'No state income tax — attractive to investors and tenants',
        'Strong STR demand in coastal zones (Vero Beach, Stuart, Jupiter)',
      ],
    },
    riskFactors: [
      'Hurricane exposure — verify wind mitigation and flood insurance requirements',
      'Florida property insurance market volatility',
      'Rising property taxes upon acquisition (Save Our Homes portability loss)',
      'STR regulation changes in Martin and Indian River counties',
      'Interest rate sensitivity on variable-rate financing',
    ],
    generatedAt: new Date().toISOString(),
  };
}

// ── Portfolio Evaluation ─────────────────────────────────────────────────────

/**
 * Evaluate a portfolio of properties for diversification, risk, and growth.
 *
 * @param {Array<object>} properties — Array of property objects
 * @param {string} [properties[].zone] — SERVICE_ZONES id
 * @param {string} [properties[].type] — Property type
 * @param {number} [properties[].value] — Current estimated value
 * @param {number} [properties[].noi] — Annual NOI
 * @param {number} [properties[].occupancy] — 0-1 occupancy rate
 * @returns {object} Portfolio-level analysis
 */
export function evaluatePortfolio(properties = []) {
  if (properties.length === 0) {
    return { totalProperties: 0, status: 'EMPTY', generatedAt: new Date().toISOString() };
  }

  const totalValue = properties.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalNoi = properties.reduce((sum, p) => sum + (p.noi || 0), 0);
  const portfolioCapRate = totalValue > 0 ? totalNoi / totalValue : 0;

  // Zone diversification
  const zoneCounts = {};
  const typeCounts = {};
  for (const p of properties) {
    const z = p.zone || 'unknown';
    const t = p.type || 'unknown';
    zoneCounts[z] = (zoneCounts[z] || 0) + 1;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  // Concentration risk — any zone > 50% of portfolio?
  const zoneConcentration = {};
  for (const [zone, count] of Object.entries(zoneCounts)) {
    zoneConcentration[zone] = {
      count,
      percent: +((count / properties.length) * 100).toFixed(1) + '%',
    };
  }

  const maxZoneConcentration = Math.max(...Object.values(zoneCounts)) / properties.length;
  const maxTypeConcentration = Math.max(...Object.values(typeCounts)) / properties.length;

  // Occupancy analysis
  const occupancies = properties.filter(p => p.occupancy != null).map(p => p.occupancy);
  const avgOccupancy = occupancies.length > 0
    ? occupancies.reduce((a, b) => a + b, 0) / occupancies.length
    : null;

  // Risk assessment
  const risks = [];
  if (maxZoneConcentration > 0.5) risks.push('GEOGRAPHIC_CONCENTRATION — over 50% of portfolio in one zone');
  if (maxTypeConcentration > 0.7) risks.push('TYPE_CONCENTRATION — over 70% of portfolio is one property type');
  if (avgOccupancy != null && avgOccupancy < 0.85) risks.push('LOW_OCCUPANCY — portfolio average below 85%');
  if (portfolioCapRate < 0.05) risks.push('LOW_YIELD — portfolio cap rate below 5%');

  // Growth potential
  const growthFactors = [];
  if (avgOccupancy != null && avgOccupancy < 0.95) {
    growthFactors.push(`Occupancy upside — current ${(avgOccupancy * 100).toFixed(1)}%, target 95%`);
  }
  if (properties.length < 10) {
    growthFactors.push('Scale opportunity — portfolio under 10 units, operational leverage available');
  }
  const underrepresentedZones = SERVICE_ZONES.filter(z => !zoneCounts[z.id]);
  if (underrepresentedZones.length > 0) {
    growthFactors.push(`Geographic expansion — ${underrepresentedZones.length} Treasure Coast zones not yet represented`);
  }

  let diversificationScore;
  const uniqueZones = Object.keys(zoneCounts).length;
  const uniqueTypes = Object.keys(typeCounts).length;
  if (uniqueZones >= 4 && uniqueTypes >= 3) diversificationScore = 'WELL_DIVERSIFIED';
  else if (uniqueZones >= 2 && uniqueTypes >= 2) diversificationScore = 'MODERATELY_DIVERSIFIED';
  else diversificationScore = 'CONCENTRATED';

  return {
    totalProperties: properties.length,
    totalValue: Math.round(totalValue),
    totalNoi: Math.round(totalNoi),
    portfolioCapRate: +(portfolioCapRate * 100).toFixed(2) + '%',
    avgOccupancy: avgOccupancy != null ? +(avgOccupancy * 100).toFixed(1) + '%' : 'N/A',
    diversification: {
      score: diversificationScore,
      byZone: zoneConcentration,
      byType: typeCounts,
      uniqueZones,
      uniqueTypes,
    },
    riskExposure: risks,
    growthPotential: growthFactors,
    generatedAt: new Date().toISOString(),
  };
}
