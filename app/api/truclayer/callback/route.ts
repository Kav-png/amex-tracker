import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { cookies } from "next/headers"
import { exchangeCode, getAccounts, getCards } from "@/lib/truclayer/client"
import { syncTransactions } from "@/lib/truclayer/sync"
import { createClient } from "@/lib/supabase/server"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent("Connection failed")}`)
  }

  // Validate CSRF state
  const cookieStore = await cookies()
  const savedState = cookieStore.get("tl_oauth_state")?.value
  cookieStore.delete("tl_oauth_state")

  if (!savedState || !state || savedState !== state) {
    return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent("Invalid session — please try again")}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  try {
    const tokens = await exchangeCode(code)

    // AMEX is a card provider — fall back to /cards if /accounts returns 501
    let accountId: string
    const accounts = await getAccounts(tokens.access_token).catch((e: Error) => {
      if (e.message.includes("501")) return null
      throw e
    })

    if (accounts && accounts.length > 0) {
      accountId = accounts[0].account_id
    } else {
      const cards = await getCards(tokens.access_token)
      if (!cards.length) {
        return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent("No accounts found")}`)
      }
      accountId = cards[0].account_id
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase.from("truclayer_connections").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        account_id: accountId,
      },
      { onConflict: "user_id" }
    )

    after(() => syncTransactions(supabase, user.id).catch(console.error))

    return NextResponse.redirect(`${APP_URL}/dashboard?syncing=1`)
  } catch (err) {
    console.error("TrueLayer callback error:", err)
    return NextResponse.redirect(`${APP_URL}/settings?error=${encodeURIComponent("Connection failed — please try again")}`)
  }
}
