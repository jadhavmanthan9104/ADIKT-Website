"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useCustomer } from "@/components/providers/CustomerContext"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  Star,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  AlertCircle,
  Plus,
} from "lucide-react"

export interface ReviewItem {
  id: string
  productId: string
  productTitle: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
  images?: string[]
  fitFeedback?: "Runs Small" | "True to Size" | "Runs Oversized"
  status: "Approved" | "Pending" | "Rejected"
  verifiedPurchase: boolean
  createdAt: string
}

export interface RatingSummaryData {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ProductReviewsSectionProps {
  productId: string
  productTitle: string
  productHandle?: string
}

export function ProductReviewsSection({
  productId,
  productTitle,
  productHandle,
}: ProductReviewsSectionProps) {
  const { customer, isAuthenticated } = useCustomer()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [summary, setSummary] = useState<RatingSummaryData>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [formTitle, setFormTitle] = useState("")
  const [formComment, setFormComment] = useState("")
  const [formFit, setFormFit] = useState<"Runs Small" | "True to Size" | "Runs Oversized">("True to Size")
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formImageUrl, setFormImageUrl] = useState("")
  const [formImages, setFormImages] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.reviews) setReviews(data.reviews)
        if (data.summary) setSummary(data.summary)
      }
    } catch (err) {
      console.warn("Failed to fetch product reviews:", err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Pre-fill customer details if logged in
  useEffect(() => {
    if (customer) {
      setFormName(`${customer.firstName} ${customer.lastName}`.trim())
      setFormEmail(customer.email)
    }
  }, [customer])

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (formImageUrl.trim() && !formImages.includes(formImageUrl.trim())) {
      setFormImages((prev) => [...prev, formImageUrl.trim()])
      setFormImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formTitle.trim() || !formComment.trim() || !formName.trim() || !formEmail.trim()) {
      setErrorMessage("Please complete all required fields.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productTitle,
          productHandle,
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
          fitFeedback: formFit,
          images: formImages,
          customerName: formName.trim(),
          customerEmail: formEmail.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || "Could not submit review.")
        setSubmitting(false)
        return
      }

      setSuccessMessage(data.message || "Review published successfully!")
      setTimeout(() => {
        setIsModalOpen(false)
        setSuccessMessage(null)
        setFormTitle("")
        setFormComment("")
        setFormImages([])
        fetchReviews()
      }, 2000)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredReviews = selectedStarFilter === "all"
    ? reviews
    : reviews.filter((r) => r.rating === selectedStarFilter)

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800 space-y-10">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9A0000]">
            Verified Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-display mt-0.5">
            Reviews & Ratings ({summary.totalReviews})
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white text-xs font-black uppercase transition-all shadow-lg shadow-[#9A0000]/30 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Ratings Summary Card & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
        {/* Left Col: Big Score */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-white font-display">
            {summary.averageRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(summary.averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
            Based on {summary.totalReviews} verified {summary.totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Right Col: Rating Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0

            return (
              <div
                key={stars}
                onClick={() =>
                  setSelectedStarFilter((prev) => (prev === stars ? "all" : stars))
                }
                className="flex items-center gap-3 text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-1 w-12 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white font-bold">
                  <span>{stars}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      selectedStarFilter === stars ? "bg-[#9A0000]" : "bg-amber-400 group-hover:bg-amber-500 dark:group-hover:bg-amber-300"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-8 text-right text-[11px] font-mono text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Star Filter Pill Bar */}
      {summary.totalReviews > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">Filter:</span>
          <button
            onClick={() => setSelectedStarFilter("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              selectedStarFilter === "all"
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-sm"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:text-white"
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStarFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                selectedStarFilter === s
                  ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:text-white"
              }`}
            >
              <span>{s}</span>
              <Star className="h-3 w-3 fill-current" />
              <span>({summary.distribution[s as 1 | 2 | 3 | 4 | 5] || 0})</span>
            </button>
          ))}
        </div>
      )}

      {/* Reviews Cards List */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between shadow-sm dark:shadow-none"
            >
              <div className="space-y-3">
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-800 dark:text-white uppercase">
                      {rev.customerName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900 dark:text-white text-xs">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded">
                            <ShieldCheck className="h-2.5 w-2.5" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${
                          idx < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Fit Feedback Badge */}
                {rev.fitFeedback && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Fit Experience:</span>
                    <span className="text-[#9A0000] font-bold">{rev.fitFeedback}</span>
                  </div>
                )}

                {/* Title & Comment */}
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    &quot;{rev.title}&quot;
                  </h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{rev.comment}</p>
                </div>

                {/* Attached Customer Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {rev.images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative aspect-square w-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                      >
                        <Image src={imgUrl} alt="Customer review photo" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <MessageSquare className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {selectedStarFilter === "all" ? "No Reviews Yet" : `No ${selectedStarFilter}-Star Reviews`}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Be the first to share your fit review and material feedback for the {productTitle}.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#9A0000] text-white text-xs font-bold uppercase hover:bg-[#7a0000] transition-colors inline-flex items-center gap-1.5 shadow-md shadow-[#9A0000]/20"
          >
            <Plus className="h-3.5 w-3.5" /> Submit First Review
          </button>
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto relative text-zinc-900 dark:text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A0000]">
                Customer Rating
              </span>
              <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white font-display">
                Review {productTitle}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Share your authentic feedback on GSM weight, silhouette drape, and fit sizing.
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Your Overall Rating *</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const starVal = idx + 1
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            starVal <= (hoverRating || formRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-300 dark:text-zinc-700"
                          }`}
                        />
                      </button>
                    )
                  })}
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">
                    {formRating === 5
                      ? "Flawless (5/5)"
                      : formRating === 4
                      ? "Great (4/5)"
                      : formRating === 3
                      ? "Average (3/5)"
                      : formRating === 2
                      ? "Below Expectations (2/5)"
                      : "Poor (1/5)"}
                  </span>
                </div>
              </div>

              {/* Fit Experience Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">How did it fit?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Runs Small", "True to Size", "Runs Oversized"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setFormFit(fit)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formFit === fit
                          ? "bg-[#9A0000] text-white border-[#9A0000] shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Headline / Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Review Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best heavyweight drop shoulder tee in India"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#9A0000]"
                />
              </div>

              {/* Review Comment / Body */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Detailed Feedback *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the fabric texture, durability, GSM weight, and overall styling..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#9A0000] resize-none"
                />
              </div>

              {/* Customer Contact Verification Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#9A0000]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Email Address (for Verified Badge) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#9A0000]"
                  />
                </div>
              </div>

              {/* Optional Photo Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300">Attach Photos (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#9A0000]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white rounded-xl text-xs font-bold border border-zinc-200 dark:border-transparent transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {formImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square w-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group"
                      >
                        <Image src={url} alt="Attached" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9A0000] hover:bg-[#7a0000] text-white text-xs font-black uppercase transition-all shadow-lg shadow-[#9A0000]/30 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
