import { NextResponse } from "next/server"
import { after } from "next/server"
import { syncTransactions } from "@/lib/truclayer/sync"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Return immediately — sync runs after response is sent, safe from client nav
  after(async () => {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await syncTransactions(supabase, user.id, from).catch(console.error)
  })

  return NextResponse.json({ status: "started" })
}
