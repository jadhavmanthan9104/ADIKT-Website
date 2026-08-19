import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { ShiprocketFulfillmentProvider } from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ShiprocketFulfillmentProvider],
})
