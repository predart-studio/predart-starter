# Component Libraries Reference

## Section 1 — Always Available (in Template)

| Library | Purpose | Features |
|---------|---------|----------|
| shadcn/ui v4 | Base components | Accessible, unstyled, built on Radix UI |
| Framer Motion | Component animations | Enter/exit, layout transitions, gestures |
| GSAP + ScrollTrigger | Scroll-driven animations | Timelines, pinning, choreography |
| Lenis | Smooth scroll | Hijacks scroll behavior for fluidity |
| Phosphor Icons | Icon system | 6 weights (thin, light, regular, bold, fill, duotone) |
| Embla Carousel | Carousel component | Via shadcn, light and performant |
| React Hook Form + Zod | Form handling | Type-safe validation and submission |
| next-themes | Dark mode | System preference detection, persistent |

---

## Section 2 — Animated Component Libraries (Per Project)

| Library | Install | Best For |
|---------|---------|----------|
| **Aceternity UI** | Copy-paste from [ui.aceternity.com](https://ui.aceternity.com) | Dramatic heroes, spotlight effects, SaaS showcase, Aurora backgrounds |
| **Magic UI** | Copy-paste from [magicui.design](https://magicui.design) | Subtle backgrounds, meteors, dot grids, beams, number tickers, stats |
| **Motion Primitives** | `npx motion-primitives@latest add [name]` | Text reveals, animated lists, disclosure, transition wrappers |
| **Animate UI** | `pnpm dlx shadcn@latest add @animate-ui/[name]` | Micro-interactions, sliding numbers, SaaS dashboards |
| **Smooth UI** | `pnpm dlx shadcn@latest add @smoothui/[name]` | Subtle polish, fluid transitions |
| **Cult UI** | Copy-paste from [cult-ui.com](https://cult-ui.com) | Unique design-forward components |
| **React Bits** | Copy-paste from [reactbits.dev](https://reactbits.dev) | 110+ text/background animations |

---

## Section 3 — Utility Libraries (Per Project)

| Library | Install | Best For |
|---------|---------|----------|
| **yet-another-react-lightbox** | `pnpm add yet-another-react-lightbox` | Photo galleries with keyboard nav, swipe, thumbnails |
| **react-photo-album** | `pnpm add react-photo-album` | Responsive photo grids with layout algorithms |
| **Swiper** | `pnpm add swiper react-swiper` | Touch carousels, 3D cube, stacked effects |
| **React Leaflet** | `pnpm add react-leaflet leaflet` | Interactive maps, markers, geolocation |
| **react-map-gl + Mapbox** | `pnpm add react-map-gl mapbox-gl` | High-performance maps, layers, geocoding |
| **React Player** | `pnpm add react-player` | Unified video player (YouTube, Vimeo, MP4, HLS) |
| **Mux Player** | `pnpm add @mux/mux-player-react` | Streaming video, live streams, analytics |

---

## Section 4 — Component → Library Quick Reference

Use this table to pick the right tool for common UI patterns:

| Component | Animated? | Library Choice |
|-----------|-----------|-----------------|
| Hero | Dramatic | Aceternity UI |
| Hero | Corporate | Tailwind + Framer Motion |
| Backgrounds | Subtle/animated | Magic UI |
| Text reveal | Animation | Motion Primitives |
| Counters/stats | Number tickers | Magic UI |
| Scroll animations | Page-scoped | GSAP + ScrollTrigger |
| Micro-interactions | Hover/tap | Animate UI or Framer Motion |
| Card hover | Dramatic | Aceternity UI |
| Carousels | Generic | Embla (via shadcn) |
| Touch carousels | Mobile-first | Swiper |
| Galleries | Lightbox | yet-another-react-lightbox |
| Photo grids | Responsive | react-photo-album |
| Maps | Interactive | React Leaflet or react-map-gl |
| Forms | Validation | shadcn + React Hook Form + Zod |
| Video | Unified player | React Player or Mux Player |

---

## Section 5 — Client Type Playbooks

### Real Estate
- **Stack**: Tailwind Plus + Embla + yet-another-react-lightbox + React Leaflet + Magic UI + Motion Primitives
- **Why**: Property galleries (lightbox), location maps, property counters (stats), subtle animations, carousel for property details

### Architecture / Construction
- **Stack**: GSAP scroll-driven + Tailwind Plus + Embla + yet-another-react-lightbox + react-photo-album + Smooth UI
- **Why**: Scroll-pinned project showcases, image galleries, portfolio timelines, subtle polish on hover

### Auto Dealership
- **Stack**: Tailwind Plus + Swiper + yet-another-react-lightbox + React Leaflet + Magic UI
- **Why**: 3D car carousels (Swiper), dealer location maps, inventory galleries, background animations for promo sections

### Production / Creative
- **Stack**: Aceternity UI + GSAP scroll + React Player + react-photo-album + Motion Primitives
- **Why**: Dramatic hero, showreel/case study videos, portfolio photo grids with scroll choreography, animated text reveals

### SaaS / Tech
- **Stack**: Aceternity UI + Magic UI + Motion Primitives + Animate UI + Smooth UI
- **Why**: Spotlight heroes, stat counters, animated feature lists, micro-interactions on dashboard preview, fluent transitions

---

## Section 6 — Tailwind v4 Animation Note

Most animated component libraries (Aceternity, Magic UI, Motion Primitives) ship legacy `tailwind.config.ts` with `extend.animation` and `extend.keyframes`. Since we're on Tailwind v4 with `app/globals.css` @theme:

1. **Locate** the library's keyframe definitions in their source or docs
2. **Convert** to CSS @keyframes in `app/globals.css`:
   ```css
   @keyframes fadeIn {
     from { opacity: 0; }
     to { opacity: 1; }
   }
   ```
3. **Add** to @theme entry:
   ```css
   @theme {
     --animation-fadeIn: fadeIn 0.3s ease-in-out;
   }
   ```
4. **Use** in Tailwind classes: `animate-fadeIn`

See `app/globals.css` for examples.

---

## Section 7 — Animation Rules

1. **Framer Motion** — for component-scoped animations
   - Enter/exit (AnimatePresence)
   - Layout transitions (layoutId)
   - Hover/tap gestures
   - Drag interactions
   - Variants for clean code

2. **GSAP + ScrollTrigger** — for page-scoped animations
   - Scroll timelines (trigger: window scroll)
   - Pinning elements during scroll
   - Sequenced choreography
   - Performance on large pages (requestAnimationFrame)

3. **Never** animate the same property on the same element from both libraries on the same breakpoint

4. **Dynamic imports** for GSAP-heavy components to reduce bundle:
   ```jsx
   const ScrollHero = dynamic(
     () => import('@/components/ScrollHero'),
     { ssr: false }
   )
   ```

5. **Always** add `prefers-reduced-motion` checks:
   ```jsx
   const prefersReducedMotion = window.matchMedia(
     '(prefers-reduced-motion: reduce)'
   ).matches
   ```

6. **Test** animations on low-end devices (DevTools throttle)

---

## Quick Start

1. Base components: Use shadcn CLI or copy from `components/ui/`
2. Per-project libraries: Review your **client type playbook** above
3. Install using the provided commands
4. Check `docs/component-libraries.md` if unsure about animation scope (Framer vs GSAP)
5. Update this file if adding a new library
