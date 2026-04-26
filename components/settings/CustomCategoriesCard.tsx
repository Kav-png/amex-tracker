"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { CustomCategory } from "@/lib/supabase/types"
import { Trash2 } from "lucide-react"

const PRESET_COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#EF4444", "#8B5CF6", "#F97316"]

interface CustomCategoriesCardProps {
  categories: CustomCategory[]
  userId: string
}

export function CustomCategoriesCard({ categories: initial, userId }: CustomCategoriesCardProps) {
  const [categories, setCategories] = useState(initial)
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [adding, startAdd] = useTransition()
  const [deleting, startDelete] = useTransition()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startAdd(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("custom_categories")
        .insert({ user_id: userId, name: name.trim(), color })
        .select()
        .single()
      if (!error && data) {
        setCategories((prev) => [...prev, data as CustomCategory])
        setName("")
      }
    })
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      const supabase = createClient()
      const { error } = await supabase.from("custom_categories").delete().eq("id", id)
      if (!error) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Categories</CardTitle>
        <CardDescription>Create categories to override the defaults</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length > 0 && (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color ?? "#6366F1" }} />
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting}
                  className="rounded-md p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1"
              maxLength={40}
            />
            <Button type="submit" loading={adding} disabled={!name.trim()}>
              Add
            </Button>
          </div>
          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : undefined,
                }}
              />
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
