import { MedusaService } from "@medusajs/framework/utils"
import { ProductReview } from "./models/review.js"

export class ReviewsModuleService extends MedusaService({
  ProductReview,
}) {}
