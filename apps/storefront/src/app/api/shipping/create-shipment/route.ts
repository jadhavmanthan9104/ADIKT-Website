import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, displayId, courier, shippingAddress, items, isCod, codAmount, packageWeightKg, dimensions } = body

    if (!orderId || !displayId || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required shipment fields: orderId, displayId, or shippingAddress" },
        { status: 400 }
      )
    }

    const shipment = await ShippingService.createShipment({
      orderId,
      displayId,
      courier,
      shippingAddress,
      items: items || [],
      isCod: Boolean(isCod),
      codAmount: codAmount ? Number(codAmount) : 0,
      packageWeightKg: packageWeightKg ? Number(packageWeightKg) : 0.5,
      dimensions: dimensions || { lengthCm: 30, breadthCm: 25, heightCm: 5 },
    })

    return NextResponse.json({
      success: true,
      message: `Shipment created with AWB ${shipment.awb}`,
      shipment,
    })
  } catch (error: any) {
    console.error("[Create Shipment API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    )
  }
}
