import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { syncTransactions } from "@/lib/truclayer/sync"
import { SANDBOX } from "@/lib/truclayer/client"
import { createClient } from "@/lib/supabase/server"

const RATE_LIMIT_SECONDS = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Rate limit: reject if synced within the last 60 seconds
  const { data: connection } = await supabase
    .from("truclayer_connections")
    .select("last_synced_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (connection?.last_synced_at) {
    const secondsSinceLast = (Date.now() - new Date(connection.last_synced_at).getTime()) / 1000
    if (secondsSinceLast < RATE_LIMIT_SECONDS) {
      const retryAfter = Math.ceil(RATE_LIMIT_SECONDS - secondsSinceLast)
      return NextResponse.json(
        { error: `Please wait ${retryAfter}s before syncing again` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }
  }

  // Stamp before launching background task so rapid re-clicks are blocked
  await supabase
    .from("truclayer_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", user.id)

  const { full } = await request.json().catch(() => ({ full: false }))

  after(async () => {
    const fromDate = full
      ? new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
      : undefined
    await syncTransactions(supabase, user.id, fromDate).catch(console.error)
  })

  return NextResponse.json({ status: "started", mode: full && !SANDBOX ? "full" : "incremental" })
}
