import { NextRequest, NextResponse } from "next/server"
import { ReviewsDB, ReviewRecord } from "@/lib/reviews-db"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !["Approved", "Pending", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status ('Approved', 'Pending', 'Rejected') is required" },
        { status: 400 }
      )
    }

    const updated = ReviewsDB.updateStatus(id, status as ReviewRecord["status"])
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      review: updated,
      message: `Review marked as ${status}`,
    })
  } catch (error: any) {
    console.error("[Admin Review Update Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = ReviewsDB.deleteReview(id)

    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error: any) {
    console.error("[Admin Review Delete Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    )
  }
}
