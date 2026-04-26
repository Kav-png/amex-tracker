export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector"
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown"
import { getDateRange, type TimeRange } from "@/lib/utils"
import { SyncButton } from "@/components/dashboard/SyncButton"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; connected?: string; syncing?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const range = (params.range as TimeRange) || "1M"
  const { from, to } = getDateRange(range, params.from, params.to)

  const [{ data: transactions }, { data: customCategories }, { data: connection }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("transaction_type", "DEBIT")
        .gte("timestamp", from.toISOString())
        .lte("timestamp", to.toISOString())
        .order("timestamp", { ascending: false }),
      supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("truclayer_connections")
        .select("account_id, created_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Spending</h1>
          {(params.connected || params.syncing) && (
            <p className="text-sm text-green-600 mt-0.5">AMEX connected — syncing transactions in the background…</p>
          )}
        </div>
        {connection && <SyncButton />}
      </div>

      {!connection ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-500 text-sm">Connect your AMEX card to start tracking.</p>
          <a
            href="/api/truclayer/connect"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Connect AMEX
          </a>
        </div>
      ) : (
        <>
          <Suspense fallback={null}>
            <TimeRangeSelector currentRange={range} />
          </Suspense>
          <CategoryBreakdown
            transactions={transactions ?? []}
            customCategories={customCategories ?? []}
          />
        </>
      )}
    </div>
  )
}
