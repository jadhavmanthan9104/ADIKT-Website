import Link from "next/link"
import { ArrowLeft } from "@/components/ui/Icons"

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">Error 404</span>
      <h1 className="text-4xl font-black uppercase tracking-tight text-white font-display">
        Silhouette Not Found
      </h1>
      <p className="text-sm text-zinc-400">
        The piece you are looking for has either sold out, moved to the archives, or the link is incorrect.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold uppercase rounded-lg text-xs"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Catalog
      </Link>
    </div>
  )
}
