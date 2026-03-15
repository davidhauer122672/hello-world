# Zapier R2 Upload Integration Prompt

## Overview

This document provides the Zapier Zap configuration for uploading files to the
Cloudflare R2 bucket `coastal-key-assets` and logging metadata to Airtable.

---

## Zap Architecture

```
Trigger (Airtable/Form/Email)
  -> Action 1: Upload file to R2 via S3-compatible API
  -> Action 2: Log asset metadata to Airtable
```

---

## Step 1: Trigger Configuration

| Setting        | Value                                      |
|----------------|--------------------------------------------|
| **App**        | Airtable / Google Forms / Webhook          |
| **Event**      | New Record / New Response / Catch Hook     |
| **Input Data** | File URL, File Name, Asset Type, Timestamp |

---

## Step 2: Upload to R2 (Amazon S3 Action)

Cloudflare R2 is S3-compatible. Use the **Amazon S3** action in Zapier.

| Setting                | Value                                          |
|------------------------|-------------------------------------------------|
| **App**                | Amazon S3                                       |
| **Action Event**       | Upload File                                     |
| **S3 Endpoint**        | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| **Access Key ID**      | *(from R2 API Token)*                           |
| **Secret Access Key**  | *(from R2 API Token)*                           |
| **Bucket**             | `coastal-key-assets`                            |
| **Key (file path)**    | `uploads/{{zap_meta_human_now}}/{{file_name}}`  |
| **File**               | `{{trigger_file_url}}`                          |
| **Content Type**       | `application/octet-stream` (or detect)          |
| **ACL**                | `public-read`                                   |

### Key Naming Convention

```
uploads/
  YYYY-MM-DD/
    <original-filename>
```

---

## Step 3: Log to Airtable

| Setting            | Value                                               |
|--------------------|------------------------------------------------------|
| **App**            | Airtable                                             |
| **Action Event**   | Create Record                                        |
| **Base**           | Coastal Key Assets                                   |
| **Table**          | Asset Registry                                       |

### Airtable Field Mapping

| Airtable Field     | Zapier Value                                         |
|--------------------|------------------------------------------------------|
| **Asset Name**     | `{{trigger_file_name}}`                              |
| **Upload Date**    | `{{zap_meta_human_now}}`                             |
| **R2 Public URL**  | `{{r2_public_url}}/uploads/{{date}}/{{file_name}}`   |
| **File Size**      | `{{trigger_file_size}}`                              |
| **Asset Type**     | `{{trigger_asset_type}}`                             |
| **Status**         | `Uploaded`                                           |
| **Source**         | `Zapier Automation`                                  |

---

## Airtable Base Schema

### Table: Asset Registry

| Field Name       | Type            | Notes                        |
|------------------|-----------------|------------------------------|
| Asset Name       | Single Line Text| Original filename            |
| Upload Date      | Date            | ISO 8601                     |
| R2 Public URL    | URL             | Public link to R2 object     |
| File Size        | Number          | Bytes                        |
| Asset Type       | Single Select   | image, video, document, other|
| Status           | Single Select   | Uploaded, Archived, Deleted  |
| Source           | Single Select   | Zapier Automation, Manual    |
| Tags             | Multi Select    | Custom taxonomy              |
| Notes            | Long Text       | Free-form notes              |

---

## Zapier Webhook Alternative

If the S3 action doesn't support custom endpoints, use a **Webhooks by Zapier**
action with a custom request:

```
Method: PUT
URL: https://<ACCOUNT_ID>.r2.cloudflarestorage.com/coastal-key-assets/uploads/{{date}}/{{file_name}}
Headers:
  Authorization: AWS4-HMAC-SHA256 ...
  Content-Type: application/octet-stream
Body: {{file_content}}
```

> Note: For webhook-based uploads, you'll need to handle AWS Signature V4
> signing. Consider using a Zapier Code step (Python/JS) to generate the
> signature, or use a proxy worker on Cloudflare Workers.

---

## Live Endpoints

| Endpoint            | URL                                                     |
|---------------------|---------------------------------------------------------|
| **Public Bucket**   | `https://pub-[yours].r2.dev`                            |
| **Worker Proxy**    | `https://image-ingestion-proxy.[yours].workers.dev`     |
| **UPLOAD_API_KEY**  | `[your-32-char-string]`                                 |

---

## Zapier Worker Proxy Upload (Recommended)

Use the Worker proxy instead of S3 auth for simpler Zapier integration.

| Setting              | Value                                                    |
|----------------------|----------------------------------------------------------|
| **App**              | Webhooks by Zapier                                       |
| **Action Event**     | Custom Request                                           |
| **Method**           | `PUT`                                                    |
| **URL**              | `https://image-ingestion-proxy.[yours].workers.dev/uploads/{{zap_meta_human_now}}/{{file_name}}` |
| **Headers**          | `Authorization: Bearer [your-32-char-UPLOAD_API_KEY]`    |
|                      | `Content-Type: application/octet-stream`                 |
| **Body**             | `{{trigger_file_url}}` (binary)                          |

The Worker returns JSON with the public URL:

```json
{
  "success": true,
  "key": "uploads/2026-03-15/photo.jpg",
  "url": "https://pub-[yours].r2.dev/uploads/2026-03-15/photo.jpg"
}
```

Use `{{response.url}}` from the Worker response to populate the Airtable R2 Public URL field.

---

## Cloudflare Worker Proxy Code

For simplified uploads without S3 auth complexity:

```javascript
export default {
  async fetch(request, env) {
    if (request.method !== 'PUT') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.UPLOAD_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    await env.R2_BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType: request.headers.get('Content-Type') || 'application/octet-stream',
      },
    });

    return Response.json({
      success: true,
      key,
      url: `${env.R2_PUBLIC_URL}/${key}`,
    });
  },
};
```

### Worker wrangler.toml

```toml
name = "coastal-key-upload-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "coastal-key-assets"

[vars]
R2_PUBLIC_URL = "https://pub-[yours].r2.dev"
UPLOAD_SECRET = "" # set via: wrangler secret put UPLOAD_SECRET
```

---

## Testing Checklist

- [ ] Trigger fires on new record/submission
- [ ] File uploads to R2 under correct path
- [ ] Public URL is accessible
- [ ] Airtable record is created with correct field mapping
- [ ] Error notifications are configured (Zapier built-in)
