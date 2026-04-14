/**
 * CK Nemotron Worker — NVIDIA Nemotron Inference Endpoint
 *
 * Routes:
 *   POST /v1/inference  — Nemotron model inference
 *   GET  /v1/health     — Health check
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token || token !== env.WORKER_AUTH_TOKEN) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

async function handleInference(request, env) {
  const body = await request.json();
  const { prompt, system, max_tokens = 1024, temperature = 0.7 } = body;

  if (!prompt) {
    return json({ error: 'Missing required field: prompt' }, 400);
  }

  const messages = [];
  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: env.MODEL_ID || 'nvidia/nemotron-4-340b-instruct',
    messages,
    max_tokens,
    temperature,
  };

  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey) {
    return json({ error: 'NVIDIA_API_KEY not configured' }, 503);
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return json({ error: 'Nemotron inference failed', detail: errorText }, response.status);
  }

  const result = await response.json();
  return json({
    model: payload.model,
    content: result.choices?.[0]?.message?.content || '',
    usage: result.usage || {},
  });
}

function handleHealth(env) {
  const apiKeyConfigured = !!env.NVIDIA_API_KEY;
  return json({
    status: apiKeyConfigured ? 'operational' : 'degraded',
    service: 'ck-nemotron-worker',
    model: env.MODEL_ID || 'nvidia/nemotron-4-340b-instruct',
    apiKeyConfigured,
    timestamp: new Date().toISOString(),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (pathname === '/v1/health' && request.method === 'GET') {
      return handleHealth(env);
    }

    if (pathname === '/v1/inference' && request.method === 'POST') {
      const authError = authenticate(request, env);
      if (authError) return authError;
      return handleInference(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },
};
