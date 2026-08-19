import { NextRequest, NextResponse } from "next/server"
import { NotificationService } from "@/lib/notifications/notification-service"

export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updated = await NotificationService.retry(id)

    if (!updated) {
      return NextResponse.json({ error: "Notification record not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      notification: updated,
      message: `Notification delivery retry completed. Status: ${updated.status}`,
    })
  } catch (error: any) {
    console.error("[Admin Notification Retry Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to retry notification" }, { status: 500 })
  }
}
