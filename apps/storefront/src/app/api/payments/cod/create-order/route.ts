import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "@/lib/payment-service"
import { OrdersDB } from "@/lib/orders-db"
import { InventoryService } from "@/lib/inventory/inventory-service"

export const dynamic = "force-dynamic"

const COD_MAX_ORDER_AMOUNT = 10000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart, customer, shippingAddress } = body

    const totalAmount = cart?.total || 1999

    // 1. Validate COD Enabled
    if (!PaymentService.isMethodEnabled("cod")) {
      return NextResponse.json(
        { error: "Cash on Delivery is currently disabled by the store." },
        { status: 400 }
      )
    }

    // 2. Validate COD Eligibility
    if (totalAmount > COD_MAX_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `Cash on Delivery is only available for orders up to ₹${COD_MAX_ORDER_AMOUNT.toLocaleString("en-IN")}. Please select Online Payment.` },
        { status: 400 }
      )
    }

    if (!shippingAddress?.pincode || shippingAddress.pincode.length !== 6) {
      return NextResponse.json(
        { error: "A valid 6-digit Indian PIN code is required for COD serviceability." },
        { status: 400 }
      )
    }

    const orderDisplayId = `ADKT-${Math.floor(10000 + Math.random() * 90000)}`

    // 2. Record Payment Transaction as Pending COD
    const transaction = PaymentService.recordCodPayment({
      orderId: orderDisplayId,
      amount: totalAmount,
      pincode: shippingAddress.pincode,
      customerEmail: customer?.email || shippingAddress?.email || "customer@example.com",
      customerPhone: customer?.phone || shippingAddress?.phone || "9876543210",
    })

    // 3. Create Order with COD Status
    const newOrder = {
      id: `order_${Date.now()}`,
      displayId: orderDisplayId,
      customer: {
        id: customer?.id || `cus_${Date.now()}`,
        name: `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim(),
        email: customer?.email || shippingAddress?.email || "customer@example.com",
        phone: customer?.phone || shippingAddress?.phone || "9876543210",
      },
      createdAt: new Date().toISOString().slice(0, 10),
      status: "Pending" as const,
      paymentStatus: "Pending" as const,
      fulfillmentStatus: "Unfulfilled" as const,
      total: totalAmount,
      subtotal: cart?.subtotal || totalAmount,
      discountTotal: cart?.discount || 0,
      shippingTotal: cart?.shipping || 0,
      taxTotal: Math.round(totalAmount * 0.12),
      paymentMethod: "Cash on Delivery (COD)" as const,
      // A carrier is assigned by fulfilment after the parcel is booked and has an AWB.
      courier: "",
      shippingAddress: {
        name: `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim(),
        phone: customer?.phone || shippingAddress?.phone || "9876543210",
        addressLine1: shippingAddress?.addressLine1 || "B-402, Highline Residences",
        addressLine2: shippingAddress?.addressLine2,
        city: shippingAddress?.city || "Mumbai",
        state: shippingAddress?.state || "Maharashtra",
        pincode: shippingAddress?.pincode || "400050",
      },
      items: (cart?.items || []).map((item: any) => ({
        id: item.id || `item_${Date.now()}`,
        title: item.title,
        variant: `${item.size} / ${item.color}`,
        sku: `ADKT-${item.size || "STD"}`,
        quantity: item.quantity,
        price: item.price,
        thumbnail: item.thumbnail,
      })),
      timeline: [
        {
          id: `tl_1`,
          time: new Date().toISOString().replace("T", " ").slice(0, 16),
          title: "COD Order Placed",
          description: `Cash on Delivery order confirmed for PIN ${shippingAddress.pincode}. Amount to collect: ₹${totalAmount}.`,
          user: "Customer Checkout",
        },
      ],
      notes: [],
    }

    OrdersDB.save(newOrder)

    // 4. Deduct Inventory Stock Permanently in Medusa Inventory Engine
    try {
      InventoryService.deductStock({
        orderId: orderDisplayId,
        cartId: cart?.id,
        items: (cart?.items || []).map((item: any) => ({
          sku: item.sku || `ADKT-${item.size || "STD"}`,
          variantId: item.variantId || item.id,
          title: item.title,
          quantity: item.quantity || 1,
        })),
      })
    } catch (invErr) {
      console.error("[Inventory Deduction Notice (COD)]:", invErr)
    }

    // 5. Record discount usage & mark abandoned cart as recovered
    try {
      if (cart?.promoCode) {
        const { DiscountsDB } = await import("@/lib/discounts-db")
        DiscountsDB.recordDiscountUsage(
          cart.promoCode,
          customer?.email || shippingAddress?.email
        )
      }
      const { AbandonedCartsDB } = await import("@/lib/abandoned-carts-db")
      AbandonedCartsDB.markAsRecovered(
        cart?.id || customer?.email || shippingAddress?.email,
        orderDisplayId
      )
    } catch (mktgErr) {
      console.warn("[Marketing Order Hook Notice]:", mktgErr)
    }

    // 6. Non-blocking customer email notification dispatch
    try {
      const { NotificationService } = await import("@/lib/notifications/notification-service")
      const customerEmail = customer?.email || shippingAddress?.email || "customer@example.com"
      const customerName = `${shippingAddress?.firstName || "Aditya"} ${shippingAddress?.lastName || "Sharma"}`.trim()
      NotificationService.sendAsync("order_confirmation", customerEmail, {
        customerName,
        orderId: orderDisplayId,
        total: totalAmount,
        items: cart?.items || [],
        paymentMethod: "Cash on Delivery (COD)",
      }, { orderId: orderDisplayId, mode: "COD" })
    } catch (notifErr) {
      console.warn("[COD Notification Notice]:", notifErr)
    }

    return NextResponse.json({
      success: true,
      orderId: orderDisplayId,
      paymentId: transaction.id,
      paymentMode: "COD",
    })
  } catch (error: any) {
    console.error("[COD Create Order API Error]:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create Cash on Delivery order" },
      { status: 500 }
    )
  }
}
