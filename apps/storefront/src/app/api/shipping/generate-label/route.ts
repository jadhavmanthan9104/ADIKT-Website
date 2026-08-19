import { NextRequest, NextResponse } from "next/server"
import { ShippingService } from "@/lib/shipping/shipping-service"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const awb = searchParams.get("awb") || searchParams.get("orderId") || "889123041"

    const shipment = ShippingService.getShipmentByReference(awb)

    const displayId = shipment?.displayId || "ADKT-10492"
    const courier = shipment?.courier || "Bluedart Air Express"
    const assignedAwb = shipment?.awb || awb
    const recipient = shipment?.shippingAddress || {
      name: "Aditya Sharma",
      phone: "+91 98765 43210",
      addressLine1: "B-402, Highline Residences, Linking Road",
      addressLine2: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
    }
    const isCod = shipment?.isCod || false
    const codAmount = shipment?.codAmount || 0
    const weight = shipment?.packageWeightKg || 0.7

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ADIKT Shipping Label - ${assignedAwb}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f4f4f5;
      display: flex;
      justify-content: center;
    }
    .label-box {
      width: 400px;
      background: #fff;
      border: 2px solid #000;
      padding: 16px;
      box-sizing: border-box;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .courier-badge {
      font-size: 12px;
      font-weight: bold;
      background: #000;
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .barcode-container {
      text-align: center;
      margin: 12px 0;
      border-bottom: 1px dashed #000;
      padding-bottom: 10px;
    }
    .barcode {
      font-family: 'Courier New', Courier, monospace;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 4px;
      border-top: 4px solid #000;
      border-bottom: 4px solid #000;
      padding: 6px 0;
      display: inline-block;
    }
    .awb-text {
      font-size: 14px;
      font-weight: 800;
      margin-top: 4px;
      letter-spacing: 1px;
    }
    .section {
      margin-bottom: 10px;
      font-size: 11px;
      line-height: 1.4;
    }
    .section-title {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 2px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 8px 0;
      margin: 10px 0;
      font-size: 11px;
    }
    .cod-banner {
      background: ${isCod ? "#fee2e2" : "#ecfdf5"};
      border: 1px solid ${isCod ? "#9A0000" : "#059669"};
      color: ${isCod ? "#9A0000" : "#065f46"};
      padding: 6px;
      text-align: center;
      font-weight: 900;
      font-size: 12px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .footer {
      font-size: 9px;
      color: #666;
      text-align: center;
      margin-top: 10px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .label-box { border: 2px solid #000; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="header">
      <div class="brand">ADIKT</div>
      <div class="courier-badge">${courier}</div>
    </div>

    <div class="barcode-container">
      <div class="barcode">||| | ||||| || |||| |||</div>
      <div class="awb-text">AWB: ${assignedAwb}</div>
      <div style="font-size: 10px; color: #444;">Order: #${displayId}</div>
    </div>

    <div class="section">
      <div class="section-title">Deliver To (Recipient Destination):</div>
      <div style="font-weight: bold; font-size: 13px;">${recipient.name}</div>
      <div>${recipient.phone}</div>
      <div>${recipient.addressLine1}</div>
      ${recipient.addressLine2 ? `<div>${recipient.addressLine2}</div>` : ""}
      <div style="font-weight: bold; font-size: 12px; margin-top: 2px;">
        ${recipient.city}, ${recipient.state} - <span style="font-size: 14px; text-decoration: underline;">${recipient.pincode}</span>
      </div>
    </div>

    <div class="details-grid">
      <div>
        <div class="section-title">Package Weight</div>
        <div style="font-weight: bold;">${weight} kg (Volumetric: 0.75kg)</div>
      </div>
      <div>
        <div class="section-title">Service Type</div>
        <div style="font-weight: bold;">Air Express / Priority Mailer</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Shipped By (Return Address):</div>
      <div style="font-weight: bold;">ADIKT Garment Fulfillment Hub (Alpha WH-1)</div>
      <div>Plot 42, Cotton Mill Road, Anupparpalayam, Tirupur, TN - 641652</div>
      <div>Helpline: support@adiktclothing.com</div>
    </div>

    <div class="cod-banner">
      ${isCod ? `CASH ON DELIVERY — COLLECT ₹${codAmount}` : "PREPAID — DO NOT COLLECT CASH"}
    </div>

    <div class="footer">
      Pan-India Express Logistics Network • Barcode scanned on dispatch
    </div>

    <div class="no-print" style="margin-top: 14px; text-align: center;">
      <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        🖨️ Print 4x6 Thermal Label
      </button>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to render shipping label" }, { status: 500 })
  }
}
