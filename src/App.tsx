import ScrollScrub from './components/ScrollScrub'

export default function App() {
  return (
    <main className="bg-black text-white">
      <ScrollScrub />

      <section className="flex min-h-[85vh] flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400">
          H2ODreamer Studio
        </p>
        <h2 className="max-w-[20em] text-2xl font-medium leading-relaxed text-balance text-white sm:text-3xl">
          每一个有梦想的人，
          <br />
          都值得一个属于自己的起点。
        </h2>
        <p className="max-w-[24em] text-sm leading-relaxed text-white/55">
          每一滴努力，都该流向属于你的地方。🌊
        </p>
        <a
          href="https://www.h2o-dreamer-studio.com/"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-7 py-3 text-sm text-orange-100 transition hover:bg-orange-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
        >
          免费聊聊你的情况 →
        </a>
        <p className="font-mono text-[11px] tracking-wider text-white/35">
          WhatsApp · 免费咨询，不会推销
        </p>
      </section>
    </main>
  )
}
