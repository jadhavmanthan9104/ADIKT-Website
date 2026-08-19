import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    return NextResponse.json({ success: true, customer })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = CustomerAuthService.getAuthenticatedCustomerFromRequest(req)
    const body = await req.json()
    const { firstName, lastName, phone, currentPassword, newPassword } = body

    const updated = CustomerAuthService.updateProfile(customer.id, {
      firstName,
      lastName,
      phone,
      currentPassword,
      newPassword,
    })

    return NextResponse.json({
      success: true,
      customer: updated,
      message: "Profile updated successfully",
    })
  } catch (error: any) {
    console.error("[Update Profile Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 }
    )
  }
}
