# Amex Tracker - Architecture Documentation

This document describes the architecture of the Amex Tracker application, a Next.js app that tracks credit card spending by connecting to TrueLayer bank APIs.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AMEX TRACKER ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │     BROWSER         │
                              │  (React Frontend)   │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │  Server          │  │  Client          │  │  Static          │
         │  Components      │  │  Components      │  │  Assets          │
         │  (SSR)           │  │  (CSR)           │  │  (CSS, Images)   │
         └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
                  │                     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   NEXT.JS SERVER    │
                  │  (API Routes)       │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   SUPABASE          │
                  │  (Auth + Database)  │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ PostgreSQL │  │   Auth     │  │   REST     │
     │  Database  │  │  (JWT)     │  │   API      │
     └────────────┘  └────────────┘  └────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  TRUELAYER API      │
                  │  (Bank Connection)  │
                  └─────────────────────┘
```

---

## Technology Stack

| Layer    | Technology            | Purpose              |
| -------- | --------------------- | -------------------- |
| Frontend | React 18 + Next.js 14 | UI Framework         |
| Styling  | Tailwind CSS          | Utility-first CSS    |
| Charts   | Recharts              | Data visualization   |
| Backend  | Next.js API Routes    | Server-side logic    |
| Database | PostgreSQL (Supabase) | Data storage         |
| Auth     | Supabase Auth         | User authentication  |
| Bank API | TrueLayer             | Transaction fetching |

---

## Data Flow Diagrams

### 1. User Visits Dashboard (SSR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVER-SIDE RENDERING (SSR) FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

BROWSER                                                                    SERVER
   │                                                                         │
   │  1. GET /dashboard                                                      │
   │────────────────────────────────────────────────────────────────────────▶│
   │                                                                         │
   │                                                                  ┌──────┴──────┐
   │                                                                  │             │
   │                                                                  │  2. Create  │
   │                                                                  │  Supabase   │
   │                                                                  │  Client     │
   │                                                                  └──────┬──────┘
   │                                                                         │
   │                                                                  ┌──────┴──────┐
   │                                                                  │             │
   │                                                                  │  3. Get     │
   │                                                                  │  User       │
   │                                                                  │  (JWT)      │
   │                                                                  └──────┬──────┘
   │                                                                         │
   │                                                                  ┌──────┴──────┐
   │                                                                  │             │
   │                                                                  │  4. Query   │
   │                                                                  │  Database   │
   │                                                                  │             │
   │                                                                  │  SELECT *   │
   │                                                                  │  FROM       │
   │                                                                  │  trans-     │
   │                                                                  │  actions    │
   │                                                                  │  WHERE      │
   │                                                                  │  user_id    │
   │                                                                  │  = ?         │
   │                                                                  └──────┬──────┘
   │                                                                         │
   │                                                                  ┌──────┴──────┐
   │                                                                  │             │
   │                                                                  │  5. RLS     │
   │                                                                  │  Filters    │
   │                                                                  │  (auto)     │
   │                                                                  └──────┬──────┘
   │                                                                         │
   │                                                                  ┌──────┴──────┐
   │                                                                  │             │
   │                                                                  │  6. Render  │
   │                                                                  │  HTML       │
   │                                                                  └──────┬──────┘
   │                                                                         │
   │  7. HTML + Data                                                         │
   │◀────────────────────────────────────────────────────────────────────────│
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐    │
   │  │ <html>                                                          │    │
   │  │   <div>Spending</div>                                          │    │
   │  │   <div data-transactions="[...]">                              │    │
   │  │     <div class="transaction">Tesco - £45.00</div>             │    │
   │  │     <div class="transaction">Amazon - £23.99</div>            │    │
   │  │   </div>                                                        │    │
   │  │ </html>                                                         │    │
   │  └─────────────────────────────────────────────────────────────────┘    │
   │                                                                         │
   │  8. React Hydrates (attaches event handlers)                           │
   │────────────────────────────────────────────────────────────────────────▶│
```

### 2. User Changes Category (CSR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE RENDERING (CSR) FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

