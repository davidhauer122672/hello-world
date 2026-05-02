import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

async function body(res) { return JSON.parse(await res.text()); }

// ── ITAM KPI Engine ────────────────────────────────────────────────────────

describe('ITAM KPI Engine', async () => {
  const {
    CLIENT_TRUST_KPIS, OPERATIONAL_KPIS, FINANCIAL_KPIS,
    EMPLOYEE_KPIS, ASSET_KPIS, STRATEGIC_THEMES,
    scoreKpi, calculateTCO, calculateHealthScore, getITAMDashboard,
  } = await import('../engines/itam-kpi.js');

  it('defines 5 client trust KPIs', () => {
    assert.equal(Object.keys(CLIENT_TRUST_KPIS).length, 5);
    assert.ok(CLIENT_TRUST_KPIS.clientRetentionRate);
    assert.ok(CLIENT_TRUST_KPIS.netPromoterScore);
    assert.equal(CLIENT_TRUST_KPIS.clientRetentionRate.priority, 'P0');
  });

  it('defines 5 operational KPIs', () => {
    assert.equal(Object.keys(OPERATIONAL_KPIS).length, 5);
    assert.ok(OPERATIONAL_KPIS.firstTimeFixRate);
    assert.ok(OPERATIONAL_KPIS.inspectionAccuracyRate);
    assert.ok(OPERATIONAL_KPIS.missedInspectionRate);
    assert.ok(OPERATIONAL_KPIS.meanTimeToDetect);
  });

  it('defines 6 financial KPIs', () => {
    assert.equal(Object.keys(FINANCIAL_KPIS).length, 6);
    assert.ok(FINANCIAL_KPIS.grossMarginPercentage);
    assert.ok(FINANCIAL_KPIS.customerLifetimeValue);
    assert.ok(FINANCIAL_KPIS.customerAcquisitionCost);
    assert.ok(FINANCIAL_KPIS.serviceMixRevenueShare);
  });

  it('defines 3 employee KPIs', () => {
    assert.equal(Object.keys(EMPLOYEE_KPIS).length, 3);
    assert.ok(EMPLOYEE_KPIS.technicianUtilizationRate);
    assert.ok(EMPLOYEE_KPIS.averageInspectionTime);
  });

  it('defines 7 asset management KPIs', () => {
    assert.equal(Object.keys(ASSET_KPIS).length, 7);
    assert.ok(ASSET_KPIS.lifecycleCost);
    assert.ok(ASSET_KPIS.downtimeFrequency);
    assert.ok(ASSET_KPIS.warrantyStatus);
    assert.ok(ASSET_KPIS.softwareReclamationRate);
    assert.ok(ASSET_KPIS.licenseComplianceRate);
  });

  it('defines 3 strategic themes', () => {
    assert.equal(Object.keys(STRATEGIC_THEMES).length, 3);
    assert.ok(STRATEGIC_THEMES.serviceToCashCycle);
    assert.ok(STRATEGIC_THEMES.agedAccountsReceivable);
    assert.ok(STRATEGIC_THEMES.brandSentiment);
  });

  it('scores a green KPI correctly', () => {
    const result = scoreKpi(CLIENT_TRUST_KPIS.clientRetentionRate, 97);
    assert.equal(result.status, 'GREEN');
    assert.equal(result.score, 100);
  });

  it('scores a yellow KPI correctly', () => {
    const result = scoreKpi(CLIENT_TRUST_KPIS.clientRetentionRate, 88);
    assert.equal(result.status, 'YELLOW');
    assert.equal(result.score, 60);
  });

  it('scores a red KPI correctly', () => {
    const result = scoreKpi(CLIENT_TRUST_KPIS.clientRetentionRate, 60);
    assert.equal(result.status, 'RED');
    assert.equal(result.score, 20);
  });

  it('scores inverted KPIs correctly (lower is better)', () => {
    const green = scoreKpi(OPERATIONAL_KPIS.missedInspectionRate, 0.5);
    assert.equal(green.status, 'GREEN');
    const red = scoreKpi(OPERATIONAL_KPIS.missedInspectionRate, 15);
    assert.equal(red.status, 'RED');
  });

  it('handles null actual value', () => {
    const result = scoreKpi(CLIENT_TRUST_KPIS.clientRetentionRate, null);
    assert.equal(result.status, 'NO_DATA');
  });

  it('calculates TCO correctly', () => {
    const tco = calculateTCO({
      id: 'ASSET-001',
      name: 'Cloudflare Workers Platform',
      purchasePrice: 0,
      installationCost: 500,
      configurationCost: 200,
      annualLicensing: 240,
      annualHosting: 60,
      annualEnergy: 0,
      yearsOwned: 3,
      totalMaintenanceCost: 150,
      estimatedDisposalCost: 0,
      annualValueGenerated: 50000,
    });
    assert.equal(tco.breakdown.acquisition, 700);
    assert.equal(tco.breakdown.operations, 900);
    assert.equal(tco.breakdown.maintenance, 150);
    assert.equal(tco.totalTCO, 1750);
    assert.ok(tco.annualizedTCO > 0);
    assert.ok(tco.roiBreakeven < 1);
  });

  it('calculates composite health score', () => {
    const metrics = {
      clientTrust: [{ score: 100 }, { score: 80 }],
      operational: [{ score: 100 }],
      financial: [{ score: 60 }],
      asset: [{ score: 100 }],
      employee: [{ score: 80 }],
    };
    const health = calculateHealthScore(metrics);
    assert.ok(health.overallScore >= 0 && health.overallScore <= 100);
    assert.ok(['A', 'B', 'C', 'D', 'F'].includes(health.grade));
    assert.ok(health.categories.clientTrust);
    assert.equal(health.categories.clientTrust.weight, 0.30);
  });

  it('generates dashboard with all categories', () => {
    const d = getITAMDashboard();
    assert.equal(d.engine, 'ITAM KPI Engine');
    assert.ok(d.categories.clientTrust);
    assert.ok(d.categories.operational);
    assert.ok(d.categories.financial);
    assert.ok(d.categories.employee);
    assert.ok(d.categories.asset);
    assert.equal(d.categories.clientTrust.priority, 'MOST CRITICAL');
    assert.equal(d.totalKpis, 26);
    assert.equal(d.totalWithStrategic, 29);
    assert.ok(d.strategicThemes.length === 3);
    assert.ok(d.endpoints.dashboard);
  });
});

