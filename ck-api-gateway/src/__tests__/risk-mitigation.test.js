import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Risk Mitigation Service ──
import {
  getRiskEngine, getRiskDomains, getRiskDomain,
  getSensorIntegration, getRiskAssessment, getRiskMetrics,
} from '../services/risk-mitigation.js';

describe('Risk Mitigation Service', () => {
  describe('getRiskEngine()', () => {
    it('returns engine overview with 4 domains', () => {
      const engine = getRiskEngine();
      assert.equal(engine.id, 'CK-RISK-ENGINE');
      assert.equal(engine.domains, 4);
      assert.equal(engine.status, 'operational');
    });

    it('includes sensor integration details', () => {
      const engine = getRiskEngine();
      assert.ok(engine.sensorIntegration);
      assert.ok(engine.sensorIntegration.hub);
      assert.ok(engine.sensorIntegration.totalSensorCost);
    });

    it('domain summary includes all 4 risk areas', () => {
      const engine = getRiskEngine();
      assert.equal(engine.domainSummary.length, 4);
      const ids = engine.domainSummary.map(d => d.id);
      assert.ok(ids.includes('RISK-WATER'));
      assert.ok(ids.includes('RISK-PEST'));
      assert.ok(ids.includes('RISK-SECURITY'));
      assert.ok(ids.includes('RISK-INSURANCE'));
    });
  });

  describe('getRiskDomains()', () => {
    it('returns all 4 domains', () => {
      const result = getRiskDomains();
      assert.equal(result.totalDomains, 4);
      assert.equal(result.domains.length, 4);
    });

    it('severity breakdown is correct', () => {
      const result = getRiskDomains();
      assert.equal(result.bySeverity.critical, 1);
      assert.equal(result.bySeverity.high, 3);
    });

    it('every domain has required fields', () => {
      const result = getRiskDomains();
      for (const d of result.domains) {
        assert.ok(d.id, 'Missing id');
        assert.ok(d.domain, 'Missing domain name');
        assert.ok(d.severity, 'Missing severity');
        assert.ok(d.sensors.length > 0, `${d.id} missing sensors`);
        assert.ok(d.predictiveIndicators.length > 0, `${d.id} missing predictive indicators`);
        assert.ok(d.automatedResponses.length > 0, `${d.id} missing automated responses`);
        assert.ok(d.mitigationProtocol, `${d.id} missing mitigation protocol`);
      }
    });
  });

  describe('getRiskDomain()', () => {
    it('returns Water Damage for RISK-WATER', () => {
      const d = getRiskDomain('RISK-WATER');
      assert.ok(d);
      assert.equal(d.domain, 'Water Damage');
      assert.equal(d.severity, 'critical');
    });

    it('returns Pest for RISK-PEST', () => {
      const d = getRiskDomain('RISK-PEST');
      assert.ok(d);
      assert.equal(d.domain, 'Pest & Termite');
    });

    it('returns Security for RISK-SECURITY', () => {
      const d = getRiskDomain('RISK-SECURITY');
      assert.ok(d);
      assert.equal(d.domain, 'Property Security');
    });

    it('returns Insurance for RISK-INSURANCE', () => {
      const d = getRiskDomain('RISK-INSURANCE');
      assert.ok(d);
      assert.equal(d.domain, 'Insurance Compliance & Claims');
    });

    it('returns null for invalid domain', () => {
      assert.equal(getRiskDomain('RISK-INVALID'), null);
      assert.equal(getRiskDomain('invalid'), null);
    });
  });

  describe('getSensorIntegration()', () => {
    it('returns sensor specs with hub details', () => {
      const sensors = getSensorIntegration();
      assert.ok(sensors.hub);
      assert.ok(sensors.totalSensorCost);
      assert.ok(sensors.alertLatency);
    });

    it('supports all 4 risk domains', () => {
      const sensors = getSensorIntegration();
      assert.equal(sensors.supportedDomains.length, 4);
    });
  });

  describe('getRiskAssessment()', () => {
    it('returns assessment for default property', () => {
      const assessment = getRiskAssessment({});
      assert.ok(assessment.riskScores);
      assert.ok(assessment.overallRisk >= 0 && assessment.overallRisk <= 100);
      assert.ok(['critical', 'high', 'moderate', 'low'].includes(assessment.classification));
      assert.equal(assessment.recommendations.length, 4);
    });

    it('high-risk property gets critical classification', () => {
      const assessment = getRiskAssessment({
        propertyAge: 30, vacantMonths: 8, roofAge: 20, floodZone: 'AE',
      });
      assert.ok(assessment.overallRisk >= 60);
      assert.ok(['critical', 'high'].includes(assessment.classification));
    });

    it('new property gets lower risk score', () => {
      const assessment = getRiskAssessment({
        propertyAge: 2, vacantMonths: 2, roofAge: 2, floodZone: 'X',
      });
      assert.ok(assessment.overallRisk < 50);
    });

    it('recommends appropriate package based on risk', () => {
      const high = getRiskAssessment({ propertyAge: 25, vacantMonths: 8, roofAge: 18, floodZone: 'AE' });
      assert.ok(['premium', 'standard'].includes(high.recommendedPackage));

      const low = getRiskAssessment({ propertyAge: 3, vacantMonths: 1, roofAge: 3, floodZone: 'X' });
      assert.equal(low.recommendedPackage, 'basic');
    });
  });

  describe('getRiskMetrics()', () => {
    it('returns projections for 3, 6, and 12 months', () => {
      const metrics = getRiskMetrics();
      assert.ok(metrics.projections.month3);
      assert.ok(metrics.projections.month6);
      assert.ok(metrics.projections.month12);
    });

    it('includes sensor packages', () => {
      const metrics = getRiskMetrics();
      assert.ok(metrics.sensorPackages.basic);
      assert.ok(metrics.sensorPackages.standard);
      assert.ok(metrics.sensorPackages.premium);
    });
  });
});

