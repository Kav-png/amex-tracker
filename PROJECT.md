# AMEX Spending Tracker — Project Overview

## What This Project Achieves

A full-stack Progressive Web App that connects to a real American Express account via Open Banking and provides a personal spending dashboard — categorised, searchable, and synced automatically.

### Core Features

- **Real bank data** — connects to live AMEX card transactions via TrueLayer's Open Banking API (OAuth 2.0 authorisation flow, read-only access)
- **Automatic sync** — incremental background sync using Next.js `after()` so the UI never blocks; resumes from the last transaction date to avoid re-fetching everything
- **Full history import** — 2-year transaction history on demand, capped to 90 days in sandbox
- **Spending dashboard** — transactions grouped by category with collapsable rows, progress bars, and grand totals for any date range (1W / 1M / 3M / 6M / 1Y / custom)
- **Statistics page** — spending over time (line chart), by category (bar + pie chart), insight cards (top category, largest transaction, biggest increase vs prior period)
- **Companies view** — transactions grouped by first word of merchant description, sortable high-to-low or low-to-high
- **Custom categories** — override any transaction's category; persisted to the database
- **Exclude transactions** — mark transactions as excluded with a note so they don't affect totals
- **Connect / Disconnect** — settings page to link or unlink AMEX; disconnect wipes all synced transactions and the connection record
- **Auth** — email/password sign-up with email confirmation, forgot password, and reset password flows via Supabase Auth
- **PWA** — installable on iOS and Android as a home screen app

### Security

- CSRF state parameter on the OAuth flow (32-byte random token in a signed `httpOnly` cookie)
- Rate limiting on the sync endpoint (60-second cooldown, enforced server-side via `last_synced_at`)
- Row Level Security on every Supabase table — all queries are scoped to `auth.uid()` at the database layer
- Auth enforced at the edge via `proxy.ts` (Next.js 16 routing proxy)
- Security headers on all responses: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- Sanitised error responses — internal errors are logged server-side only
- Input validation: UUID format check on transaction IDs, strict boolean check on sync body params
- TrueLayer tokens never sent to the browser

---

## CV Bullet Points

- Built a full-stack Open Banking PWA in **Next.js 16** (App Router, Server Components, Turbopack) connected to a live **American Express** account via the **TrueLayer Data API**, syncing real card transactions in the background using `after()` to keep the UI non-blocking
- Designed and implemented an incremental sync engine that resumes from the last transaction date (with a 7-day late-posting buffer), reducing redundant API calls while supporting a full 2-year history import
- Secured the OAuth 2.0 flow end-to-end: CSRF state tokens in `httpOnly` cookies, server-side rate limiting via a `last_synced_at` timestamp, sanitised error responses, and input validation throughout all API routes
- Configured **Supabase** with Row Level Security policies scoped to `auth.uid()` on every table, ensuring zero cross-user data access at the database layer regardless of application-level bugs
- Deployed on **Vercel** with GitHub CI/CD, environment-aware sandbox/production switching (auto-detected from `TRUCLAYER_CLIENT_ID` prefix), and security headers applied globally via `next.config.ts`
- Delivered four distinct views — Dashboard, Statistics, Companies, Settings — each sharing a reusable date-range selector and collapsable transaction breakdown components built with **shadcn/ui**, **Tailwind CSS**, and **Recharts**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Lucide icons |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Open Banking | TrueLayer Data API |
| Deployment | Vercel (with GitHub CI/CD) |
| PWA | next-pwa |
| Date handling | date-fns |
