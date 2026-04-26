import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { exchangeCode, getAccounts } from "@/lib/truclayer/client"
import { syncTransactions } from "@/lib/truclayer/sync"
import { createClient } from "@/lib/supabase/server"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    const msg = error ?? "No authorisation code received"
    return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent(msg)}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  try {
    const tokens = await exchangeCode(code)
    const accounts = await getAccounts(tokens.access_token)

    if (!accounts.length) {
      return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent("No accounts found")}`)
    }

    const account = accounts[0]
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase.from("truclayer_connections").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        account_id: account.account_id,
      },
      { onConflict: "user_id" }
    )

    // Redirect immediately — sync runs after response is sent
    after(() => syncTransactions(supabase, user.id).catch(console.error))

    return NextResponse.redirect(`${APP_URL}/dashboard?syncing=1`)
  } catch (err) {
    console.error("TrueLayer callback error:", err)
    const msg = err instanceof Error ? err.message : "Connection failed"
    return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent(msg)}`)
  }
}
