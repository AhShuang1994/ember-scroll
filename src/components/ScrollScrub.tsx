import { useEffect, useRef, useState } from 'react'

type Manifest = { count: number; width: number; height: number; aspect: number }
type Beat = { at: number; title: string; kicker: string }

// Story beats mapped to scroll progress (0..1). Edit freely.
const BEATS: Beat[] = [
  { at: 0.0, title: 'She rests in the quiet dark.', kicker: 'idle' },
  { at: 0.32, title: 'Energy gathers — drawn toward her.', kicker: 'inflow' },
  { at: 0.64, title: 'The light pours in.', kicker: 'surge' },
  { at: 0.9, title: 'She opens her eyes.', kicker: 'awake' },
]

const SMOOTHING = 0.2 // validated feel
const PX_PER_FRAME = 40 // scroll distance per frame

const grad = 'linear-gradient(90deg,#f97316,#fcd34d)'

export default function ScrollScrub() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const beatRef = useRef(-1)
  const scrolledRef = useRef(false)

  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const [beatIdx, setBeatIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  // Load manifest + preload every frame before enabling the scrub.
  useEffect(() => {
    let cancelled = false
    fetch('/frames.json')
      .then((r) => r.json())
      .then((m: Manifest) => {
        if (cancelled) return
        setManifest(m)
        const imgs: HTMLImageElement[] = []
        let done = 0
        for (let i = 0; i < m.count; i++) {
          const img = new Image()
          const onDone = () => {
            done++
            setLoaded(done)
            if (done === m.count && !cancelled) setReady(true)
          }
          img.src = `/frames/frame_${String(i).padStart(3, '0')}.webp`
          // Force a full decode up front so scrubbing never hitches decoding a
          // frame on first paint.
          img.decode().then(onDone, onDone)
          imgs[i] = img
        }
        imagesRef.current = imgs
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Scroll -> smoothed frame index -> canvas draw.
  useEffect(() => {
    if (!ready || !manifest) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let cur = 0
    let target = 0
    let maxScroll = 0
    let lastIdx = -1
    let raf = 0

    const recompute = () => {
      const track = trackRef.current
      maxScroll = track ? Math.max(0, track.offsetHeight - window.innerHeight) : 0
    }
    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      recompute()
      lastIdx = -1
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      target = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0
      if (!scrolledRef.current && window.scrollY > 24) {
        scrolledRef.current = true
        setScrolled(true)
      }
      cur += (target - cur) * SMOOTHING
      const p = cur
      const idx = Math.round(p * (manifest.count - 1))
      // Only repaint when the frame actually changes — avoids redundant
      // drawImage every rAF tick and keeps scrolling smooth.
      if (idx !== lastIdx) {
        lastIdx = idx
        const W = canvas.clientWidth
        const H = canvas.clientHeight
        const img = imagesRef.current[idx]
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, W, H)
        if (img && img.complete && img.naturalWidth) {
          // cover on portrait screens (phones), contain on landscape (desktop)
          const cover = W / H <= manifest.aspect + 0.12
          const s = cover
            ? Math.max(W / img.naturalWidth, H / img.naturalHeight)
            : Math.min(W / img.naturalWidth, H / img.naturalHeight)
          const dw = img.naturalWidth * s
          const dh = img.naturalHeight * s
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
        }
      }
      if (barRef.current) barRef.current.style.width = `${p * 100}%`
      let bi = 0
      for (let i = 0; i < BEATS.length; i++)
        if (p >= BEATS[i].at - 0.001) bi = i
      if (bi !== beatRef.current) {
        beatRef.current = bi
        setBeatIdx(bi)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [ready, manifest])

  // Use lvh (large viewport height) so the canvas height stays CONSTANT when the
  // mobile address bar retracts on first scroll — otherwise `cover` rescales and
  // the frame appears to zoom in.
  const trackHeight = manifest
    ? `calc(100lvh + ${manifest.count * PX_PER_FRAME}px)`
    : '100lvh'
  const pct = manifest ? Math.round((loaded / manifest.count) * 100) : 0

  return (
    <>
      {!ready && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black px-8 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
            Ember
          </div>
          <div className="h-px w-48 overflow-hidden bg-white/10">
            <div
              className="h-full transition-[width] duration-200"
              style={{ width: `${pct}%`, background: grad }}
            />
          </div>
          <div className="font-mono text-xs text-white/50">loading {pct}%</div>
        </div>
      )}

      <div ref={trackRef} style={{ height: trackHeight }} className="relative">
        <div className="sticky top-0 h-[100lvh] w-full overflow-hidden bg-black">
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

          {/* top-left mark */}
          <div className="pointer-events-none absolute left-5 top-5 font-mono text-[11px] uppercase tracking-[0.28em] text-white/70">
            Ember<span className="text-orange-400">.</span>
          </div>

          {/* story beats */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[16%] px-8">
            <div className="relative mx-auto flex h-28 max-w-[24ch] items-center justify-center">
              {BEATS.map((b, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                    i === beatIdx
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-3 opacity-0'
                  }`}
                >
                  <p className="text-2xl font-medium leading-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)] sm:text-3xl">
                    {b.title}
                  </p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-orange-400">
                    {b.kicker}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* scroll hint */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-8 flex justify-center font-mono text-[11px] uppercase tracking-[0.24em] text-white/50 transition-opacity duration-500 ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
          >
            scroll ↓
          </div>

          {/* progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
            <div
              ref={barRef}
              className="h-full"
              style={{ width: '0%', background: grad }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
