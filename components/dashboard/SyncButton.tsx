"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, History } from "lucide-react"
import { useRouter } from "next/navigation"

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [fullLoading, setFullLoading] = useState(false)
  const [status, setStatus] = useState("")
  const router = useRouter()

  async function handleSync(full = false) {
    if (full) setFullLoading(true)
    else setLoading(true)
    setStatus("")

    try {
      const res = await fetch("/api/truclayer/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full }),
      })

      if (res.ok) {
        const data = await res.json()
        const isFull = data.mode === "full"
        setStatus(isFull ? "Importing full history… refreshing shortly" : "Syncing… refreshing shortly")
        setTimeout(() => {
          router.refresh()
          setStatus("")
          setLoading(false)
          setFullLoading(false)
        }, 8000)
      } else {
        const data = await res.json()
        setStatus(data.error ?? "Sync failed")
        setLoading(false)
        setFullLoading(false)
        setTimeout(() => setStatus(""), 4000)
      }
    } catch {
      setStatus("Network error")
      setLoading(false)
      setFullLoading(false)
      setTimeout(() => setStatus(""), 4000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status && <span className="text-xs text-gray-500">{status}</span>}
      <Button variant="outline" size="sm" loading={fullLoading} onClick={() => handleSync(true)} disabled={loading}>
        <History className="h-3.5 w-3.5" />
        Full History
      </Button>
      <Button variant="outline" size="sm" loading={loading} onClick={() => handleSync()} disabled={fullLoading}>
        <RefreshCw className="h-3.5 w-3.5" />
        Sync
      </Button>
    </div>
  )
}
