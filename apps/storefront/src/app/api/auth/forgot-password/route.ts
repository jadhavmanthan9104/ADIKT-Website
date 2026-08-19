import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const result = CustomerAuthService.requestPasswordReset(email)

    // Non-blocking notification dispatch
    try {
      const { NotificationService } = await import("@/lib/notifications/notification-service")
      NotificationService.sendAsync("password_reset", email, {
        customerEmail: email,
        resetToken: result.token,
        resetUrl: result.resetUrl,
      })
    } catch (notifErr) {
      console.warn("[Password Reset Notification Notice]:", notifErr)
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been issued.",
      resetUrl: result.resetUrl, // Provided for easy development & demonstration
    })
  } catch (error: any) {
    console.error("[Forgot Password Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
