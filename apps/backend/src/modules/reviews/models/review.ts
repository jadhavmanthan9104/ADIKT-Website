import { model } from "@medusajs/framework/utils"

export const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  customer_name: model.text(),
  customer_email: model.text().nullable(),
  rating: model.number(),
  title: model.text(),
  content: model.text(),
  fit_feedback: model.enum(["runs_small", "true_to_size", "runs_large"]).default("true_to_size"),
  quality_rating: model.number().default(5),
  images: model.array().nullable(),
  verified_purchase: model.boolean().default(false),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  admin_reply: model.text().nullable(),
})
