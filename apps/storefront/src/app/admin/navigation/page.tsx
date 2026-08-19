"use client"

export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import { AdminContentItem } from "@/lib/content-store"
import { NavigationStudio } from "@/components/admin/NavigationStudio"
import { Loader2 } from "lucide-react"

export default function AdminNavigationPage() {
  const [content, setContent] = useState<AdminContentItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          setContent(data.content)
        }
      })
      .catch((err) => console.error("Failed to load navigation content:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content) return
    setIsSaving(true)

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (!res.ok) throw new Error("Failed to save navigation content")

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error("Error saving navigation content:", err)
      alert("Failed to save navigation changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-zinc-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Loading Header Navigation...
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <NavigationStudio
        content={content}
        onChange={setContent}
        onSave={handleSave}
        isSaving={isSaving}
        isSaved={isSaved}
      />
    </div>
  )
}
