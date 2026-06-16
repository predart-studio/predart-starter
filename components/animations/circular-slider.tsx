'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  angularStep,
  placeItem,
  advanceIndex,
  DEFAULT_RADIUS,
  DEFAULT_DURATION,
  DEFAULT_EASE,
} from '@/lib/motion/circular-slider'
import { cn } from '@/lib/utils'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

export interface CircularSliderItem {
  /** Image URL (or any src usable in an <img>). */
  src: string
  /** Alt / label text. */
  label: string
}

interface CircularSliderProps {
  /** Cards to lay out around the ring. */
  items?: CircularSliderItem[]
  /** Circle radius in px (center -> card). Big values push cards off-screen so
   *  only the top arc is visible, like the reference. */
  radius?: number
  /** Tween duration for a single advance (s). */
  duration?: number
  /** GSAP ease for the ring rotation. */
  ease?: string
  className?: string
}

const PLACEHOLDERS: CircularSliderItem[] = Array.from({ length: 8 }, (_, i) => ({
  src: `https://picsum.photos/seed/circular-${i}/400/520`,
  label: `Slide ${i + 1}`,
}))

/**
 * CircularSlider — GSAP ring carousel (section-scoped).
 *
 * Lays cards out evenly around a circle (polar -> cartesian via placeItem) and
 * rotates the whole ring by one angular step per Next/Prev so the chosen card
 * swings up to the front (top / 12 o'clock). Each card is rotated to stay tangent
 * to the ring, so the arc reads as a wheel of cards. The ring tween overshoots
 * slightly and settles (back.out) to match the reference's springy feel.
 *
 * Renders its resting arc server-side (no layout shift, no-JS safe); only the
 * rotation layers on the client. Respects prefers-reduced-motion: under reduced
 * motion the ring snaps to each new angle instantly (no tween, no overshoot).
 * Do NOT also bind Framer Motion to the ring's rotation.
 *
 * Clean-room reference: annnimate "CircularSlider" — behavior only.
 * Implementation is standard core GSAP (see gsap-core / gsap-react skills).
 */
export function CircularSlider({
  items = PLACEHOLDERS,
  radius = DEFAULT_RADIUS,
  duration = DEFAULT_DURATION,
  ease = DEFAULT_EASE,
  className,
}: CircularSliderProps) {
  const count = items.length
  const step = angularStep(count)

  const ringRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  // Continuous turn counter (not wrapped) so successive clicks keep rotating in
  // the clicked direction; active = wrapped index for highlighting.
  const turnRef = useRef(0)
  const [active, setActive] = useState(0)

  const advance = useCallback(
    (dir: number) => {
      turnRef.current += dir
      setActive((a) => advanceIndex(a, dir, count))
      const ring = ringRef.current
      if (!ring) return
      const rotation = -turnRef.current * step
      if (prefersReduced) {
        gsap.set(ring, { rotation })
      } else {
        gsap.to(ring, { rotation, duration, ease, overwrite: true })
      }
    },
    [count, step, duration, ease, prefersReduced],
  )

  // Keep the ring at the right resting angle on mount / when reduced-motion or
  // layout deps change (covers SSR -> client settle).
  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return
    const ctx = gsap.context(() => {
      gsap.set(ring, { rotation: -turnRef.current * step })
    }, ring)
    return () => ctx.revert()
  }, [step, prefersReduced])

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* The visible window: a tall band showing the top arc of the wheel. */}
      <div className="relative mx-auto aspect-square w-full max-w-[1600px]">
        {/* Ring is centered; it is much larger than the window so only the top
            arc of cards shows. transform-origin is the ring center. */}
        <div
          ref={ringRef}
          className="absolute left-1/2 top-[120%] h-[260%] w-[260%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        >
          {items.map((item, i) => {
            const p = placeItem(i, count, radius)
            const isActive = i === active
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-44 w-32 sm:h-56 sm:w-40"
                style={{
                  transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) rotate(${p.angle}deg)`,
                }}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  className={cn(
                    'h-full w-full select-none rounded-xl object-cover shadow-lg transition-opacity duration-500',
                    isActive ? 'opacity-100 ring-2 ring-foreground' : 'opacity-50',
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => advance(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/20 bg-background/80 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
        >
          <CaretLeft weight="bold" className="h-5 w-5" />
        </button>
        <span className="min-w-16 text-center text-sm tabular-nums text-foreground/70">
          {active + 1} / {count}
        </span>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => advance(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/20 bg-background/80 backdrop-blur transition-colors hover:bg-foreground hover:text-background"
        >
          <CaretRight weight="bold" className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
