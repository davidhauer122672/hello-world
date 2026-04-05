/**
 * Coastal Key Financial Intelligence Engine
 *
 * Revenue modeling, fee calculation, ROI analysis, budgeting,
 * and dynamic pricing for Treasure Coast property management.
 */

import { SERVICE_ZONES } from '../agents/constants.js';

// ── Revenue Models ──────────────────────────────────────────────────────────

export const REVENUE_MODELS = {
  managementFees: {
    description: 'Monthly management fee as percentage of collected rent',
    rates: {
      single_family: { min: 0.08, max: 0.10, default: 0.10 },
      condo:         { min: 0.08, max: 0.10, default: 0.08 },
      luxury:        { min: 0.06, max: 0.08, default: 0.07 },
      str:           { min: 0.15, max: 0.25, default: 0.20 },
      multi_family:  { min: 0.04, max: 0.08, default: 0.06 },
    },
  },
  leasingFees: {
    description: 'One-time fee for tenant placement',
    rates: {
      single_family: { flatFee: null, percentOfAnnualRent: 0.50 },
      condo:         { flatFee: null, percentOfAnnualRent: 0.50 },
      luxury:        { flatFee: null, percentOfAnnualRent: 0.75 },
      multi_family:  { flatFee: 500, percentOfAnnualRent: null },
    },
  },
  maintenanceMarkup: {
    description: 'Markup on vendor maintenance invoices',
    standardMarkup: 0.10,
    emergencyMarkup: 0.15,
    capitalProjectMarkup: 0.05,
  },
  concierge: {
    description: 'Concierge services for luxury and STR properties',
    hourlyRate: 75,
    packageMonthly: 500,
    premiumPackageMonthly: 1200,
  },
  homeWatch: {
    description: 'Scheduled home watch visits for absent owners',
    perVisit: 65,
    weeklyPackage: 225,
    biWeeklyPackage: 125,
  },
  consultingFees: {
    description: 'Advisory services for investors and developers',
    hourlyRate: 250,
    portfolioReviewFlat: 2500,
    investmentAnalysisFlat: 1500,
  },
};

// ── Expense Categories ──────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  { id: 'maintenance',  label: 'Maintenance & Repairs',  budgetPct: 0.15 },
  { id: 'insurance',    label: 'Property Insurance',     budgetPct: 0.08 },
  { id: 'taxes',        label: 'Property Taxes',         budgetPct: 0.12 },
  { id: 'utilities',    label: 'Utilities',              budgetPct: 0.06 },
  { id: 'hoa',          label: 'HOA / Condo Fees',       budgetPct: 0.10 },
  { id: 'marketing',    label: 'Marketing & Advertising', budgetPct: 0.05 },
  { id: 'legal',        label: 'Legal & Accounting',     budgetPct: 0.03 },
  { id: 'reserves',     label: 'Capital Reserves',       budgetPct: 0.05 },
  { id: 'landscaping',  label: 'Landscaping & Grounds',  budgetPct: 0.04 },
  { id: 'pest_control', label: 'Pest Control',           budgetPct: 0.01 },
  { id: 'pool',         label: 'Pool & Spa',             budgetPct: 0.02 },
  { id: 'cleaning',     label: 'Cleaning & Turnover',    budgetPct: 0.04 },
  { id: 'technology',   label: 'Smart Home & Tech',      budgetPct: 0.02 },
  { id: 'management',   label: 'Management Fee',         budgetPct: 0.10 },
  { id: 'vacancy',      label: 'Vacancy Loss',           budgetPct: 0.05 },
];

// ── Financial Benchmarks ────────────────────────────────────────────────────

