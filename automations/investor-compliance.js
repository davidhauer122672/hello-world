const COMPLIANCE_CONFIG = {
  threshold: 5000000,
  retention_years: 7,
  required_artifacts: [
    'call_recording',
    'nemotron_brief',
    'follow_up_emails',
    'property_brief',
    'ceo_review_timestamp'
  ]
};

async function archiveInvestorInteraction(env, leadRecord, artifacts) {
  const archiveKey = `investor/${leadRecord.id}/${Date.now()}`;

  const archivePayload = {
    lead_id: leadRecord.id,
    lead_name: leadRecord.fields.Name,
    property_value: leadRecord.fields['Property Value'],
    zone: leadRecord.fields.Zone,
    segment: leadRecord.fields.Segment,
    archived_at: new Date().toISOString(),
    retention_expires: getRetentionExpiry(),
    artifacts: {}
  };

  for (const artifact of COMPLIANCE_CONFIG.required_artifacts) {
    if (artifacts[artifact]) {
      archivePayload.artifacts[artifact] = {
        present: true,
        content: artifacts[artifact],
        archived_at: new Date().toISOString()
      };
    } else {
      archivePayload.artifacts[artifact] = {
        present: false,
        missing_flagged: true
      };
    }
  }

  const missingArtifacts = COMPLIANCE_CONFIG.required_artifacts.filter(a => !artifacts[a]);

  if (env.S3_BUCKET) {
    await uploadToS3(env, archiveKey, archivePayload);
  }

  await logToAirtable(env, leadRecord, archivePayload, missingArtifacts);

  if (missingArtifacts.length > 0) {
    await alertMissingArtifacts(env, leadRecord, missingArtifacts);
  }

  return {
    archived: true,
    archive_key: archiveKey,
    retention_expires: archivePayload.retention_expires,
    complete: missingArtifacts.length === 0,
    missing: missingArtifacts
  };
}

function getRetentionExpiry() {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + COMPLIANCE_CONFIG.retention_years);
  return expiry.toISOString();
}

async function uploadToS3(env, key, payload) {
  const response = await fetch(
    `https://${env.S3_BUCKET}.s3.amazonaws.com/${key}.json`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-amz-storage-class': 'GLACIER_IR',
        'x-amz-object-lock-mode': 'COMPLIANCE',
        'x-amz-object-lock-retain-until-date': getRetentionExpiry()
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.status}`);
  }
}

async function logToAirtable(env, leadRecord, archive, missing) {
  await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Investor%20Compliance%20Log`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Lead': leadRecord.fields.Name,
          'Property Value': leadRecord.fields['Property Value'],
          'Zone': leadRecord.fields.Zone,
          'Archive Key': archive.archive_key || 'pending',
          'Retention Expires': archive.retention_expires,
          'Artifacts Complete': missing.length === 0,
          'Missing Artifacts': missing.join(', ') || 'None',
          'Archived At': new Date().toISOString()
        }
      })
    }
  );
}

async function alertMissingArtifacts(env, leadRecord, missing) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#investor-alerts',
      text: `COMPLIANCE WARNING | ${leadRecord.fields.Name} | $${(leadRecord.fields['Property Value'] / 1000000).toFixed(1)}M | Missing artifacts: ${missing.join(', ')} | Archive incomplete - action required`
    })
  });
}

async function auditComplianceRecords(env) {
  const formula = encodeURIComponent("{Artifacts Complete} = FALSE()");
  const response = await fetch(
    `${env.AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/Investor%20Compliance%20Log?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${env.AIRTABLE_API_KEY}` } }
  );
  const data = await response.json();
  const incomplete = data.records || [];

  return {
    total_incomplete: incomplete.length,
    records: incomplete.map(r => ({
      lead: r.fields.Lead,
      missing: r.fields['Missing Artifacts'],
      archived_at: r.fields['Archived At']
    }))
  };
}

export {
  archiveInvestorInteraction,
  auditComplianceRecords,
  COMPLIANCE_CONFIG
};
