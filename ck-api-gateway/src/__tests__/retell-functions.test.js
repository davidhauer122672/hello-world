import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RETELL_FUNCTIONS, ATLAS_FUNCTIONS } from '../functions/retell-custom-functions.js';

describe('ReTell Custom Functions', () => {
  it('defines 6 callable functions', () => {
    assert.equal(RETELL_FUNCTIONS.length, 6);
  });

  it('all functions have required schema fields', () => {
    for (const fn of RETELL_FUNCTIONS) {
      assert.ok(fn.name, `Missing name`);
      assert.ok(fn.description, `Missing description for ${fn.name}`);
      assert.ok(fn.parameters, `Missing parameters for ${fn.name}`);
      assert.ok(typeof fn.handler === 'function', `Missing handler for ${fn.name}`);
    }
  });

  it('all function names are unique', () => {
    const names = RETELL_FUNCTIONS.map(f => f.name);
    assert.equal(new Set(names).size, names.length);
  });

  describe('check_service_area', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'check_service_area');

    it('returns true for Stuart', async () => {
      const result = await fn.handler({ city: 'Stuart' });
      assert.equal(result.in_service_area, true);
    });

    it('returns true for Jensen Beach (case insensitive)', async () => {
      const result = await fn.handler({ city: 'jensen beach' });
      assert.equal(result.in_service_area, true);
    });

    it('returns false for Miami', async () => {
      const result = await fn.handler({ city: 'Miami' });
      assert.equal(result.in_service_area, false);
    });

    it('returns false for empty city', async () => {
      const result = await fn.handler({ city: '' });
      assert.equal(result.in_service_area, false);
    });
  });

  describe('get_pricing_recommendation', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'get_pricing_recommendation');

    it('recommends Platinum for $1M+ properties', async () => {
      const result = await fn.handler({ assessed_value: 1200000 });
      assert.equal(result.recommended_tier, 'Platinum');
      assert.equal(result.monthly_price, 395);
    });

    it('recommends Premier for $400K properties', async () => {
      const result = await fn.handler({ assessed_value: 400000 });
      assert.equal(result.recommended_tier, 'Premier');
      assert.equal(result.monthly_price, 295);
    });

    it('recommends Select for $200K properties', async () => {
      const result = await fn.handler({ assessed_value: 200000 });
      assert.equal(result.recommended_tier, 'Select');
      assert.equal(result.monthly_price, 195);
    });

    it('upgrades vacant Select properties to Premier', async () => {
      const result = await fn.handler({ assessed_value: 200000, occupancy: 'vacant' });
      assert.equal(result.recommended_tier, 'Premier');
      assert.ok(result.risk_note);
    });

    it('includes complimentary offer', async () => {
      const result = await fn.handler({ assessed_value: 500000 });
      assert.ok(result.complimentary_offer);
    });
  });

  describe('check_availability', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'check_availability');

    it('returns up to 3 available slots', async () => {
      const result = await fn.handler({});
      assert.ok(result.available_slots.length > 0);
      assert.ok(result.available_slots.length <= 3);
    });

    it('each slot has date, day, and times', async () => {
      const result = await fn.handler({});
      for (const slot of result.available_slots) {
        assert.ok(slot.date);
        assert.ok(slot.day);
        assert.ok(slot.times);
      }
    });
  });

  describe('book_assessment', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'book_assessment');

    it('returns confirmed appointment with ID', async () => {
      const result = await fn.handler({
        contact_name: 'John Smith',
        phone: '772-555-0100',
        property_address: '123 Ocean Blvd, Stuart FL',
        preferred_date: '2026-05-10',
        preferred_time: 'morning',
      });
      assert.equal(result.status, 'confirmed');
      assert.ok(result.appointment_id.startsWith('CK-'));
      assert.equal(result.time_window, '9:00 AM - 12:00 PM');
      assert.ok(result.next_steps.length > 0);
    });
  });

  describe('handle_objection', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'handle_objection');

    it('returns reframe for price objection', async () => {
      const result = await fn.handler({ objection_type: 'price' });
      assert.ok(result.reframe.includes('$195'));
      assert.ok(result.follow_up);
    });

    it('returns reframe for neighbor objection', async () => {
      const result = await fn.handler({ objection_type: 'neighbor_watches' });
      assert.ok(result.reframe.includes('timestamped'));
    });

    it('returns generic reframe for unknown objection', async () => {
      const result = await fn.handler({ objection_type: 'something_else' });
      assert.ok(result.reframe);
    });
  });

  describe('transfer_to_specialist', () => {
    const fn = RETELL_FUNCTIONS.find(f => f.name === 'transfer_to_specialist');

    it('initiates transfer with correct number', async () => {
      const result = await fn.handler({ reason: 'Qualified lead wants detailed consultation' });
      assert.equal(result.transfer_initiated, true);
      assert.equal(result.transfer_number, '+17722470982');
    });
  });
});

describe('Atlas Functions', () => {
  it('defines 3 atlas function templates', () => {
    assert.equal(Object.keys(ATLAS_FUNCTIONS).length, 3);
  });

  it('revival_follow_up generates personalized script', () => {
    const script = ATLAS_FUNCTIONS.revival_follow_up.script_template({ name: 'Jane' });
    assert.ok(script.opening.includes('Jane'));
    assert.ok(script.value_prop);
    assert.ok(script.close);
  });

  it('appointment_confirmation generates script with date', () => {
    const script = ATLAS_FUNCTIONS.appointment_confirmation.script_template({
      name: 'Bob',
      date: 'May 10th',
      time_window: 'morning',
    });
    assert.ok(script.opening.includes('Bob'));
    assert.ok(script.opening.includes('May 10th'));
  });

  it('speed_to_lead generates immediate follow-up script', () => {
    const script = ATLAS_FUNCTIONS.speed_to_lead.script_template({ name: 'Alice' });
    assert.ok(script.opening.includes('Alice'));
    assert.ok(script.qualify);
    assert.ok(script.close.includes('complimentary'));
  });
});
