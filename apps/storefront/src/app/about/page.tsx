export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8 text-zinc-300">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">The Philosophy</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
          Crafting The New Standard of Indian Streetwear
        </h1>
      </div>

      <p className="text-base sm:text-lg leading-relaxed text-zinc-200">
        Founded with a singular commitment to garment weight, drape, and structural permanence, <strong>ADIKT</strong> bridges high-density material engineering with contemporary luxury silhouettes.
      </p>

      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Uncompromising Standards</h3>
        <ul className="space-y-3 text-sm text-zinc-400">
          <li><strong>280-400 GSM Fabrics</strong>: Custom knit single jerseys and heavyweight French Terry milled in South India.</li>
          <li><strong>Bespoke Silhouette Engineering</strong>: Drop-shoulder boxy cuts with ribbed neckline reinforcement that never bacon.</li>
          <li><strong>Sustainable Direct-to-Consumer Model</strong>: Zero distributor markups, self-hosted commerce, and full manufacturing transparency.</li>
        </ul>
      </div>
    </div>
  )
}
