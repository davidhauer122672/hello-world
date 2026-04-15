/**
 * Field Inspection Engine — Property Inspection Logging & Reporting
 *
 * Closes the Day 43 Field Reporting Gap.
 * Provides structured inspection creation, photo documentation references,
 * deficiency tracking, and inspector assignment.
 *
 * Integrates with: Airtable (Inspections table), OPS division agents,
 * Intelligence Officers (IO-B01 schema consistency).
 */

// ── Inspection Types ───────────────────────────────────────────────────────

export const INSPECTION_TYPES = {
  homeWatch: { label: 'Home Watch Visit', frequency: 'weekly/biweekly', duration: 30, checklist: ['exterior', 'interior', 'plumbing', 'hvac', 'electrical', 'security', 'landscape', 'pool'] },
  moveIn: { label: 'Move-In Inspection', frequency: 'per-event', duration: 60, checklist: ['walls', 'floors', 'fixtures', 'appliances', 'plumbing', 'electrical', 'exterior', 'hvac', 'keys', 'meter-readings'] },
  moveOut: { label: 'Move-Out Inspection', frequency: 'per-event', duration: 60, checklist: ['walls', 'floors', 'fixtures', 'appliances', 'plumbing', 'electrical', 'exterior', 'hvac', 'damage-assessment', 'cleaning-needed'] },
  quarterly: { label: 'Quarterly Property Review', frequency: 'quarterly', duration: 90, checklist: ['roof', 'exterior-paint', 'foundation', 'hvac-filter', 'smoke-detectors', 'fire-extinguishers', 'pool-equipment', 'landscape', 'pest', 'appliance-age'] },
  hurricane: { label: 'Hurricane Prep/Recovery', frequency: 'as-needed', duration: 120, checklist: ['shutters', 'debris', 'drainage', 'roof', 'windows', 'generator', 'supplies', 'trees', 'pool', 'exterior-furniture'] },
  emergency: { label: 'Emergency Response', frequency: 'as-needed', duration: 45, checklist: ['damage-scope', 'safety-hazards', 'utilities', 'water-intrusion', 'structural', 'photos', 'insurance-docs', 'vendor-needed'] },
};

// ── Deficiency Severity Levels ─────────────────────────────────────────────

export const SEVERITY_LEVELS = {
  critical: { label: 'Critical', sla: '4 hours', color: '#ef4444', description: 'Active water leak, fire hazard, security breach, structural failure' },
  high: { label: 'High', sla: '24 hours', color: '#f97316', description: 'HVAC failure, plumbing issue, electrical concern, pest infestation' },
  medium: { label: 'Medium', sla: '72 hours', color: '#eab308', description: 'Cosmetic damage, appliance issue, landscape concern' },
  low: { label: 'Low', sla: '7 days', color: '#22c55e', description: 'Minor maintenance, preventive replacement, aesthetic improvement' },
};

// ── Inspector Registry ─────────────────────────────────────────────────────

export const INSPECTORS = [
  { id: 'INS-001', name: 'Primary Inspector', zone: 'Vero Beach', status: 'active', certifications: ['Home Watch', 'Property Management', 'NHWA Certified'] },
  { id: 'INS-002', name: 'Secondary Inspector', zone: 'Stuart/Martin', status: 'active', certifications: ['Home Watch', 'Hurricane Prep'] },
  { id: 'INS-003', name: 'Emergency Inspector', zone: 'All Zones', status: 'on-call', certifications: ['Emergency Response', 'Insurance Documentation'] },
];

// ── Inspection Report Generator ────────────────────────────────────────────

export function createInspection(data) {
  const {
    propertyId,
    propertyAddress,
    inspectorId = 'INS-001',
    type = 'homeWatch',
    scheduledDate,
    notes = '',
  } = data;

  const inspType = INSPECTION_TYPES[type];
  if (!inspType) {
    return { error: `Unknown inspection type: ${type}. Valid: ${Object.keys(INSPECTION_TYPES).join(', ')}` };
  }

  const inspector = INSPECTORS.find(i => i.id === inspectorId);
  const checklist = inspType.checklist.map(item => ({
    item,
    status: 'pending',
    notes: '',
    photoRequired: true,
    deficiency: null,
  }));

  return {
    inspectionId: `INSP-${Date.now()}`,
    propertyId,
    propertyAddress,
    inspector: inspector || { id: inspectorId, name: 'Unassigned' },
    type,
    typeLabel: inspType.label,
    scheduledDate: scheduledDate || new Date().toISOString(),
    estimatedDuration: inspType.duration,
    status: 'scheduled',
    checklist,
    notes,
    deficiencies: [],
    photos: [],
    createdAt: new Date().toISOString(),
    createdBy: 'CK-INSPECTION-ENGINE',
  };
}

