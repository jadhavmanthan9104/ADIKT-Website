import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { awb } = body

    if (!awb) {
      return NextResponse.json(
        { error: "AWB or Order reference is required for cancellation" },
        { status: 400 }
      )
    }

    const result = await ShippingService.cancelShipment(awb)

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error: any) {
    console.error("[Shipment Cancel API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel shipment" },
      { status: 500 }
    )
  }
}
