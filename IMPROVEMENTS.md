# Possible Improvements

Ranked roughly by impact vs effort.

---

## High Impact

### Keyword-based Categorisation
TrueLayer card transactions return `null` or `PURCHASE` for `transaction_category`, so most transactions default to "Other". A keyword matcher on `description` and `merchant_name` at sync time would auto-assign meaningful categories (Eating Out, Groceries, Transport, etc.) without any user input. The plan for this already exists in the codebase — it just hasn't been implemented yet.

### Recurring / Subscription Detection
Identify transactions that appear at regular intervals (same merchant, similar amount, monthly/weekly cadence) and tag them as subscriptions. Surface them on a dedicated "Subscriptions" view with monthly cost totals — very useful for auditing what you're actually paying for.

### Budgets & Spending Limits
Allow setting a monthly budget per category. Show progress bars on the dashboard turning amber/red as you approach or exceed the limit. Optional push notification (via Web Push API) when a budget is hit.

### Real-time Updates (Supabase Realtime)
Currently the dashboard only updates on page load or manual sync. Subscribing to the `transactions` table via Supabase Realtime would make the UI reflect new transactions the moment they land — no refresh required.

---

## Medium Impact

### Token Encryption at Rest
TrueLayer access and refresh tokens are stored in plaintext in Supabase. Encrypting them using Supabase Vault (or application-level AES-256 before insert) would mean a database breach doesn't expose live bank access tokens. Low practical risk with RLS in place, but good practice for anything holding financial credentials.

### CSV / PDF Export
A one-click export of the filtered transaction set for the selected date range. Useful for expense reports, tax returns, or handing to an accountant.

### Multiple Card Support
Currently the app assumes one AMEX card per user. Supporting multiple TrueLayer connections (or multiple accounts from one connection) would let users track a supplementary card or a partner's card in the same dashboard.

### Smarter Date Range — Rolling vs Fixed
Add "this month", "last month", "this year" presets in addition to the current relative ranges (1M, 3M, etc.). The difference matters — "last month" is always a complete calendar month, whereas "1M" is rolling from today.

### Merchant Logo / Enrichment
Use a merchant enrichment API (e.g. Brandfetch, Clearbit, or TrueLayer's own enrichment layer) to show brand logos next to transactions instead of raw text descriptions.

---

## Lower Impact / Nice to Have

### Dark Mode
Tailwind `dark:` classes are already available. Add a theme toggle that persists to `localStorage` or a cookie.

### Search & Filter
A search bar on the dashboard and companies page to filter by description, merchant, or amount range without changing the date range.

### Spending Trends & Forecasting
Given 2 years of data, project end-of-month spend based on daily average so far. Highlight categories trending up vs the previous period.

### AI-powered Smart Categorisation
Send transaction descriptions to a language model (Claude, GPT) to classify them with higher accuracy than keyword matching — especially useful for unfamiliar or foreign merchants.

### Email Digest
A weekly or monthly summary email (via Resend or Supabase Edge Functions + cron) showing total spend, top categories, and any new subscriptions detected.

### More Providers
Extend beyond AMEX to support other TrueLayer-connected banks (Monzo, Starling, Barclays, HSBC) — the TrueLayer integration is already in place, the app would just need multi-connection support.

### Shared / Family View
Allow sharing a read-only view of the dashboard with another user (e.g. partner) via a signed URL or invite system, without giving them edit access.

### PWA Push Notifications
Use the Web Push API (already partially available via the existing PWA setup) to send budget alerts or "your sync is complete" notifications to the home screen.
