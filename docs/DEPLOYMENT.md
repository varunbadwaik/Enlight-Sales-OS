# Deployment & Staging Guide — Automated Draft Invoice Generation System

## Environment Architecture

```text
Development              Staging                 Production
  (Local / Sandbox)  →    (Render / Supabase)  →  (Vercel / AWS / Zoho Live)
```

---

## Production Prerequisites & Checklist

### 1. Environment Variables (`.env`)
Ensure all credentials are non-placeholder strings:
- `DATABASE_URL`: Production PostgreSQL connection string (Supabase/AWS RDS).
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: AWS IAM credentials with restricted S3 access.
- `AWS_S3_BUCKET_NAME`: Private S3 Bucket (No public read access).
- `GEMINI_API_KEY`: Production Gemini API key.
- `GEMINI_MODEL`: Pinned tested model version (e.g. `gemini-1.5-pro`).
- `DEFAULT_WEIGHT_TOLERANCE_PERCENT`: `1.0`.
- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ORGANIZATION_ID`: Production Zoho Books OAuth 2.0 credentials.

### 2. Service Deployment Targets
- **Frontend (Next.js)**: Vercel / Netlify.
- **Backend API (FastAPI)**: Render / Railway / AWS ECS.
- **Database (PostgreSQL)**: Supabase / AWS RDS.
- **Workflow Orchestration**: n8n Cloud / Self-hosted n8n Docker instance.
- **Object Storage**: AWS S3 (Private Bucket with presigned URL access).
