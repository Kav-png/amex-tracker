"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function SyncingBanner() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh()
    }, 8000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <p className="text-sm text-green-600 mt-0.5">
      AMEX connected — syncing transactions in the background…
    </p>
  )
}
