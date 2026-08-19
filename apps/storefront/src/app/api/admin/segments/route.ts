import { NextRequest, NextResponse } from "next/server"
import { SegmentsService } from "@/lib/segments-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")

    if (slug) {
      const segment = SegmentsService.getSegmentBySlug(slug)
      if (!segment) {
        return NextResponse.json({ error: "Segment not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, segment })
    }

    const segments = SegmentsService.getSegments()
    return NextResponse.json({
      success: true,
      segments,
      totalCustomers: segments[0]?.memberCount || 0,
    })
  } catch (error: any) {
    console.error("[Segments GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch customer segments" }, { status: 500 })
  }
}
