import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const config = ShippingService.getShippingConfig()
    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipping configuration" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      freeShippingThreshold,
      standardDeliveryFee,
      expressDeliveryFee,
      defaultCarrier,
      codFee,
    } = body

    if (
      typeof freeShippingThreshold !== "number" ||
      freeShippingThreshold < 0
    ) {
      return NextResponse.json(
        { error: "Please specify a valid non-negative free shipping threshold" },
        { status: 400 }
      )
    }

    const updatedConfig = ShippingService.updateShippingConfig({
      freeShippingThreshold: Number(freeShippingThreshold),
      standardDeliveryFee:
        typeof standardDeliveryFee === "number" ? Number(standardDeliveryFee) : undefined,
      expressDeliveryFee:
        typeof expressDeliveryFee === "number" ? Number(expressDeliveryFee) : undefined,
      defaultCarrier: defaultCarrier ? String(defaultCarrier) : undefined,
      codFee: typeof codFee === "number" ? Number(codFee) : undefined,
    })

    return NextResponse.json({
      success: true,
      message: "Shipping rules and free threshold saved & finalized successfully",
      config: updatedConfig,
    })
  } catch (error: any) {
    console.error("[Shipping Config API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save shipping configuration" },
      { status: 500 }
    )
  }
}
