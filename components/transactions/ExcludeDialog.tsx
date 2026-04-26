"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/supabase/types"

interface ExcludeDialogProps {
  transaction: Transaction
  open: boolean
  onClose: () => void
  onUpdate: (updated: Transaction) => void
}

export function ExcludeDialog({ transaction, open, onClose, onUpdate }: ExcludeDialogProps) {
  const [note, setNote] = useState(transaction.exclusion_note ?? "")
  const [isPending, startTransition] = useTransition()
  const isExcluded = transaction.excluded

  function handleSubmit() {
    startTransition(async () => {
      const supabase = createClient()
      const newExcluded = !isExcluded
      const { data, error } = await supabase
        .from("transactions")
        .update({
          excluded: newExcluded,
          exclusion_note: newExcluded ? (note.trim() || null) : null,
        })
        .eq("id", transaction.id)
        .select()
        .single()

      if (!error && data) {
        onUpdate(data as Transaction)
        onClose()
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          {isExcluded ? "Re-include transaction" : "Exclude transaction"}
        </DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>

      <DialogBody className="space-y-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{transaction.merchant_name ?? transaction.description}</span>
          {" — "}
          {new Intl.NumberFormat("en-GB", { style: "currency", currency: transaction.currency }).format(transaction.amount)}
        </p>

        {!isExcluded && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Reason (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Group dinner, everyone paid me back"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {isExcluded && transaction.exclusion_note && (
          <p className="text-sm text-gray-500 italic">&ldquo;{transaction.exclusion_note}&rdquo;</p>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={isExcluded ? "default" : "outline"}
          size="sm"
          loading={isPending}
          onClick={handleSubmit}
          className={!isExcluded ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
        >
          {isExcluded ? "Re-include" : "Exclude"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
