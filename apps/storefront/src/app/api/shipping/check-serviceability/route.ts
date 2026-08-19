import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pincode, weightKg = 0.5, isCod = false } = body

    if (!pincode || String(pincode).trim().length !== 6) {
      return NextResponse.json(
        { error: "A valid 6-digit Indian postal PIN code is required" },
        { status: 400 }
      )
    }

    const result = await ShippingService.checkServiceability(
      String(pincode).trim(),
      Number(weightKg),
      Boolean(isCod)
    )

    return NextResponse.json({
      success: true,
      serviceability: result,
    })
  } catch (error: any) {
    console.error("[Shipping Serviceability Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check PIN code serviceability" },
      { status: 500 }
    )
  }
}
