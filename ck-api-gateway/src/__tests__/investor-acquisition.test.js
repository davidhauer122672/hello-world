import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getInvestorFramework, getInvestorSections, getInvestorSection, getInvestorQuestion, scoreAcquisition } from '../services/investor-acquisition.js';

describe('Investor Acquisition Service', () => {
  describe('getInvestorFramework()', () => {
    it('returns framework with 35 questions in 5 sections', () => {
      const fw = getInvestorFramework();
      assert.equal(fw.totalQuestions, 35);
      assert.equal(fw.totalSections, 5);
      assert.equal(fw.status, 'production-ready');
    });

    it('includes scoring model with 5 grades', () => {
      const fw = getInvestorFramework();
      assert.equal(fw.scoringModel.grades.length, 5);
    });
  });

  describe('getInvestorSections()', () => {
    it('returns all 5 sections', () => {
      const result = getInvestorSections();
      assert.equal(result.totalSections, 5);
      assert.equal(result.sections.length, 5);
    });

    it('section weights sum to 1.0', () => {
      const result = getInvestorSections();
      const totalWeight = result.sections.reduce((sum, s) => sum + s.weight, 0);
      assert.ok(Math.abs(totalWeight - 1.0) < 0.01);
    });

    it('total questions across sections = 35', () => {
      const result = getInvestorSections();
      const total = result.sections.reduce((sum, s) => sum + s.questions.length, 0);
      assert.equal(total, 35);
    });
  });

  describe('getInvestorSection()', () => {
    it('returns Financial Integrity for SEC-01', () => {
      const s = getInvestorSection('SEC-01');
      assert.ok(s);
      assert.equal(s.name, 'Financial Integrity');
      assert.equal(s.weight, 0.30);
      assert.equal(s.questions.length, 7);
    });

    it('returns null for invalid section', () => {
      assert.equal(getInvestorSection('SEC-99'), null);
    });
  });

  describe('getInvestorQuestion()', () => {
    it('returns Q-01 with section info', () => {
      const q = getInvestorQuestion('Q-01');
      assert.ok(q);
      assert.equal(q.section, 'Financial Integrity');
      assert.ok(q.question);
      assert.ok(q.redFlag);
    });

    it('returns Q-35 (the most revealing question)', () => {
      const q = getInvestorQuestion('Q-35');
      assert.ok(q);
      assert.equal(q.weight, 10);
    });

    it('returns null for invalid question', () => {
      assert.equal(getInvestorQuestion('Q-99'), null);
    });
  });

  describe('scoreAcquisition()', () => {
    it('returns grade A for high scores', () => {
      const answers = {};
      for (let i = 1; i <= 35; i++) answers[`Q-${String(i).padStart(2, '0')}`] = 9;
      const result = scoreAcquisition(answers);
      assert.equal(result.grade, 'A');
      assert.ok(result.overallScore >= 8);
      assert.equal(result.redFlags.length, 0);
    });

    it('returns grade F for low scores', () => {
      const answers = {};
      for (let i = 1; i <= 35; i++) answers[`Q-${String(i).padStart(2, '0')}`] = 1;
      const result = scoreAcquisition(answers);
      assert.ok(['D', 'F'].includes(result.grade));
    });

    it('returns 5 section scores', () => {
      const result = scoreAcquisition({});
      assert.equal(result.sectionScores.length, 5);
    });

    it('defaults missing answers to 5', () => {
      const result = scoreAcquisition({});
      assert.ok(result.overallScore >= 4 && result.overallScore <= 6);
    });
  });
});

import { handleInvestorFramework, handleInvestorSections, handleInvestorSection, handleInvestorQuestion, handleInvestorScore } from '../routes/investor-acquisition.js';

describe('Investor Acquisition Routes', () => {
  it('GET /v1/investor/framework returns 200', async () => {
    const res = handleInvestorFramework();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalQuestions, 35);
  });

  it('GET /v1/investor/sections returns all sections', async () => {
    const res = handleInvestorSections();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.totalSections, 5);
  });

  it('GET /v1/investor/sections/SEC-01 returns section', async () => {
    const res = handleInvestorSection('SEC-01');
    assert.equal(res.status, 200);
  });

  it('GET /v1/investor/sections/SEC-99 returns 404', async () => {
    const res = handleInvestorSection('SEC-99');
    assert.equal(res.status, 404);
  });

  it('GET /v1/investor/questions/Q-01 returns question', async () => {
    const res = handleInvestorQuestion('Q-01');
    assert.equal(res.status, 200);
  });

  it('POST /v1/investor/score returns grade', async () => {
    const mockRequest = { json: async () => ({ 'Q-01': 8, 'Q-02': 7 }) };
    const res = await handleInvestorScore(mockRequest);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.grade);
    assert.ok(body.overallScore);
  });

  it('POST /v1/investor/score returns 400 for invalid JSON', async () => {
    const mockRequest = { json: async () => { throw new Error('bad'); } };
    const res = await handleInvestorScore(mockRequest);
    assert.equal(res.status, 400);
  });
});
