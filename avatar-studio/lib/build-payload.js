'use strict';

// buildRequestPayload — pure function that converts a built spec into a
// Banana Pro API request body. The three field names (promptField,
// metadataField, outputFormatField) are injected via config so they can be
// adjusted without code changes once the Banana Pro account is provisioned.

function buildRequestPayload(spec, config) {
  if (!spec || typeof spec !== 'object') {
    throw new TypeError('buildRequestPayload: spec must be an object');
  }
  if (!config || typeof config !== 'object') {
    throw new TypeError('buildRequestPayload: config must be an object');
  }
  const fields = config.fields || {};
  const promptField = fields.promptField || 'prompt';
  const metadataField = fields.metadataField || 'metadata';
  const outputFormatField = fields.outputFormatField || 'output_format';

  if (typeof spec.prompt !== 'string' || spec.prompt.length === 0) {
    throw new Error(`buildRequestPayload: spec.prompt is missing for ${spec.id || '<no-id>'}`);
  }

  const payload = {};
  payload[promptField] = spec.prompt;
  payload[outputFormatField] = (spec.technical && spec.technical.format) || 'mov';
  payload[metadataField] = {
    id: spec.id,
    title: spec.title,
    filename: spec.filename,
    resolution: spec.technical && spec.technical.resolution,
    fps: spec.technical && spec.technical.fps,
    loop_duration_s: spec.technical && spec.technical.loop_duration_s,
    color_space: spec.technical && spec.technical.color_space,
    hdr: spec.technical && spec.technical.hdr,
    identity_source: spec.identity && spec.identity.source,
    governance: spec.governance,
  };
  return payload;
}

module.exports = { buildRequestPayload };
