# Ember — scroll-scrub story site

A scroll-driven "story" site. Scroll position maps to a frame of an image
sequence drawn on a `<canvas>`, so scrolling scrubs the animation (Apple-style).
Built for a black, Linear-style aesthetic. **Segment 1: awakening** (eyes closed →
energy flows in → eyes open).

Stack: Vite + React + TypeScript + Tailwind CSS v4.

## Local dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## How it works

- Frames live in `public/frames/frame_000.webp … frame_119.webp` with a
  `public/frames.json` manifest (`{count, width, height, aspect}`).
- `src/components/ScrollScrub.tsx` preloads every frame, then a `requestAnimationFrame`
  loop reads `window.scrollY` each frame, eases it (`SMOOTHING = 0.2`), and draws the
  matching frame. Portrait screens get `cover` (full-bleed); wide screens get `contain`
  on black.

### Tuning knobs (in `ScrollScrub.tsx`)

| Constant | Meaning |
| --- | --- |
| `SMOOTHING` | 0.2 — higher = snappier, lower = floatier |
| `PX_PER_FRAME` | 40 — scroll distance per frame (controls total scroll length) |
| `BEATS` | the story captions and the scroll progress each appears at |

## Swapping in a new / better clip

1. Extract your video to 120 WebP frames named `frame_000.webp…` into
   `public/frames/`, plus a matching `public/frames.json`.
2. For a **desktop 16:9** version, extract a second set and load it by viewport
   (add a media-query branch that picks the `/frames-desktop/` folder on wide screens).

## Deploy — Cloudflare Pages

**Option A — connect the GitHub repo (recommended):**

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** →
   pick the repo.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Node version is pinned to 22 via `.node-version` (Vite 8 needs Node ≥ 20.19).
4. Save & Deploy. Every push to `main` redeploys. Test the `*.pages.dev` URL on your
   phone.

**Option B — direct upload (no GitHub):**

```bash
npm run build
npx wrangler pages deploy dist
```

Frame files are cached immutably via `public/_headers`.
