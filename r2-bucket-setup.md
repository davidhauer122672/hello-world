# Cloudflare R2 Bucket Setup Guide

## Bucket Configuration

| Field             | Value                    |
|-------------------|--------------------------|
| **Bucket Name**   | `coastal-key-assets`     |
| **Location**      | Automatic                |
| **Public Access**  | Enabled (Allow Access)  |
| **Public URL**    | `https://pub-<id>.r2.dev` |

## Setup Steps

### 1. Create the Bucket
1. Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **R2 Object Storage** from the left sidebar
3. Click **Create Bucket**
4. Enter bucket name: `coastal-key-assets`
5. Location: **Automatic**
6. Click **Create Bucket**

### 2. Enable Public Access
1. Open the `coastal-key-assets` bucket
2. Go to the **Settings** tab
3. Under **Public Access**, click **Allow Access**
4. Copy the **Public Bucket URL** (format: `https://pub-abc123def456.r2.dev`)

### 3. Generate API Tokens
1. Go to **R2 Object Storage** > **Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions: **Object Read & Write**
4. Scope: Bucket `coastal-key-assets`
5. Save the **Access Key ID** and **Secret Access Key**

### 4. Live Endpoints

| Endpoint            | URL                                                     |
|---------------------|---------------------------------------------------------|
| **Public Bucket**   | `https://pub-coastalkey-pm.r2.dev`                            |
| **Worker Proxy**    | `https://image-ingestion-proxy.coastalkey-pm.workers.dev`     |
| **S3 Endpoint**     | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`         |

### 5. Environment Variables

```env
R2_PUBLIC_URL=https://pub-coastalkey-pm.r2.dev
WORKER_URL=https://image-ingestion-proxy.coastalkey-pm.workers.dev
API_KEY=<set-via-wrangler-secret>
API_TOKEN=<set-via-wrangler-secret>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-access-key>
R2_SECRET_ACCESS_KEY=<your-secret-key>
R2_BUCKET_NAME=coastal-key-assets
```

> See `.env.example` for the full template.

## CORS Configuration (if needed)

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```
