import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { originalShipmentId, orderId, reason = "Size exchange / fit preference", pickupAddress, items } = body

    if (!originalShipmentId) {
      return NextResponse.json(
        { error: "Original shipment ID or AWB is required to book a return" },
        { status: 400 }
      )
    }

    const { returnShipment, returnAwb } = await ShippingService.createReturnShipment({
      originalShipmentId,
      orderId: orderId || originalShipmentId,
      reason,
      pickupAddress,
      items: items || [],
    })

    return NextResponse.json({
      success: true,
      message: `Return pickup booked with reverse AWB ${returnAwb}`,
      returnShipment,
      returnAwb,
    })
  } catch (error: any) {
    console.error("[Reverse Logistics Return API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to book reverse logistics return" },
      { status: 500 }
    )
  }
}
