import { MedusaService } from "@medusajs/framework/utils"
import { WishlistItem } from "./models/wishlist.js"

export class WishlistModuleService extends MedusaService({
  WishlistItem,
}) {}