export const FINANCIAL_BENCHMARKS = {
  vacancyRate: {
    classA: 0.03,   // Luxury / waterfront
    classB: 0.05,   // Mid-market single family
    classC: 0.07,   // Workforce housing
    str:    0.25,   // STR (seasonal occupancy target 75%+)
  },
  expenseRatio: {
    target: 0.40,     // Operating expenses as % of gross income
    excellent: 0.35,
    warning: 0.50,
    critical: 0.60,
  },
  maintenanceReserve: {
    perUnit: 2500,    // Annual reserve per unit
    percentOfRent: 0.10,
  },
  roi: {
    classA: { capRate: { min: 0.04, target: 0.055 }, cashOnCash: { min: 0.05, target: 0.07 } },
    classB: { capRate: { min: 0.05, target: 0.07 },  cashOnCash: { min: 0.06, target: 0.09 } },
    classC: { capRate: { min: 0.06, target: 0.09 },  cashOnCash: { min: 0.08, target: 0.12 } },
    str:    { capRate: { min: 0.06, target: 0.10 },  cashOnCash: { min: 0.08, target: 0.15 } },
  },
  dscr: {
    minimum: 1.20,
    target: 1.40,
    excellent: 1.60,
  },
  rentToValue: {
    singleFamily: 0.006,  // 0.6% monthly rent-to-value ratio
    condo: 0.007,
    luxury: 0.004,
    str: 0.010,
  },
};

// ── Zone Pricing Data ───────────────────────────────────────────────────────

const ZONE_MARKET_DATA = {
  vero_beach:       { medianRent: 2800, medianPrice: 425000, pricePerSqft: 285, avgDOM: 45 },
  sebastian:        { medianRent: 2200, medianPrice: 350000, pricePerSqft: 235, avgDOM: 52 },
  fort_pierce:      { medianRent: 1900, medianPrice: 290000, pricePerSqft: 195, avgDOM: 58 },
  port_saint_lucie: { medianRent: 2300, medianPrice: 365000, pricePerSqft: 225, avgDOM: 48 },
  jensen_beach:     { medianRent: 2600, medianPrice: 395000, pricePerSqft: 270, avgDOM: 42 },
  palm_city:        { medianRent: 2900, medianPrice: 450000, pricePerSqft: 290, avgDOM: 40 },
  stuart:           { medianRent: 2700, medianPrice: 420000, pricePerSqft: 275, avgDOM: 44 },
  hobe_sound:       { medianRent: 3200, medianPrice: 520000, pricePerSqft: 310, avgDOM: 38 },
  jupiter:          { medianRent: 3800, medianPrice: 650000, pricePerSqft: 380, avgDOM: 35 },
  north_palm_beach: { medianRent: 3500, medianPrice: 580000, pricePerSqft: 350, avgDOM: 37 },
};

// ── Fee Calculation ─────────────────────────────────────────────────────────

export function calculateManagementFee(monthlyRent, propertyType = 'single_family', zoneId = null) {
  const typeRates = REVENUE_MODELS.managementFees.rates[propertyType]
    || REVENUE_MODELS.managementFees.rates.single_family;

  let rate = typeRates.default;

  // Premium zones get slightly lower rates for luxury properties
  if (zoneId && ['jupiter', 'north_palm_beach', 'hobe_sound'].includes(zoneId)) {
    if (propertyType === 'luxury') rate = typeRates.min;
  }

  // Volume discount for higher-rent properties
  if (monthlyRent > 5000) rate = Math.max(typeRates.min, rate - 0.01);

  const monthlyFee = monthlyRent * rate;
  const annualFee = monthlyFee * 12;

  return {
    rate,
    monthlyFee: Math.round(monthlyFee * 100) / 100,
    annualFee: Math.round(annualFee * 100) / 100,
    propertyType,
    zoneId,
  };
}

// ── Rent Estimate ───────────────────────────────────────────────────────────

export function calculateRentEstimate(property) {
  const { zoneId, sqft, bedrooms, bathrooms, propertyType = 'single_family', features = [] } = property;

  const zoneData = ZONE_MARKET_DATA[zoneId];
  if (!zoneData) return { error: `Unknown zone: ${zoneId}` };

  let estimate = zoneData.medianRent;

  // Adjust for size relative to zone average (~1500 sqft baseline)
  if (sqft) {
    const sizeFactor = sqft / 1500;
    estimate *= (0.4 + 0.6 * sizeFactor); // Partial scaling
  }

  // Bedroom adjustment
  if (bedrooms) {
    const bedroomDelta = bedrooms - 3; // 3BR is baseline
    estimate += bedroomDelta * 200;
  }

  // Bathroom adjustment
  if (bathrooms) {
    const bathDelta = bathrooms - 2; // 2BA is baseline
    estimate += bathDelta * 100;
  }

  // Feature premiums
  const featurePremiums = {
    pool: 300, waterfront: 500, water_view: 250, gated: 150,
    garage: 100, updated_kitchen: 200, hurricane_shutters: 75,
    smart_home: 100, dock: 350, furnished: 400,
  };
  for (const f of features) {
    if (featurePremiums[f]) estimate += featurePremiums[f];
  }

  // STR multiplier
  if (propertyType === 'str') estimate *= 1.8;

  const low = Math.round(estimate * 0.92);
  const high = Math.round(estimate * 1.08);
  estimate = Math.round(estimate);

  return { estimate, range: { low, high }, zoneId, medianForZone: zoneData.medianRent };
}

