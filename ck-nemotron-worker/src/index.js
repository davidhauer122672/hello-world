const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

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

  const model = env.MODEL_ID || DEFAULT_MODEL;
  const payload = {
    model,
    max_tokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  };

  if (system) {
    payload.system = system;
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 503);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return json({ error: 'Claude inference failed', detail: errorText }, response.status);
  }

  const result = await response.json();
  return json({
    model: result.model,
    content: result.content?.[0]?.text || '',
    usage: result.usage || {},
  });
}

function handleHealth(env) {
  const apiKeyConfigured = !!env.ANTHROPIC_API_KEY;
  return json({
    status: apiKeyConfigured ? 'operational' : 'degraded',
    service: 'ck-inference-worker',
    model: env.MODEL_ID || DEFAULT_MODEL,
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
