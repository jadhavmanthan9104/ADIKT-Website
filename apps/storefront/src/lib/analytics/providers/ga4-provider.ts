import { AnalyticsProvider } from "./analytics-provider.interface"
import { AnalyticsEvent, AnalyticsEventType } from "../analytics-types"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export class GA4Provider implements AnalyticsProvider {
  name = "Google Analytics 4"

  trackEvent<T extends AnalyticsEventType>(event: AnalyticsEvent<T>): void {
    if (typeof window === "undefined" || !window.gtag) return

    const { event: eventName, payload } = event

    switch (eventName) {
      case "page_view": {
        const p = payload as any
        window.gtag("event", "page_view", {
          page_title: p.page_title,
          page_location: p.page_location,
          page_path: p.page_path,
        })
        break
      }

      case "product_view": {
        const p = payload as any
        window.gtag("event", "view_item", {
          currency: p.currency || "INR",
          value: p.price,
          items: [
            {
              item_id: p.product_id,
              item_name: p.name,
              item_category: p.category,
              item_variant: p.variant,
              price: p.price,
            },
          ],
        })
        break
      }

      case "search": {
        const p = payload as any
        window.gtag("event", "search", {
          search_term: p.search_term,
        })
        break
      }

      case "add_to_cart": {
        const p = payload as any
        window.gtag("event", "add_to_cart", {
          currency: p.currency || "INR",
          value: p.price * p.quantity,
          items: [
            {
              item_id: p.product_id,
              item_name: p.name,
              item_category: p.category,
              item_variant: p.variant,
              price: p.price,
              quantity: p.quantity,
            },
          ],
        })
        break
      }

      case "remove_from_cart": {
        const p = payload as any
        window.gtag("event", "remove_from_cart", {
          currency: p.currency || "INR",
          value: p.price * p.quantity,
          items: [
            {
              item_id: p.product_id,
              item_name: p.name,
              price: p.price,
              quantity: p.quantity,
            },
          ],
        })
        break
      }

      case "view_cart": {
        const p = payload as any
        window.gtag("event", "view_cart", {
          currency: p.currency || "INR",
          value: p.cart_value,
          items: p.items.map((i: any) => ({
            item_id: i.item_id,
            item_name: i.item_name,
            price: i.price,
            quantity: i.quantity || 1,
          })),
        })
        break
      }

      case "begin_checkout": {
        const p = payload as any
        window.gtag("event", "begin_checkout", {
          currency: p.currency || "INR",
          value: p.cart_value,
          coupon: p.coupon,
          items: p.items.map((i: any) => ({
            item_id: i.item_id,
            item_name: i.item_name,
            price: i.price,
            quantity: i.quantity || 1,
          })),
        })
        break
      }

      case "add_payment_info": {
        const p = payload as any
        window.gtag("event", "add_payment_info", {
          currency: p.currency || "INR",
          value: p.cart_value,
          payment_type: p.payment_method,
        })
        break
      }

      case "purchase": {
        const p = payload as any
        window.gtag("event", "purchase", {
          transaction_id: p.transaction_id || p.order_id,
          value: p.value,
          currency: p.currency || "INR",
          tax: p.tax || 0,
          shipping: p.shipping || 0,
          coupon: p.coupon,
          payment_type: p.payment_method,
          items: p.items.map((i: any) => ({
            item_id: i.item_id,
            item_name: i.item_name,
            price: i.price,
            quantity: i.quantity || 1,
          })),
        })
        break
      }

      case "refund": {
        const p = payload as any
        window.gtag("event", "refund", {
          transaction_id: p.order_id,
          value: p.value,
          currency: p.currency || "INR",
        })
        break
      }

      case "wishlist_add": {
        const p = payload as any
        window.gtag("event", "add_to_wishlist", {
          items: [
            {
              item_id: p.product_id,
              item_name: p.name,
              price: p.price,
            },
          ],
        })
        break
      }

      case "login": {
        const p = payload as any
        window.gtag("event", "login", {
          method: p.method,
        })
        break
      }

      case "signup": {
        const p = payload as any
        window.gtag("event", "sign_up", {
          method: p.method,
        })
        break
      }

      default: {
        window.gtag("event", eventName, payload)
        break
      }
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window === "undefined" || !window.gtag) return
    window.gtag("set", "user_properties", {
      user_id: userId,
      ...traits,
    })
  }
}
