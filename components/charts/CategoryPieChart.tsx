"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { CategoryTotal } from "@/lib/supabase/types"

interface CategoryPieChartProps {
  categories: CategoryTotal[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryTotal & { percent: number } }> }) {
  if (!active || !payload?.length) return null
  const { name, total, percent } = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-900">{name}</p>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(total)}</p>
      <p className="text-xs text-gray-400">{(percent * 100).toFixed(1)}%</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-600">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function CategoryPieChart({ categories }: CategoryPieChartProps) {
  const top = categories.slice(0, 8)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={top}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="42%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
          stroke="none"
        >
          {top.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
