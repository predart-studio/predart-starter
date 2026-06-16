'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  parallaxOffset,
  directionSign,
  stepDurationFor,
  wrapIndex,
  DEFAULT_INFINITE_PARALLAX_SLIDER,
  type SliderDirection,
} from '@/lib/motion/infinite-parallax-slider'
import { cn } from '@/lib/utils'

export interface InfiniteParallaxSlide {
  /** Image source (URL or data-URI). */
  src: string
  /** Accessible alt / caption text. */
  alt: string
}

interface InfiniteParallaxSliderProps {
  /** Slides to loop. Falls back to built-in placeholder data-URIs. */
  slides?: InfiniteParallaxSlide[]
  /** Inner-image drift as a fraction of slide offset-from-center. Default 1/6. */
  parallaxFactor?: number
  /** Image upscale that hides the parallax offset behind the frame. Default 1.3. */
  imgScale?: number
  /** Advance direction. Default 'left'. */
  direction?: SliderDirection
  /** Speed factor for the step tween — higher is snappier. Default 2. */
  speed?: number
  className?: string
}

/** Six monochrome SVG placeholder tiles (data-URIs) so the slider renders standalone. */
const PLACEHOLDER_SLIDES: InfiniteParallaxSlide[] = [
  ['Apparel', '0a0a0a'],
  ['Running Shoes', '141414'],
  ['Cycling', '1e1e1e'],
  ['Snowboarding', '101010'],
  ['Tennis', '181818'],
  ['Running Glasses', '0d0d0d'],
].map(([label, hex]) => ({
  alt: label,
  src:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#${hex}"/><text x="50%" y="50%" fill="#555" font-family="sans-serif" font-size="34" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
    ),
}))

/**
 * InfiniteParallaxSlider — GSAP infinite carousel with inner-image parallax
 * (component-scoped, interaction-driven).
 *
 * A horizontally looping image slider: prev/next advance the track by one slide
 * step, and the order wraps endlessly (a slide leaving one edge reappears on the
 * other). On every frame each inner <img> is offset OPPOSITE to its slide's
 * distance-from-center at `parallaxFactor` of it (centered slide → flush image),
 * giving a depth drift; the image is scaled (`imgScale`) so the offset stays
 * hidden behind the clipped frame. Not scroll-driven and not auto-playing — the
 * parallax keys off live slide position, recomputed continuously through each
 * step tween, so no ScrollTrigger.
 *
 * Reduced motion: renders the slides static with no upscale and no parallax
 * offset (imgScale 1, offset 0) — buttons remain for manual paging, but no tween
 * and no rAF ticker are attached.
 *
 * Do NOT also bind Framer Motion to the track's or images' transform — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "InfiniteParallaxSlider" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function InfiniteParallaxSlider({
  slides = PLACEHOLDER_SLIDES,
  parallaxFactor = DEFAULT_INFINITE_PARALLAX_SLIDER.parallaxFactor,
  imgScale = DEFAULT_INFINITE_PARALLAX_SLIDER.imgScale,
  direction = DEFAULT_INFINITE_PARALLAX_SLIDER.direction,
  speed = 2,
  className,
}: InfiniteParallaxSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Array<HTMLDivElement | null>>([])
  const imgRefs = useRef<Array<HTMLImageElement | null>>([])
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)

  // Imperative paging is wired through a ref so the buttons stay stable.
  const goRef = useRef<(dir: number) => void>(() => {})

  useEffect(() => {
    if (prefersReduced) return
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const count = slides.length
    if (count === 0) return

    const ctx = gsap.context(() => {
      // Upscale every image so the parallax x-offset hides behind the clipped
      // frame (matches the demo's 1.3 scale headroom).
      gsap.set(imgRefs.current.filter(Boolean), { scale: imgScale })

      // Each image gets a quickTo so per-frame parallax updates are cheap.
      const imgSetters = imgRefs.current.map((img) =>
        img ? gsap.quickTo(img, 'x', { duration: 0.3, ease: 'power2.out' }) : null,
      )

      // Recompute every image's parallax from its LIVE center-distance.
      const applyParallax = () => {
        const vp = viewport.getBoundingClientRect()
        const center = vp.left + vp.width / 2
        slideRefs.current.forEach((slide, i) => {
          const setter = imgSetters[i]
          if (!slide || !setter) return
          const r = slide.getBoundingClientRect()
          const dist = r.left + r.width / 2 - center
          setter(parallaxOffset(dist, parallaxFactor))
        })
      }

      gsap.ticker.add(applyParallax)

      let index = 0
      let animating = false

      const go = (dir: number) => {
        if (animating || count === 0) return
        animating = true
        const slideEl = slideRefs.current[0]
        const step = slideEl ? slideEl.offsetWidth + 16 : viewport.offsetWidth / 3
        const sign = directionSign(direction)
        const duration = stepDurationFor(step, speed)

        gsap.to(track, {
          x: `+=${sign * step * -dir}`,
          duration,
          ease: DEFAULT_INFINITE_PARALLAX_SLIDER.ease,
          onComplete: () => {
            // Wrap: snap the track back and rotate the active index so the loop
            // is endless without an ever-growing offset.
            gsap.set(track, { x: 0 })
            index = wrapIndex(index + dir, count)
            setActive(index)
            animating = false
          },
        })
      }
      goRef.current = go

      // initial parallax paint
      applyParallax()

      return () => {
        gsap.ticker.remove(applyParallax)
      }
    }, viewport)

    return () => ctx.revert()
  }, [slides, parallaxFactor, imgScale, direction, speed, prefersReduced])

  const handlePrev = () => goRef.current(-1)
  const handleNext = () => goRef.current(1)

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div ref={viewportRef} className="relative overflow-hidden">
        <div ref={trackRef} className="flex flex-nowrap gap-4 will-change-transform">
          {slides.map((slide, i) => (
            <div
              key={i}
              ref={(el) => {
                slideRefs.current[i] = el
              }}
              className="relative aspect-[3/4] w-[clamp(220px,32vw,389px)] shrink-0 overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[i] = el
                }}
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 text-sm font-medium text-white/90">
                {slide.alt}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"
          >
            ›
          </button>
        </div>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === active ? 'bg-foreground' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
