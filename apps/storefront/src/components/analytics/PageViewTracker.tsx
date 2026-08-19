"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnalyticsHub } from "@/lib/analytics/analytics-hub"

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`
      AnalyticsHub.pageView(document.title, url)
    }
  }, [pathname, searchParams])

  return null
}
