import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ReviewsModule from "../modules/reviews/index.js"

export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: ReviewsModule.linkable.productReview,
    isList: true,
  }
)
