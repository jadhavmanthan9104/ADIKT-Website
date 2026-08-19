import { NextRequest, NextResponse } from "next/server"
import { CustomerAuthService } from "@/lib/auth/customer-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const { customer, token } = CustomerAuthService.login({
      email,
      password,
    })

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
    console.error("[Customer Login Error]:", error)
    return NextResponse.json(
      { error: error.message || "Invalid credentials" },
      { status: 401 }
    )
  }
}
