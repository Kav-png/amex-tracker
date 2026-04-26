"use client"

import { useState, useMemo, useEffect } from "react"
import { cn, formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transactions/TransactionList"
import { ChevronDown } from "lucide-react"
import type { Transaction, CustomCategory, CategoryTotal } from "@/lib/supabase/types"

const CATEGORY_COLORS: Record<string, string> = {
  "Eating Out": "#F59E0B",
  "Entertainment": "#8B5CF6",
  "Groceries": "#10B981",
  "Shopping": "#EC4899",
  "Transport": "#3B82F6",
  "Accommodation": "#06B6D4",
  "Bills & Utilities": "#64748B",
  "Health": "#EF4444",
  "Travel": "#F97316",
  "Personal Care": "#A855F7",
  "Fees": "#6B7280",
  "Cash": "#78716C",
  "Transfers": "#94A3B8",
  "Other": "#CBD5E1",
}

function getCategoryColor(name: string, customCategories: CustomCategory[]): string {
  const custom = customCategories.find((c) => c.name === name)
  if (custom?.color) return custom.color
  return CATEGORY_COLORS[name] ?? "#6366F1"
}

function buildCategoryTotals(
  transactions: Transaction[],
  customCategories: CustomCategory[]
): CategoryTotal[] {
  const map = new Map<string, { total: number; transactions: Transaction[]; color: string }>()

  for (const tx of transactions) {
    const name = tx.custom_category ?? tx.category ?? "Other"
    const color = getCategoryColor(name, customCategories)
    if (!map.has(name)) {
      map.set(name, { total: 0, transactions: [], color })
    }
    const entry = map.get(name)!
    entry.transactions.push(tx)
    if (!tx.excluded) {
      entry.total += tx.amount
    }
  }

  return Array.from(map.entries())
    .map(([name, { total, transactions, color }]) => ({ name, total, transactions, color }))
    .sort((a, b) => b.total - a.total)
}

interface CategoryBreakdownProps {
  transactions: Transaction[]
  customCategories: CustomCategory[]
}

export function CategoryBreakdown({ transactions, customCategories }: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [txState, setTxState] = useState(transactions)

  useEffect(() => {
    setTxState(transactions)
    setExpanded(null)
  }, [transactions])

  const categories = useMemo(
    () => buildCategoryTotals(txState, customCategories),
    [txState, customCategories]
  )

  const grandTotal = categories.reduce((sum, c) => sum + c.total, 0)

  function handleUpdate(updated: Transaction) {
    setTxState((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  if (txState.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500 text-sm">No transactions for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          {txState.filter((t) => !t.excluded).length} transactions
        </p>
        <p className="text-base font-semibold text-gray-900">{formatCurrency(grandTotal)}</p>
      </div>

      {categories.map((category) => {
        const pct = grandTotal > 0 ? (category.total / grandTotal) * 100 : 0
        const isOpen = expanded === category.name

        return (
          <div key={category.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : category.name)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{category.name}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                    {formatCurrency(category.total)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: category.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-10 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                <TransactionList
                  transactions={category.transactions}
                  customCategories={customCategories}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
