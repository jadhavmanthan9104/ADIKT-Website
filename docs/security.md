# Security Architecture & Hardening Documentation

## 1. Overview & Threat Modeling

Operating a high-profile D2C fashion brand requires resilient security architecture against real-world ecommerce threats:
- **Carding & Payment Fraud**: Bots probing stolen cards or manipulating checkout amounts.
- **COD Abuse & Fake Orders**: High RTO (Return to Origin) caused by spam or malicious Cash-on-Delivery bookings.
- **Inventory Hoarding / Scalping**: Automated bots holding cart reservations during limited-edition drops.
- **Credential Stuffing & Account Takeover**: Automated login attempts against customer and admin accounts.
- **Webhook Spoofing**: Attackers forging payment confirmation webhooks to obtain goods without paying.

---

## 2. Authentication & Authorization Architecture

### 2.1 Customer Authentication
- **Mechanism**: Medusa v2 Auth Module utilizing encrypted password hashing (Argon2 / scrypt / bcrypt with cost factor 12+).
- **Session Transport**: HTTP-only, secure, `SameSite=Lax` or `Strict` cookies, preventing JavaScript XSS token theft.
- **Token Invalidation**: Instant customer session revocation upon password reset.

### 2.2 Admin User Authentication & RBAC
- **Strict Role-Based Access Control (RBAC)**:
  - `Super Admin`: Full system privileges, credentials, and settings.
  - `Merchandiser`: Product catalog, clothing specs, banners, categories.
  - `Customer Support / Ops`: Orders, fulfillment, shipping labels, review moderation. (Restricted from secret keys and system settings).
- **Audit Logging**: All sensitive mutations (manual refund trigger, inventory adjustment, price change) are written to an immutable PostgreSQL audit trail with actor ID, timestamp, and previous vs new state.

### 2.3 API Keys Separation
- **Publishable Key (`pk_...`)**: Publicly accessible in Next.js frontend code. Strictly scoped to customer-facing catalog, cart creation, and checkout queries. Cannot modify pricing, read other customers' orders, or bypass payment steps.
- **Secret Key (`sk_...`)**: Server-to-server operations only. Never bundled or transmitted to the browser.

---

## 3. Payment Security & PCI-DSS Scope Reduction

### 3.1 Zero Raw Card Exposure (PCI-DSS SAQ A)
- The platform never receives, transmits, or stores raw card numbers, CVVs, or bank credentials.
- All payment capture is delegated to **Razorpay's PCI-DSS Level 1 certified hosted checkout modal**.

### 3.2 Cryptographic Webhook & Signature Verification
1. **Client Signature Verification**:
   When Razorpay modal returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`, the server computes:
   ```typescript
   const expectedSignature = crypto
     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
     .digest("hex")

   if (expectedSignature !== razorpay_signature) {
     throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payment signature mismatch")
   }
   ```
2. **Asynchronous Webhook Signature Verification**:
   All `/api/webhooks/razorpay` requests verify the `x-razorpay-signature` header against raw binary payload using `RAZORPAY_WEBHOOK_SECRET`. Requests with invalid signatures are rejected with `401 Unauthorized` immediately.

---

## 4. Input Validation, XSS & Injection Mitigation

1. **Zod Runtime Schema Validation**: Every API route validates input types, lengths, email formats, and string bounds.
2. **SQL Injection Defense**: Medusa v2 DML and MikroORM strictly utilize parameterized SQL queries. Raw SQL concatenation is forbidden.
3. **Cross-Site Scripting (XSS)**:
   - Next.js and React automatically escape dynamic strings.
   - Any customer-generated HTML (e.g. reviews content) passes through `DOMPurify` before sanitization.
   - Strict Content Security Policy (CSP) headers block execution of unauthorized scripts.

---

## 5. Rate Limiting & Abuse Prevention

Implemented via Redis sliding-window algorithm:

| Endpoint Target | Rate Limit | Action on Exceeded |
|---|---|---|
| `/store/auth/*` (Login / Register) | 5 requests / min per IP | 429 Too Many Requests + 15 min exponential backoff |
| `/store/carts/:id/payment-sessions` | 10 requests / min per IP | Prevents payment gateway hammering |
| `/store/carts/:id/promotions` | 15 attempts / min per IP | Prevents coupon code brute-forcing |
| `/store/products` (Catalog API) | 120 requests / min per IP | Protects catalog against aggressive scrapers |

---

## 6. HTTP Security Headers

Next.js (`storefront/next.config.ts`) and Medusa backend enforce security headers on all responses:

```typescript
// Security headers configuration
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com; connect-src 'self' https://api.razorpay.com https://*.google-analytics.com; img-src 'self' data: https: blob:; frame-src https://api.razorpay.com;",
  },
]
```

---

## 7. Operational Security Checklist

- [x] All production secrets loaded exclusively from environment variables.
- [x] Database port `5432` and Redis port `6379` closed to the public internet; accessible only within private Docker network.
- [x] HTTPS enforced with TLS 1.3 across all domains.
- [x] Automated vulnerability scanning via `npm audit` in CI/CD pipeline.
- [x] Webhook endpoints protected with raw body HMAC verification.
- [x] Sensitive customer personally identifiable information (PII) encrypted at rest in PostgreSQL.
