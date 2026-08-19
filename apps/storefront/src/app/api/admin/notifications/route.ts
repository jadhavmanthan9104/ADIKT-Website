import { NextRequest, NextResponse } from "next/server"
import { NotificationService } from "@/lib/notifications/notification-service"
import { NotificationEventType } from "@/lib/notifications/templates/template-registry"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const typeFilter = searchParams.get("type")
    const statusFilter = searchParams.get("status")

    let notifications = NotificationService.getAll()

    if (typeFilter && typeFilter !== "all") {
      notifications = notifications.filter((n) => n.type === typeFilter)
    }

    if (statusFilter && statusFilter !== "all") {
      notifications = notifications.filter((n) => n.status === statusFilter)
    }

    const all = NotificationService.getAll()
    const sentCount = all.filter((n) => n.status === "Sent").length
    const failedCount = all.filter((n) => n.status === "Failed").length
    const deliveryRate = all.length > 0 ? Math.round((sentCount / all.length) * 100) : 100

    return NextResponse.json({
      success: true,
      notifications,
      summary: {
        total: all.length,
        sent: sentCount,
        failed: failedCount,
        deliveryRate,
      },
    })
  } catch (error: any) {
    console.error("[Admin Notifications GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, recipientEmail, customerName, data } = body

    if (!type || !recipientEmail) {
      return NextResponse.json(
        { error: "Event type and recipient email are required." },
        { status: 400 }
      )
    }

    const record = await NotificationService.sendSync(
      type as NotificationEventType,
      recipientEmail,
      {
        customerName: customerName || "Member",
        ...data,
      }
    )

    return NextResponse.json({
      success: true,
      notification: record,
      message: `Notification ${type} dispatched with status: ${record.status}`,
    }, { status: 201 })
  } catch (error: any) {
    console.error("[Admin Notifications POST Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to dispatch notification" }, { status: 500 })
  }
}
