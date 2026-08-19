import { NextRequest, NextResponse } from "next/server"
import { AbandonedCartsDB } from "@/lib/abandoned-carts-db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const carts = AbandonedCartsDB.getAll()
    const totalAbandonedValue = carts
      .filter((c) => c.recoveryStatus === "Active" || c.recoveryStatus === "Email Sent")
      .reduce((sum, c) => sum + (c.cartValue || 0), 0)

    const recoveredCarts = carts.filter((c) => c.recoveryStatus === "Recovered")
    const recoveredRevenue = recoveredCarts.reduce((sum, c) => sum + (c.cartValue || 0), 0)
    const recoveryRate = carts.length > 0 ? Math.round((recoveredCarts.length / carts.length) * 100) : 0

    return NextResponse.json({
      success: true,
      carts,
      summary: {
        totalCarts: carts.length,
        totalAbandonedValue,
        recoveredRevenue,
        recoveryRate,
      },
    })
  } catch (error: any) {
    console.error("[Abandoned Carts GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch abandoned carts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartId, customerEmail, customerName, customerPhone, marketingConsent, cartValue, items } = body

    if (!customerEmail || !cartValue || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Valid email, cart value, and items are required to track cart." },
        { status: 400 }
      )
    }

    const tracked = AbandonedCartsDB.trackCart({
      cartId,
      customerEmail,
      customerName,
      customerPhone,
      marketingConsent,
      cartValue: Number(cartValue) || 0,
      items,
    })

    return NextResponse.json({
      success: true,
      cart: tracked,
      message: "Cart tracked successfully.",
    })
  } catch (error: any) {
    console.error("[Abandoned Carts POST Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to track cart" }, { status: 500 })
  }
}
