import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ClothingSpecModule from "../modules/clothing-spec/index.js"

export default defineLink(
  ProductModule.linkable.product,
  ClothingSpecModule.linkable.clothingSpec
)
