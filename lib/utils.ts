import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

export type TimeRange = "1W" | "1M" | "6M" | "1Y" | "custom"

export function getDateRange(
  range: TimeRange,
  customFrom?: string,
  customTo?: string
): { from: Date; to: Date } {
  const to = new Date()
  to.setHours(23, 59, 59, 999)

  if (range === "custom") {
    const from = customFrom ? new Date(customFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return { from, to: customTo ? new Date(customTo) : to }
  }

  const msMap: Record<Exclude<TimeRange, "custom">, number> = {
    "1W": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
    "6M": 180 * 24 * 60 * 60 * 1000,
    "1Y": 365 * 24 * 60 * 60 * 1000,
  }

  const from = new Date(Date.now() - msMap[range])
  from.setHours(0, 0, 0, 0)
  return { from, to }
}

export function getPreviousDateRange(range: TimeRange, from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime()
  return {
    from: new Date(from.getTime() - duration),
    to: new Date(from.getTime()),
  }
}
