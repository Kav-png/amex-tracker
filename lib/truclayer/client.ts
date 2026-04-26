const SANDBOX = process.env.TRUCLAYER_CLIENT_ID?.startsWith("sandbox-")
const TL_AUTH_URL = SANDBOX ? "https://auth.truelayer-sandbox.com" : "https://auth.truelayer.com"
const TL_API_URL = SANDBOX ? "https://api.truelayer-sandbox.com" : "https://api.truelayer.com"

export type TLAccount = {
  account_id: string
  account_type: string
  display_name: string
  currency: string
  provider: { provider_id: string; display_name: string }
}

export type TLTransaction = {
  transaction_id: string
  timestamp: string
  description: string
  amount: number
  currency: string
  transaction_type: "DEBIT" | "CREDIT"
  transaction_category: string
  merchant_name?: string
}

export type TLTokens = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export function buildOAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TRUCLAYER_CLIENT_ID!,
    scope: "info accounts balance transactions offline_access",
    redirect_uri: process.env.TRUCLAYER_REDIRECT_URI!,
    providers: SANDBOX ? "mock" : "amex",
    enable_mock: SANDBOX ? "true" : "false",
  })
  return `${TL_AUTH_URL}/?${params.toString()}`
}

export async function exchangeCode(code: string): Promise<TLTokens> {
  const res = await fetch(`${TL_AUTH_URL}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.TRUCLAYER_CLIENT_ID!,
      client_secret: process.env.TRUCLAYER_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.TRUCLAYER_REDIRECT_URI!,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TrueLayer token exchange failed (${res.status}): ${body}`)
  }
  return res.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<TLTokens> {
  const res = await fetch(`${TL_AUTH_URL}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.TRUCLAYER_CLIENT_ID!,
      client_secret: process.env.TRUCLAYER_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TrueLayer token refresh failed (${res.status}): ${body}`)
  }
  return res.json()
}

export async function getAccounts(accessToken: string): Promise<TLAccount[]> {
  const res = await fetch(`${TL_API_URL}/data/v1/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`TrueLayer accounts fetch failed: ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}

export async function getTransactions(
  accessToken: string,
  accountId: string,
  from: Date,
  to: Date
): Promise<TLTransaction[]> {
  const params = new URLSearchParams({
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  })
  const res = await fetch(
    `${TL_API_URL}/data/v1/accounts/${accountId}/transactions?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`TrueLayer transactions fetch failed: ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}
