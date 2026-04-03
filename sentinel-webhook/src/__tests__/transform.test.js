import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transformRetellToAirtable, transformAtlasToAirtable } from '../transform.js';

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
});

// ── Atlas Call Completed Payload Tests ──────────────────────────────────────

describe('transformAtlasToAirtable', () => {

  it('maps a complete Atlas Call Completed payload (Zapier space-key format)', () => {
    const call = {
      'Campaign Id': 'camp_sentinel_001',
      'Agent Id': 'agent_005',
      'Call Id': 'atlas_call_789',
      'Customer Number': '+17725551234',
      'Customer Name': 'Maria Johnson',
      'Campaign Name': '[CK] Project Sentinel - Outbound',
      'Agent Name': 'Sarah',
      'Campaign Type': 'outbound',
      'Call Summary': 'Customer booked a consultation for property management.',
      'Ended At': '2026-04-02T15:30:00Z',
      'Started At': '2026-04-02T15:25:00Z',
      'Duration Ms': 300000,
      'Duration Seconds': 300,
      'Duration Minutes': 5,
      'Call Transcript': 'Agent: Hi Maria, this is Sarah from Coastal Key...\nCustomer: Yes, I\'d like to schedule a consultation.',
      'Audio Url': 'https://atlas.example.com/recordings/atlas_call_789.mp3',
    };

    const fields = transformAtlasToAirtable(call);

    assert.equal(fields['Lead Name'], 'Maria Johnson');
    assert.equal(fields['Phone Number'], '+17725551234');
    assert.deepEqual(fields['Status'], { name: 'New' });
    assert.deepEqual(fields['Lead Source'], { name: 'Atlas Sentinel Campaign' });
    assert.deepEqual(fields['Call Disposition'], { name: 'Booked' });
    assert.equal(fields['Date Captured'], '2026-04-02');
    assert.ok(fields['Inquiry Notes'].includes('Sarah from Coastal Key'));
    assert.ok(fields['Audit Trail/Activity Log'].includes('atlas_call_789'));
    assert.ok(fields['Audit Trail/Activity Log'].includes('Project Sentinel'));
    assert.equal(fields._meta.source, 'atlas');
    assert.equal(fields._meta.durationSec, 300);
    assert.equal(fields._meta.campaignName, '[CK] Project Sentinel - Outbound');
    assert.equal(fields._meta.audioUrl, 'https://atlas.example.com/recordings/atlas_call_789.mp3');
  });

  it('maps Atlas payload with snake_case keys', () => {
    const call = {
      campaign_id: 'camp_002',
      call_id: 'atlas_snake_001',
      customer_number: '+15615559999',
      customer_name: 'Robert Chen',
      campaign_name: 'Investor outreach',
      campaign_type: 'outbound',
      call_summary: 'Not interested at this time.',
      duration_seconds: 45,
    };

    const fields = transformAtlasToAirtable(call);

    assert.equal(fields['Lead Name'], 'Robert Chen');
    assert.equal(fields['Phone Number'], '+15615559999');
    assert.deepEqual(fields['Call Disposition'], { name: 'Not Interested' });
    assert.deepEqual(fields['Sentinel Segment'], { name: 'Investor / Family Office' });
  });

  it('falls back to Customer Number when name is missing', () => {
    const call = {
      'Campaign Id': 'camp_003',
      'Call Id': 'atlas_noname',
      'Customer Number': '+17725550000',
      'Campaign Name': 'Test',
      'Duration Seconds': 10,
    };

    const fields = transformAtlasToAirtable(call);
    assert.equal(fields['Lead Name'], '+17725550000');
  });

  it('parses Dynamic information field for email and address', () => {
    const call = {
      'Campaign Id': 'camp_004',
      'Call Id': 'atlas_dynamic',
      'Customer Name': 'Jane Doe',
      'Customer Number': '+17725551111',
      'Campaign Name': 'Absentee owner campaign',
      'Campaign Type': 'outbound',
      'Call Summary': 'Booked consultation.',
      'Duration Seconds': 120,
      'Dynamic information': 'email=jane@example.com;property_address=456 Palm Ave, Stuart FL;service_zone=stuart',
    };

    const fields = transformAtlasToAirtable(call);

    assert.equal(fields['Email'], 'jane@example.com');
    assert.equal(fields['Property Address'], '456 Palm Ave, Stuart FL');
    assert.deepEqual(fields['Service Zone'], { name: 'Stuart' });
    assert.deepEqual(fields['Sentinel Segment'], { name: 'Absentee Homeowner' });
  });

  it('auto-detects Atlas payload when passed to transformRetellToAirtable', () => {
    const call = {
      'Campaign Id': 'camp_autodetect',
      'Call Id': 'atlas_auto_001',
      'Customer Name': 'Auto Detect Test',
      'Customer Number': '+17725552222',
      'Campaign Name': 'Luxury property outreach',
      'Campaign Type': 'outbound',
      'Duration Seconds': 60,
    };

    // Pass to the Retell function — should auto-detect and route to Atlas handler
    const fields = transformRetellToAirtable(call);

    assert.equal(fields['Lead Name'], 'Auto Detect Test');
    assert.equal(fields._meta.source, 'atlas');
    assert.deepEqual(fields['Lead Source'], { name: 'Atlas Sentinel Campaign' });
    assert.deepEqual(fields['Sentinel Segment'], { name: 'Luxury Property $1M+' });
  });

  it('handles disqualified disposition from Call Summary', () => {
    const call = {
      'Campaign Id': 'camp_dq',
      'Call Id': 'atlas_dq_001',
      'Customer Name': 'Wrong Number',
      'Customer Number': '+15550000000',
      'Campaign Name': 'Test',
      'Call Summary': 'Customer disqualified - number belongs to a business.',
      'Duration Seconds': 15,
    };

    const fields = transformAtlasToAirtable(call);
    assert.deepEqual(fields['Call Disposition'], { name: 'Disqualified' });
  });
});
