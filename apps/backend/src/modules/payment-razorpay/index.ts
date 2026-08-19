import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { RazorpayPaymentProvider } from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayPaymentProvider],
})
