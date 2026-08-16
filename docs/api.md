# API Reference & Contracts Documentation

## 1. Overview & Authentication Model

The platform exposes two primary API surfaces:
1. **Store API (`/store/*`)**: Customer-facing endpoints accessed by the Next.js storefront using a Publishable API Key (`x-publishable-api-key: pk_...`) and customer JWT session tokens (`Authorization: Bearer <token>` or HTTP-only cookies).
2. **Admin API (`/admin/*`)**: Operations and merchandiser endpoints accessed using session cookies or Secret API Keys (`x-medusa-access-token: sk_...`).
3. **Webhook Ingress (`/api/webhooks/*`)**: Publicly accessible endpoints protected by cryptographic signature verification headers.

---

## 2. Medusa v2 JS SDK Integration (Storefront)

The Next.js storefront uses the official `@medusajs/js-sdk`:

```typescript
// storefront/src/lib/medusa.ts
import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === "development",
})
```

---

## 3. Storefront API Endpoints

### 3.1 Catalog & Product Discovery

#### `GET /store/products`
Fetch paginated list of published products with filters, sorting, and linked clothing specs.
- **Query Parameters**:
  - `limit` (default: 20)
  - `offset` (default: 0)
  - `category_id[]`
  - `collection_id[]`
  - `q` (Search query)
  - `order` (`created_at`, `-created_at`, `price`, `-price`)
  - `fields` (e.g. `*variants.prices,*categories,*clothing_spec`)
- **Response**:
```json
{
  "products": [
    {
      "id": "prod_01HYZT789",
      "title": "Heavyweight Boxy Tee - Vintage Black",
      "handle": "heavyweight-boxy-tee-vintage-black",
      "description": "280 GSM luxury combed cotton oversized streetwear tee.",
      "thumbnail": "https://media.adiktclothing.com/products/boxy-tee-black-1.webp",
      "images": [
        { "id": "img_1", "url": "https://media.adiktclothing.com/products/boxy-tee-black-1.webp" },
        { "id": "img_2", "url": "https://media.adiktclothing.com/products/boxy-tee-black-2.webp" }
      ],
      "categories": [{ "id": "pcat_tees", "name": "T-Shirts", "handle": "t-shirts" }],
      "variants": [
        {
          "id": "variant_s",
          "title": "S / Black",
          "sku": "ADKT-TEE-BLK-S",
          "options": [{ "option_id": "opt_size", "value": "S" }, { "option_id": "opt_color", "value": "Black" }],
          "calculated_price": { "calculated_amount": 1999, "original_amount": 2499, "currency_code": "inr" },
          "inventory_quantity": 14
        }
      ],
      "clothing_spec": {
        "fabric": "100% Combed Compact Cotton",
        "gsm": 280,
        "weave_type": "Single Jersey",
        "fit": "Oversized Boxy Fit",
        "print_technique": "Screen Print",
        "wash_care_instructions": ["Machine wash cold", "Wash inside out", "Do not iron print"],
        "model_info": { "height": "6'1\"", "wearing_size": "L", "chest": "39\"" },
        "size_chart": {
          "unit": "inches",
          "columns": ["Size", "Chest", "Length", "Shoulder"],
          "rows": [
            { "size": "S", "chest": "42", "length": "28", "shoulder": "20" },
            { "size": "M", "chest": "44", "length": "29", "shoulder": "21" },
            { "size": "L", "chest": "46", "length": "30", "shoulder": "22" },
            { "size": "XL", "chest": "48", "length": "31", "shoulder": "23" }
          ]
        }
      }
    }
  ],
  "count": 48,
  "offset": 0,
  "limit": 20
}
```

#### `GET /store/products/:handle`
Fetch single product by handle with all variants, images, clothing specs, and reviews summary.

---

### 3.2 Cart & Checkout Workflow

#### `POST /store/carts`
Create a new shopping cart.
- **Request**: `{ "region_id": "reg_in", "currency_code": "inr" }`
- **Response**: `{ "cart": { "id": "cart_01HY...", "items": [], "total": 0 } }`

#### `POST /store/carts/:id/line-items`
Add garment variant to cart.
- **Request**:
```json
{
  "variant_id": "variant_s",
  "quantity": 1
}
```

#### `POST /store/carts/:id/promotions`
Apply discount coupon code.
- **Request**: `{ "promo_codes": ["WELCOME10"] }`
- **Response**: Cart with recalculated discount and totals.

