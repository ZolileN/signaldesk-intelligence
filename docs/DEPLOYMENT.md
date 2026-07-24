# SignalDesk Africa — Deployment Guide

> **Stack**: Vercel (Frontend) + Render (API + PostgreSQL) — **$0/month on free tiers**

---

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐
│   Vercel (Free)     │         │   Render (Free)      │
│                     │  HTTPS  │                      │
│  React/Vite SPA     │────────▶│  FastAPI (Python)    │
│  Global CDN         │         │  Web Service         │
│                     │         │                      │
│  app.signaldesk.com │         │  api.signaldesk.com  │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  Render PostgreSQL   │
                                │  (pgvector, Free)    │
                                │                      │
                                │  signaldesk_db       │
                                └──────────────────────┘
```

---

## Prerequisites

- GitHub repo pushed to `origin/master`
- [Vercel account](https://vercel.com) (free, no credit card)
- [Render account](https://render.com) (free, no credit card)

---

## Step 1: Deploy API + Database on Render

Render uses the [`render.yaml`](../render.yaml) Blueprint file at the repo root to auto-provision infrastructure.

### 1.1 Create Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repo (`ZolileN/signaldesk-intelligence`)
4. Render auto-detects `render.yaml` on the `master` branch
5. Click **Apply**

This creates:

| Resource | Name | Type |
|----------|------|------|
| Web Service | `signaldesk-api` | Free Python service |
| Database | `signaldesk-db` | Free PostgreSQL 16 |

### 1.2 Verify Deployment

Wait ~2–3 minutes for the build, then test:

```bash
curl https://signaldesk-api.onrender.com/health | python3 -m json.tool
```

Expected response:

```json
{
  "status": "ONLINE",
  "platform": "SignalDesk Africa",
  "version": "1.0.0",
  "database": "CONNECTED"
}
```

### 1.3 Copy Your API URL

Your API URL will look like: `https://signaldesk-api.onrender.com`

You'll need this for Step 2.

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Create Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repo (`ZolileN/signaldesk-intelligence`)

### 2.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 2.3 Set Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://signaldesk-api.onrender.com` |

> **Important**: Use your actual Render API URL from Step 1.3

### 2.4 Deploy

Click **Deploy**. Your frontend will be live at: `https://signaldesk-intelligence.vercel.app`

---

## Step 3: Custom Domain Setup (Optional)

### Frontend — Vercel

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add `app.signaldesk.com`
3. Add the DNS records Vercel provides to your domain registrar:
   - `CNAME` → `cname.vercel-dns.com`

### API — Render

1. Render Dashboard → `signaldesk-api` → **Settings** → **Custom Domains**
2. Add `api.signaldesk.com`
3. Add the CNAME record Render provides to your registrar

### Update API URL

After setting a custom domain on Render, update the Vercel env var:

| Key | New Value |
|-----|-----------|
| `VITE_API_URL` | `https://api.signaldesk.com` |

Then redeploy the frontend from Vercel dashboard.

---

## Environment Variables Reference

### Vercel (Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://signaldesk-api.onrender.com` |

### Render (API) — set automatically by `render.yaml`

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-linked from `signaldesk-db` |
| `PYTHON_VERSION` | Python runtime version | `3.11.9` |

---

## Local Development

Local development works exactly the same as before — no configuration changes needed.

```bash
# Terminal 1: Start the API
uvicorn apps.api.main:app --reload --port 8000

# Terminal 2: Start the frontend
cd apps/web
npm run dev
```

The frontend falls back to `http://localhost:8000` when `VITE_API_URL` is not set.

---

## Demo Tips

### Warm Up Before a Demo

Render's free tier spins down the API after 15 minutes of inactivity. The first request after idle takes ~30–50 seconds. Run this 1 minute before your demo:

```bash
curl https://signaldesk-api.onrender.com/health
```

### Quick Health Check Script

```bash
#!/bin/bash
echo "🔄 Warming up SignalDesk API..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://signaldesk-api.onrender.com/health)
if [ "$response" = "200" ]; then
  echo "✅ API is online and ready"
else
  echo "⏳ API is starting up (got HTTP $response), wait 30s and retry"
fi
```

---

## Free Tier Limits

### Render

| Resource | Limit | Notes |
|----------|-------|-------|
| Web Service hours | 750 hrs/month | More than enough for demo use |
| PostgreSQL | 90 days, 1 GB | After 90 days: upgrade or re-create |
| Cold start | ~30–50s after 15min idle | Warm up before demos |
| Bandwidth | 100 GB/month | Sufficient for demo/early use |

### Vercel

| Resource | Limit | Notes |
|----------|-------|-------|
| Bandwidth | 100 GB/month | Generous for an SPA |
| Builds | 6,000 mins/month | ~200 deploys |
| Serverless Functions | 100 GB-hrs/month | Not used (static SPA) |

---

## Upgrading to Production

When SignalDesk is ready for real users:

| Service | Free → Paid | Cost | Benefit |
|---------|-------------|------|---------|
| Render Web Service | Free → Starter | $7/mo | No cold starts, always-on |
| Render PostgreSQL | Free → Starter | $7/mo | No 90-day expiry, backups |
| Vercel | Free → Pro | $20/mo | Team features, analytics |
| **Total** | | **$14–34/mo** | Production-ready |

---

## Troubleshooting

### "render.yaml not found on master branch"

The file must be committed and pushed:

```bash
git add render.yaml
git commit -m "add render.yaml"
git push origin master
```

### API returns CORS errors

The FastAPI backend already allows all origins (`allow_origins=["*"]`). If you see CORS issues, ensure `VITE_API_URL` does not have a trailing slash.

### Frontend shows "localhost:8000" errors in production

The `VITE_API_URL` environment variable wasn't set on Vercel, or the app wasn't redeployed after setting it. Add the variable in Vercel dashboard and trigger a redeploy.

### Database connection fails on Render

Check that `DATABASE_URL` is auto-linked in the Render dashboard under your web service's **Environment** tab. It should show as linked to `signaldesk-db`.
