import { NextRequest, NextResponse } from "next/server"
import { NotificationService } from "@/lib/notifications/notification-service"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = NotificationService.getById(id)

    if (!record) {
      return NextResponse.json({ error: "Notification record not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      notification: record,
    })
  } catch (error: any) {
    console.error("[Admin Notification Detail GET Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve notification" }, { status: 500 })
  }
}
