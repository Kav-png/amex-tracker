import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ConnectionCard } from "@/components/settings/ConnectionCard"
import { CustomCategoriesCard } from "@/components/settings/CustomCategoriesCard"
import { SignOutButton } from "@/components/settings/SignOutButton"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: connection }, { data: customCategories }] = await Promise.all([
    supabase
      .from("truclayer_connections")
      .select("account_id, created_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("custom_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
  ])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {params.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(params.error)}
        </div>
      )}

      <ConnectionCard connection={connection} />
      <CustomCategoriesCard categories={customCategories ?? []} userId={user.id} />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  )
}
