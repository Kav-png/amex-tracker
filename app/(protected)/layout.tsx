import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/nav/Navigation"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:pl-56 pb-20 lg:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