BROWSER                                      SUPABASE                          SERVER
   │                                            │                                │
   │  1. User clicks "Eating Out" dropdown      │                                │
   │  ┌─────────────────────────────────────┐   │                                │
   │  │ <select onChange={handleCategory}>  │   │                                │
   │  │   <option>Groceries</option>        │   │                                │
   │  │   <option selected>Eating Out</option>                                │
   │  └─────────────────────────────────────┘   │                                │
   │                                            │                                │
   │  2. handleCategoryChange("Eating Out")    │                                │
   │       │                                    │                                │
   │       ▼                                    │                                │
   │  ┌─────────────────────────────────────┐   │                                │
   │  │ createBrowserClient()               │   │                                │
   │  │ - Uses JWT from cookies             │   │                                │
   │  └─────────────────────────────────────┘   │                                │
   │                                            │                                │
   │  3. UPDATE query                           │                                │
   │────────────────────────────────────────────────────────────────────────▶│
   │                                            │                                │
   │                                       ┌────┴────┐                           │
   │                                       │         │                           │
   │                                       │ 4. Vali │                           │
   │                                       │ date    │                           │
   │                                       │ JWT     │                           │
   │                                       └────┬────┘                           │
   │                                            │                                │
   │                                       ┌────┴────┐                           │
   │                                       │         │                           │
   │                                       │ 5. RLS  │                           │
   │                                       │ Check   │                           │
   │                                       │         │                           │
   │                                       │ user_id │                           │
   │                                       │ =       │                           │
   │                                       │ auth    │                           │
   │                                       │ .uid()  │                           │
   │                                       └────┬────┘                           │
   │                                            │                                │
   │                                       ┌────┴────┐                           │
   │                                       │         │                           │
   │                                       │ 6. Upda │                           │
   │                                       │ te      │                           │
   │                                       │ Row     │                           │
   │                                       └────┬────┘                           │
   │                                            │                                │
   │  7. Response: { id, custom_category: "Eating Out" }                       │
   │◀─────────────────────────────────────────────────────────────────────────│
   │                                            │                                │
   │  8. setTx(updated) → Re-render component  │                                │
   │  ┌─────────────────────────────────────┐   │                                │
   │  │ <span class="category">Eating Out</span>                                │
   │  └─────────────────────────────────────┘   │                                │
```

### 3. Background Sync (TrueLayer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKGROUND SYNC FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

BROWSER              NEXT.JS SERVER              TRUELAYER API         SUPABASE
   │                      │                           │                    │
   │  1. Click Sync       │                           │                    │
   │─────────────────────▶│                           │                    │
   │                      │                           │                    │
   │                 ┌────┴────┐                      │                    │
   │                 │         │                      │                    │
   │                 │ 2. Valid│                      │                    │
   │                 │ ate     │                      │                    │
   │                 │ Auth    │                      │                    │
   │                 └────┬────┘                      │                    │
   │                      │                           │                    │
   │                 ┌────┴────┐                      │                    │
   │                 │         │                      │                    │
   │                 │ 3. Rate │                      │                    │
   │                 │ Limit   │                      │                    │
   │                 │ Check   │                      │                    │
   │                 └────┬────┘                      │                    │
   │                      │                           │                    │
   │                      │  4. after() schedules     │                    │
   │                      │  background task          │                    │
   │                      │                           │                    │
   │  5. "started"        │                           │                    │
   │◀─────────────────────│                           │                    │
   │                      │                           │                    │
   │                      │  ┌────────────────────────┴───────────────┐      │
   │                      │  │ BACKGROUND TASK (after response)       │      │
   │                      │  └────────────────────────────────────────┘      │
   │                      │                           │                    │
   │                      │                      ┌────┴────┐               │
   │                      │                      │         │               │
   │                      │                      │ 6. Get  │               │
   │                      │                      │ OAuth   │               │
   │                      │                      │ Tokens  │               │
   │                      │                      └────┬────┘               │
   │                      │                           │                    │
   │                      │                      ┌────┴────┐               │
   │                      │                      │         │               │
   │                      │                      │ 7. Check│               │
   │                      │                      │ Token   │               │
   │                      │                      │ Expired?│               │
   │                      │                      └────┬────┘               │
   │                      │                           │                    │
   │                      │                      ┌────┴────┐               │
   │                      │                      │         │               │
   │                      │                      │ 8. Fetch│               │
   │                      │                      │ Trans-  │               │
   │                      │                      │ actions │──────────────▶│
   │                      │                      └────┬────┘               │
   │                      │                           │                    │
   │                      │                      ┌────┴────┐               │
   │                      │                      │         │               │
   │                      │                      │ 9. Trans│               │
   │                      │                      │ form    │               │
   │                      │                      │ Categories              │
   │                      │                      │ (EATING │               │
   │                      │                      │ _OUT →  │               │
   │                      │                      │ "Eating │               │
   │                      │                      │ Out")   │               │
   │                      │                      └────┬────┘               │
   │                      │                           │                    │
   │                      │                      ┌────┴────┐               │
   │                      │                      │         │               │
   │                      │                      │10. Upse │               │
   │                      │                      │ rt to   │──────────────▶│
   │                      │                      │ DB      │               │
   │                      │                      └────┬────┘               │
   │                      │                           │                    │
```

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT TREE                                      │
└─────────────────────────────────────────────────────────────────────────────┘

