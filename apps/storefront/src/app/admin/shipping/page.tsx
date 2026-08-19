"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable"
import { formatPrice, formatDate } from "@/lib/formatters"
import {
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  ExternalLink,
  MapPin,
  Clock,
  Settings,
  Plus,
  X,
  Check,
  Search,
  DollarSign,
  ShieldCheck,
  Navigation,
  Save,
  Loader2,
  RefreshCw,
} from "lucide-react"

interface ShipmentItem {
  id: string
  title: string
  variant: string
  sku: string
  quantity: number
  price: number
}

interface Shipment {
  id: string
  orderId: string
  displayId: string
  courier: string
  courierCode: string
  awb: string
  trackingUrl: string
  status: string
  shippingCost: number
  isCod: boolean
  codAmount: number
  packageWeightKg: number
  shippingAddress: {
    name: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  items: ShipmentItem[]
  labelUrl?: string
  checkpoints: {
    status: string
    title: string
    location: string
    timestamp: string
    description: string
  }[]
  isReturn?: boolean
  returnReason?: string
  createdAt: string
  updatedAt: string
}

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [selectedShipmentForTrack, setSelectedShipmentForTrack] = useState<Shipment | null>(null)
  const [selectedShipmentForReturn, setSelectedShipmentForReturn] = useState<Shipment | null>(null)
  const [returnReason, setReturnReason] = useState("Customer requested size exchange")
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)
  const [returnMessage, setReturnMessage] = useState<string | null>(null)

  // Create Shipment Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOrderDisplayId, setNewOrderDisplayId] = useState("")
  const [newCustomerName, setNewCustomerName] = useState("Aditya Sharma")
  const [newCustomerPhone, setNewCustomerPhone] = useState("9876543210")
  const [newAddressLine1, setNewAddressLine1] = useState("Flat 402, Highline Residences, Linking Road")
  const [newCity, setNewCity] = useState("Mumbai")
  const [newState, setNewState] = useState("Maharashtra")
  const [newPincode, setNewPincode] = useState("400050")
  const [newCourier, setNewCourier] = useState("Bluedart Air Express")
  const [newWeight, setNewWeight] = useState(0.7)
  const [isCreatingShipment, setIsCreatingShipment] = useState(false)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // Rate rules & configuration state
  const [threshold, setThreshold] = useState(1999)
  const [expressRate, setExpressRate] = useState(99)
  const [standardRate, setStandardRate] = useState(49)
  const [primaryCarrier, setPrimaryCarrier] = useState("Bluedart Air Express")
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [configSaveSuccess, setConfigSaveSuccess] = useState<string | null>(null)
  const [configSaveError, setConfigSaveError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  // Live Checkpoint Update State
  const [updateStatus, setUpdateStatus] = useState("In Transit")
  const [updateLocation, setUpdateLocation] = useState("Mumbai Alpha Hub")
  const [updateDescription, setUpdateDescription] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)

  const handlePostCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipmentForTrack) return

    setIsUpdatingStatus(true)
    setUpdateSuccess(null)

    try {
      const res = await fetch("/api/shipping/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awb: selectedShipmentForTrack.awb,
          status: updateStatus,
          location: updateLocation,
          description: updateDescription.trim() || `Parcel status updated to ${updateStatus}.`,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update shipment status")

      setUpdateSuccess(`Live checkpoint added! Status is now ${updateStatus}`)
      setSelectedShipmentForTrack(data.shipment)
      await fetchShipments()
      setTimeout(() => {
        setUpdateSuccess(null)
      }, 3000)
    } catch (err: any) {
      alert(`Error updating checkpoint: ${err.message}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSyncCarrier = async () => {
    if (!selectedShipmentForTrack) return
    try {
      const res = await fetch(`/api/shipping/track/${encodeURIComponent(selectedShipmentForTrack.awb)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.tracking?.shipment) {
          setSelectedShipmentForTrack(data.tracking.shipment)
        }
        await fetchShipments()
        alert(`Carrier activity synchronized in real-time with ${selectedShipmentForTrack.courier}!`)
      }
    } catch (err: any) {
      alert(`Carrier sync notice: ${err.message}`)
    }
  }

  const fetchShipments = async () => {
    try {
      const res = await fetch("/api/shipping/shipments")
      if (res.ok) {
        const data = await res.json()
        if (data.shipments) setShipments(data.shipments)
      }
    } catch (err) {
      console.error("Failed to fetch shipments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShippingConfig = async () => {
    try {
      const res = await fetch("/api/shipping/config")
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setThreshold(data.config.freeShippingThreshold)
          setExpressRate(data.config.expressDeliveryFee)
          setStandardRate(data.config.standardDeliveryFee)
          if (data.config.defaultCarrier) setPrimaryCarrier(data.config.defaultCarrier)
          if (data.config.updatedAt) setLastSavedAt(data.config.updatedAt)
        }
      }
    } catch (err) {
      console.error("Failed to fetch shipping config:", err)
    }
  }

  useEffect(() => {
    fetchShipments()
    fetchShippingConfig()
  }, [])

  // Handle Save / Finalize Shipping Rules
  const handleSaveShippingConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    setConfigSaveSuccess(null)
    setConfigSaveError(null)

    try {
      const res = await fetch("/api/shipping/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeShippingThreshold: Number(threshold),
          expressDeliveryFee: Number(expressRate),
          standardDeliveryFee: Number(standardRate),
          defaultCarrier: primaryCarrier,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save configuration")

      setConfigSaveSuccess(
        `Shipping rules finalized! Orders ≥ ₹${threshold.toLocaleString("en-IN")} receive Free Air Express delivery.`
      )
      if (data.config?.updatedAt) {
        setLastSavedAt(data.config.updatedAt)
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shipping-config-updated"))
      }
      setTimeout(() => {
        setConfigSaveSuccess(null)
      }, 4000)
    } catch (err: any) {
      setConfigSaveError(err.message || "Failed to save configuration")
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Handle Cancel Shipment
  const handleCancelShipment = async (awb: string) => {
    if (!confirm(`Are you sure you want to cancel shipment with AWB ${awb}?`)) return

    try {
      const res = await fetch("/api/shipping/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awb }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel shipment")
      alert(data.message)
      await fetchShipments()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Handle Book Return Shipment
  const handleExecuteReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipmentForReturn) return

    setIsProcessingReturn(true)
    setReturnMessage(null)

    try {
      const res = await fetch("/api/shipping/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalShipmentId: selectedShipmentForReturn.id,
          orderId: selectedShipmentForReturn.displayId,
          reason: returnReason,
          pickupAddress: selectedShipmentForReturn.shippingAddress,
          items: selectedShipmentForReturn.items,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create return shipment")

      setReturnMessage(`Reverse Logistics return booked! Reverse AWB: ${data.returnAwb}`)
      await fetchShipments()
      setTimeout(() => {
        setSelectedShipmentForReturn(null)
        setReturnMessage(null)
      }, 2000)
    } catch (err: any) {
      setReturnMessage(`Error: ${err.message}`)
    } finally {
      setIsProcessingReturn(false)
    }
  }

  // Handle Create / Dispatch Shipment
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingShipment(true)
    setCreateSuccess(null)

    try {
      const displayId = newOrderDisplayId || `ADKT-${Math.floor(10000 + Math.random() * 90000)}`
      const res = await fetch("/api/shipping/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          displayId,
          courier: newCourier,
          packageWeightKg: newWeight,
          shippingAddress: {
            name: newCustomerName,
            phone: newCustomerPhone,
            addressLine1: newAddressLine1,
            city: newCity,
            state: newState,
            pincode: newPincode,
          },
          items: [
            {
              id: `item_${Date.now()}`,
              title: "280 GSM Boxy Heavyweight Tee - Vintage Black",
              variant: "L / Vintage Black",
              sku: "ADKT-TEE-BLK-L",
              quantity: 1,
              price: 1999,
              weightGrams: 350,
            },
          ],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create shipment")

      setCreateSuccess(`Shipment created with AWB ${data.shipment.awb}`)
      await fetchShipments()
      setTimeout(() => {
        setShowCreateModal(false)
        setCreateSuccess(null)
        setNewOrderDisplayId("")
      }, 1500)
    } catch (err: any) {
      alert(`Error creating shipment: ${err.message}`)
    } finally {
      setIsCreatingShipment(false)
    }
  }

  // Metrics
  const activeInTransit = shipments.filter(
    (s) => s.status === "In Transit" || s.status === "Shipped" || s.status === "Out for Delivery"
  ).length
  const totalDelivered = shipments.filter((s) => s.status === "Delivered").length
  const totalReturns = shipments.filter((s) => s.isReturn || s.status.includes("Return")).length

  const columns: Column<Shipment>[] = [
    {
      header: "Shipment ID & AWB",
      accessor: (s) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-white text-xs">{s.awb}</span>
            {s.isReturn && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Reverse Return
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-500 block">{s.id}</span>
        </div>
      ),
    },
    {
      header: "Order Ref",
      accessor: (s) => (
        <div>
          <span className="font-mono font-bold text-accent">#{s.displayId}</span>
          <span className="text-[11px] text-zinc-500 block">{s.items?.length || 1} Item(s)</span>
        </div>
      ),
    },
    {
      header: "Courier Partner",
      accessor: (s) => (
        <div>
          <span className="font-bold text-white flex items-center gap-1 text-xs">
            <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
            {s.courier}
          </span>
          <span className="text-[10px] text-zinc-400 block">{s.packageWeightKg} kg • Volumetric</span>
        </div>
      ),
    },
    {
      header: "Destination",
      accessor: (s) => (
        <div>
          <span className="font-bold text-white text-xs block">{s.shippingAddress.name}</span>
          <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">
            {s.shippingAddress.city}, {s.shippingAddress.state} ({s.shippingAddress.pincode})
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (s) => (
        <span
          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
            s.status === "Delivered"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : s.status === "In Transit" || s.status === "Shipped" || s.status === "Out for Delivery"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : s.status.includes("Return")
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : s.status === "Cancelled"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-zinc-800 text-zinc-300 border-zinc-700"
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessor: (s) => (
        <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
          {formatDate(s.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          {/* Print Label Button */}
          <a
            href={`/api/shipping/generate-label?awb=${s.awb}&orderId=${s.displayId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Print 4x6 Thermal Shipping Label"
          >
            <Printer className="h-3.5 w-3.5 text-white" />
          </a>

          {/* Inspect Tracking */}
          <button
            onClick={() => setSelectedShipmentForTrack(s)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="View Live Checkpoints"
          >
            <Navigation className="h-3.5 w-3.5 text-accent" />
          </button>

          {/* Book Return (if delivered) */}
          {s.status === "Delivered" && !s.isReturn && (
            <button
              onClick={() => setSelectedShipmentForReturn(s)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-purple-900/60 text-zinc-300 hover:text-purple-300 transition-colors"
              title="Book Reverse Logistics Return"
            >
              <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
            </button>
          )}

          {/* Cancel Shipment (if not delivered) */}
          {s.status !== "Delivered" && s.status !== "Cancelled" && (
            <button
              onClick={() => handleCancelShipment(s.awb)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-colors"
              title="Cancel Shipment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Pan-India Courier Logistics & Fulfillment Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Shipments & Deliveries ({shipments.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time integration with Shiprocket, Delhivery Direct, and Bluedart Air networks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-accent" />
            Customer Tracking Portal
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase shadow-lg shadow-accent/20 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Dispatch / Create Shipment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-accent" /> Total Booked Shipments
          </span>
          <p className="text-xl sm:text-2xl font-black text-white font-display">{shipments.length}</p>
          <p className="text-[10px] text-zinc-500">Across all pan-India carriers</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> In Transit / Line Haul
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-400 font-display">{activeInTransit}</p>
          <p className="text-[10px] text-zinc-500">Currently out in transit vehicle</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Successfully Delivered
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">{totalDelivered}</p>
          <p className="text-[10px] text-zinc-500">OTP verified doorstep delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reverse Returns
          </span>
          <p className="text-xl sm:text-2xl font-black text-purple-400 font-display">{totalReturns}</p>
          <p className="text-[10px] text-zinc-500">Reverse logistics booked</p>
        </div>
      </div>

      {/* Main Shipments Data Table */}
      <AdminDataTable
        data={shipments}
        columns={columns}
        searchPlaceholder="Search by AWB, order #, customer name, destination city..."
        filterKey={(s, q) =>
          s.awb.toLowerCase().includes(q.toLowerCase()) ||
          s.displayId.toLowerCase().includes(q.toLowerCase()) ||
          s.shippingAddress.name.toLowerCase().includes(q.toLowerCase()) ||
          s.shippingAddress.city.toLowerCase().includes(q.toLowerCase()) ||
          s.shippingAddress.pincode.includes(q) ||
          s.courier.toLowerCase().includes(q.toLowerCase())
        }
      />

      {/* Rate Rules & Carrier Setup Section (With Save & Finalize Option) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-zinc-800">
        <form
          onSubmit={handleSaveShippingConfig}
          className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <DollarSign className="h-4 w-4 text-accent" />
              Free Shipping & Rate Thresholds Configuration
            </div>
            {lastSavedAt && (
              <span className="text-[10px] font-mono text-zinc-500">
                Last finalized: {formatDate(lastSavedAt)}
              </span>
            )}
          </div>

          {/* Success Banner */}
          {configSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{configSaveSuccess}</span>
            </div>
          )}

          {/* Error Banner */}
          {configSaveError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{configSaveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-300 font-bold block">
                Free Shipping Cart Minimum (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                Cart subtotals at or above ₹{threshold.toLocaleString("en-IN")} qualify for complimentary express delivery across India.
              </p>
            </div>

            <div>
              <label className="text-zinc-300 font-bold block">
                Air Express Delivery Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={expressRate}
                onChange={(e) => setExpressRate(Number(e.target.value))}
                className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                Applied to orders below the free shipping threshold for priority dispatch.
              </p>
            </div>

            <div>
              <label className="text-zinc-300 font-bold block">
                Standard Surface Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={standardRate}
                onChange={(e) => setStandardRate(Number(e.target.value))}
                className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                Standard surface freight rate for non-priority parcels.
              </p>
            </div>

            <div>
              <label className="text-zinc-300 font-bold block">
                Default Courier Gateway
              </label>
              <select
                value={primaryCarrier}
                onChange={(e) => setPrimaryCarrier(e.target.value)}
                className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="Bluedart Air Express">Bluedart Air Express (Primary)</option>
                <option value="Delhivery Air Express">Delhivery Air Express</option>
                <option value="Delhivery Surface">Delhivery Surface</option>
                <option value="Shadowfax Local">Shadowfax Local</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="text-[11px] text-zinc-400">
              Changes take effect immediately across all customer checkout sessions.
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-50 shadow-md"
            >
              {isSavingConfig ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Finalizing...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-black" />
                  <span>Save & Finalize Shipping Rules</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
            <Settings className="h-4 w-4 text-accent" />
            Active Indian Logistics Gateways
          </div>

          <div className="space-y-2.5">
            {[
              { name: "Bluedart Air Express", rate: "Pan-India Air (2-3 Days)", status: "Active Primary", code: "BLD" },
              { name: "Delhivery Air & Surface", rate: "28,000+ PIN Codes (2-4 Days)", status: "Active Secondary", code: "DLHV" },
              { name: "DTDC Express", rate: "Domestic & Zonal Network (2-4 Days)", status: "Active", code: "DTDC" },
              { name: "DHL Express India", rate: "Priority Air & Metro Express (1-2 Days)", status: "Active Priority", code: "DHL" },
              { name: "Shadowfax Local", rate: "Intra-City Metro (1-2 Days)", status: "Standby", code: "SFX" },
            ].map((c, i) => (
              <div key={i} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-accent" /> {c.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">{c.rate} • Code: <span className="font-mono text-zinc-300">{c.code}</span></p>
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1 text-[11px] text-zinc-400">
            <span className="font-bold text-white block">Logistics Automation Policy</span>
            <p className="leading-relaxed">
              When an order is created, the system compares cart weight against courier volumetric cards and assigns the optimal Air/Surface route automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Live Tracking Checkpoints */}
      {selectedShipmentForTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    AWB: {selectedShipmentForTrack.awb}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                    {selectedShipmentForTrack.courier}
                  </span>
                </div>
                <h3 className="text-sm font-bold uppercase text-white tracking-wider mt-0.5">
                  Live Carrier Activity — Order #{selectedShipmentForTrack.displayId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipmentForTrack(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Checkpoints Timeline */}
            <div className="space-y-4 max-h-56 overflow-y-auto pl-4 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800 text-xs">
              {selectedShipmentForTrack.checkpoints.map((cp, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div
                    className={`absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 ${
                      idx === 0 ? "bg-accent border-zinc-900" : "bg-zinc-700 border-zinc-900"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{cp.title}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{cp.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{cp.location}</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{cp.description}</p>
                </div>
              ))}
            </div>

            {/* Live Checkpoint Posting & Transition Form */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-accent" /> Post Live Scan Event / Transition Status
                </span>
                <button
                  type="button"
                  onClick={handleSyncCarrier}
                  className="text-[10px] font-bold text-zinc-400 hover:text-accent underline"
                >
                  Sync Carrier API ↗
                </button>
              </div>

              {updateSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">
                  {updateSuccess}
                </div>
              )}

              <form onSubmit={handlePostCheckpoint} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Update Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Packed">Packed</option>
                    <option value="RTO Initiated">RTO Initiated</option>
                    <option value="Return Delivered">Return Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Current Transit Hub</label>
                  <input
                    type="text"
                    value={updateLocation}
                    onChange={(e) => setUpdateLocation(e.target.value)}
                    placeholder="e.g. Mumbai Hub / Local Van"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Scan Activity Note</label>
                  <input
                    type="text"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="e.g. Out with delivery rider for doorstep delivery."
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedShipmentForTrack(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    {isUpdatingStatus ? "Updating..." : "Post & Sync Storefront"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Book Reverse Logistics Return */}
      {selectedShipmentForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                  Book Reverse Pickup — #{selectedShipmentForReturn.displayId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipmentForReturn(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {returnMessage ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
                {returnMessage}
              </div>
            ) : (
              <form onSubmit={handleExecuteReturn} className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Pickup Address (Customer)</span>
                  <p className="text-white font-bold">{selectedShipmentForReturn.shippingAddress.name}</p>
                  <p className="text-zinc-400">
                    {selectedShipmentForReturn.shippingAddress.addressLine1}, {selectedShipmentForReturn.shippingAddress.city} -{" "}
                    {selectedShipmentForReturn.shippingAddress.pincode}
                  </p>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                  >
                    <option value="Customer requested size exchange">Customer requested size exchange</option>
                    <option value="Fit / Silhouette preference">Fit / Silhouette preference</option>
                    <option value="Garment defect or manufacturing issue">Garment defect or manufacturing issue</option>
                    <option value="Customer changed mind">Customer changed mind</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedShipmentForReturn(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingReturn}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isProcessingReturn ? "Booking Reverse Pickup..." : "Book Reverse Pickup"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create / Dispatch Shipment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                  Dispatch & Generate AWB
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
                {createSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-medium">Order Display ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. ADKT-10493"
                      value={newOrderDisplayId}
                      onChange={(e) => setNewOrderDisplayId(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">Courier Partner *</label>
                    <select
                      value={newCourier}
                      onChange={(e) => setNewCourier(e.target.value)}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Bluedart Express">Bluedart Express</option>
                      <option value="DTDC">DTDC</option>
                      <option value="DHL Express">DHL Express</option>
                      <option value="Shadowfax Local">Shadowfax Local</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-medium">Customer Name *</label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">Customer Mobile (10 Digits) *</label>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Street Address *</label>
                  <input
                    type="text"
                    value={newAddressLine1}
                    onChange={(e) => setNewAddressLine1(e.target.value)}
                    required
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 font-medium">City *</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">State *</label>
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 font-medium">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
                      required
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingShipment}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold uppercase shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isCreatingShipment ? "Allocating AWB..." : "Confirm & Allocate AWB"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
