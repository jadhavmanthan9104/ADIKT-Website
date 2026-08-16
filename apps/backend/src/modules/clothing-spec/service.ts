import { MedusaService } from "@medusajs/framework/utils"
import { ClothingSpec } from "./models/clothing-spec.js"

export class ClothingSpecModuleService extends MedusaService({
  ClothingSpec,
}) {}
