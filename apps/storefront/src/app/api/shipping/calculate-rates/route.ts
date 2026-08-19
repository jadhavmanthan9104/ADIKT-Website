import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deliveryPincode, pickupPincode, weightKg = 0.5, orderValue = 0, isCod = false } = body

    if (!deliveryPincode) {
      return NextResponse.json(
        { error: "Delivery PIN code is required for rate calculation" },
        { status: 400 }
      )
    }

    const rates = await ShippingService.calculateRates({
      deliveryPincode,
      pickupPincode,
      weightKg: Number(weightKg),
      orderValue: Number(orderValue),
      isCod: Boolean(isCod),
    })

    return NextResponse.json({
      success: true,
      rates,
    })
  } catch (error: any) {
    console.error("[Shipping Rates API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to calculate shipping rates" },
      { status: 500 }
    )
  }
}
