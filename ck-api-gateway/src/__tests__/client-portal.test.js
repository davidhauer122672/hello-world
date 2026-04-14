import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Client Portal Service ──
import {
  getPortalOverview, getPortalWorkflows, getPortalWorkflow,
  getPortalDashboard, getSeasonalOwnerProfile, getPortalMetrics,
} from '../services/client-portal.js';

describe('Client Portal Service', () => {
  describe('getPortalOverview()', () => {
    it('returns portal engine overview', () => {
      const overview = getPortalOverview();
      assert.equal(overview.id, 'CK-PORTAL-ENGINE');
      assert.equal(overview.status, 'operational');
      assert.equal(overview.workflows, 5);
      assert.equal(overview.dashboardModules, 6);
    });

    it('includes target profile and automation highlight', () => {
      const overview = getPortalOverview();
      assert.ok(overview.targetProfile);
      assert.ok(overview.automationHighlight);
    });
  });

  describe('getPortalWorkflows()', () => {
    it('returns all 5 workflows', () => {
      const result = getPortalWorkflows();
      assert.equal(result.totalWorkflows, 5);
      assert.equal(result.workflows.length, 5);
    });

    it('includes automation summary', () => {
      const result = getPortalWorkflows();
      assert.ok(result.automationSummary);
      assert.ok(result.automationSummary.averageCoverage);
    });

    it('workflow IDs are WF-CP-001 through WF-CP-005', () => {
      const result = getPortalWorkflows();
      const ids = result.workflows.map(w => w.id);
      assert.deepEqual(ids, ['WF-CP-001', 'WF-CP-002', 'WF-CP-003', 'WF-CP-004', 'WF-CP-005']);
    });

    it('every workflow has required fields', () => {
      const result = getPortalWorkflows();
      for (const w of result.workflows) {
        assert.ok(w.id, `Missing id`);
        assert.ok(w.name, `Missing name`);
        assert.ok(w.trigger, `Missing trigger`);
        assert.ok(w.steps.length > 0, `${w.id} missing steps`);
        assert.ok(w.estimatedCost, `${w.id} missing estimatedCost`);
        assert.ok(w.automationCoverage, `${w.id} missing automationCoverage`);
      }
    });
  });

  describe('getPortalWorkflow()', () => {
    it('returns Seasonal Property Activation for WF-CP-001', () => {
      const w = getPortalWorkflow('WF-CP-001');
      assert.ok(w);
      assert.equal(w.name, 'Seasonal Property Activation');
      assert.equal(w.steps.length, 8);
    });

    it('returns Vacant Property Monitoring for WF-CP-002', () => {
      const w = getPortalWorkflow('WF-CP-002');
      assert.ok(w);
      assert.equal(w.name, 'Vacant Property Monitoring');
    });

    it('returns null for invalid workflow', () => {
      assert.equal(getPortalWorkflow('WF-CP-999'), null);
      assert.equal(getPortalWorkflow('invalid'), null);
    });
  });

  describe('getPortalDashboard()', () => {
    it('returns all 6 dashboard modules', () => {
      const dash = getPortalDashboard();
      assert.equal(dash.totalModules, 6);
      assert.equal(dash.modules.length, 6);
    });

    it('each module has id, name, description, dataSource', () => {
      const dash = getPortalDashboard();
      for (const m of dash.modules) {
        assert.ok(m.id, 'Missing id');
        assert.ok(m.name, 'Missing name');
        assert.ok(m.description, 'Missing description');
        assert.ok(m.dataSource, 'Missing dataSource');
      }
    });
  });

  describe('getSeasonalOwnerProfile()', () => {
    it('returns owner profile with pain points and value prop', () => {
      const profile = getSeasonalOwnerProfile();
      assert.ok(profile.demographic);
      assert.ok(profile.painPoints.length >= 5);
      assert.ok(profile.valueProposition.length >= 5);
      assert.ok(profile.costToOwner);
    });

    it('AI monitoring is $3.99/month', () => {
      const profile = getSeasonalOwnerProfile();
      assert.equal(profile.costToOwner.aiMonitoring, '$3.99/month add-on for AI reports + predictions + alerts');
    });
  });

  describe('getPortalMetrics()', () => {
    it('returns projections for 3, 6, and 12 months', () => {
      const metrics = getPortalMetrics();
      assert.ok(metrics.projections.month3);
      assert.ok(metrics.projections.month6);
      assert.ok(metrics.projections.month12);
    });

    it('returns KPIs', () => {
      const metrics = getPortalMetrics();
      assert.ok(metrics.kpis.targetResponseTime);
      assert.ok(metrics.kpis.targetChurn);
    });
  });
});

// ── Client Portal Route Handlers ──
import {
  handlePortalOverview, handlePortalWorkflows, handlePortalWorkflow,
  handlePortalDashboard, handleOwnerProfile, handlePortalMetrics,
} from '../routes/client-portal.js';

describe('Client Portal Routes', () => {
  it('GET /v1/portal/overview returns 200', async () => {
    const res = handlePortalOverview();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 'CK-PORTAL-ENGINE');
    assert.equal(body.status, 'operational');
  });

  it('GET /v1/portal/workflows returns all workflows', async () => {
    const res = handlePortalWorkflows();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalWorkflows, 5);
  });

  it('GET /v1/portal/workflows/WF-CP-001 returns workflow', async () => {
    const res = handlePortalWorkflow('WF-CP-001');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.workflow.name, 'Seasonal Property Activation');
  });

  it('GET /v1/portal/workflows/WF-CP-999 returns 404', async () => {
    const res = handlePortalWorkflow('WF-CP-999');
    assert.equal(res.status, 404);
  });

  it('GET /v1/portal/dashboard returns modules', async () => {
    const res = handlePortalDashboard();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalModules, 6);
  });

  it('GET /v1/portal/owner-profile returns profile', async () => {
    const res = handleOwnerProfile();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.demographic);
    assert.ok(body.painPoints);
  });

  it('GET /v1/portal/metrics returns projections', async () => {
    const res = handlePortalMetrics();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.projections);
    assert.ok(body.kpis);
  });
});
