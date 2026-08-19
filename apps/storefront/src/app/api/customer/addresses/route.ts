import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const addresses = CustomerAuthService.getAddresses(customer.id)
    return NextResponse.json({ success: true, addresses })
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
    const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = body

    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "All required address fields must be provided" },
        { status: 400 }
      )
    }

    const created = CustomerAuthService.addAddress(customer.id, {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    })

    const addresses = CustomerAuthService.getAddresses(customer.id)

    return NextResponse.json({
      success: true,
      address: created,
      addresses,
    })
  } catch (error: any) {
    console.error("[Add Address Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add address" },
      { status: 400 }
    )
  }
}
