import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, currency = "INR", cartId, items, customer } = body

    if (!PaymentService.isMethodEnabled("razorpay")) {
      return NextResponse.json(
        { error: "Razorpay online payments are currently disabled by the store." },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount specified" },
        { status: 400 }
      )
    }

    const receipt = cartId || `cart_${Date.now()}`
    const orderData = await PaymentService.createRazorpayOrder({
      amountInINR: amount,
      receipt,
      notes: {
        cart_id: receipt,
        customer_email: customer?.email || "",
        customer_phone: customer?.phone || "",
        brand: "ADIKT Clothing Co.",
      },
    })

    return NextResponse.json({
      success: true,
      order: orderData,
    })
  } catch (error: any) {
    console.error("[Razorpay Create Order API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initialize Razorpay order" },
      { status: 500 }
    )
  }
}
