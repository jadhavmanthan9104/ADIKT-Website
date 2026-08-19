import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const transactions = PaymentService.getTransactions()
    const eventLogs = PaymentService.getEventLogs()

    return NextResponse.json({
      success: true,
      transactions,
      eventLogs,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
