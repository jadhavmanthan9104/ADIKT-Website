import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params

    if (!awb || !awb.trim()) {
      return NextResponse.json(
        { error: "AWB or Order Reference is required for tracking" },
        { status: 400 }
      )
    }

    const trackingResult = await ShippingService.trackShipment(awb.trim())

    return NextResponse.json({
      success: true,
      tracking: trackingResult,
    })
  } catch (error: any) {
    console.error("[Tracking API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch parcel tracking information" },
      { status: 500 }
    )
  }
}