// ── ROI Analysis ────────────────────────────────────────────────────────────

export function analyzePropertyROI(property) {
  const {
    purchasePrice, monthlyRent, annualExpenses, downPaymentPct = 0.25,
    interestRate = 0.07, loanTermYears = 30, propertyType = 'single_family',
  } = property;

  if (!purchasePrice || !monthlyRent) return { error: 'purchasePrice and monthlyRent required' };

  const annualRent = monthlyRent * 12;
  const expenses = annualExpenses || annualRent * FINANCIAL_BENCHMARKS.expenseRatio.target;
  const noi = annualRent - expenses;
  const capRate = noi / purchasePrice;

  // Mortgage calculation
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const numPayments = loanTermYears * 12;
  const monthlyMortgage = loanAmount > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
      / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const annualDebtService = monthlyMortgage * 12;

  const cashFlow = noi - annualDebtService;
  const cashOnCash = downPayment > 0 ? cashFlow / downPayment : null;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : null;

  // 5-year IRR estimate (simplified — assumes 3% annual appreciation)
  const appreciationRate = 0.03;
  const cashFlows = [-downPayment];
  for (let y = 1; y <= 5; y++) {
    cashFlows.push(cashFlow);
  }
  const saleValue = purchasePrice * Math.pow(1 + appreciationRate, 5);
  const remainingLoan = loanAmount * (1 - 5 / loanTermYears); // Simplified
  cashFlows[5] += saleValue - remainingLoan;
  const irr = estimateIRR(cashFlows);

  // Rating
  const benchmarks = FINANCIAL_BENCHMARKS.roi[propertyType] || FINANCIAL_BENCHMARKS.roi.classB;
  let rating = 'below-target';
  if (capRate >= benchmarks.capRate.target) rating = 'strong';
  else if (capRate >= benchmarks.capRate.min) rating = 'acceptable';

  return {
    annualRent,
    expenses: Math.round(expenses),
    noi: Math.round(noi),
    capRate: Math.round(capRate * 10000) / 10000,
    cashFlow: Math.round(cashFlow),
    cashOnCash: cashOnCash ? Math.round(cashOnCash * 10000) / 10000 : null,
    dscr: dscr ? Math.round(dscr * 100) / 100 : null,
    irr5Year: irr ? Math.round(irr * 10000) / 10000 : null,
    monthlyMortgage: Math.round(monthlyMortgage),
    rating,
    benchmarks,
  };
}

function estimateIRR(cashFlows, tolerance = 0.0001, maxIter = 100) {
  let low = -0.5, high = 2.0;
  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2;
    const npv = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + mid, t), 0);
    if (Math.abs(npv) < tolerance) return mid;
    if (npv > 0) low = mid; else high = mid;
  }
  return (low + high) / 2;
}

// ── Financial Forecast ──────────────────────────────────────────────────────