// ── ITAM KPI Routes ────────────────────────────────────────────────────────

describe('ITAM KPI Routes', async () => {
  const {
    handleITAMDashboard, handleITAMKpis, handleITAMCategory,
    handleITAMScore, handleITAMTco, handleITAMHealth, handleITAMStrategic,
  } = await import('../routes/itam-kpi.js');

  it('GET /v1/itam/dashboard returns engine overview', async () => {
    const res = handleITAMDashboard();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.engine, 'ITAM KPI Engine');
    assert.equal(b.totalKpis, 26);
  });

  it('GET /v1/itam/kpis returns all KPIs', async () => {
    const res = handleITAMKpis();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.count, 26);
    assert.ok(b.categories.clientTrust);
    assert.ok(b.categories.asset);
  });

  it('GET /v1/itam/kpis/:category returns category KPIs', async () => {
    const res = handleITAMCategory('operational');
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.category, 'operational');
    assert.equal(b.count, 5);
  });

  it('GET /v1/itam/kpis/:category rejects invalid category', async () => {
    const res = handleITAMCategory('fake');
    assert.equal(res.status, 400);
  });

  it('POST /v1/itam/score scores a KPI', async () => {
    const res = handleITAMScore({ kpiId: 'CTR-001', actual: 97 });
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.status, 'GREEN');
    assert.equal(b.actual, 97);
  });

  it('POST /v1/itam/score rejects missing fields', async () => {
    const res = handleITAMScore({});
    assert.equal(res.status, 400);
  });

  it('POST /v1/itam/score returns 404 for unknown KPI', async () => {
    const res = handleITAMScore({ kpiId: 'FAKE-999', actual: 50 });
    assert.equal(res.status, 404);
  });

  it('POST /v1/itam/tco calculates TCO', async () => {
    const res = handleITAMTco({ id: 'A1', name: 'Test', purchasePrice: 1000, yearsOwned: 2 });
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.breakdown.acquisition, 1000);
    assert.ok(b.totalTCO >= 1000);
  });

  it('POST /v1/itam/tco rejects missing fields', async () => {
    const res = handleITAMTco({});
    assert.equal(res.status, 400);
  });

  it('GET /v1/itam/health returns composite score', async () => {
    const res = handleITAMHealth();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b.overallScore >= 0);
    assert.ok(b.grade);
    assert.ok(b.categories);
  });

  it('GET /v1/itam/strategic returns 3 themes', async () => {
    const res = handleITAMStrategic();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.count, 3);
    assert.ok(b.themes.find(t => t.id === 'STR-001'));
  });
});
