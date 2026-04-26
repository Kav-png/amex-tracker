# How to Delete Everything

Step-by-step guide to fully remove the app, all stored data, and all third-party access.

---

## 1. Disconnect AMEX in the App

Go to **Settings** and click **Disconnect**. This deletes:
- All synced transactions from the database
- The TrueLayer connection record (access token, refresh token, account ID)

Custom categories are preserved but can be deleted via Supabase (step 3).

---

## 2. Revoke TrueLayer Access from Your AMEX Account

TrueLayer holds a consent grant that allows it to read your AMEX data. Revoking this means TrueLayer can no longer refresh your token even if the app still had one stored.

1. Go to [https://auth.truelayer.com/profile](https://auth.truelayer.com/profile) and sign in
2. Find the consent for this app and revoke it
3. Alternatively, contact American Express directly to revoke any active open banking consents

---

## 3. Delete Your Data from Supabase

If you want to wipe your account entirely (including the auth user record):

**Option A — via the app** (soft delete):
- Disconnect in Settings (clears transactions + connection)
- There is no in-app account deletion — use Option B

**Option B — via Supabase Dashboard**:
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and open the project
2. Go to **Authentication → Users**, find your user, and delete it
3. Because all tables use `ON DELETE CASCADE` from `auth.users`, this automatically deletes all transactions, connections, and custom categories

**Option C — via SQL Editor** (delete data but keep the account):
```sql
DELETE FROM public.transactions WHERE user_id = auth.uid();
DELETE FROM public.truclayer_connections WHERE user_id = auth.uid();
DELETE FROM public.custom_categories WHERE user_id = auth.uid();
```

---

## 4. Delete the Supabase Project

To fully remove the database, storage, and auth system:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open the project → **Settings → General**
3. Scroll to the bottom → **Delete Project**
4. Type the project name to confirm

This is irreversible. All data, users, and configuration are permanently deleted.

---

## 5. Delete the TrueLayer App

1. Go to [https://console.truelayer.com](https://console.truelayer.com)
2. Open your application
3. Go to **Settings → Danger Zone → Delete Application**

This removes your client ID, client secret, and all associated consents.

---

## 6. Delete the Vercel Project

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Open the **amex-tracker** project → **Settings**
3. Scroll to **Delete Project** and confirm

This removes all deployments, environment variables, and the production URL.

---

## 7. Delete the GitHub Repository

1. Go to [https://github.com/Kav-png/amex-tracker](https://github.com/Kav-png/amex-tracker)
2. **Settings → Danger Zone → Delete this repository**
3. Type the repository name to confirm

---

## Summary of Third-Party Services Used

| Service | Purpose | Delete / Revoke at |
|---|---|---|
| **TrueLayer** | Open Banking API — reads AMEX card transactions | [console.truelayer.com](https://console.truelayer.com) |
| **American Express** | Source of transaction data via Open Banking consent | [americanexpress.com](https://www.americanexpress.com) → account settings → open banking |
| **Supabase** | Database, authentication, Row Level Security | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **Vercel** | Hosting, CI/CD, environment variables | [vercel.com/dashboard](https://vercel.com/dashboard) |
| **GitHub** | Source code repository | [github.com/Kav-png/amex-tracker](https://github.com/Kav-png/amex-tracker) |
