import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()

  const allowedFields = ["excluded", "exclusion_note", "custom_category"] as const
  const update: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) update[field] = body[field]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Transaction update error:", error.message)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  return NextResponse.json(data)
}
