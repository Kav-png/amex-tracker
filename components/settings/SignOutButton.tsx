"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    })
  }

  return (
    <Button variant="outline" size="sm" loading={isPending} onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
