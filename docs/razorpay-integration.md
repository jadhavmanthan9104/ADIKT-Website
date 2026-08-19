# Razorpay Payment Provider Integration for Medusa v2 & Next.js Storefront

This document specifies the architecture, configuration, security practices, webhook mechanisms, and operational runbooks for the **Razorpay Payment Provider** in the ADIKT Commerce platform.

---

## 1. Architecture Overview & Medusa v2 Provider Model

### 1.1 Core Principles
- **Medusa as the Single Source of Truth**: All carts, payment collections, payment sessions, orders, inventory reservations, payment states (`authorized`, `captured`, `refunded`, `failed`), and customer profiles are orchestrated and governed by Medusa Core.
- **Provider Modularity**: Razorpay is implemented as a standard Medusa v2 payment module provider under `apps/backend/src/modules/payment-razorpay/` extending `AbstractPaymentProvider` from `@medusajs/framework/utils` and registered in `medusa-config.ts`.
- **Zero Client Trust**: All client-side parameters returned by Razorpay Checkout (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) undergo **server-side timing-safe HMAC-SHA256 verification** before order creation or stock mutation.

### 1.2 End-to-End Payment Flow Diagram

```
Customer                    Next.js Storefront             Medusa / Backend           Razorpay Gateway
   │                               │                              │                          │
   │ 1. Checkout (Select Razorpay) │                              │                          │
   ├──────────────────────────────>│                              │                          │
   │                               │ 2. Create Payment Session    │                          │
   │                               ├─────────────────────────────>│                          │
   │                               │                              │ 3. orders.create()       │
   │                               │                              ├─────────────────────────>│
   │                               │                              │<─────────────────────────┤ (Returns order_id)
   │                               │<─────────────────────────────┤ (Returns session & key_id)
   │                               │                              │                          │
   │ 4. Opens Razorpay Modal       │                              │                          │
   │<──────────────────────────────┤                              │                          │
   │                               │                              │                          │
   │ 5. Customer Pays (UPI / Card) │                              │                          │
   ├────────────────────────────────────────────────────────────────────────────────────────>│
   │<────────────────────────────────────────────────────────────────────────────────────────┤ (Returns signature)
   │ 6. Signature Callback         │                              │                          │
   ├──────────────────────────────>│                              │                          │
   │                               │ 7. POST /api/payments/verify │                          │
   │                               ├─────────────────────────────>│                          │
   │                               │                              │ 8. Timing-Safe HMAC      │
   │                               │                              │    Verification          │
   │                               │                              │ 9. Deduct Inventory &    │
   │                               │                              │    Complete Order        │
   │                               │<─────────────────────────────┤ (Order #ADKT-XXXXX)      │
   │ 10. Redirect to Success Page  │                              │                          │
   │<──────────────────────────────┤                              │                          │
   │                               │                              │                          │
   │                               │                              │ 11. Async Webhook Event  │
   │                               │                              │<─────────────────────────┤ (X-Razorpay-Signature)
   │                               │                              │ 12. Idempotent Reconcile │
```

---

## 2. Environment Variables & Security Constraints

### 2.1 Configuration Keys

| Variable | Environment | Description | Expose to Client? |
| :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Backend & Storefront | Public Razorpay API Key ID (`rzp_test_...` or `rzp_live_...`) | **Yes** (via Next.js public or session payload) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Storefront | Public Razorpay Key ID for client-side Checkout script | **Yes** |
| `RAZORPAY_KEY_SECRET` | Backend & Storefront API | Private Secret used for order generation and HMAC verification | ❌ **NEVER EXPOSE TO CLIENT** |
| `RAZORPAY_WEBHOOK_SECRET` | Backend & Storefront API | Secret shared between Razorpay Dashboard and server for webhook HMAC | ❌ **NEVER EXPOSE TO CLIENT** |

### 2.2 Security Implementation Rules
1. **Timing-Safe Comparison**: Signatures are evaluated using Node's native `crypto.timingSafeEqual` with byte buffers to prevent timing side-channel attacks.
2. **No Sensitive Cardholder Storage**: ADIKT does not store credit/debit card numbers, CVVs, or OTPs. All sensitive processing occurs within Razorpay's PCI-DSS Level 1 compliant checkout frame.
3. **Idempotency Safeguards**:
   - `isPaymentAlreadyProcessed(paymentId)` ensures duplicate callbacks for the same payment ID re-return the existing order reference rather than creating duplicate orders or double-deducting stock.
   - `isWebhookEventProcessed(eventId)` prevents duplicate webhook notifications from triggering duplicate records or refunds.

