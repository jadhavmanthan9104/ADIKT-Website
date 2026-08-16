import React from "react"

export const metadata = {
  title: "Privacy Policy | ADIKT Clothing Co.",
  description: "Indian Information Technology Act compliant privacy policy of ADIKT Clothing Co.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Legal & Compliance</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400">Effective Date: August 2026 | Compliant with Indian IT Act 2000</p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">1. Information We Collect</h2>
          <p className="text-zinc-400">
            We collect information you provide directly to us when creating a VIP account, placing an order, subscribing to drop alerts, or contacting our concierge:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Contact Information: Full name, delivery address, email address, and 10-digit mobile number.</li>
            <li>Transaction Details: Order history, items purchased, and payment method identifier.</li>
            <li>Technical Data: IP address, browser type, and device information for fraud prevention.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">2. Payment Security</h2>
          <p className="text-zinc-400">
            We do not store complete credit card numbers, debit card PINs, or CVV codes on our servers. All digital transactions are processed securely through <strong>Razorpay Payment Gateway</strong> using 256-bit SSL encryption adhering to PCI-DSS Level 1 compliance.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">3. How We Use Your Data</h2>
          <p className="text-zinc-400">
            Your personal information is used exclusively to fulfill orders, transmit tracking updates via SMS/WhatsApp, process returns, prevent fraudulent transactions, and send early drop notifications if subscribed. We never sell or lease customer data to third-party advertisers.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase">4. Data Protection Officer & Grievance</h2>
          <p className="text-zinc-400">
            In accordance with the Information Technology Act 2000 and rules made thereunder, the Grievance Officer for ADIKT Apparel Works Pvt Ltd can be contacted at: <strong>grievance@adiktclothing.com</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
