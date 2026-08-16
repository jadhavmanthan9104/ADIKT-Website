"use client"

import React, { useState } from "react"
import { X } from "@/components/ui/Icons"

export interface SizeChartModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
}

export function SizeChartModal({ isOpen, onClose, productTitle }: SizeChartModalProps) {
  const [unit, setUnit] = useState<"inches" | "cm">("inches")

  if (!isOpen) return null

  const sizeDataInches = [
    { size: "S", chest: '42"', length: '28"', shoulder: '20"', sleeve: '8.5"' },
    { size: "M", chest: '44"', length: '29"', shoulder: '21"', sleeve: '9.0"' },
    { size: "L", chest: '46"', length: '30"', shoulder: '22"', sleeve: '9.5"' },
    { size: "XL", chest: '48"', length: '31"', shoulder: '23"', sleeve: '10.0"' },
    { size: "XXL", chest: '50"', length: '32"', shoulder: '24"', sleeve: '10.5"' },
  ]

  const sizeDataCm = [
    { size: "S", chest: "106 cm", length: "71 cm", shoulder: "50 cm", sleeve: "21.5 cm" },
    { size: "M", chest: "111 cm", length: "73 cm", shoulder: "53 cm", sleeve: "23 cm" },
    { size: "L", chest: "117 cm", length: "76 cm", shoulder: "56 cm", sleeve: "24 cm" },
    { size: "XL", chest: "122 cm", length: "78 cm", shoulder: "58 cm", sleeve: "25.5 cm" },
    { size: "XXL", chest: "127 cm", length: "81 cm", shoulder: "61 cm", sleeve: "26.5 cm" },
  ]

  const currentData = unit === "inches" ? sizeDataInches : sizeDataCm

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold">Size Guide & Measurements</h3>
            <p className="text-xs text-zinc-400">{productTitle} (Oversized Boxy Fit)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between my-4">
          <span className="text-xs text-zinc-400">Garment measured flat</span>
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => setUnit("inches")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === "inches" ? "bg-accent text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                unit === "cm" ? "bg-accent text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
              <tr>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Chest</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Shoulder</th>
                <th className="py-2.5 px-3">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {currentData.map((row) => (
                <tr key={row.size} className="hover:bg-zinc-900/50">
                  <td className="py-2.5 px-3 font-bold text-white">{row.size}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{row.chest}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{row.length}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{row.shoulder}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit tip */}
        <div className="mt-4 p-3 bg-zinc-900/80 rounded-lg text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-white">💡 ADIKT Fit Recommendation:</p>
          <p>This garment is intentionally cut with an oversized boxy drop-shoulder silhouette. For a standard fit, order one size down.</p>
        </div>
      </div>
    </div>
  )
}
