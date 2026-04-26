"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Mode = "signin" | "signup" | "magic"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<Mode>("signin")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  function switchMode(next: Mode) {
    setMode(next)
    setError("")
    setMessage("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const supabase = createClient()

    if (mode === "magic") {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (authError) setError(authError.message)
      else setSent(true)
    } else if (mode === "signin") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (authError) setError(authError.message)
      else router.push("/dashboard")
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (authError) setError(authError.message)
      else setMessage("Account created! Check your email to confirm, then sign in.")
    }
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
          <h1 className="text-2xl font-bold text-gray-900">AMEX Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">Smart spending insights</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-medium text-green-800">Check your email</p>
            <p className="mt-1 text-xs text-green-600">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setEmail("") }}
              className="mt-4 text-xs text-green-700 underline"
            >
              Use a different email
            </button>
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
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {mode !== "magic" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              {message && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">{message}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send sign-in link"}
              </Button>
            </div>

            <div className="text-center text-xs text-gray-400 space-y-1">
              {mode === "signin" && (
                <>
                  <p>
                    No account?{" "}
                    <button type="button" onClick={() => switchMode("signup")} className="underline text-gray-500">
                      Create one
                    </button>
                  </p>
                  <p>
                    <button type="button" onClick={() => switchMode("magic")} className="underline text-gray-500">
                      Send a magic link instead
                    </button>
                  </p>
                </>
              )}
              {mode === "signup" && (
                <p>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="underline text-gray-500">
                    Sign in
                  </button>
                </p>
              )}
              {mode === "magic" && (
                <p>
                  <button type="button" onClick={() => switchMode("signin")} className="underline text-gray-500">
                    Sign in with password
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
