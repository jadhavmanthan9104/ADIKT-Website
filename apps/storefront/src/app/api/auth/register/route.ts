import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: "Email, password, and first name are required" },
        { status: 400 }
      )
    }

    const { customer, token } = CustomerAuthService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
    })

    // Non-blocking notification dispatch
    try {
      const { NotificationService } = await import("@/lib/notifications/notification-service")
      NotificationService.sendAsync("account_created", email, {
        customerName: firstName,
        discountCode: "WELCOME10",
      }, { customerId: customer.id })

      NotificationService.sendAsync("email_verification", email, {
        customerName: firstName,
        verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      }, { customerId: customer.id })
    } catch (notifErr) {
      console.warn("[Register Notification Notice]:", notifErr)
    }

    const response = NextResponse.json({
      success: true,
      customer,
      token,
    })

    // Set secure HTTP-only cookie
    response.cookies.set("adikt_customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[Customer Register Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to register customer" },
      { status: 400 }
    )
  }
}
