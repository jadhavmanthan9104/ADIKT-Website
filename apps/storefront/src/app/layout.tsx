import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { StoreProvider } from "@/components/providers/StoreProvider"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { FlyToCartOverlay } from "@/components/cart/FlyToCartOverlay"
import { contentStore } from "@/lib/content-store"
import { constructMetadata, generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/seo"
import { GA4Script } from "@/components/analytics/GA4Script"
import { PageViewTracker } from "@/components/analytics/PageViewTracker"

export const metadata: Metadata = constructMetadata({
  route: "/",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialContent = contentStore.getContent()
  const orgJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebSiteJsonLd()

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent selection:text-white font-sans">
        <GA4Script />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <StoreProvider initialContent={initialContent}>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <FlyToCartOverlay />
        </StoreProvider>
      </body>
    </html>
  )
}
