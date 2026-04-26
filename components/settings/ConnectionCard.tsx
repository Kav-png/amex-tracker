"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ConnectionCardProps {
  connection: { account_id: string; created_at: string } | null
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const [disconnecting, startDisconnect] = useTransition()
  const router = useRouter()

  function handleDisconnect() {
    startDisconnect(async () => {
      const supabase = createClient()
      await supabase.from("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("truclayer_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AMEX Connection</CardTitle>
        <CardDescription>Your linked AMEX card via TrueLayer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium text-gray-900">Connected</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Account ···{connection.account_id.slice(-4)} · since {formatDate(connection.created_at)}
              </p>
            </div>
            <Button variant="outline" size="sm" loading={disconnecting} onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              <p className="text-sm text-gray-500">No card connected</p>
            </div>
            <a href="/api/truclayer/connect">
              <Button className="w-full sm:w-auto">Connect AMEX</Button>
            </a>
            <p className="text-xs text-gray-400">
              You&apos;ll be redirected to TrueLayer to authorise read-only access to your AMEX transactions. Your credentials never touch this app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
