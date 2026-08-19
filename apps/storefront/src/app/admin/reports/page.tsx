"use client"

import React, { useState } from "react"
import { FileSpreadsheet, Download, Calendar, Filter, Check } from "lucide-react"

interface ReportDefinition {
  id: string
  title: string
  description: string
  frequency: string
  lastGenerated: string
  format: "CSV" | "Excel" | "JSON"
}

const REPORTS: ReportDefinition[] = [
  { id: "gst_b2c", title: "Monthly GST GSTR-1 B2C Tax Filing Report", description: "State-wise tax rate breakdown (5% & 12% GST) and HSN codes for all completed orders.", frequency: "Monthly", lastGenerated: "Aug 01, 2026", format: "Excel" },
  { id: "sales_recon", title: "Daily Sales & Razorpay Gateway Reconciliation", description: "Line item ledger of settled online transactions vs COD cash collections.", frequency: "Daily", lastGenerated: "Today at 00:00", format: "CSV" },
  { id: "inventory_val", title: "Warehouse Stock Valuation & COGS Report", description: "Physical stock on hand multiplied by unit landed manufacturing cost across all SKUs.", frequency: "Weekly", lastGenerated: "Aug 14, 2026", format: "Excel" },
  { id: "courier_perf", title: "Logistics SLA & Courier Delivery Performance", description: "Delhivery vs Bluedart transit time metrics, RTO rates, and shipping charge auditing.", frequency: "Weekly", lastGenerated: "Aug 15, 2026", format: "CSV" },
]

export default function AdminReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = (id: string) => {
    setDownloadingId(id)
    setTimeout(() => {
      setDownloadingId(null)
      alert("Report export generated successfully. Download started.")
    }, 1200)
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            Financial & Tax Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
            Reports & Export Center
          </h1>
        </div>
      </div>

      <div className="space-y-4">
        {REPORTS.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-accent shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase text-white">{rep.title}</h3>
                <p className="text-xs text-zinc-400 max-w-xl">{rep.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                  <span>Frequency: <strong className="text-zinc-300">{rep.frequency}</strong></span>
                  <span>•</span>
                  <span>Last Generated: <strong className="text-zinc-300">{rep.lastGenerated}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(rep.id)}
              disabled={downloadingId === rep.id}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-accent" />
              {downloadingId === rep.id ? "Generating..." : `Download ${rep.format}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
