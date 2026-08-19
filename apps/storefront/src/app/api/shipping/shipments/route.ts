import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const shipments = ShippingService.getAllShipments()
    return NextResponse.json({
      success: true,
      shipments,
      total: shipments.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipments" },
      { status: 500 }
    )
  }
}
