import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const config = PaymentService.getPaymentConfig()
    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment configuration" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay, cod } = body

    const updates: any = {}
    if (razorpay !== undefined) {
      updates.razorpay = typeof razorpay === "boolean" ? { enabled: razorpay } : razorpay
    }
    if (cod !== undefined) {
      updates.cod = typeof cod === "boolean" ? { enabled: cod } : cod
    }

    const updatedConfig = PaymentService.updatePaymentConfig(updates)

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: "Payment methods configuration updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update payment configuration" },
      { status: 500 }
    )
  }
}