app/
├── layout.tsx                    ← Root Layout (Server)
│   └── (protected)/
│       └── layout.tsx            ← Protected Layout (Server)
│           └── dashboard/
│               └── page.tsx      ← DashboardPage (Server)
│                   │
│                   ├── SyncButton.tsx              ← Client ("use client")
│                   │   └── Button.tsx              ← Client (UI component)
│                   │
│                   ├── TimeRangeSelector.tsx       ← Client
│                   │   └── Select.tsx              ← Client (UI component)
│                   │
│                   └── CategoryBreakdown.tsx       ← Client
│                       ├── CategoryPieChart.tsx    ← Client (Recharts)
│                       ├── SpendingBarChart.tsx    ← Client (Recharts)
│                       ├── SpendingLineChart.tsx   ← Client (Recharts)
│                       └── TransactionList.tsx     ← Client
│                           └── TransactionRow.tsx  ← Client
│                               └── ExcludeDialog.tsx ← Client
│                                   └── Dialog.tsx    ← Client (UI component)
│
└── api/
    └── truclayer/
        ├── sync/route.ts         ← API Route (Server)
        ├── connect/route.ts      ← API Route (Server)
        └── callback/route.ts     ← API Route (Server)
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│  truclayer_         │       │    transactions     │       │  custom_categories  │
│  connections        │       │                     │       │                     │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id (UUID)           │       │ id (UUID)           │       │ id (UUID)           │
│ user_id (UUID)  ────┼───────┤ user_id (UUID)  ────┼───────┼── user_id (UUID)    │
│ access_token        │       │ external_id         │       │ name                │
│ refresh_token       │       │ amount (NUMERIC)    │       │ color               │
│ expires_at          │       │ currency            │       │ created_at          │
│ account_id          │       │ description         │       └─────────────────────┘
│ created_at          │       │ merchant_name       │
└─────────────────────┘       │ timestamp           │
                              │ category            │
                              │ custom_category     │
                              │ transaction_type    │
                              │ excluded            │
                              │ exclusion_note      │
                              │ created_at          │
                              └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROW LEVEL SECURITY (RLS)                           │
└─────────────────────────────────────────────────────────────────────────────┘

  Policy: "Own transactions"
  ─────────────────────────
  SELECT, INSERT, UPDATE, DELETE
  WHERE user_id = auth.uid()

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  User A's Query: SELECT * FROM transactions                            │
  │                                                                         │
  │  Becomes: SELECT * FROM transactions WHERE user_id = 'user-a-uuid'    │
  │                                                                         │
  │  User B cannot see User A's transactions!                              │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Authentication                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   Browser    │────▶│  Supabase    │────▶│   JWT Token  │
  │   Login      │     │   Auth       │     │   Created    │
  └──────────────┘     └──────────────┘     └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │  HTTP-Only   │
                                              │  Cookie      │
                                              └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Client-Side Validation                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  TransactionRow.tsx                                                     │
  │  ─────────────────                                                      │
  │  const { data: { user } } = await supabase.auth.getUser()              │
  │                                                                         │
  │  // User ID comes from AUTH, not user input!                           │
  │  .eq("user_id", user.id)                                               │
  └─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Row Level Security (Database)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  RLS Policy: "Own transactions"                                         │
  │  ─────────────────────────────────                                      │
  │  USING: user_id = auth.uid()                                            │
  │                                                                         │
  │  Even if query is wrong, database enforces ownership!                  │
  └─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: API Route Validation                                             │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │  app/api/transactions/[id]/route.ts                                     │
  │  ─────────────────────────────────────                                   │
  │  const { data: { user } } = await supabase.auth.getUser()              │
  │  if (!user) return NextResponse.json({error: "Unauthorised"}, {status: 401})
  │                                                                         │
  │  // Double-check ownership                                              │
  │  .eq("user_id", user.id)                                               │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Server Components with Direct Database Access

```typescript
// app/(protected)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()  // Server client

  // Direct query - no API route needed!
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)

  return <CategoryBreakdown transactions={data} />
}
```

### 2. Client Components for Interactivity

```typescript
// components/transactions/TransactionRow.tsx
"use client";

export function TransactionRow({ transaction }) {
  const [tx, setTx] = useState(transaction);

  async function handleCategoryChange(newCategory) {
    const supabase = createClient(); // Browser client
    await supabase
      .from("transactions")
      .update({ custom_category: newCategory })
      .eq("id", tx.id);
  }
}
```

### 3. Background Sync with `after()`

