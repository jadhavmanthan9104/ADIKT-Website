import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase font-display text-white">
              ADIKT<span className="text-accent">.</span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Engineered luxury streetwear & high-GSM silhouettes. Designed and manufactured with uncompromising craftsmanship in India.
            </p>
            <p className="text-xs text-foreground/40">
              © {new Date().getFullYear()} ADIKT Clothing Co. All rights reserved.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Collections</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=tees" className="hover:text-white transition-colors">Oversized Tees</Link></li>
              <li><Link href="/shop?category=hoodies" className="hover:text-white transition-colors">Heavyweight Hoodies</Link></li>
              <li><Link href="/shop?category=cargos" className="hover:text-white transition-colors">Parachute Cargos</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/return-refund-policy" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Size Guide</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li className="text-xs text-foreground/50 pt-2">
                Payments secured with 256-bit encryption via Razorpay.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
