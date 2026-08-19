import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"
import { ShipmentStatus } from "@/lib/shipping/types"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const awb = payload?.awb || payload?.awb_code || payload?.shipment_id || payload?.tracking_number
    const rawStatus = payload?.current_status || payload?.status || payload?.event

    if (!awb) {
      return NextResponse.json({ error: "Missing AWB tracking reference in webhook payload" }, { status: 400 })
    }

    // Map carrier status codes to normalized ShipmentStatus
    const status = mapCarrierStatusToNormalized(rawStatus)
    const location = payload?.location || payload?.current_location_name || "Regional Sort Center"
    const description = payload?.activity || payload?.status_description || `Courier scan update: ${rawStatus}`

    const updatedShipment = ShippingService.updateShipmentStatus(awb, status, location, description)

    return NextResponse.json({
      received: true,
      awb,
      status,
      updated: Boolean(updatedShipment),
    })
  } catch (error: any) {
    console.error("[Shipping Webhook Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process shipping webhook" },
      { status: 500 }
    )
  }
}

function mapCarrierStatusToNormalized(status: string = ""): ShipmentStatus {
  const s = status.toUpperCase()
  if (s.includes("DELIVERED") || s === "DL") return "Delivered"
  if (s.includes("OUT FOR DELIVERY") || s.includes("OFD")) return "Out for Delivery"
  if (s.includes("IN TRANSIT") || s.includes("TRANSIT") || s.includes("REACHED") || s.includes("SORTED")) return "In Transit"
  if (s.includes("PICKED UP") || s.includes("SHIPPED") || s.includes("DISPATCHED")) return "Shipped"
  if (s.includes("PACKED") || s.includes("MANIFEST")) return "Packed"
  if (s.includes("CANCEL")) return "Cancelled"
  if (s.includes("RTO") && s.includes("DELIVER")) return "RTO Delivered"
  if (s.includes("RTO") || s.includes("RETURN")) return "RTO Initiated"
  return "In Transit"
}