```typescript
// app/api/truclayer/sync/route.ts
import { after } from "next/server";

export async function POST(request) {
  // Validate auth
  // Check rate limit

  // Schedule background task (runs AFTER response sent)
  after(async () => {
    await syncTransactions(supabase, user.id);
  });

  // Return immediately - user doesn't wait!
  return NextResponse.json({ status: "started" });
}
```

### 4. Auto-Refreshing OAuth Tokens

```typescript
// lib/truclayer/sync.ts
async function getValidAccessToken(connection) {
  const expiresAt = new Date(connection.expires_at);
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt > fiveMinutesFromNow) {
    return connection.access_token; // Still valid
  }

  // Token expired - refresh automatically!
  const refreshed = await refreshAccessToken(connection.refresh_token);
  await supabase.from("truclayer_connections").update({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
  });

  return refreshed.access_token;
}
```

---

## Performance Optimizations

### 1. Parallel Data Fetching

```typescript
// Fetch all data in parallel
const [transactions, categories, connection] = await Promise.all([
  supabase.from("transactions").select("*"),
  supabase.from("custom_categories").select("*"),
  supabase.from("truclayer_connections").select("*"),
]);
```

### 2. React `useTransition` for Non-Blocking Updates

```typescript
const [isPending, startTransition] = useTransition()

function handleSubmit() {
  startTransition(async () => {
    // Database update doesn't block UI
    await supabase.from("transactions").update(...)
  })
}
```

### 3. Incremental Sync

```typescript
// Only fetch new transactions (last 7 days buffer for late-posting)
const from = new Date(latestTimestamp - 7 * 24 * 60 * 60 * 1000);
const transactions = await getCardTransactions(token, from, new Date());
```

### 4. Upsert for Deduplication

```typescript
// Insert new, update existing - no duplicates!
await supabase.from("transactions").upsert(rows, {
  onConflict: "user_id,external_id",
});
```

---

## File Structure

```
amex-tracker/
├── app/
│   ├── (auth)/                    # Auth pages (login, forgot-password)
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (protected)/               # Protected pages (require auth)
│   │   ├── layout.tsx             # Shared layout with Navigation
│   │   ├── dashboard/page.tsx     # Main dashboard (Server Component)
│   │   ├── companies/page.tsx     # Company breakdown
│   │   ├── statistics/page.tsx    # Statistics page
│   │   └── settings/page.tsx      # Settings page
│   │
│   └── api/                       # API Routes
│       ├── transactions/
│       │   └── [id]/route.ts      # PATCH transaction
│       └── truclayer/
│           ├── sync/route.ts      # Trigger background sync
│           ├── connect/route.ts   # OAuth start
│           └── callback/route.ts  # OAuth callback
│
├── components/
│   ├── charts/                    # Recharts components
│   │   ├── CategoryPieChart.tsx
│   │   ├── SpendingBarChart.tsx
│   │   └── SpendingLineChart.tsx
│   │
│   ├── dashboard/                 # Dashboard components
│   │   ├── CategoryBreakdown.tsx
│   │   ├── SyncButton.tsx
│   │   ├── SyncingBanner.tsx
│   │   └── TimeRangeSelector.tsx
│   │
│   ├── transactions/              # Transaction components
│   │   ├── TransactionList.tsx
│   │   ├── TransactionRow.tsx
│   │   └── ExcludeDialog.tsx
│   │
│   ├── ui/                        # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── skeleton.tsx
│   │
│   └── nav/
│       └── Navigation.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── types.ts               # TypeScript types
│   │
│   ├── truclayer/
│   │   ├── client.ts              # TrueLayer API client
│   │   └── sync.ts                # Sync logic
│   │
│   └── utils.ts                   # Utility functions (cn, formatCurrency)
│
├── supabase/
│   └── schema.sql                 # Database schema with RLS policies
│
└── public/
    └── manifest.json              # PWA manifest
```

---

## Summary

| Aspect               | Implementation                                    |
| -------------------- | ------------------------------------------------- |
| **Frontend**         | React 18 with Server Components                   |
| **Styling**          | Tailwind CSS with `cn()` utility                  |
| **Data Fetching**    | Server Components (SSR) + Client Components (CSR) |
| **Authentication**   | Supabase Auth (JWT in HTTP-only cookies)          |
| **Database**         | PostgreSQL with Row Level Security                |
| **External API**     | TrueLayer for bank transactions                   |
| **Background Tasks** | Next.js `after()` API                             |
| **Charts**           | Recharts library                                  |
| **Deployment**       | Vercel (Next.js optimized)                        |

This architecture provides:

- **Fast initial load** via Server-Side Rendering
- **Rich interactivity** via Client Components
- **Secure data access** via RLS and JWT validation
- **Reliable sync** via background processing
- **Beautiful visualizations** via Recharts
