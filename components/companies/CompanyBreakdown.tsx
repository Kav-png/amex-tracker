"use client"

import { useState, useMemo, useEffect } from "react"
import { cn, formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transactions/TransactionList"
import { ChevronDown, ArrowDownUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Transaction, CustomCategory } from "@/lib/supabase/types"

function firstWord(description: string): string {
  return description.trim().split(/\s+/)[0].toUpperCase()
}

function buildCompanyGroups(transactions: Transaction[]) {
  const map = new Map<string, { total: number; transactions: Transaction[] }>()

  for (const tx of transactions) {
    const key = firstWord(tx.description ?? "Unknown")
    if (!map.has(key)) map.set(key, { total: 0, transactions: [] })
    const entry = map.get(key)!
    entry.transactions.push(tx)
    if (!tx.excluded) entry.total += tx.amount
  }

  return Array.from(map.entries()).map(([name, { total, transactions }]) => ({
    name,
    total,
    transactions,
  }))
}

interface CompanyBreakdownProps {
  transactions: Transaction[]
  customCategories: CustomCategory[]
}

export function CompanyBreakdown({ transactions, customCategories }: CompanyBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [txState, setTxState] = useState(transactions)
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    setTxState(transactions)
    setExpanded(null)
  }, [transactions])

  const groups = useMemo(() => {
    const built = buildCompanyGroups(txState)
    return built.sort((a, b) => sortDesc ? b.total - a.total : a.total - b.total)
  }, [txState, sortDesc])

  const grandTotal = useMemo(
    () => groups.reduce((s, g) => s + g.total, 0),
    [groups]
  )

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
          {txState.filter((t) => !t.excluded).length} transactions · {groups.length} companies
        </p>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-gray-900">{formatCurrency(grandTotal)}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDesc((d) => !d)}
            className="h-7 gap-1.5 text-xs"
          >
            <ArrowDownUp className="h-3 w-3" />
            {sortDesc ? "High" : "Low"}
          </Button>
        </div>
      </div>

      {groups.map((group) => {
        const pct = grandTotal > 0 ? (group.total / grandTotal) * 100 : 0
        const isOpen = expanded === group.name

        return (
          <div key={group.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : group.name)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                <span className="text-[10px] font-bold text-indigo-600 leading-none">
                  {group.name.slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{group.name}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                    {formatCurrency(group.total)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-10 text-right">
                    {group.transactions.length} tx
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
                  transactions={group.transactions}
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
