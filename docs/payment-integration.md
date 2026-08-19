# Payment Architecture & Razorpay / COD Integration Guide

This document provides a technical reference for the enterprise payment architecture implemented for **ADIKT Clothing Co.**, covering **Razorpay Online Payments (UPI, Cards, Netbanking, Wallets)** and **Cash on Delivery (COD)**.

---

## 1. Required Environment Variables

Add these variables to your `.env` in `apps/storefront` and `apps/backend`.

| Variable | Scope | Required | Example / Description |
|---|---|---|---|
| `RAZORPAY_KEY_ID` | Server (Backend & Next.js API) | **Yes** | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | **Server-Only (NEVER expose to browser)** | **Yes** | `SecretKeyHere...` (Used for HMAC-SHA256 verification and Refunds) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client (Browser checkout popup) | **Yes** | `rzp_test_...` (Only the Key ID is public) |
| `RAZORPAY_WEBHOOK_SECRET` | **Server-Only** | **Yes** | `whsec_...` (Configured in Razorpay Dashboard for webhook signing) |
| `RAZORPAY_ACCOUNT_NAME` | Client / Server | Optional | `"ADIKT Clothing Co."` |
| `COD_ENABLED` | Server & Storefront | **Yes** | `true` |
| `COD_MAX_ORDER_AMOUNT` | Server | **Yes** | `10000` (Max cart value allowed for COD in INR) |
| `COD_FEE_INR` | Server & Storefront | Optional | `0` (Optional surcharge for COD handling) |

> [!CAUTION]
> **CRITICAL SECURITY REQUIREMENT**:
> - Never prefix `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` with `NEXT_PUBLIC_`.
> - Never commit `.env` files to git.

---

## 2. Zero-Trust Payment Protocol & Security Model

### 2.1 Cryptographic HMAC-SHA256 Verification
When a customer pays via the Razorpay checkout modal, the client receives:
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

**The server NEVER trusts client success messages directly.** Before an order is marked as paid or completed, the Next.js API route (`/api/payments/razorpay/verify`) verifies the cryptographic signature:

```typescript
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex")

const isValid = crypto.timingSafeEqual(
  Buffer.from(generatedSignature, "utf-8"),
  Buffer.from(razorpay_signature, "utf-8")
)
```

If the signature does not match or has been modified, the payment is rejected with HTTP 400 and logged in the security audit trail.

---

## 3. Webhook Setup & Asynchronous Recovery

Razorpay Webhooks ensure orders are fulfilled even if the customer's browser crashes, closes, or loses internet immediately after debiting the funds.

### 3.1 Webhook Configuration in Razorpay Dashboard
1. Go to **Razorpay Dashboard** -> **Settings** -> **Webhooks** -> **Add New Webhook**.
2. **Webhook URL**: `https://your-domain.com/api/webhooks/razorpay`
3. **Secret**: Set a high-entropy secret string and copy it to `RAZORPAY_WEBHOOK_SECRET`.
4. **Subscribed Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.created`

### 3.2 Idempotency & Replay Attack Defense
Every incoming webhook is verified against `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`.
The system maintains an in-memory & persisted registry of processed `event_id` and `payment_id` entries to ensure no event is processed twice.

---

## 4. Cash on Delivery (COD) Rules

1. **Eligibility Threshold**: Orders above `₹10,000` require online payment to protect against high-ticket bogus returns.
2. **PIN Code Validation**: Requires a valid 6-digit Indian PIN code verified against logistics partner serviceability.
3. **Payment State**: Recorded in the payments ledger with status `Pending` until courier delivery partner confirms cash collection.

---

## 5. Refunds Engine

Admins can issue full or partial refunds directly from **Admin Dashboard** -> **Payments Ledger** (`/admin/payments`):
1. Select any captured payment and click **"Issue Refund"**.
2. Enter custom refund amount and select reason (`Customer return`, `Quality issue`, `Cancellation`).
3. If online payment, the server interacts directly with `razorpay.payments.refund(...)`.
4. The transaction status transitions to `Refunded` or `Partially Refunded` and an audit event is logged.

---

## 6. End-to-End Testing Guide

### Testing Razorpay Online Payments in Test Mode (`rzp_test_...`):
1. **UPI / QR Code**: Enter any valid virtual payment address (e.g. `success@razorpay`) or click "Success" in the sandbox modal.
2. **Test Cards**:
   - Card Number: `4111 1111 1111 1111`
   - Expiry: `12/30`
   - CVV: `123`
   - OTP: `123456`
3. **Failure Simulation**: Select "Failure" in the sandbox modal to test the dedicated `/checkout/failure` recovery state.
