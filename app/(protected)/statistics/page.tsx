export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector"
import { SpendingBarChart } from "@/components/charts/SpendingBarChart"
import { CategoryPieChart } from "@/components/charts/CategoryPieChart"
import { SpendingLineChart } from "@/components/charts/SpendingLineChart"
import { getDateRange, getPreviousDateRange, formatCurrency, type TimeRange } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction, CategoryTotal, InsightData } from "@/lib/supabase/types"
import type { LineDataPoint } from "@/components/charts/SpendingLineChart"

const CATEGORY_COLORS: Record<string, string> = {
  "Eating Out": "#F59E0B", "Entertainment": "#8B5CF6", "Groceries": "#10B981",
  "Shopping": "#EC4899", "Transport": "#3B82F6", "Accommodation": "#06B6D4",
  "Bills & Utilities": "#64748B", "Health": "#EF4444", "Travel": "#F97316",
  "Personal Care": "#A855F7", "Fees": "#6B7280", "Cash": "#78716C",
  "Transfers": "#94A3B8", "Other": "#CBD5E1",
}

function buildCategories(transactions: Transaction[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>()
  for (const tx of transactions) {
    if (tx.excluded) continue
    const name = tx.custom_category ?? tx.category ?? "Other"
    if (!map.has(name)) {
      map.set(name, { name, total: 0, color: CATEGORY_COLORS[name] ?? "#6366F1", transactions: [] })
    }
    const cat = map.get(name)!
    cat.total += tx.amount
    cat.transactions.push(tx)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

function buildLineData(transactions: Transaction[], from: Date, to: Date): LineDataPoint[] {
  const dayMs = 24 * 60 * 60 * 1000
  const durationDays = Math.ceil((to.getTime() - from.getTime()) / dayMs)

  // Use weekly buckets for > 60 days, daily otherwise
  if (durationDays > 60) {
    const weeks = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.excluded) continue
      const d = new Date(tx.timestamp)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split("T")[0]
      weeks.set(key, (weeks.get(key) ?? 0) + tx.amount)
    }
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }))
  }

  const days = new Map<string, number>()
  for (const tx of transactions) {
    if (tx.excluded) continue
    const key = tx.timestamp.split("T")[0]
    days.set(key, (days.get(key) ?? 0) + tx.amount)
  }
  return Array.from(days.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }))
}

function computeInsights(
  current: Transaction[],
  previous: Transaction[]
): InsightData {
  const included = current.filter((t) => !t.excluded)
  const totalSpend = included.reduce((s, t) => s + t.amount, 0)

  const catMap = new Map<string, number>()
  for (const tx of included) {
    const name = tx.custom_category ?? tx.category ?? "Other"
    catMap.set(name, (catMap.get(name) ?? 0) + tx.amount)
  }

  const sorted = Array.from(catMap.entries()).sort(([, a], [, b]) => b - a)
  const topCategory = sorted.length
    ? { name: sorted[0][0], total: sorted[0][1], percent: totalSpend > 0 ? (sorted[0][1] / totalSpend) * 100 : 0 }
    : null

  const biggestTransaction = included.sort((a, b) => b.amount - a.amount)[0] ?? null

  const prevCatMap = new Map<string, number>()
  for (const tx of previous.filter((t) => !t.excluded)) {
    const name = tx.custom_category ?? tx.category ?? "Other"
    prevCatMap.set(name, (prevCatMap.get(name) ?? 0) + tx.amount)
  }

  let mostImprovedCategory: InsightData["mostImprovedCategory"] = null
  let biggestIncrease = 0
  for (const [name, curr] of catMap.entries()) {
    const prev = prevCatMap.get(name) ?? 0
    const change = curr - prev
    if (change > biggestIncrease) {
      biggestIncrease = change
      mostImprovedCategory = { name, change }
    }
  }

  return { topCategory, biggestTransaction, mostImprovedCategory, totalSpend, transactionCount: included.length }
}

export default async function StatisticsPage({
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
  const { from: prevFrom, to: prevTo } = getPreviousDateRange(range, from, to)

  const [{ data: currentTx }, { data: previousTx }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("transaction_type", "DEBIT")
      .gte("timestamp", from.toISOString())
      .lte("timestamp", to.toISOString()),
    supabase
      .from("transactions")
      .select("id, amount, custom_category, category, excluded, timestamp")
      .eq("user_id", user.id)
      .eq("transaction_type", "DEBIT")
      .gte("timestamp", prevFrom.toISOString())
      .lte("timestamp", prevTo.toISOString()),
  ])

  const transactions = currentTx ?? []
  const categories = buildCategories(transactions)
  const lineData = buildLineData(transactions, from, to)
  const insights = computeInsights(transactions, (previousTx ?? []) as Transaction[])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Statistics</h1>

      <Suspense fallback={null}>
        <TimeRangeSelector currentRange={range} />
      </Suspense>

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-0.5">Total spend</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(insights.totalSpend)}</p>
            <p className="text-xs text-gray-400">{insights.transactionCount} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-0.5">Top category</p>
            <p className="text-base font-bold text-gray-900 truncate">{insights.topCategory?.name ?? "—"}</p>
            <p className="text-xs text-gray-400">
              {insights.topCategory ? `${insights.topCategory.percent.toFixed(0)}% of spend` : "No data"}
            </p>
          </CardContent>
        </Card>
        {insights.biggestTransaction && (
          <Card className="col-span-2">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 mb-0.5">Largest transaction</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 truncate mr-2">
                  {insights.biggestTransaction.merchant_name ?? insights.biggestTransaction.description}
                </p>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {formatCurrency(insights.biggestTransaction.amount)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {insights.mostImprovedCategory && (
          <Card className="col-span-2">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 mb-0.5">Biggest increase vs prior period</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{insights.mostImprovedCategory.name}</p>
                <p className="text-sm font-bold text-red-600">
                  +{formatCurrency(insights.mostImprovedCategory.change)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-500 text-sm">No spending data for this period.</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Spending over time</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingLineChart data={lineData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By category</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingBarChart categories={categories} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category split</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart categories={categories} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
