import { renderMasterEmailLayout } from "./email-layout"

export type NotificationEventType =
  | "account_created"
  | "email_verification"
  | "password_reset"
  | "order_confirmation"
  | "payment_confirmation"
  | "payment_failure"
  | "order_cancellation"
  | "order_refund"
  | "order_shipped"
  | "order_delivered"
  | "return_approved"
  | "return_rejected"
  | "return_received"
  | "abandoned_cart"

export interface NotificationPayloadData {
  customerName?: string
  customerEmail?: string
  orderId?: string
  total?: number
  items?: Array<{
    title: string
    variant?: string
    quantity: number
    price: number
    thumbnail?: string
  }>
  paymentMethod?: string
  transactionId?: string
  trackingNumber?: string
  trackingUrl?: string
  courier?: string
  returnId?: string
  reason?: string
  refundAmount?: number
  verificationCode?: string
  resetToken?: string
  resetUrl?: string
  discountCode?: string
  deliveryDate?: string
  siteUrl?: string
}

export interface RenderedTemplate {
  subject: string
  html: string
  text: string
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export class TemplateRegistry {
  static render(type: NotificationEventType, data: NotificationPayloadData): RenderedTemplate {
    const siteUrl = data.siteUrl || DEFAULT_BASE_URL
    const name = data.customerName || "Shopper"

    switch (type) {
      // 1. Account Created
      case "account_created": {
        const welcomeCode = data.discountCode || "WELCOME10"
        const subject = `Welcome to ADIKT, ${name} | Your Member Access is Active`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Welcome to the Syndicate</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Hey ${name}, your member account has been registered. You now have exclusive early access to upcoming limited heavyweight drops, order archives, and private restocks.
          </p>
          <div style="background-color: #1c1917; border: 1px dashed #9A0000; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #9A0000; margin-bottom: 4px;">Exclusive Welcome Voucher</div>
            <div style="font-size: 20px; font-weight: 900; font-family: monospace; letter-spacing: 3px; color: #ffffff;">${welcomeCode}</div>
            <div style="font-size: 11px; color: #78716c; margin-top: 4px;">10% off on your first drop order (Min cart ₹999)</div>
          </div>
        `
        const text = `Hey ${name},\n\nWelcome to ADIKT. Your account is active.\nUse welcome code ${welcomeCode} for 10% off on your first drop order.\n\nShop now: ${siteUrl}/shop`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Explore Drop Catalog", url: `${siteUrl}/shop` },
          }),
          text,
        }
      }

      // 2. Email Verification
      case "email_verification": {
        const code = data.verificationCode || "892014"
        const subject = `Verify your email address - ADIKT`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Verify Your Email</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0;">
            Please enter the 6-digit security code below to verify your account email address.
          </p>
          <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 28px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #ffffff;">${code}</div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 8px;">Code expires in 15 minutes.</div>
          </div>
        `
        const text = `Hey ${name},\n\nYour 6-digit verification code is: ${code}\nThis code expires in 15 minutes.`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 3. Password Reset
      case "password_reset": {
        const resetUrl = data.resetUrl || `${siteUrl}/account/reset-password?token=${data.resetToken || "tok_123"}`
        const subject = `Reset Your ADIKT Account Password`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Password Reset Request</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset the password for your ADIKT account (${data.customerEmail || name}). Click below to choose a new password.
          </p>
          <p style="font-size: 11px; color: #71717a; line-height: 1.5; margin: 0 0 10px 0;">
            If you did not make this request, you can safely ignore this email.
          </p>
        `
        const text = `Hey ${name},\n\nReset your password using the link below:\n${resetUrl}\n\nLink valid for 1 hour.`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Reset Password", url: resetUrl },
          }),
          text,
        }
      }

      // 4. Order Confirmation
      case "order_confirmation": {
        const orderId = data.orderId || "ADKT-10001"
        const subject = `Order Confirmed: ${orderId} | ADIKT`
        const itemsHtml = (data.items || []).map((i) => `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #27272a; font-size: 13px; color: #ffffff;">
              <strong>${i.quantity}x ${i.title}</strong>
              <div style="font-size: 11px; color: #a1a1aa;">${i.variant || "Standard"}</div>
            </td>
            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #27272a; font-size: 13px; font-weight: 700; color: #ffffff; font-family: monospace;">
              ₹${(i.price * i.quantity).toLocaleString()}
            </td>
          </tr>
        `).join("")

        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Order Confirmed</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for your order, ${name}. We have received your order <strong style="color: #ffffff;">${orderId}</strong> and are preparing it for express dispatch from our warehouse.
          </p>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
            ${itemsHtml}
            <tr>
              <td style="padding-top: 14px; font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase;">Total</td>
              <td align="right" style="padding-top: 14px; font-size: 16px; font-weight: 900; color: #9A0000; font-family: monospace;">
                ₹${(data.total || 0).toLocaleString()}
              </td>
            </tr>
          </table>
          <p style="font-size: 11px; color: #71717a;">Payment Mode: ${data.paymentMethod || "Prepaid Online"}</p>
        `
        const text = `Order Confirmed: ${orderId}\n\nHey ${name},\nTotal: ₹${data.total}\nTrack your order: ${siteUrl}/account/orders/${orderId}`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "View Order Details", url: `${siteUrl}/account/orders/${orderId}` },
          }),
          text,
        }
      }