export function generateFinancialForecast(portfolio) {
  const { properties = [], growthRate = 0.03, expenseInflation = 0.025 } = portfolio;

  if (properties.length === 0) return { error: 'No properties in portfolio' };

  const months = [];
  let totalAnnualRent = 0;
  let totalAnnualExpenses = 0;

  for (const p of properties) {
    totalAnnualRent += (p.monthlyRent || 0) * 12;
    totalAnnualExpenses += p.annualExpenses || (p.monthlyRent || 0) * 12 * FINANCIAL_BENCHMARKS.expenseRatio.target;
  }

  const monthlyRentBase = totalAnnualRent / 12;
  const monthlyExpenseBase = totalAnnualExpenses / 12;

  for (let m = 1; m <= 12; m++) {
    const growthFactor = 1 + (growthRate * m / 12);
    const expenseFactor = 1 + (expenseInflation * m / 12);

    const revenue = Math.round(monthlyRentBase * growthFactor);
    const expenses = Math.round(monthlyExpenseBase * expenseFactor);
    const noi = revenue - expenses;

    months.push({
      month: m,
      revenue,
      expenses,
      noi,
      cumulativeNOI: months.length > 0 ? months[months.length - 1].cumulativeNOI + noi : noi,
    });
  }

  return {
    propertyCount: properties.length,
    annualRevenue: Math.round(totalAnnualRent * (1 + growthRate)),
    annualExpenses: Math.round(totalAnnualExpenses * (1 + expenseInflation)),
    annualNOI: months[11].cumulativeNOI,
    expenseRatio: Math.round((totalAnnualExpenses / totalAnnualRent) * 100) / 100,
    months,
  };
}

// ── Dynamic Pricing Strategy ────────────────────────────────────────────────

export function generatePricingStrategy(zoneId, marketData = {}) {
  const zoneInfo = SERVICE_ZONES.find(z => z.id === zoneId);
  const baseData = ZONE_MARKET_DATA[zoneId];
  if (!zoneInfo || !baseData) return { error: `Unknown zone: ${zoneId}` };

  const {
    currentOccupancy = 0.95,
    competitorAvgFee = 0.10,
    seasonalMultiplier = 1.0,
    demandIndex = 1.0,
  } = marketData;

  // Price positioning
  let recommendedRate = competitorAvgFee;

  // If high occupancy, can push rates up
  if (currentOccupancy > 0.95) recommendedRate *= 1.05;
  else if (currentOccupancy < 0.85) recommendedRate *= 0.95;

  // Seasonal adjustment
  recommendedRate *= seasonalMultiplier;

  // Demand adjustment
  if (demandIndex > 1.2) recommendedRate *= 1.03;
  else if (demandIndex < 0.8) recommendedRate *= 0.97;

  const recommendedFee = Math.round(baseData.medianRent * recommendedRate);

  return {
    zone: zoneInfo.label,
    county: zoneInfo.county,
    medianRent: baseData.medianRent,
    medianPrice: baseData.medianPrice,
    pricePerSqft: baseData.pricePerSqft,
    avgDaysOnMarket: baseData.avgDOM,
    recommendedManagementRate: Math.round(recommendedRate * 1000) / 1000,
    recommendedMonthlyFee: recommendedFee,
    positioning: recommendedRate > competitorAvgFee ? 'premium' : 'competitive',
    factors: { currentOccupancy, competitorAvgFee, seasonalMultiplier, demandIndex },
  };
}

// ── Budget Generation ───────────────────────────────────────────────────────

export function generateBudget(property, year) {
  const { monthlyRent, propertyType = 'single_family', zoneId } = property;
  if (!monthlyRent) return { error: 'monthlyRent required' };

  const annualRent = monthlyRent * 12;
  const vacancyRate = FINANCIAL_BENCHMARKS.vacancyRate[propertyType]
    || FINANCIAL_BENCHMARKS.vacancyRate.classB;
  const effectiveIncome = annualRent * (1 - vacancyRate);

  const lineItems = EXPENSE_CATEGORIES.map(cat => ({
    category: cat.id,
    label: cat.label,
    annual: Math.round(effectiveIncome * cat.budgetPct),
    monthly: Math.round((effectiveIncome * cat.budgetPct) / 12),
    percentOfIncome: cat.budgetPct,
  }));

  const totalExpenses = lineItems.reduce((s, li) => s + li.annual, 0);
  const noi = effectiveIncome - totalExpenses;

  return {
    year,
    propertyType,
    zoneId,
    grossIncome: annualRent,
    vacancyLoss: Math.round(annualRent * vacancyRate),
    effectiveIncome: Math.round(effectiveIncome),
    lineItems,
    totalExpenses,
    noi: Math.round(noi),
    expenseRatio: Math.round((totalExpenses / effectiveIncome) * 100) / 100,
  };
}
