import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const orders = CustomerAuthService.getCustomerOrders(customer.id, customer.email)

    return NextResponse.json({
      success: true,
      customer,
      orders,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    )
  }
}
