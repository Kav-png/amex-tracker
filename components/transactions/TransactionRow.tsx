"use client"

import { useState } from "react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { ExcludeDialog } from "./ExcludeDialog"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, CustomCategory } from "@/lib/supabase/types"

interface TransactionRowProps {
  transaction: Transaction
  customCategories: CustomCategory[]
  onUpdate: (updated: Transaction) => void
}

export function TransactionRow({ transaction: initialTx, customCategories, onUpdate }: TransactionRowProps) {
  const [tx, setTx] = useState(initialTx)
  const [showExclude, setShowExclude] = useState(false)
  const [changingCategory, setChangingCategory] = useState(false)

  const displayCategory = tx.custom_category ?? tx.category ?? "Other"
  const displayName = tx.merchant_name ?? tx.description ?? "Unknown"

  async function handleCategoryChange(newCategory: string) {
    setChangingCategory(false)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("transactions")
      .update({ custom_category: newCategory || null })
      .eq("id", tx.id)
      .select()
      .single()
    if (!error && data) {
      const updated = data as Transaction
      setTx(updated)
      onUpdate(updated)
    }
  }

  function handleUpdate(updated: Transaction) {
    setTx(updated)
    onUpdate(updated)
  }

  const defaultCategories = [
    "Eating Out", "Entertainment", "Groceries", "Shopping", "Transport",
    "Accommodation", "Bills & Utilities", "Health", "Travel", "Personal Care",
    "Fees", "Cash", "Transfers", "Other",
  ]
  const allCategories = [
    ...defaultCategories,
    ...customCategories.map((c) => c.name).filter((n) => !defaultCategories.includes(n)),
  ]

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors group",
          tx.excluded && "opacity-50"
        )}
      >
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-gray-900 truncate",
              tx.excluded && "line-through text-gray-400"
            )}
          >
            {displayName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{formatDate(tx.timestamp)}</span>
            {tx.excluded && tx.exclusion_note && (
              <span className="text-xs text-gray-400 italic truncate max-w-[180px]">
                &ldquo;{tx.exclusion_note}&rdquo;
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {changingCategory ? (
            <select
              autoFocus
              defaultValue={displayCategory}
              onBlur={() => setChangingCategory(false)}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setChangingCategory(true)}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Change category"
            >
              {displayCategory}
            </button>
          )}

          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              tx.excluded ? "text-gray-300 line-through" : "text-gray-900"
            )}
          >
            {formatCurrency(tx.amount, tx.currency)}
          </span>

          <button
            onClick={() => setShowExclude(true)}
            className={cn(
              "rounded-md p-1 text-xs transition-colors opacity-0 group-hover:opacity-100",
              tx.excluded
                ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                : "text-gray-300 hover:text-red-500 hover:bg-red-50"
            )}
            title={tx.excluded ? "Re-include" : "Exclude"}
          >
            {tx.excluded ? "↩" : "✕"}
          </button>
        </div>
      </div>

      <ExcludeDialog
        transaction={tx}
        open={showExclude}
        onClose={() => setShowExclude(false)}
        onUpdate={handleUpdate}
      />
    </>
  )
}
