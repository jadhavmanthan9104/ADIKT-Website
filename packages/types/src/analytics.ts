/**
 * Google Analytics 4 Ecommerce and Custom Analytics Types
 */

export interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
  item_category2?: string
  item_variant?: string
  price: number
  quantity?: number
  index?: number
}

export interface GA4ViewItemListParams {
  item_list_id?: string
  item_list_name?: string
  items: GA4Item[]
}

export interface GA4ViewItemParams {
  currency: string
  value: number
  items: GA4Item[]
}

export interface GA4AddToCartParams {
  currency: string
  value: number
  items: GA4Item[]
}

export interface GA4RemoveFromCartParams {
  currency: string
  value: number
  items: GA4Item[]
}

export interface GA4BeginCheckoutParams {
  currency: string
  value: number
  coupon?: string
  items: GA4Item[]
}

export interface GA4PurchaseParams {
  transaction_id: string
  value: number
  tax?: number
  shipping?: number
  currency: string
  coupon?: string
  items: GA4Item[]
}

export type EcommerceEventName =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase"
  | "apply_coupon"
  | "add_to_wishlist"
