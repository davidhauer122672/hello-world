export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "PUT" && request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${env.API_KEY}`) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key || key === "/") {
      return json({ error: "Missing object key in path" }, 400);
    }

    const contentType =
      request.headers.get("Content-Type") || "application/octet-stream";

    await env.R2_BUCKET.put(key, request.body, {
      httpMetadata: { contentType },
    });

    return json({
      status: "success",
      key,
      permanent_url: `${env.R2_PUBLIC_URL}/${key}`,
      token: env.API_TOKEN,
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}
