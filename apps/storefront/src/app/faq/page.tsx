export default function FAQPage() {
  const faqs = [
    {
      q: "What makes 280 GSM t-shirts different from regular tees?",
      a: "Standard t-shirts use 160-180 GSM fabrics which tend to cling and lose shape. Our 280 GSM combed compact cotton provides a structured boxy drape that holds its form all day without sticking to the body.",
    },
    {
      q: "How does the sizing work? Should I size up or down?",
      a: "Our garments are intentionally cut with an oversized boxy drop-shoulder silhouette. If you prefer the intended streetwear look, choose your true size. If you prefer a regular tailored fit, order one size down.",
    },
    {
      q: "How long does shipping take across India?",
      a: "Orders are dispatched within 24 hours from our Mumbai central warehouse. Delivery takes 2-3 business days for tier-1 metro cities and 3-5 business days for the rest of India via Bluedart and Delhivery.",
    },
    {
      q: "What is your return & exchange policy?",
      a: "We offer a 7-day hassle-free doorstep pickup and size exchange policy. All tags must remain attached and the garment must be unwashed.",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Support Portal</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <h3 className="text-base font-bold text-white">{faq.q}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
