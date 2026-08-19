import { NextRequest, NextResponse } from "next/server"
import { OrdersDB } from "@/lib/orders-db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = OrdersDB.getById(id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error("[Admin Order Detail Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, awb, courier, note, isCodCollected, collectionNote } = body

    let updatedOrder = OrdersDB.getById(id)
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (status || awb || courier) {
      updatedOrder = OrdersDB.updateStatus(id, status, awb, isCodCollected, collectionNote, courier)

      // Synchronize immediately with live Shipping & Live Parcel Tracking Service
      try {
        const { ShippingService } = await import("@/lib/shipping/shipping-service")
        if (updatedOrder) {
          ShippingService.syncOrderUpdate(updatedOrder, status, awb)
        }
      } catch (shipSyncErr) {
        console.warn("[Shipping Service Sync Notice]:", shipSyncErr)
      }

      // Asynchronous non-blocking customer email notification dispatch
      try {
        const { NotificationService } = await import("@/lib/notifications/notification-service")
        if (updatedOrder && updatedOrder.customer?.email) {
          const email = updatedOrder.customer.email
          const name = updatedOrder.customer.name || "Valued Shopper"
          const displayId = updatedOrder.displayId || id

          if (status === "Shipped") {
            NotificationService.sendAsync("order_shipped", email, {
              customerName: name,
              orderId: displayId,
              trackingNumber: awb || updatedOrder.awb || "",
              courier: updatedOrder.courier || "",
            }, { orderId: displayId, status })
          } else if (status === "Delivered") {
            NotificationService.sendAsync("order_delivered", email, {
              customerName: name,
              orderId: displayId,
            }, { orderId: displayId, status })
          } else if (status === "Cancelled") {
            NotificationService.sendAsync("order_cancellation", email, {
              customerName: name,
              orderId: displayId,
              reason: note || "Order cancellation request processed",
            }, { orderId: displayId, status })
          } else if (status === "Refunded") {
            NotificationService.sendAsync("order_refund", email, {
              customerName: name,
              orderId: displayId,
              refundAmount: updatedOrder.total,
            }, { orderId: displayId, status })
          }
        }
      } catch (notifErr) {
        console.warn("[Order Notification Notice]:", notifErr)
      }
    }

    if (note) {
      OrdersDB.addNote(id, note)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully",
    })
  } catch (error: any) {
    console.error("[Admin Order Update Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    )
  }
}
