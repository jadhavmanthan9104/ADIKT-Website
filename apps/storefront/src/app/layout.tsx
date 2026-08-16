import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { StoreProvider } from "@/components/providers/StoreProvider"
import { CartDrawer } from "@/components/cart/CartDrawer"

export const metadata: Metadata = {
  title: {
    default: "ADIKT | Modern D2C Fashion & Luxury Streetwear",
    template: "%s | ADIKT",
  },
  description:
    "Engineered luxury streetwear, 280 GSM heavyweight tees, 400 GSM French Terry hoodies, and tailored cargos. Designed and crafted in India.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent selection:text-white font-sans">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  )
}
