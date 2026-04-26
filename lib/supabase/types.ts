export type Transaction = {
  id: string
  user_id: string
  external_id: string
  amount: number
  currency: string
  description: string | null
  merchant_name: string | null
  timestamp: string
  category: string | null
  custom_category: string | null
  transaction_type: "DEBIT" | "CREDIT"
  excluded: boolean
  exclusion_note: string | null
  created_at: string
}

export type TrueLayerConnection = {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  account_id: string
  created_at: string
}

export type CustomCategory = {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export type CategoryTotal = {
  name: string
  total: number
  color: string
  transactions: Transaction[]
}

export type InsightData = {
  topCategory: { name: string; total: number; percent: number } | null
  biggestTransaction: Transaction | null
  mostImprovedCategory: { name: string; change: number } | null
  totalSpend: number
  transactionCount: number
}
