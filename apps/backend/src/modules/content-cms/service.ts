import { MedusaService } from "@medusajs/framework/utils"
import { ContentBanner } from "./models/banner.js"

export class ContentCmsModuleService extends MedusaService({
  ContentBanner,
}) {}
