import { NextRequest, NextResponse } from "next/server"
import { AnalyticsEngine, TimeframeFilter } from "@/lib/analytics/analytics-engine"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = (searchParams.get("range") || "30d") as TimeframeFilter["range"]
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const metrics = AnalyticsEngine.getMetrics({
      range,
      startDate,
      endDate,
    })

    return NextResponse.json({
      success: true,
      analytics: metrics,
    })
  } catch (error: any) {
    console.error("[Admin Analytics API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to calculate analytics" }, { status: 500 })
  }
}