---

## 3. Razorpay Test Mode Setup Guide

### 3.1 Generating Test API Keys
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Look at the top navigation bar and toggle the environment switch from **Live Mode** to **Test Mode**.
3. Go to **Settings** (left sidebar) ➔ **API Keys**.
4. Click **Generate Test Key**.
5. Copy your **Key ID** (`rzp_test_...`) and **Key Secret**.
6. Paste these into your root `.env` and `apps/storefront/.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_YourGeneratedKeyId
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourGeneratedKeyId
   RAZORPAY_KEY_SECRET=YourGeneratedKeySecret
   ```

---

## 4. Razorpay Webhook Configuration

### 4.1 Configuring the Webhook Endpoint
1. In the Razorpay Dashboard (Test Mode or Live Mode), navigate to **Settings** ➔ **Webhooks**.
2. Click **Add New Webhook**.
3. Set the **Webhook URL**:
   - Production: `https://adikt.co/api/webhooks/razorpay` (or `https://api.adikt.co/hooks/payment/razorpay`)
   - Local Dev: Use an ngrok tunnel (e.g. `https://xxxx.ngrok-free.app/api/webhooks/razorpay`).
4. Enter a strong, random **Secret** (e.g. 32 alphanumeric characters).
5. In your `.env` file, set:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=YourConfiguredWebhookSecret32Chars
   ```
6. Check the following **Active Events**:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
   - `refund.processed`
7. Click **Save**.

---

## 5. Testing Guide & Verification Scenarios

### 5.1 Automated Integration Test Suite
To verify the entire payment provider lifecycle, run:
```bash
node scripts/test-razorpay-integration.js
```
This tests:
- Session initiation and order creation
- Timing-safe HMAC verification
- Rejection of tampered signatures (400 Bad Request)
- Idempotent duplicate prevention
- Webhook signature validation & duplicate suppression
- Refund handling
- Disabling and re-enabling payment methods

### 5.2 Manual Payment Testing in Browser

| Test Case | Payment Mode | Test Details | Expected Result |
| :--- | :--- | :--- | :--- |
| **Successful UPI** | UPI / QR | Enter `success@razorpay` or click Success in Razorpay sandbox modal | Payment captured, order created (`#ADKT-XXXXX`), inventory deducted, redirected to confirmation page. |
| **Successful Card** | Credit/Debit Card | Card: `4111 1111 1111 1111`<br>Expiry: Any future date<br>CVV: `123`<br>OTP: `123456` | Payment captured, HMAC verified, order confirmed. |
| **Payment Declined** | Card / UPI | Enter `failure@razorpay` or select "Simulate Failure" | Clear error message displayed to customer, cart items preserved, user can immediately retry. |
| **Modal Dismissal** | Modal Close | Click the "X" button on the Razorpay modal before completing payment | Modal closes, message indicates checkout was paused, user can retry without duplicate cart/order. |
| **Partial / Full Refund** | Admin Panel | Go to `/admin/payments` ➔ Click "Issue Refund" on a captured transaction | Refund processed via Razorpay API, ledger updated to `Refunded` or `Partially Refunded`. |

---

## 6. Switching from Test Mode to Production Live Mode

When ready to accept real customer transactions in India:

1. **Complete Razorpay KYC Verification**:
   - Submit business entity documentation (GSTIN, PAN, Bank Account details) in the Razorpay Dashboard.
2. **Switch to Live Mode in Dashboard**:
   - Toggle the switch at the top to **Live Mode**.
3. **Generate Live API Keys**:
   - Go to **Settings** ➔ **API Keys** ➔ **Generate Live Key**.
   - Copy the Live `Key ID` (`rzp_live_...`) and `Key Secret`.
4. **Update Production Environment Variables**:
   ```bash
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=LiveSecretFromDashboard
   RAZORPAY_WEBHOOK_SECRET=LiveWebhookSecret32Chars
   ```
5. **Create Live Webhook**:
   - In Live Mode ➔ Settings ➔ Webhooks ➔ Add your production URL `https://your-domain.com/api/webhooks/razorpay`.
6. **Execute Live ₹1 Smoke Test**:
   - Complete a real ₹1 payment using a live UPI app or card to verify full end-to-end receipt, HMAC verification, and bank settlement.
   - Issue a test refund of ₹1 from the Admin Dashboard to verify refund webhooks and reconciliation.
