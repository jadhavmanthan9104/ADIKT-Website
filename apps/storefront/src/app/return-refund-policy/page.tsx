export default function ReturnRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-6 text-zinc-300">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
        Returns & Exchanges Policy
      </h1>
      <p className="text-sm text-zinc-400">Last updated: August 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">1. 7-Day Doorstep Returns & Exchanges</h2>
          <p>We want you to be completely satisfied with your garment fit and fabric experience. If you need a different size or wish to return an item, you can initiate a return within 7 calendar days of delivery from your customer account.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">2. Return Conditions</h2>
          <p>• Items must be unused, unwashed, with all original tags attached and packaging intact.</p>
          <p>• Reverse pickup will be arranged by our logistics courier directly from your address.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase">3. Refund Processing</h2>
          <p>• <strong>Prepaid Orders</strong>: Refunds are credited back to the original payment source (UPI/Credit Card/Netbanking) within 3-5 business days of the returned parcel passing quality inspection.</p>
          <p>• <strong>COD Orders</strong>: Refunds are transferred via instant IMPS bank transfer or UPI ID provided during return initiation.</p>
        </section>
      </div>
    </div>
  )
}
