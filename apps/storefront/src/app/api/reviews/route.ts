import { NextRequest, NextResponse } from "next/server"
import { ReviewsDB } from "@/lib/reviews-db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId") || undefined
    const statusParam = searchParams.get("status")
    const isAdmin = searchParams.get("admin") === "true"

    // Public storefront sees approved reviews; admin sees according to status filter
    const status = isAdmin ? statusParam || undefined : "Approved"

    const reviews = ReviewsDB.getAll(status, productId)
    const summary = productId ? ReviewsDB.getRatingSummary(productId) : undefined

    return NextResponse.json({
      success: true,
      reviews,
      summary,
      total: reviews.length,
    })
  } catch (error: any) {
    console.error("[Reviews GET Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productId,
      productTitle,
      productHandle,
      rating,
      title,
      comment,
      images,
      fitFeedback,
      customerEmail,
      customerName,
    } = body

    if (!productId || !title || !comment || !rating || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Product, rating, title, comment, name, and email are required." },
        { status: 400 }
      )
    }

    const numRating = Number(rating)
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      )
    }

    // Check duplicate review
    const hasDuplicate = ReviewsDB.checkDuplicateReview(customerEmail, productId)
    if (hasDuplicate) {
      return NextResponse.json(
        { error: "You have already submitted a review for this silhouette." },
        { status: 409 }
      )
    }

    // Verify purchase
    const verification = ReviewsDB.checkPurchaseVerification(customerEmail, productId)

    const created = ReviewsDB.createReview({
      productId,
      productTitle: productTitle || "ADIKT Garment",
      productHandle,
      customerEmail,
      customerName,
      rating: numRating,
      title: title.trim(),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.filter((img: string) => typeof img === "string" && img.trim() !== "") : [],
      fitFeedback: fitFeedback || "True to Size",
      status: "Approved", // Auto-approved or set to Approved when verified
      verifiedPurchase: verification.isVerified,
      orderId: verification.orderId,
    })

    return NextResponse.json({
      success: true,
      review: created,
      verifiedPurchase: verification.isVerified,
      message: verification.isVerified
        ? "Thank you! Your verified purchase review has been published."
        : "Thank you! Your review has been submitted.",
    })
  } catch (error: any) {
    console.error("[Reviews POST Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    )
  }
}
