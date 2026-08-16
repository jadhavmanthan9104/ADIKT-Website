import React from "react"

export const metadata = {
  title: "Terms of Service | ADIKT Clothing Co.",
  description: "Terms and conditions of use for ADIKT Clothing Co. storefront.",
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Storefront Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">1. Agreement to Terms</h2>
          <p className="text-zinc-400">
            By accessing or shopping at <strong>ADIKT Clothing Co.</strong>, you agree to be bound by these Terms of Service and all applicable Indian commercial laws.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">2. Product Specifications & Pricing</h2>
          <p className="text-zinc-400">
            All prices displayed on the storefront are denominated in Indian Rupees (INR ₹) and are inclusive of applicable Goods and Services Tax (GST). Fabric specifications such as GSM (grams per square meter), weave, and color swatches are accurately photographed under color-calibrated lighting.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">3. Orders, Dispatch & Cancellations</h2>
          <p className="text-zinc-400">
            Orders placed on the storefront are subject to acceptance and stock availability. You may cancel your order at any time before it has been dispatched from our warehouse by navigating to your account orders dashboard or contacting concierge support.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">4. Governing Law & Jurisdiction</h2>
          <p className="text-zinc-400">
            These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </div>
      </div>
    </div>
  )
}
