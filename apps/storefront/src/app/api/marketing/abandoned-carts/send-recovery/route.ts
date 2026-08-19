import { NextRequest, NextResponse } from "next/server"
import { AbandonedCartsDB } from "@/lib/abandoned-carts-db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cartId, discountCode } = body

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required." }, { status: 400 })
    }

    const result = AbandonedCartsDB.sendRecoveryCampaign(cartId, discountCode || "COMEBACK10")

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      )
    }

    // Trigger transactional abandoned cart email
    try {
      const cart = AbandonedCartsDB.getById(cartId)
      if (cart && cart.customerEmail) {
        const { NotificationService } = await import("@/lib/notifications/notification-service")
        NotificationService.sendAsync("abandoned_cart", cart.customerEmail, {
          customerName: cart.customerName,
          items: cart.items,
          discountCode: discountCode || "COMEBACK10",
        }, { cartId: cart.id })
      }
    } catch (notifErr) {
      console.warn("[Abandoned Cart Notification Notice]:", notifErr)
    }

    return NextResponse.json({
      success: true,
      message: `Recovery campaign dispatched with coupon ${discountCode || "COMEBACK10"}.`,
    })
  } catch (error: any) {
    console.error("[Send Recovery Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to send recovery campaign" }, { status: 500 })
  }
}
