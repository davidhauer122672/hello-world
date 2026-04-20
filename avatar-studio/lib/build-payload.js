'use strict';

// buildRequestPayload — pure function that converts a built avatar spec
// (from avatar-studio/specs/built/*.json) plus its pasteable prompt text
// into a Banana Pro API request body. The three body field names
// (promptField, metadataField, outputFormatField) are injected via config
// so they can be adjusted once the Banana Pro account is provisioned,
// without touching code.

function buildRequestPayload(spec, promptText, config) {
  if (!spec || typeof spec !== 'object') {
    throw new TypeError('buildRequestPayload: spec must be an object');
  }
  if (typeof promptText !== 'string' || promptText.length === 0) {
    throw new Error(`buildRequestPayload: promptText is missing for ${spec.id || '<no-id>'}`);
  }
  if (!config || typeof config !== 'object') {
    throw new TypeError('buildRequestPayload: config must be an object');
  }

  const fields = config.fields || {};
  const promptField = fields.promptField || 'prompt';
  const metadataField = fields.metadataField || 'metadata';
  const outputFormatField = fields.outputFormatField || 'output_format';

  const tech = spec.technicalStandards || {};
  const res = tech.resolution || {};
  const resolution = res.width && res.height ? `${res.width}x${res.height}` : null;

  const payload = {};
  payload[promptField] = promptText;
  payload[outputFormatField] = tech.container || 'mov';
  payload[metadataField] = {
    id: spec.id,
    title: spec.title,
    version: spec.version || null,
    resolution,
    frame_rate: tech.frameRate || null,
    color_space: tech.colorSpace || null,
    dynamic_range: tech.dynamicRange || null,
    subject_kind: spec.subject && spec.subject.kind,
    content_rating: spec.subject && spec.subject.contentRating,
    target_platforms: spec.targetPlatforms || [],
    renderer: spec.renderer || null,
  };
  return payload;
}

module.exports = { buildRequestPayload };
