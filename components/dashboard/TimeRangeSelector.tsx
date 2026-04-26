"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { TimeRange } from "@/lib/utils"

const RANGES: { label: string; value: TimeRange }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "Custom", value: "custom" },
]

export function TimeRangeSelector({ currentRange }: { currentRange: TimeRange }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setRange(range: TimeRange) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", range)
    if (range !== "custom") {
      params.delete("from")
      params.delete("to")
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleCustomDates(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const from = (form.elements.namedItem("from") as HTMLInputElement).value
    const to = (form.elements.namedItem("to") as HTMLInputElement).value
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", "custom")
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {RANGES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              currentRange === value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {currentRange === "custom" && (
        <form onSubmit={handleCustomDates} className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            name="from"
            defaultValue={searchParams.get("from") ?? ""}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.get("to") ?? ""}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  )
}
