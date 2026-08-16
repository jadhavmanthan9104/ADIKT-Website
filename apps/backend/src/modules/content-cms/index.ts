import { Module } from "@medusajs/framework/utils"
import { ContentCmsModuleService } from "./service.js"

export const CONTENT_CMS_MODULE = "contentCms"

export default Module(CONTENT_CMS_MODULE, {
  service: ContentCmsModuleService,
})