// ── Risk Mitigation Route Handlers ──
import {
  handleRiskEngine, handleRiskDomains, handleRiskDomain,
  handleSensorIntegration, handleRiskAssessment, handleRiskMetrics,
} from '../routes/risk-mitigation.js';

describe('Risk Mitigation Routes', () => {
  it('GET /v1/risk/engine returns 200', async () => {
    const res = handleRiskEngine();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.domains, 4);
    assert.equal(body.status, 'operational');
  });

  it('GET /v1/risk/domains returns all domains', async () => {
    const res = handleRiskDomains();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalDomains, 4);
  });

  it('GET /v1/risk/domains/RISK-WATER returns water domain', async () => {
    const res = handleRiskDomain('RISK-WATER');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.domain.domain, 'Water Damage');
  });

  it('GET /v1/risk/domains/RISK-INVALID returns 404', async () => {
    const res = handleRiskDomain('RISK-INVALID');
    assert.equal(res.status, 404);
  });

  it('GET /v1/risk/sensors returns sensor specs', async () => {
    const res = handleSensorIntegration();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.hub);
  });

  it('POST /v1/risk/assess returns assessment', async () => {
    const mockRequest = {
      json: async () => ({ propertyAge: 15, vacantMonths: 6, roofAge: 10, floodZone: 'X' }),
    };
    const res = await handleRiskAssessment(mockRequest);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.riskScores);
    assert.ok(body.classification);
  });

  it('POST /v1/risk/assess returns 400 for invalid JSON', async () => {
    const mockRequest = {
      json: async () => { throw new Error('Invalid JSON'); },
    };
    const res = await handleRiskAssessment(mockRequest);
    assert.equal(res.status, 400);
  });

  it('GET /v1/risk/metrics returns projections', async () => {
    const res = handleRiskMetrics();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.projections);
    assert.ok(body.sensorPackages);
  });
});
