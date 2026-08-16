/**
 * Order Lifecycle, Logistics, and Payment Domain Types
 */

export type OrderLifecycleStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refund_requested"
  | "refunded"
  | "returned"
  | "rto"

export type PaymentProviderType = "razorpay" | "cod" | "manual"

export interface RazorpayPaymentSessionData {
  razorpay_order_id: string
  amount: number
  currency: string
  key_id: string
}

export interface RazorpayAuthorizationResult {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface TrackingActivity {
  timestamp: string
  activity: string
  location: string
}

export interface ShiprocketTrackingDTO {
  order_id: string
  awb_code: string
  courier_name: string
  current_status: string
  tracking_url?: string
  status_history: TrackingActivity[]
}

export interface AddressDTO {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}
