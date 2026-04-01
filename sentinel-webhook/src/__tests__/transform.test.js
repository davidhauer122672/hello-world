import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transformRetellToAirtable } from '../transform.js';

describe('transformRetellToAirtable', () => {

  it('maps a complete inbound call_analyzed payload', () => {
    const call = {
      call_id: 'call_abc123',
      direction: 'inbound',
      from_number: '+17725551234',
      to_number: '+17725559999',
      start_timestamp: 1711612800000,
      end_timestamp: 1711613100000,
      disconnection_reason: 'agent_hangup',
      transcript: [
        { role: 'agent', content: 'Hi, this is Coastal Key.' },
        { role: 'user', content: 'I need property management help.' },
      ],
      retell_llm_dynamic_variables: {
        customer_name: 'John Smith',
        property_address: '123 Ocean Blvd, Vero Beach FL',
        email: 'john@example.com',
        segment: 'absentee_homeowner',
      },
      metadata: {
        region: 'vero_beach',
        campaign: 'absentee',
      },
    };

    const fields = transformRetellToAirtable(call);

    assert.equal(fields['Lead Name'], 'John Smith');
    assert.equal(fields['Phone Number'], '+17725551234');
    assert.equal(fields['Email'], 'john@example.com');
    assert.equal(fields['Property Address'], '123 Ocean Blvd, Vero Beach FL');
    assert.deepEqual(fields['Status'], { name: 'New' });
    assert.deepEqual(fields['Call Disposition'], { name: 'Booked' });
    assert.deepEqual(fields['Sentinel Segment'], { name: 'Absentee Homeowner' });
    assert.deepEqual(fields['Service Zone'], { name: 'Vero Beach' });
    assert.deepEqual(fields['Sequence Step'], { name: 'Day 1 - Cold Open' });
    assert.equal(fields['Date Captured'], '2024-03-28');
    assert.ok(fields['Inquiry Notes'].includes('AGENT: Hi, this is Coastal Key.'));
    assert.ok(fields['Audit Trail/Activity Log'].includes('call_abc123'));
    assert.equal(fields._meta.durationSec, 300);
  });

  it('falls back to phone number when name is missing', () => {
    const call = {
      call_id: 'call_xyz',
      direction: 'outbound',
      to_number: '+15615550000',
      retell_llm_dynamic_variables: {},
      metadata: {},
    };

    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Lead Name'], '+15615550000');
  });

  it('falls back to call ID when both name and phone are missing', () => {
    const call = {
      call_id: 'call_nophone',
      retell_llm_dynamic_variables: {},
      metadata: {},
    };

    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Lead Name'], 'Sentinel Lead call_nophone');
  });

  it('maps inactivity_timeout to No Answer disposition', () => {
    const call = {
      call_id: 'call_timeout',
      disconnection_reason: 'inactivity_timeout',
      retell_llm_dynamic_variables: {},
      metadata: {},
    };

    const fields = transformRetellToAirtable(call);
    assert.deepEqual(fields['Call Disposition'], { name: 'No Answer' });
  });

  it('handles string transcripts', () => {
    const call = {
      call_id: 'call_str',
      transcript: 'Agent: Hello. User: Hi.',
      retell_llm_dynamic_variables: {},
      metadata: {},
    };

    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Inquiry Notes'], 'Agent: Hello. User: Hi.');
  });

  it('maps treasure_coast region to Vero Beach zone', () => {
    const call = {
      call_id: 'call_tc',
      retell_llm_dynamic_variables: {},
      metadata: { region: 'treasure_coast' },
    };

    const fields = transformRetellToAirtable(call);
    assert.deepEqual(fields['Service Zone'], { name: 'Vero Beach' });
  });

  it('handles minimal call object with only call_id', () => {
    const call = { call_id: 'call_min' };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Lead Name'], 'Sentinel Lead call_min');
    assert.deepEqual(fields['Status'], { name: 'New' });
    assert.ok(fields['Date Captured']);
  });

  it('sets no disposition for unknown disconnection_reason', () => {
    const call = {
      call_id: 'call_unk',
      disconnection_reason: 'some_future_reason',
      retell_llm_dynamic_variables: {},
      metadata: {},
    };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Call Disposition'], undefined);
  });

  it('sets no segment for unknown campaign keyword', () => {
    const call = {
      call_id: 'call_noseg',
      retell_llm_dynamic_variables: {},
      metadata: { campaign: 'unknown_campaign_type' },
    };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Sentinel Segment'], undefined);
  });

  it('sets no zone for unknown region', () => {
    const call = {
      call_id: 'call_nozone',
      retell_llm_dynamic_variables: {},
      metadata: { region: 'moon_base' },
    };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Service Zone'], undefined);
  });

  it('truncates very long transcripts', () => {
    const call = {
      call_id: 'call_long',
      transcript: 'x'.repeat(200000),
      retell_llm_dynamic_variables: {},
      metadata: {},
    };
    const fields = transformRetellToAirtable(call);
    assert.ok(fields['Inquiry Notes'].length <= 100100); // truncated near 100k boundary
    assert.ok(fields['Inquiry Notes'].length < 200000); // significantly shorter than input
    assert.ok(fields['Inquiry Notes'].includes('[TRUNCATED AT LIMIT]'));
  });

  it('computes duration from duration_ms field', () => {
    const call = {
      call_id: 'call_dur',
      duration_ms: 45000,
      retell_llm_dynamic_variables: {},
      metadata: {},
    };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields._meta.durationSec, 45);
  });

  it('extracts email from customer_email fallback', () => {
    const call = {
      call_id: 'call_email',
      retell_llm_dynamic_variables: { customer_email: 'alt@test.com' },
      metadata: {},
    };
    const fields = transformRetellToAirtable(call);
    assert.equal(fields['Email'], 'alt@test.com');
  });
});
