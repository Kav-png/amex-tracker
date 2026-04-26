"use client"

import { useState } from "react"
import { TransactionRow } from "./TransactionRow"
import type { Transaction, CustomCategory } from "@/lib/supabase/types"

interface TransactionListProps {
  transactions: Transaction[]
  customCategories: CustomCategory[]
}

export function TransactionList({ transactions: initial, customCategories }: TransactionListProps) {
  const [transactions, setTransactions] = useState(initial)

  function handleUpdate(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400 py-3 px-4">No transactions</p>
  }

  return (
    <div className="divide-y divide-gray-50">
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          transaction={tx}
          customCategories={customCategories}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )
}
