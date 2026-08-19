"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AdminContentItem, contentStore, INITIAL_CMS_CONTENT } from "@/lib/content-store"

interface ContentContextType {
  content: AdminContentItem
  updateContent: (updates: Partial<AdminContentItem>) => void
  refreshContent: () => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode
  initialContent?: AdminContentItem
}) {
  const [content, setContent] = useState<AdminContentItem>(() => initialContent || contentStore.getContent())

  const refreshContent = async () => {
    try {
      const res = await fetch("/api/content")
      if (res.ok) {
        const data = await res.json()
        if (data?.content) {
          contentStore.initFromPersisted(data.content)
          setContent(data.content)
        }
      }
    } catch {
      // fallback to current store
      setContent(contentStore.getContent())
    }
  }

  useEffect(() => {
    // 1. If initialContent was passed, ensure client contentStore is synchronized
    if (initialContent) {
      contentStore.initFromPersisted(initialContent)
    }

    // 2. Subscribe to in-memory store changes
    const unsubscribe = contentStore.subscribe(() => {
      setContent(contentStore.getContent())
    })

    // 3. Sync from persistent server API
    refreshContent()

    return unsubscribe
  }, [initialContent])

  const updateContent = (updates: Partial<AdminContentItem>) => {
    const updated = contentStore.updateContent(updates)
    setContent(updated)
  }

  return (
    <ContentContext.Provider value={{ content, updateContent, refreshContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextType {
  const context = useContext(ContentContext)
  if (!context) {
    return {
      content: INITIAL_CMS_CONTENT,
      updateContent: () => {},
      refreshContent: async () => {},
    }
  }
  return context
}
