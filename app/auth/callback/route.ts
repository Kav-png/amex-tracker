import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Recovery sessions must land on reset-password, not dashboard
      const destination = data.session?.user.recovery_sent_at ? "/reset-password" : next
      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", origin))
}
