import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transactionId, amount, reason = "Customer return / size exchange" } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID or Order ID is required for refund processing" },
        { status: 400 }
      )
    }

    const result = await PaymentService.processRefund({
      transactionId,
      amount: amount ? Number(amount) : undefined,
      reason,
    })

    return NextResponse.json({
      success: true,
      message: `Refund processed successfully`,
      refundId: result.refundId,
      transaction: result.transaction,
    })
  } catch (error: any) {
    console.error("[Refund API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    )
  }
}
