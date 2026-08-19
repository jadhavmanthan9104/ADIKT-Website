import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const wishlist = CustomerAuthService.getWishlist(customer.id)
    return NextResponse.json({ success: true, wishlist })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const result = CustomerAuthService.toggleWishlist(customer.id, productId)
    return NextResponse.json({
      success: true,
      wishlist: result.wishlist,
      isSaved: result.isSaved,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    )
  }
}
