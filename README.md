# AMEX Spending Tracker

A personal finance PWA that connects to a real American Express account via Open Banking and provides a spending dashboard — categorised, charted, and synced automatically.

## Features

- **Real bank data** — connects to live AMEX transactions via the TrueLayer Data API (OAuth 2.0, read-only)
- **Spending dashboard** — transactions grouped by category with collapsible rows, progress bars, and totals for any date range (1W / 1M / 3M / 6M / 1Y)
- **Statistics** — spending over time (line chart), by category (bar + pie chart), and insight cards (top category, largest transaction, biggest increase vs prior period)
- **Companies view** — transactions grouped by merchant, sortable high-to-low
- **Custom categories** — override any transaction's category, persisted to the database
- **Exclude transactions** — mark transactions as excluded with a note so they don't skew totals
- **Background sync** — incremental sync using Next.js `after()` so the UI never blocks; resumes from the last transaction date with a 7-day late-posting buffer
- **Full history import** — up to 2 years of transaction history on demand
- **PWA** — installable on iOS and Android as a home screen app

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Lucide icons |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Open Banking | TrueLayer Data API |
| Deployment | Vercel |
| PWA | next-pwa |

## Security

- CSRF state token on the OAuth flow (32-byte random, stored in a signed `httpOnly` cookie)
- Row Level Security on every table — all queries scoped to `auth.uid()` at the database layer
- Rate limiting on the sync endpoint (60-second server-side cooldown)
- Content-Security-Policy, HSTS, X-Frame-Options, and other security headers on all responses
- Open redirect protection on auth callback — `next` param validated to reject absolute URLs
- TrueLayer tokens stored server-side only, never sent to the browser

## Getting Started

See [SETUP.md](./SETUP.md) for full setup instructions (Supabase, TrueLayer, Vercel).

```bash
cp .env.local.example .env.local
# Fill in all values

npm install
npm run dev
# → http://localhost:3000
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `TRUCLAYER_CLIENT_ID` | TrueLayer app client ID |
| `TRUCLAYER_CLIENT_SECRET` | TrueLayer app client secret |
| `TRUCLAYER_REDIRECT_URI` | OAuth callback URL |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

TrueLayer sandbox mode is auto-detected from the `TRUCLAYER_CLIENT_ID` prefix (`sandbox-`), so no extra config is needed for local development.
