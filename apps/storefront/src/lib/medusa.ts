import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_test_sample",
  debug: process.env.NODE_ENV === "development",
})

export const DEFAULT_CURRENCY = "INR"
export const DEFAULT_REGION = "in"
