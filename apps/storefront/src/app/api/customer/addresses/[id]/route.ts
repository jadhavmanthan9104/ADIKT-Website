import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const { id } = await params
    const body = await req.json()

    const updated = CustomerAuthService.updateAddress(customer.id, id, body)
    const addresses = CustomerAuthService.getAddresses(customer.id)

    return NextResponse.json({
      success: true,
      address: updated,
      addresses,
    })
  } catch (error: any) {
    console.error("[Update Address Error]:", error)
    const isAuthError =
      error.message?.includes("unauthorized") ||
      error.message?.includes("not found")
    return NextResponse.json(
      { error: error.message || "Failed to update address" },
      { status: isAuthError ? 403 : 400 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const { id } = await params

    CustomerAuthService.deleteAddress(customer.id, id)
    const addresses = CustomerAuthService.getAddresses(customer.id)

    return NextResponse.json({
      success: true,
      addresses,
      message: "Address deleted successfully",
    })
  } catch (error: any) {
    console.error("[Delete Address Error]:", error)
    const isAuthError =
      error.message?.includes("unauthorized") ||
      error.message?.includes("not found")
    return NextResponse.json(
      { error: error.message || "Failed to delete address" },
      { status: isAuthError ? 403 : 400 }
    )
  }
}
