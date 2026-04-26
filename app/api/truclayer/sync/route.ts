import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { syncTransactions } from "@/lib/truclayer/sync"
import { SANDBOX } from "@/lib/truclayer/client"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { full } = await request.json().catch(() => ({ full: false }))

  after(async () => {
    // full history: 2 years in prod, capped to 90 days in sandbox by syncTransactions
    const fromDate = full
      ? new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
      : undefined // incremental in prod, 90-day default in sandbox
    await syncTransactions(supabase, user.id, fromDate).catch(console.error)
  })

  return NextResponse.json({ status: "started", mode: full && !SANDBOX ? "full" : "incremental" })
}
