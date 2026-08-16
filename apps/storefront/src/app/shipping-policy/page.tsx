export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-6 text-zinc-300">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
        Shipping & Delivery Policy
      </h1>
      <p className="text-sm text-zinc-400">Last updated: August 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">1. Processing & Dispatch</h2>
          <p>All orders placed before 3:00 PM IST on business days are packed and dispatched on the same day from our Mumbai fulfillment center. Orders placed over the weekend are dispatched on Monday morning.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">2. Courier Partners & Tracking</h2>
          <p>We partner with premier express logistics services including Delhivery, Bluedart, and Shiprocket. Once dispatched, a live tracking link with your AWB number is sent via SMS and Email.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">3. Shipping Rates</h2>
          <p>• <strong>Prepaid Orders (UPI/Cards)</strong>: Free express shipping across India on orders over ₹1,999. Flat ₹150 for orders below ₹1,999.</p>
          <p>• <strong>Cash on Delivery (COD)</strong>: Available on orders up to ₹10,000.</p>
        </section>
      </div>
    </div>
  )
}