#### `POST /store/carts/:id/payment-sessions`
Initialize Razorpay / COD payment session.
- **Request**: `{ "provider_id": "pp_razorpay" }`
- **Response**:
```json
{
  "cart": {
    "id": "cart_01HY...",
    "payment_collection": {
      "payment_sessions": [
        {
          "id": "payses_01HY...",
          "provider_id": "pp_razorpay",
          "amount": 1999,
          "data": {
            "razorpay_order_id": "order_NX8271sample",
            "amount": 199900,
            "currency": "INR",
            "key_id": "rzp_test_YourKeyIdHere123456"
          }
        }
      ]
    }
  }
}
```

#### `POST /store/carts/:id/complete`
Complete checkout after Razorpay signature confirmation or COD selection.
- **Request**:
```json
{
  "provider_id": "pp_razorpay",
  "data": {
    "razorpay_order_id": "order_NX8271sample",
    "razorpay_payment_id": "pay_NX8282sample",
    "razorpay_signature": "5f2b874..."
  }
}
```
- **Response**:
```json
{
  "type": "order",
  "order": {
    "id": "order_01HYZ999",
    "display_id": 1001,
    "status": "pending",
    "payment_status": "captured",
    "total": 1999,
    "currency_code": "inr",
    "shipping_address": { "city": "Mumbai", "postal_code": "400001" }
  }
}
```

---

### 3.3 Customer Account & Order Tracking

#### `POST /store/auth/customer/emailpass` (Login)
- **Request**: `{ "email": "customer@example.com", "password": "SecurePassword123" }`
- **Response**: `{ "token": "jwt_token_here", "customer": { "id": "cus_01...", "email": "customer@example.com" } }`

#### `GET /store/customers/me/orders`
Fetch customer order history with item photos, invoices, and live tracking.

#### `GET /store/orders/:id/track`
Fetch real-time delivery status synced with Shiprocket.
- **Response**:
```json
{
  "order_id": "order_01HYZ999",
  "awb_code": "14328901234",
  "courier_name": "Delhivery Surface",
  "current_status": "OUT_FOR_DELIVERY",
  "status_history": [
    { "timestamp": "2026-08-16T10:00:00Z", "activity": "Out for delivery in Mumbai South Hub", "location": "Mumbai" },
    { "timestamp": "2026-08-15T18:30:00Z", "activity": "Arrived at sorting center", "location": "Bhiwandi" },
    { "timestamp": "2026-08-14T14:00:00Z", "activity": "Pickup manifest generated", "location": "ADIKT Central Warehouse" }
  ]
}
```

---

### 3.4 Reviews & Wishlist

#### `GET /store/products/:id/reviews`
List approved reviews, star distribution, and fit feedback percentages (e.g. 85% True to Size).

#### `POST /store/products/:id/reviews`
Submit a customer review (requires verified customer auth or order token).

#### `GET /store/customers/me/wishlist` & `POST /store/customers/me/wishlist`
Retrieve and toggle wishlist items.

---

## 4. Custom Admin API Endpoints

### 4.1 Merchandising & Clothing Specs
- `POST /admin/products/:id/clothing-spec`: Create/update clothing specification attributes.
- `GET /admin/products/:id/clothing-spec`: Retrieve clothing specs for admin widget.

### 4.2 Fulfillment & Shiprocket Operations
- `POST /admin/orders/:id/shiprocket/create-awb`: Trigger Shiprocket shipment creation and generate AWB label.
- `GET /admin/orders/:id/shiprocket/label`: Download PDF shipping label.

### 4.3 Operational Analytics Dashboard
- `GET /admin/analytics/dashboard-kpis`:
  - Returns Gross Revenue, Net Revenue, Orders Count, AOV, Returning Customer Rate, COD vs Prepaid percentage, Top 5 Products, Low Stock Alerts.

---

## 5. Webhook Ingress Endpoints

### 5.1 Razorpay Webhook (`POST /api/webhooks/razorpay`)
- **Header**: `x-razorpay-signature`
- **Validation**: Cryptographic HMAC-SHA256 of raw request body using `RAZORPAY_WEBHOOK_SECRET`.
- **Supported Events**:
  - `payment.captured`: Fallback confirmation for order creation.
  - `payment.failed`: Records payment failure note on cart/order.
  - `refund.processed`: Updates Medusa order refund status.

### 5.2 Shiprocket Tracking Webhook (`POST /api/webhooks/shiprocket`)
- **Header**: `x-shiprocket-token`
- **Supported Events**:
  - `SHIPMENT_PICKED_UP`: Transitions order fulfillment to `shipped`.
  - `OUT_FOR_DELIVERY`: Emits customer SMS/Email alert.
  - `DELIVERED`: Marks order fulfillment as `delivered`, emits review invite email.
  - `RTO_INITIATED`: Flags order for return-to-origin processing.
