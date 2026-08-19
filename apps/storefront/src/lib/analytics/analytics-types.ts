export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase"
  | "refund"
  | "wishlist_add"
  | "wishlist_remove"
  | "coupon_apply"
  | "coupon_remove"
  | "login"
  | "signup"

export interface AnalyticsItem {
  item_id: string
  item_name: string
  item_category?: string
  price: number
  quantity?: number
  variant?: string
  gsm?: number
}

export interface BaseEventContext {
  userId?: string
  sessionId?: string
  timestamp?: string
  url?: string
  referrer?: string
  userAgent?: string
}

export interface PageViewPayload extends BaseEventContext {
  page_title: string
  page_location: string
  page_path: string
}

export interface ProductViewPayload extends BaseEventContext {
  product_id: string
  name: string
  category?: string
  price: number
  variant?: string
  gsm?: number
  currency?: string
}

export interface SearchPayload extends BaseEventContext {
  search_term: string
  results_count?: number
}

export interface CartActionPayload extends BaseEventContext {
  product_id: string
  name: string
  category?: string
  price: number
  quantity: number
  variant?: string
  cart_value?: number
  currency?: string
}

export interface ViewCartPayload extends BaseEventContext {
  items: AnalyticsItem[]
  cart_value: number
  item_count: number
  currency?: string
}

export interface BeginCheckoutPayload extends BaseEventContext {
  items: AnalyticsItem[]
  cart_value: number
  item_count: number
  coupon?: string
  currency?: string
}

export interface AddPaymentInfoPayload extends BaseEventContext {
  payment_method: string
  cart_value: number
  order_id?: string
  currency?: string
}

export interface PurchasePayload extends BaseEventContext {
  order_id: string
  transaction_id?: string
  value: number
  currency: string
  items: AnalyticsItem[]
  payment_method: string
  coupon?: string
  tax?: number
  shipping?: number
}

export interface RefundPayload extends BaseEventContext {
  order_id: string
  refund_id?: string
  value: number
  currency: string
  reason?: string
  items?: AnalyticsItem[]
}

export interface WishlistActionPayload extends BaseEventContext {
  product_id: string
  name: string
  price?: number
  category?: string
}

export interface CouponActionPayload extends BaseEventContext {
  coupon_code: string
  discount_amount?: number
  cart_value?: number
}

export interface AuthActionPayload extends BaseEventContext {
  customer_id: string
  method: "email" | "google" | "phone" | "passwordless"
  email?: string
}

export type AnalyticsEventPayloadMap = {
  page_view: PageViewPayload
  product_view: ProductViewPayload
  search: SearchPayload
  add_to_cart: CartActionPayload
  remove_from_cart: CartActionPayload
  view_cart: ViewCartPayload
  begin_checkout: BeginCheckoutPayload
  add_payment_info: AddPaymentInfoPayload
  purchase: PurchasePayload
  refund: RefundPayload
  wishlist_add: WishlistActionPayload
  wishlist_remove: WishlistActionPayload
  coupon_apply: CouponActionPayload
  coupon_remove: CouponActionPayload
  login: AuthActionPayload
  signup: AuthActionPayload
}

export interface AnalyticsEvent<T extends AnalyticsEventType = AnalyticsEventType> {
  event: T
  payload: AnalyticsEventPayloadMap[T]
  timestamp: string
  sessionId?: string
  userId?: string
}