      // 5. Payment Confirmation
      case "payment_confirmation": {
        const orderId = data.orderId || "ADKT-10001"
        const subject = `Payment Captured for ${orderId} (₹${(data.total || 0).toLocaleString()})`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Payment Captured</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Your payment of <strong style="color: #ffffff;">₹${(data.total || 0).toLocaleString()}</strong> for Order <strong>${orderId}</strong> was successfully verified and captured.
          </p>
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; font-size: 12px; color: #a1a1aa; margin-bottom: 20px;">
            <div>Transaction Reference: <strong style="color: #ffffff; font-family: monospace;">${data.transactionId || "pay_verified"}</strong></div>
            <div style="margin-top: 4px;">Payment Gateway: Razorpay Secure 256-bit</div>
          </div>
        `
        const text = `Payment Captured for Order ${orderId}: ₹${data.total}\nRef: ${data.transactionId}`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 6. Payment Failure
      case "payment_failure": {
        const orderId = data.orderId || "Checkout Session"
        const subject = `Action Required: Payment Failed for ${orderId}`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #9A0000; margin: 0 0 12px 0;">Payment Incomplete</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Hey ${name}, your recent payment attempt could not be authorized by your bank or UPI app. Your garments are held in reservation for a limited window.
          </p>
          <p style="font-size: 12px; color: #d4d4d8; margin: 0 0 20px 0;">
            You can complete payment online or switch to Cash on Delivery (COD) to lock in your pieces.
          </p>
        `
        const text = `Payment failed for ${orderId}. Retry checkout at ${siteUrl}/checkout`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Retry Checkout", url: `${siteUrl}/checkout` },
          }),
          text,
        }
      }

      // 7. Order Cancellation
      case "order_cancellation": {
        const orderId = data.orderId || "ADKT-10001"
        const subject = `Order Cancelled: ${orderId}`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Order Cancelled</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Order <strong style="color: #ffffff;">${orderId}</strong> has been cancelled. Any prepaid amounts will be credited back to your original payment method within 3–5 working days.
          </p>
          <p style="font-size: 11px; color: #71717a;">Reason: ${data.reason || "Customer cancellation request"}</p>
        `
        const text = `Order ${orderId} has been cancelled. Refund processing if applicable.`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 8. Order Refund
      case "order_refund": {
        const orderId = data.orderId || "ADKT-10001"
        const refundAmount = data.refundAmount || data.total || 0
        const subject = `Refund Processed for ${orderId} (₹${refundAmount.toLocaleString()})`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #10b981; margin: 0 0 12px 0;">Refund Processed</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            A refund of <strong style="color: #ffffff;">₹${refundAmount.toLocaleString()}</strong> for order <strong style="color: #ffffff;">${orderId}</strong> has been initiated back to your source account.
          </p>
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; font-size: 12px; color: #a1a1aa; margin-bottom: 20px;">
            <div>Refund Reference: <strong style="color: #ffffff; font-family: monospace;">${data.transactionId || "rfnd_active"}</strong></div>
            <div style="margin-top: 4px;">Timeline: 3 to 5 business days per RBI/banking guidelines</div>
          </div>
        `
        const text = `Refund of ₹${refundAmount} processed for order ${orderId}. Reference: ${data.transactionId}`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 9. Order Shipped
      case "order_shipped": {
        const orderId = data.orderId || "ADKT-10001"
        const trackingNum = data.trackingNumber || "BLUEDART-882910"
        const trackingUrl = data.trackingUrl || `${siteUrl}/account/orders/${orderId}`
        const subject = `Dispatched: Your ADIKT Order ${orderId} is on the way`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Dispatched & In Transit</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Your parcel for Order <strong style="color: #ffffff;">${orderId}</strong> ${data.courier ? `has been handed over to <strong style="color: #ffffff;">${data.courier}</strong>.` : "is being processed for dispatch."}
          </p>
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; font-size: 12px; color: #a1a1aa; margin-bottom: 20px;">
            ${trackingNum ? `<div>AWB Tracking Number: <strong style="color: #ffffff; font-family: monospace;">${trackingNum}</strong></div>` : ""}
            ${data.courier ? `<div style="margin-top: 4px;">Carrier: <strong style="color: #ffffff;">${data.courier}</strong></div>` : ""}
          </div>
        `
        const text = `Order ${orderId} dispatched${data.courier ? ` via ${data.courier}` : ""}.${trackingNum ? ` AWB: ${trackingNum}` : ""}\nTrack at: ${trackingUrl}`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Track Live Shipment", url: trackingUrl },
          }),
          text,
        }
      }

      // 10. Order Delivered
      case "order_delivered": {
        const orderId = data.orderId || "ADKT-10001"
        const subject = `Delivered: Order ${orderId} | Rate Your Heavyweight Piece`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #10b981; margin: 0 0 12px 0;">Delivered Successfully</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Your package for Order <strong style="color: #ffffff;">${orderId}</strong> has been delivered. We hope you enjoy the fit and weight of your garment.
          </p>
          <p style="font-size: 12px; color: #d4d4d8; margin: 0 0 20px 0;">
            Help the community by sharing your review on fabric drape, sizing, and GSM quality.
          </p>
        `
        const text = `Order ${orderId} has been delivered. Leave a review at ${siteUrl}/account/orders/${orderId}`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Review Your Purchase", url: `${siteUrl}/account/orders/${orderId}` },
          }),
          text,
        }
      }

      // 11. Return Approved
      case "return_approved": {
        const returnId = data.returnId || "RET-901"
        const subject = `Return Approved: ${returnId} | Pickup Instructions`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Return Request Approved</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Your return request <strong style="color: #ffffff;">${returnId}</strong> has been approved. A courier partner will arrive for pickup within 24–48 hours.
          </p>
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; font-size: 12px; color: #a1a1aa; margin-bottom: 20px;">
            <div>Packaging Guidelines:</div>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>Keep original tags intact</li>
              <li>Place in original dustbag/mailer</li>
              <li>Do not seal with unverified adhesive</li>
            </ul>
          </div>
        `
        const text = `Return ${returnId} approved. Pickup in 24-48 hours. Keep original tags intact.`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 12. Return Rejected
      case "return_rejected": {
        const returnId = data.returnId || "RET-901"
        const subject = `Update Regarding Return Request ${returnId}`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #9A0000; margin: 0 0 12px 0;">Return Request Declined</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            We reviewed your return request <strong style="color: #ffffff;">${returnId}</strong>. Unfortunately, it does not meet our return criteria.
          </p>
          <p style="font-size: 12px; color: #71717a;">Reason: ${data.reason || "Item beyond 7-day return policy or tags missing"}</p>
        `
        const text = `Return request ${returnId} declined. Reason: ${data.reason}`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 13. Return Received
      case "return_received": {
        const returnId = data.returnId || "RET-901"
        const subject = `Return Received & Inspected: ${returnId}`
        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #10b981; margin: 0 0 12px 0;">Return Parcel Inspected</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Your return package for <strong style="color: #ffffff;">${returnId}</strong> has been received at our central facility and passed quality inspection.
          </p>
          <p style="font-size: 12px; color: #d4d4d8;">Your refund / exchange has been authorized and dispatched.</p>
        `
        const text = `Return ${returnId} received and quality inspection passed.`
        return {
          subject,
          html: renderMasterEmailLayout({ title: subject, contentHtml }),
          text,
        }
      }

      // 14. Abandoned Cart
      case "abandoned_cart": {
        const recoveryCode = data.discountCode || "COMEBACK10"
        const subject = `Your ADIKT Cart is Waiting | Complete Your Drop with 10% Off`
        const itemsHtml = (data.items || []).slice(0, 3).map((i) => `
          <div style="display: inline-block; width: 45%; margin: 2%; vertical-align: top; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 12px; box-sizing: border-box;">
            <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${i.title}</div>
            <div style="font-size: 11px; color: #a1a1aa;">${i.variant || "Standard"} • ₹${i.price.toLocaleString()}</div>
          </div>
        `).join("")

        const contentHtml = `
          <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #ffffff; margin: 0 0 12px 0;">Still Thinking About It?</h1>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px 0;">
            Hey ${name}, we noticed you left some heavyweights in your bag. Our production runs are limited and items may sell out.
          </p>
          <div style="margin-bottom: 20px;">
            ${itemsHtml}
          </div>
          <div style="background-color: #1c1917; border: 1px dashed #9A0000; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #9A0000; margin-bottom: 4px;">Exclusive 10% Recovery Voucher</div>
            <div style="font-size: 20px; font-weight: 900; font-family: monospace; letter-spacing: 3px; color: #ffffff;">${recoveryCode}</div>
          </div>
        `
        const text = `Hey ${name}, complete your cart with code ${recoveryCode} for 10% off at ${siteUrl}/checkout`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml,
            callToAction: { label: "Complete Checkout", url: `${siteUrl}/checkout` },
          }),
          text,
        }
      }

      default: {
        const subject = `Notification from ADIKT`
        const text = `You have a new update from ADIKT Clothing Co.`
        return {
          subject,
          html: renderMasterEmailLayout({
            title: subject,
            contentHtml: `<p style="font-size: 13px; color: #ffffff;">You have a new update regarding your account.</p>`,
          }),
          text,
        }
      }
    }
  }
}
