"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    setStatus("")
    try {
      const res = await fetch("/api/truclayer/sync", { method: "POST" })
      if (res.ok) {
        setStatus("Syncing… refreshing shortly")
        setTimeout(() => {
          router.refresh()
          setStatus("")
          setLoading(false)
        }, 8000)
      } else {
        const data = await res.json()
        setStatus(data.error ?? "Sync failed")
        setLoading(false)
        setTimeout(() => setStatus(""), 4000)
      }
    } catch {
      setStatus("Network error")
      setLoading(false)
      setTimeout(() => setStatus(""), 4000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status && <span className="text-xs text-gray-500">{status}</span>}
      <Button variant="outline" size="sm" loading={loading} onClick={handleSync}>
        <RefreshCw className="h-3.5 w-3.5" />
        Sync
      </Button>
    </div>
  )
}
