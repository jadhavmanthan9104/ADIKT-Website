import { NextRequest, NextResponse } from "next/server"
import { AnalyticsDB } from "@/lib/analytics/analytics-db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { event, payload, sessionId, userId } = rawBody

    if (!event) {
      return NextResponse.json({ error: "Missing event name" }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || undefined

    const record = AnalyticsDB.recordEvent({
      event,
      payload: payload || {},
      sessionId,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, eventId: record.id }, { status: 201 })
  } catch (error: any) {
    console.warn("[Analytics Ingest Notice]:", error?.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 200 })
  }
}
