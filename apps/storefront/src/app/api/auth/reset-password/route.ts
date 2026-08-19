import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      )
    }

    CustomerAuthService.resetPassword({
      token,
      newPassword,
    })

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in.",
    })
  } catch (error: any) {
    console.error("[Reset Password Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 400 }
    )
  }
}
