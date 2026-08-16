import { Module } from "@medusajs/framework/utils"
import { ClothingSpecModuleService } from "./service.js"

export const CLOTHING_SPEC_MODULE = "clothingSpec"

export default Module(CLOTHING_SPEC_MODULE, {
  service: ClothingSpecModuleService,
})
