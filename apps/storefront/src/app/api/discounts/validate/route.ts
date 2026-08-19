import { NextRequest, NextResponse } from "next/server"
import { DiscountsDB } from "@/lib/discounts-db"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, subtotal, items, customerEmail } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Coupon code is required." }, { status: 400 })
    }

    // Try to get authenticated customer email if not supplied in body
    let email = customerEmail
    if (!email) {
      try {
        const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
        if (customer?.email) email = customer.email
      } catch {}
    }

    const result = DiscountsDB.validateDiscount(
      code,
      Number(subtotal) || 0,
      Array.isArray(items) ? items : [],
      email
    )

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        error: result.error,
        discountAmount: 0,
      })
    }

    return NextResponse.json({
      valid: true,
      code: result.discount?.code,
      discountAmount: result.discountAmount,
      isFreeShipping: Boolean(result.isFreeShipping),
      type: result.discount?.type,
      value: result.discount?.value,
      description: result.discount?.description,
    })
  } catch (error: any) {
    console.error("[Discount Validate Error]:", error)
    return NextResponse.json(
      { valid: false, error: error.message || "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