// ── Complete Inspection ────────────────────────────────────────────────────

export function completeInspection(inspection, results) {
  const {
    checklistResults = [],
    deficiencies = [],
    overallCondition = 'good',
    photos = [],
    inspectorNotes = '',
  } = results;

  // Update checklist items
  for (const result of checklistResults) {
    const item = inspection.checklist.find(c => c.item === result.item);
    if (item) {
      item.status = result.status || 'pass';
      item.notes = result.notes || '';
      item.deficiency = result.deficiency || null;
    }
  }

  // Process deficiencies
  const processedDeficiencies = deficiencies.map((d, i) => ({
    id: `DEF-${Date.now()}-${i}`,
    area: d.area,
    description: d.description,
    severity: d.severity || 'medium',
    severityConfig: SEVERITY_LEVELS[d.severity || 'medium'],
    photos: d.photos || [],
    vendorRequired: d.vendorRequired || false,
    estimatedCost: d.estimatedCost || null,
    status: 'open',
    reportedAt: new Date().toISOString(),
  }));

  const passCount = inspection.checklist.filter(c => c.status === 'pass').length;
  const failCount = inspection.checklist.filter(c => c.status === 'fail').length;
  const totalItems = inspection.checklist.length;

  return {
    ...inspection,
    status: 'completed',
    completedAt: new Date().toISOString(),
    overallCondition,
    inspectorNotes,
    photos,
    deficiencies: processedDeficiencies,
    summary: {
      totalItems,
      passed: passCount,
      failed: failCount,
      passRate: totalItems > 0 ? ((passCount / totalItems) * 100).toFixed(1) + '%' : '0%',
      deficiencyCount: processedDeficiencies.length,
      criticalCount: processedDeficiencies.filter(d => d.severity === 'critical').length,
      highCount: processedDeficiencies.filter(d => d.severity === 'high').length,
      vendorWorkOrders: processedDeficiencies.filter(d => d.vendorRequired).length,
      estimatedRepairCost: processedDeficiencies.reduce((s, d) => s + (d.estimatedCost || 0), 0),
    },
    agentAssignments: {
      dispatchAgent: 'OPS-002 Maintenance Dispatcher',
      qualityAgent: 'OPS-032 Quality Assurance',
      ownerCommsAgent: 'OPS-020 Owner Communicator',
      budgetAgent: 'OPS-042 Budget Controller',
    },
  };
}

// ── Inspection Dashboard ───────────────────────────────────────────────────

export function getInspectionDashboard() {
  return {
    system: 'Coastal Key Field Inspection Engine',
    status: 'OPERATIONAL',
    inspectionTypes: INSPECTION_TYPES,
    severityLevels: SEVERITY_LEVELS,
    inspectors: INSPECTORS,
    sops: {
      homeWatch: 'SOP-OPS-001: Weekly/biweekly home watch visits per NHWA standards',
      moveInOut: 'SOP-OPS-002: Move-in/move-out inspection with photo documentation',
      quarterly: 'SOP-OPS-003: Quarterly comprehensive property review',
      hurricane: 'SOP-OPS-004: Hurricane preparation and post-storm assessment',
      emergency: 'SOP-OPS-005: Emergency response inspection within 4-hour SLA',
      reporting: 'SOP-OPS-006: Digital inspection report with photo evidence to owner within 24h',
    },
    integrations: {
      airtable: 'Inspections table (tbl*) — all reports stored with photo URLs',
      agents: ['OPS-001 Property Pulse', 'OPS-003 Inspection Conductor', 'OPS-032 Quality Assurance'],
      intelOfficers: ['IO-B01 Archivist (schema)', 'IO-B03 Gatekeeper (field validation)'],
      notifications: ['Owner email via EM-C02', 'Slack #ops-alerts', 'CEO standup feed'],
    },
    metrics: {
      targetInspectionsPerWeek: 'All active properties on rotation',
      reportDeliveryTarget: '24 hours post-inspection',
      photoMinimum: '10 per home watch, 25 per quarterly',
      deficiencyResponseSLA: 'Per severity level (4h critical → 7d low)',
    },
    timestamp: new Date().toISOString(),
  };
}
