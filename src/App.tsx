import ScrollScrub from './components/ScrollScrub'

export default function App() {
  return (
    <main className="bg-black text-white">
      <ScrollScrub />

      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-orange-400">
          the story continues
        </p>
        <h2 className="max-w-[16ch] text-3xl font-medium leading-tight text-white sm:text-4xl">
          This is where the next chapter scrolls in.
        </h2>
        <p className="max-w-[42ch] text-sm leading-relaxed text-white/50">
          Segment 1 — awakening. Chain the next segment here: its first frame is
          this segment&apos;s last frame, for a seamless continuation.
        </p>
      </section>
    </main>
  )
}
