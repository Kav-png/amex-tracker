import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { buildOAuthUrl } from "@/lib/truclayer/client"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!))
  }

  const state = randomBytes(32).toString("hex")
  const cookieStore = await cookies()
  cookieStore.set("tl_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  const url = buildOAuthUrl(state)
  return NextResponse.redirect(url)
}
