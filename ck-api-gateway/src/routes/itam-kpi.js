/**
 * ITAM KPI Routes — /v1/itam/*
 */

import {
  CLIENT_TRUST_KPIS, OPERATIONAL_KPIS, FINANCIAL_KPIS,
  EMPLOYEE_KPIS, ASSET_KPIS, STRATEGIC_THEMES,
  scoreKpi, calculateTCO, calculateHealthScore, getITAMDashboard,
} from '../engines/itam-kpi.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
});

const CATEGORIES = {
  clientTrust: CLIENT_TRUST_KPIS,
  operational: OPERATIONAL_KPIS,
  financial: FINANCIAL_KPIS,
  employee: EMPLOYEE_KPIS,
  asset: ASSET_KPIS,
};

export function handleITAMDashboard() {
  return json(getITAMDashboard());
}

export function handleITAMKpis() {
  const allKpis = {};
  for (const [cat, kpis] of Object.entries(CATEGORIES)) {
    allKpis[cat] = Object.values(kpis);
  }
  return json({
    count: Object.values(allKpis).reduce((s, a) => s + a.length, 0),
    categories: allKpis,
  });
}

export function handleITAMCategory(category) {
  const kpis = CATEGORIES[category];
  if (!kpis) {
    return json({ error: 'Unknown category', valid: Object.keys(CATEGORIES) }, 400);
  }
  return json({
    category,
    count: Object.keys(kpis).length,
    kpis: Object.values(kpis),
  });
}

export function handleITAMScore(body) {
  if (!body || !body.kpiId || body.actual === undefined) {
    return json({ error: 'Required: kpiId, actual' }, 400);
  }

  let kpi = null;
  for (const cat of Object.values(CATEGORIES)) {
    for (const k of Object.values(cat)) {
      if (k.id === body.kpiId) { kpi = k; break; }
    }
    if (kpi) break;
  }

  for (const k of Object.values(STRATEGIC_THEMES)) {
    if (k.id === body.kpiId) { kpi = k; break; }
  }

  if (!kpi) {
    return json({ error: `KPI not found: ${body.kpiId}` }, 404);
  }

  const result = scoreKpi(kpi, body.actual);
  return json({
    kpi: { id: kpi.id, name: kpi.name, target: kpi.target, unit: kpi.unit },
    actual: body.actual,
    ...result,
  });
}

export function handleITAMTco(body) {
  if (!body || !body.id || !body.purchasePrice) {
    return json({ error: 'Required: id, purchasePrice, name' }, 400);
  }
  return json(calculateTCO(body));
}

export function handleITAMHealth() {
  const sampleMetrics = {
    clientTrust: Object.values(CLIENT_TRUST_KPIS).map(k => ({
      id: k.id,
      ...scoreKpi(k, k.target),
    })),
    operational: Object.values(OPERATIONAL_KPIS).map(k => ({
      id: k.id,
      ...scoreKpi(k, k.target),
    })),
    financial: Object.values(FINANCIAL_KPIS).map(k => ({
      id: k.id,
      ...scoreKpi(k, k.target),
    })),
    asset: Object.values(ASSET_KPIS).map(k => ({
      id: k.id,
      ...scoreKpi(k, k.target),
    })),
    employee: Object.values(EMPLOYEE_KPIS).map(k => ({
      id: k.id,
      ...scoreKpi(k, k.target),
    })),
  };

  return json(calculateHealthScore(sampleMetrics));
}

export function handleITAMStrategic() {
  return json({
    count: Object.keys(STRATEGIC_THEMES).length,
    themes: Object.values(STRATEGIC_THEMES),
  });
}
