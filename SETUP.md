# AMEX Tracker — Setup Guide

## Prerequisites
- Node.js 20+
- A Supabase account (free tier works)
- A TrueLayer account (free sandbox available)
- A Vercel account (free tier works)

---

## Step 1 — Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Once created, go to **SQL Editor → New query**
3. Paste and run the contents of `supabase/schema.sql`
4. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Authentication → URL Configuration** and set:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: add `https://your-domain.vercel.app/**`

---

## Step 2 — TrueLayer

1. Go to [console.truelayer.com](https://console.truelayer.com) → Create application
2. Under **Redirect URIs**, add: `https://your-domain.vercel.app/api/truclayer/callback`
3. Also add the localhost URI for local dev: `http://localhost:3000/api/truclayer/callback`
4. Copy **Client ID** → `TRUCLAYER_CLIENT_ID`
5. Copy **Client Secret** → `TRUCLAYER_CLIENT_SECRET`
6. For local testing, enable the **Sandbox** — you'll get mock AMEX data

---

## Step 3 — Local Development

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local

npm run dev
# → http://localhost:3000
```

For local dev, update `.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
TRUCLAYER_REDIRECT_URI=http://localhost:3000/api/truclayer/callback
```

---

## Step 4 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars (or use the Vercel dashboard)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add TRUCLAYER_CLIENT_ID
vercel env add TRUCLAYER_CLIENT_SECRET
vercel env add TRUCLAYER_REDIRECT_URI
vercel env add NEXT_PUBLIC_APP_URL
```

After deploying, update your Supabase Auth redirect URLs and TrueLayer redirect URIs with the production domain.

---

## Step 5 — PWA Icons

Place two PNG icons in `public/icons/`:
- `icon-192.png` (192×192px)
- `icon-512.png` (512×512px)

You can generate these from any icon using [maskable.app](https://maskable.app/editor).

---

## How it works

1. **Login**: Visit the app → enter your email → click the magic link
2. **Connect AMEX**: Settings → Connect AMEX → authorise on TrueLayer's page
3. **Sync**: Historical data (up to 2 years) syncs automatically on first connect. Use the Sync button to pull recent transactions.
4. **Dashboard**: Browse spending by time range → expand categories → exclude group bookings
5. **Statistics**: View bar/pie/line charts + spending insights
