# Third-Party Integrations & Modular Services Specification

## 1. Overview & Modularity Principle

Every external integration (Payments, Shipping, Media, Notifications, Analytics) is isolated behind an abstract provider or service interface in Medusa v2 and Next.js. If a provider is swapped in the future (e.g. switching from Shiprocket to Delhivery Direct, or Razorpay to Stripe), zero core commerce or database models need to change.

---

## 2. Payment Integration: Razorpay & Cash on Delivery (COD)

### 2.1 Architecture & Flow
- **Provider ID**: `pp_razorpay` (Registered in Medusa Payment Module).
- **Supported Payment Modes**: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Netbanking, and Wallets.

```
[Storefront Checkout] ──> Create Payment Session ──> [Medusa Razorpay Provider]
                                                               │
                                                               ▼ (Razorpay Orders API)
[Razorpay Checkout Modal Opens] <─── Returns `razorpay_order_id` ──┘
         │
  (Customer Pays)
         │
         ▼
[Signature Returned: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`]
         │
         ▼
[Storefront Submits to Medusa Complete Cart]
         │
         ▼ (Server-side HMAC-SHA256 Verification)
[Medusa Emits `order.placed` & Decrements Stock]
```

### 2.2 Provider Service Implementation (`backend/src/modules/payment-razorpay/service.ts`)
```typescript
import Razorpay from "razorpay"
import crypto from "crypto"
import { AbstractPaymentProvider } from "@medusajs/framework/utils"

export class RazorpayPaymentProvider extends AbstractPaymentProvider {
  static identifier = "pp_razorpay"
  private client: Razorpay

  constructor(container: any, options: any) {
    super(container, options)
    this.client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }

  async createPaymentSession(input: { amount: number; currency_code: string; context: any }) {
    const order = await this.client.orders.create({
      amount: Math.round(input.amount * 100), // Convert INR to paise
      currency: input.currency_code.toUpperCase(),
      receipt: input.context.cart_id,
      notes: { cart_id: input.context.cart_id },
    })

    return {
      id: order.id,
      data: {
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    }
  }

  async authorizePayment(paymentSessionData: Record<string, unknown>, context: Record<string, unknown>) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentSessionData as any
    
    // Cryptographic verification
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generated_signature !== razorpay_signature) {
      return { status: "error", data: { error: "Signature verification failed" } }
    }

    return { status: "authorized", data: paymentSessionData }
  }
}
```

### 2.3 Webhook Ingress (`/api/webhooks/razorpay`)
- Protects against browser drops or internet disconnections during customer checkout.
- On `payment.captured`, checks if order is created; if not, triggers the order placement workflow idempotently.

---

## 3. Shipping & Logistics: Shiprocket Integration

### 3.1 Flow & Operational Lifecycle
1. **Serviceability Check**: When customer enters pin code in checkout, Next.js calls `/store/shipping/check-serviceability?pincode=400001`.
2. **Order Placement**: Order created in Medusa with shipping details.
3. **Admin / Auto Fulfillment Workflow**:
   - Generates Shiprocket Custom Order via API.
   - Assigns Courier (e.g. Delhivery, Bluedart, Ecom Express).
   - Generates AWB (Air Waybill) and downloads printable shipping label.
   - Updates Medusa fulfillment status to `shipped` with tracking URL.
4. **Live Tracking Sync**: Shiprocket webhooks push tracking updates directly into Medusa database.

### 3.2 Shiprocket Service Client (`backend/src/services/shiprocket.ts`)
```typescript
export class ShiprocketService {
  private token: string | null = null
  private tokenExpiresAt: number = 0

  private async getAuthToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token
    }

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_API_EMAIL,
        password: process.env.SHIPROCKET_API_PASSWORD,
      }),
    })
    const data = await res.json()
    this.token = data.token
    this.tokenExpiresAt = Date.now() + 86400 * 1000 * 9 // Valid for 9 days
    return this.token!
  }

  async checkServiceability(deliveryPincode: string, weightKg: number = 0.5) {
    const token = await this.getAuthToken()
    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=400001&delivery_postcode=${deliveryPincode}&weight=${weightKg}&cod=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.json()
  }

  async createShipment(order: any) {
    const token = await this.getAuthToken()
    // Creates shipment payload mapping Medusa Order -> Shiprocket Order
    const payload = {
      order_id: order.display_id,
      order_date: new Date(order.created_at).toISOString().slice(0, 10),
      pickup_location: process.env.SHIPROCKET_DEFAULT_PICKUP_LOCATION,
      billing_customer_name: order.shipping_address.first_name,
      billing_last_name: order.shipping_address.last_name,
      billing_address: order.shipping_address.address_1,
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.postal_code,
      billing_state: order.shipping_address.province,
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      order_items: order.items.map((i: any) => ({
        name: i.title,
        sku: i.variant_sku || "SKU-GENERIC",
        units: i.quantity,
        selling_price: i.unit_price,
      })),
      payment_method: order.payment_status === "captured" ? "Prepaid" : "COD",
      sub_total: order.total,
      length: process.env.DEFAULT_PARCEL_LENGTH || 30,
      breadth: process.env.DEFAULT_PARCEL_BREADTH || 25,
      height: process.env.DEFAULT_PARCEL_HEIGHT || 5,
      weight: (order.items.length * 0.35),
    }

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    return res.json()
  }
}
```

---

## 4. Media & Asset Storage: S3 / Cloudinary Provider

1. **Direct Uploads**: Admin UI uploads fashion assets (up to 4K resolution) directly to S3 / Cloudflare R2 bucket with pre-signed URLs.
2. **CDN Delivery**: Images delivered via CloudFront or Cloudinary with automatic WebP/AVIF format transcoding and on-the-fly resizing:
   - Thumbnails: `w=300,q=80,f=webp`
   - Catalog Grid: `w=600,q=85,f=webp`
   - Product Details Hero: `w=1400,q=90,f=webp`

---

## 5. Transactional Emails: Resend Integration

Subscribers listen to Medusa Redis events and trigger branded HTML emails via Resend:

| Event Name | Trigger Condition | Template |
|---|---|---|
| `order.placed` | Order paid or COD confirmed | Itemized invoice receipt with delivery estimate |
| `fulfillment.created` | AWB generated via Shiprocket | Tracking number, live tracker link, courier info |
| `order.delivered` | Shiprocket webhook confirms delivery | Delivery confirmation + 5-star review request |
| `customer.password_reset`| Customer clicks 'Forgot Password' | Secure tokenized reset link (valid 1 hour) |
| `cart.abandoned` | Cart idle for > 2 hours | Re-engagement email with 5% exclusive discount |

---

## 6. Analytics & Event Tracking: GA4 Enhanced Ecommerce

Next.js storefront emits Google Analytics 4 standard ecommerce events:

```typescript
// storefront/src/lib/analytics.ts
export const trackEcommerceEvent = (eventName: string, params: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params)
  }
}

// Example: Product Detail View
export const trackViewItem = (product: any, variant: any) => {
  trackEcommerceEvent("view_item", {
    currency: "INR",
    value: variant.calculated_price.calculated_amount,
    items: [
      {
        item_id: variant.sku,
        item_name: product.title,
        item_category: product.categories?.[0]?.name,
        price: variant.calculated_price.calculated_amount,
        item_variant: variant.title,
      },
    ],
  })
}
```
