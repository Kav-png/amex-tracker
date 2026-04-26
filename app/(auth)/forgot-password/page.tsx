"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setLoading(false)
    if (authError) setError(authError.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 mb-4">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="mt-1 text-sm text-gray-500">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-medium text-green-800">Check your email</p>
            <p className="mt-1 text-xs text-green-600">
              Sent a reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="mt-4 block text-xs text-green-700 underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Send reset link
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400">
              <Link href="/login" className="underline text-gray-500">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
