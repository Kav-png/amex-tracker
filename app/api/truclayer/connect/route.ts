import { NextResponse } from "next/server"
import { buildOAuthUrl } from "@/lib/truclayer/client"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!))
  }

  const url = buildOAuthUrl()
  return NextResponse.redirect(url)
}
