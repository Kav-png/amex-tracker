import { SupabaseClient } from "@supabase/supabase-js"
import { getCardTransactions, refreshAccessToken, TLTransaction } from "./client"

const CATEGORY_MAP: Record<string, string> = {
  EATING_OUT: "Eating Out",
  ENTERTAINMENT: "Entertainment",
  GROCERIES: "Groceries",
  SHOPPING: "Shopping",
  TRANSPORT: "Transport",
  ACCOMMODATION: "Accommodation",
  BILLS: "Bills & Utilities",
  HEALTH: "Health",
  TRAVEL: "Travel",
  INCOME: "Income",
  SAVINGS: "Savings",
  EDUCATION: "Education",
  INSURANCE: "Insurance",
  PERSONAL_CARE: "Personal Care",
  GENERAL: "General",
  PURCHASE: "Shopping",
  CASH: "Cash",
  TRANSFER: "Transfers",
  DIRECT_DEBIT: "Bills & Utilities",
  FEE_CHARGE: "Fees",
}

function normaliseCategory(tlCategory: string): string {
  return CATEGORY_MAP[tlCategory?.toUpperCase()] ?? "Other"
}

async function getValidAccessToken(supabase: SupabaseClient, connection: {
  id: string
  access_token: string
  refresh_token: string
  expires_at: string
}): Promise<string> {
  const expiresAt = new Date(connection.expires_at)
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)

  if (expiresAt > fiveMinutesFromNow) {
    return connection.access_token
  }

  const refreshed = await refreshAccessToken(connection.refresh_token)
  await supabase
    .from("truclayer_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    })
    .eq("id", connection.id)

  return refreshed.access_token
}

export async function syncTransactions(
  supabase: SupabaseClient,
  userId: string,
  fromDate?: Date
): Promise<{ synced: number; errors: string[] }> {
  const { data: connection, error: connError } = await supabase
    .from("truclayer_connections")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (connError || !connection) {
    throw new Error("No TrueLayer connection found for user")
  }

  const accessToken = await getValidAccessToken(supabase, connection)

  // Default: pull 90 days of history (TrueLayer sandbox limit)
  const from = fromDate ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const to = new Date()

  const tlTransactions = await getCardTransactions(accessToken, connection.account_id, from, to)

  const errors: string[] = []
  let synced = 0
  const CHUNK = 500

  for (let i = 0; i < tlTransactions.length; i += CHUNK) {
    const chunk = tlTransactions.slice(i, i + CHUNK)
    const rows = chunk.map((tx: TLTransaction) => ({
      user_id: userId,
      external_id: tx.transaction_id,
      amount: Math.abs(tx.amount),
      currency: tx.currency,
      description: tx.description ?? null,
      merchant_name: tx.merchant_name ?? null,
      timestamp: tx.timestamp,
      category: normaliseCategory(tx.transaction_category),
      transaction_type: tx.transaction_type,
    }))

    const { error } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "user_id,external_id" })

    if (error) {
      errors.push(error.message)
    } else {
      synced += chunk.length
    }
  }

  return { synced, errors }
}
