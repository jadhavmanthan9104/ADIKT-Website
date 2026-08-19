import {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsEventPayloadMap,
  AnalyticsItem,
} from "./analytics-types"
import { AnalyticsProvider } from "./providers/analytics-provider.interface"
import { GA4Provider } from "./providers/ga4-provider"
import { ServerAnalyticsProvider } from "./providers/server-analytics-provider"
import { ConsoleAnalyticsProvider } from "./providers/console-provider"

class AnalyticsHubClass {
  private providers: AnalyticsProvider[] = []
  private sessionId: string = ""
  private currentUserId?: string

  constructor() {
    this.providers = [
      new GA4Provider(),
      new ServerAnalyticsProvider(),
      new ConsoleAnalyticsProvider(),
    ]
    this.initSession()
  }

  private initSession() {
    if (typeof window === "undefined") return

    try {
      let stored = sessionStorage.getItem("adikt_analytics_session_id")
      if (!stored) {
        stored = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem("adikt_analytics_session_id", stored)
      }
      this.sessionId = stored
    } catch {
      this.sessionId = `sess_${Date.now()}`
    }
  }

  public registerProvider(provider: AnalyticsProvider) {
    this.providers.push(provider)
  }

  public identify(userId: string, traits?: Record<string, any>) {
    this.currentUserId = userId
    for (const provider of this.providers) {
      provider.identify?.(userId, traits)
    }
  }

  public track<T extends AnalyticsEventType>(
    event: T,
    payload: AnalyticsEventPayloadMap[T]
  ): void {
    if (!this.sessionId) this.initSession()

    const fullEvent: AnalyticsEvent<T> = {
      event,
      payload: {
        ...payload,
        sessionId: this.sessionId,
        userId: this.currentUserId,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : undefined,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.currentUserId,
    }

    for (const provider of this.providers) {
      try {
        provider.trackEvent(fullEvent)
      } catch (err) {
        console.warn(`[Analytics Provider Error: ${provider.name}]`, err)
      }
    }
  }

  // Helper shortcuts for all 16 events
  public pageView(title?: string, path?: string) {
    if (typeof window === "undefined") return
    this.track("page_view", {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: path || window.location.pathname,
    })
  }

  public productView(product: {
    id: string
    title: string
    category?: string
    price: number
    variant?: string
    gsm?: number
  }) {
    this.track("product_view", {
      product_id: product.id,
      name: product.title,
      category: product.category,
      price: product.price,
      variant: product.variant,
      gsm: product.gsm,
      currency: "INR",
    })
  }

  public search(query: string, resultsCount?: number) {
    this.track("search", {
      search_term: query,
      results_count: resultsCount,
    })
  }

  public addToCart(product: {
    id: string
    title: string
    category?: string
    price: number
    quantity?: number
    variant?: string
    cartValue?: number
  }) {
    this.track("add_to_cart", {
      product_id: product.id,
      name: product.title,
      category: product.category,
      price: product.price,
      quantity: product.quantity || 1,
      variant: product.variant,
      cart_value: product.cartValue,
      currency: "INR",
    })
  }

  public removeFromCart(product: {
    id: string
    title: string
    price: number
    quantity?: number
    cartValue?: number
  }) {
    this.track("remove_from_cart", {
      product_id: product.id,
      name: product.title,
      price: product.price,
      quantity: product.quantity || 1,
      cart_value: product.cartValue,
      currency: "INR",
    })
  }

  public viewCart(items: AnalyticsItem[], cartValue: number) {
    this.track("view_cart", {
      items,
      cart_value: cartValue,
      item_count: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      currency: "INR",
    })
  }

  public beginCheckout(items: AnalyticsItem[], cartValue: number, coupon?: string) {
    this.track("begin_checkout", {
      items,
      cart_value: cartValue,
      item_count: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      coupon,
      currency: "INR",
    })
  }

  public addPaymentInfo(paymentMethod: string, cartValue: number, orderId?: string) {
    this.track("add_payment_info", {
      payment_method: paymentMethod,
      cart_value: cartValue,
      order_id: orderId,
      currency: "INR",
    })
  }

  public purchase(data: {
    orderId: string
    transactionId?: string
    value: number
    items: AnalyticsItem[]
    paymentMethod: string
    coupon?: string
    tax?: number
    shipping?: number
  }) {
    this.track("purchase", {
      order_id: data.orderId,
      transaction_id: data.transactionId,
      value: data.value,
      currency: "INR",
      items: data.items,
      payment_method: data.paymentMethod,
      coupon: data.coupon,
      tax: data.tax || 0,
      shipping: data.shipping || 0,
    })
  }

  public refund(data: {
    orderId: string
    refundId?: string
    value: number
    reason?: string
    items?: AnalyticsItem[]
  }) {
    this.track("refund", {
      order_id: data.orderId,
      refund_id: data.refundId,
      value: data.value,
      currency: "INR",
      reason: data.reason,
      items: data.items,
    })
  }

  public wishlistAdd(product: { id: string; title: string; price?: number; category?: string }) {
    this.track("wishlist_add", {
      product_id: product.id,
      name: product.title,
      price: product.price,
      category: product.category,
    })
  }

  public wishlistRemove(product: { id: string; title: string; price?: number; category?: string }) {
    this.track("wishlist_remove", {
      product_id: product.id,
      name: product.title,
      price: product.price,
      category: product.category,
    })
  }

  public couponApply(couponCode: string, discountAmount?: number, cartValue?: number) {
    this.track("coupon_apply", {
      coupon_code: couponCode,
      discount_amount: discountAmount,
      cart_value: cartValue,
    })
  }

  public couponRemove(couponCode: string, cartValue?: number) {
    this.track("coupon_remove", {
      coupon_code: couponCode,
      cart_value: cartValue,
    })
  }

  public login(customerId: string, method: "email" | "google" | "phone" | "passwordless" = "email") {
    this.identify(customerId)
    this.track("login", {
      customer_id: customerId,
      method,
    })
  }

  public signup(customerId: string, method: "email" | "google" | "phone" | "passwordless" = "email") {
    this.identify(customerId)
    this.track("signup", {
      customer_id: customerId,
      method,
    })
  }
}

export const AnalyticsHub = new AnalyticsHubClass()
