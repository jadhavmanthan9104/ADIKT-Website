import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const { id } = await params

    const order = CustomerAuthService.getCustomerOrderById(
      customer.id,
      customer.email,
      id
    )

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error("[Customer Order Detail Error]:", error.message)
    const isIdorViolation = error.message?.includes("IDOR") || error.message?.includes("permission")
    const isNotFound = error.message?.includes("not found")

    return NextResponse.json(
      { error: error.message || "Order not found" },
      { status: isIdorViolation ? 403 : isNotFound ? 404 : 401 }
    )
  }
}
