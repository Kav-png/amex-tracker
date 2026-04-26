import { NextResponse } from "next/server"
import { syncTransactions } from "@/lib/truclayer/sync"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  try {
    // Incremental sync: only fetch last 30 days to avoid re-fetching everything
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const result = await syncTransactions(supabase, user.id, from)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
