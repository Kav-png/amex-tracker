import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function Badge({ className, color, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        !color && "bg-indigo-50 text-indigo-700",
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : style}
      {...props}
    />
  )
}
