export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector"
import { CompanyBreakdown } from "@/components/companies/CompanyBreakdown"
import { getDateRange, type TimeRange } from "@/lib/utils"

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const range = (params.range as TimeRange) || "1M"
  const { from, to } = getDateRange(range, params.from, params.to)

  const [{ data: transactions }, { data: customCategories }] = await Promise.all([
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
  ])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Companies</h1>

      <Suspense fallback={null}>
        <TimeRangeSelector currentRange={range} />
      </Suspense>

      <CompanyBreakdown
        transactions={transactions ?? []}
        customCategories={customCategories ?? []}
      />
    </div>
  )
}
