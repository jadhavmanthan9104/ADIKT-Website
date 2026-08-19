import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"
import { ShipmentStatus } from "@/lib/shipping/types"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { awb, status, location, description } = body

    if (!awb || !status) {
      return NextResponse.json(
        { error: "AWB reference and Status are required to update shipment." },
        { status: 400 }
      )
    }

    const updatedShipment = ShippingService.updateShipmentStatus(
      awb.trim(),
      status as ShipmentStatus,
      location?.trim(),
      description?.trim()
    )

    if (!updatedShipment) {
      return NextResponse.json(
        { error: `Shipment with AWB ${awb} was not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Shipment ${awb} status updated to ${status}.`,
      shipment: updatedShipment,
    })
  } catch (error: any) {
    console.error("[Update Shipment Status Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update shipment status" },
      { status: 500 }
    )
  }
}
