# India Shipping & Logistics Architecture (Shiprocket / Pan-India Carriers)

This document provides a technical specification for the modular Indian shipping and fulfillment architecture implemented for **ADIKT Clothing Co.**

---

## 1. Overview & Clean Abstraction Principle

All logistics operations (serviceability checks, dynamic rate calculation, shipment booking, AWB allocation, label generation, live tracking, cancellations, and reverse pickups) are decoupled behind the **`IShippingProvider`** interface. 

**Zero shipping business logic resides in React components.** All client UI components invoke Next.js server API routes (`/api/shipping/*`), which interact with the `ShippingService` and active provider.

```
┌────────────────────────────────────────────────────────┐
│               Storefront / Admin React UI              │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON API Requests
                            ▼
┌────────────────────────────────────────────────────────┐
│           Next.js Server API Routes (/api/shipping/*)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    ShippingService                     │
│         (Disk Persistence & Order Synchronization)     │
└───────────────────────────┬────────────────────────────┘
                            │ Calls IShippingProvider
                            ▼
┌────────────────────────────────────────────────────────┐
│                IShippingProvider Interface             │
├───────────────────────────┬────────────────────────────┤
│    ShiprocketProvider     │   DelhiveryDirectProvider  │
└───────────────────────────┴────────────────────────────┘
```

---

## 2. Required Environment Variables

| Variable | Scope | Required | Description |
|---|---|---|---|
| `SHIPROCKET_API_EMAIL` | Server | **Yes** | Shiprocket account login email |
| `SHIPROCKET_API_PASSWORD` | Server | **Yes** | Shiprocket account password |
| `SHIPROCKET_DEFAULT_PICKUP_LOCATION` | Server | **Yes** | Name of default warehouse pickup location (e.g. `"Tirupur Warehouse WH-1"`) |
| `SHIPROCKET_AUTO_GENERATE_AWB` | Server | Optional | `true` (Automatically assign AWB on order dispatch) |
| `SHIPROCKET_WEBHOOK_TOKEN` | Server | Optional | Secret verification token for incoming carrier webhooks |
| `DEFAULT_PARCEL_LENGTH` | Server | Optional | `30` (Default package length in cm) |
| `DEFAULT_PARCEL_BREADTH` | Server | Optional | `25` (Default package breadth in cm) |
| `DEFAULT_PARCEL_HEIGHT` | Server | Optional | `5` (Default package height in cm) |
| `DEFAULT_PARCEL_WEIGHT` | Server | Optional | `0.5` (Default package weight in kg) |

---

## 3. Order & Shipment Lifecycle

The system tracks shipments through 6 forward logistics stages and 3 reverse logistics stages:

### Forward Logistics
1. **Order Placed**: Customer completes checkout (Razorpay or COD). Order is recorded as unfulfilled.
2. **Shipment Created**: Order is queued for dispatch; Air Waybill (AWB) number is allocated with carrier.
3. **Packed**: Garments pass QA check and are sealed in ADIKT anti-tamper mailer bags with thermal barcode labels.
4. **Shipped**: Package is handed over to carrier pickup vehicle at Tirupur fulfillment hub.
5. **In Transit**: Parcel moves through regional sorting facilities (e.g. Mumbai/Delhi/Bengaluru Alpha Hubs).
6. **Out for Delivery**: Assigned to delivery rider for doorstep handoff.
7. **Delivered**: Customer receives parcel via OTP / signature verification. (For COD, payment status automatically transitions to `Captured`).

### Reverse Logistics (Returns & Exchanges)
1. **Return Initiated**: Admin or customer initiates size exchange / return; reverse AWB is generated (`RET-DLHV-...`).
2. **Return Picked Up**: Carrier collects parcel from customer's residence.
3. **Return Delivered**: Package returns to Tirupur warehouse for inspection and restocking.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shipping/check-serviceability` | Validates 6-digit Indian PIN codes and returns available couriers & ETA |
| `POST` | `/api/shipping/calculate-rates` | Calculates dynamic rates (Free above ₹1,999) |
| `POST` | `/api/shipping/create-shipment` | Dispatches order and allocates AWB |
| `GET` | `/api/shipping/shipments` | Retrieves all shipments for the admin ledger |
| `GET` | `/api/shipping/track/[awb]` | Returns live tracking timeline and checkpoints |
| `GET` | `/api/shipping/generate-label` | Generates 4x6 thermal barcode shipping label |
| `POST` | `/api/shipping/cancel` | Cancels shipment with carrier |
| `POST` | `/api/shipping/return` | Books reverse pickup return shipment |
| `POST` | `/api/webhooks/shipping` | Ingests live tracking updates from Shiprocket / Delhivery |

---

## 5. Thermal 4x6 Label Generation

Shipping labels can be viewed and printed directly from the Admin Shipping Dashboard or via URL:
`/api/shipping/generate-label?awb=BLD-88912304&orderId=ADKT-10492`

Labels contain:
- Brand identity (`ADIKT`)
- High-contrast scannable barcode
- Assigned AWB & Order reference
- Recipient delivery address with prominent PIN code
- Shipper return address (`Tirupur Warehouse WH-1`)
- Package weight & volumetric dimensions
- Payment type indicator (`PREPAID` vs `CASH ON DELIVERY — COLLECT ₹...`)
