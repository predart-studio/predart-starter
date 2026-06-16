'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  multiFlipState,
  multiFlipGathered,
  DEFAULT_MULTI_FLIP,
  type MultiFlipConfig,
} from '@/lib/motion/multi-flip'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/** Neutral monochrome placeholder card used when no `items` are supplied. */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">` +
      `<rect width="300" height="400" rx="14" fill="%230a0a0a"/>` +
      `<rect x="0.5" y="0.5" width="299" height="399" rx="13.5" fill="none" stroke="%23262626"/>` +
      `<circle cx="150" cy="170" r="44" fill="none" stroke="%23404040" stroke-width="2"/>` +
      `<rect x="70" y="250" width="160" height="10" rx="5" fill="%23262626"/>` +
      `<rect x="95" y="276" width="110" height="10" rx="5" fill="%231a1a1a"/>` +
    `</svg>`,
  )

const DEFAULT_ITEMS: MultiFlipItem[] = Array.from({ length: 4 }, (_, i) => ({
  src: PLACEHOLDER,
  alt: `Card ${i + 1}`,
}))

export interface MultiFlipItem {
  src: string
  alt?: string
}

interface MultiFlipProps {
  /** Cards to stack-and-scatter. Defaults to 4 monochrome placeholders. */
  items?: MultiFlipItem[]
  /** Scatter radius in px at full progress. */
  spread?: number
  /** Max card tilt in degrees when scattered. */
  maxRotation?: number
  /**
   * Pin length as a multiple of the viewport height — how far you scroll to go
   * from gathered to fully scattered. Matches the reference's ~3x spacer.
   */
  pinMultiplier?: number
  className?: string
}

/**
 * MultiFlip — GSAP ScrollTrigger wrapper (page-scoped, pinned + scrubbed).
 *
 * A stacked deck of cards that scatters apart as you scroll through a pinned
 * section: the section sticks to the viewport while a scrubbed timeline spreads
 * each card from a tight gathered fan to a distinct outward position + tilt
 * (scale/opacity stay put). Per-card targets come from multiFlipState() so it
 * works for any number of cards. Renders the gathered stack server-side (no
 * layout shift, no-JS safe); the scatter layers on the client. Respects
 * prefers-reduced-motion (no pin, no tween — the gathered stack stays put).
 *
 * Full-width pinned SECTION, not an inline card — give it room above and below.
 * Do NOT also bind Framer Motion to the cards' transforms.
 *
 * Clean-room reference: annnimate "MultiFlip" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger pin/scrub (see gsap-scrolltrigger).
 */
export function MultiFlip({
  items = DEFAULT_ITEMS,
  spread = DEFAULT_MULTI_FLIP.spread,
  maxRotation = DEFAULT_MULTI_FLIP.maxRotation,
  pinMultiplier = 3,
  className,
}: MultiFlipProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const prefersReduced = usePrefersReducedMotion()

  const count = items.length
  const config: MultiFlipConfig = { spread, maxRotation }

  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * pinMultiplier}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress
          cards.forEach((card, i) => {
            const s = multiFlipState(p, i, count, config)
            gsap.set(card, { x: s.x, y: s.y, rotation: s.rotation, scale: s.scale })
          })
        },
      })
    }, section)

    return () => ctx.revert()
  }, [count, spread, maxRotation, pinMultiplier, prefersReduced])

  return (
    <div
      ref={sectionRef}
      className={cn(
        'relative flex h-screen w-full items-center justify-center overflow-hidden',
        className,
      )}
    >
      <div className="relative h-[400px] w-[300px]">
        {items.map((item, i) => {
          // Final SSR/reduced-motion state = the gathered stack.
          const g = multiFlipGathered(i, config)
          return (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute inset-0"
              style={{
                transform: `translate(${g.x}px, ${g.y}px) rotate(${g.rotation}deg)`,
                zIndex: count - i,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt ?? ''}
                className="h-full w-full rounded-2xl object-cover shadow-xl"
                draggable={false}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
