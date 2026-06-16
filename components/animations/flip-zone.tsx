'use client'

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  zoneForProgress,
  buildFlipZoneVars,
  DEFAULT_FLIP_ZONE_CONFIG,
  type FlipZoneIndex,
} from '@/lib/motion/flip-zone'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip, ScrollTrigger)
}

interface FlipZoneProps {
  /** The shared media that morphs between zones. Defaults to a placeholder card. */
  media?: ReactNode
  /** Headline shown beside zone 0 (the larger, tilted resting spot). */
  firstLabel?: ReactNode
  /** Headline shown beside zone 1 (the smaller, upright destination). */
  secondLabel?: ReactNode
  /** Scroll progress (0..1) at which the card leaves zone 0 and begins flipping. */
  flipStart?: number
  /** Scroll progress (0..1) at which the card has settled into zone 1. */
  flipEnd?: number
  className?: string
}

/**
 * FlipZone — GSAP Flip + ScrollTrigger wrapper (section-scoped, scrubbed).
 *
 * A single shared media card lives in zone 1 (larger, tilted) and FLIPs into
 * zone 2 (smaller, upright) as the section scrolls past — the layout morph is
 * scrub-linked, so the card tracks scroll position 1:1 and re-flips on scroll-up.
 * Implemented the canonical way: capture Flip.getState() before a scroll-driven
 * React state change reparents the card into the other zone, then Flip.from() in
 * a layout effect tweens the FLIP delta. Renders zone 0 server-side (no layout
 * shift, no-JS safe); the flip layers on the client. Respects
 * prefers-reduced-motion — the card simply renders in its current zone with no
 * tween, no ScrollTrigger.
 *
 * Do NOT also bind Framer Motion to the media card's transform — Flip owns it.
 *
 * Clean-room reference: annnimate "FlipZone" — behavior only.
 * Implementation is standard GSAP Flip + ScrollTrigger (see gsap-plugins skill).
 */
export function FlipZone({
  media,
  firstLabel = 'Every mile counts.',
  secondLabel = 'Built for speed.',
  flipStart = DEFAULT_FLIP_ZONE_CONFIG.flipStart,
  flipEnd = DEFAULT_FLIP_ZONE_CONFIG.flipEnd,
  className,
}: FlipZoneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const zoneRefs = useRef<(HTMLDivElement | null)[]>([])
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const prefersReduced = usePrefersReducedMotion()

  const [zone, setZone] = useState<FlipZoneIndex>(0)

  // Drive `zone` from scroll. Scrubbed ScrollTrigger maps scroll progress to the
  // target zone via the pure zoneForProgress() logic.
  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const next = zoneForProgress(self.progress, { flipStart, flipEnd })
          setZone((prev) => (prev === next ? prev : next))
        },
      })
    }, root)

    return () => ctx.revert()
  }, [flipStart, flipEnd, prefersReduced])

  // Capture the Flip state synchronously BEFORE the DOM commits the reparent.
  if (typeof window !== 'undefined' && !prefersReduced && mediaRef.current) {
    flipStateRef.current = Flip.getState(mediaRef.current)
  }

  // After React moves the card into the new zone, play the FLIP from the captured
  // state. useLayoutEffect runs after DOM mutation, before paint — no flash.
  useLayoutEffect(() => {
    if (prefersReduced) return
    const state = flipStateRef.current
    if (!state) return

    const ctx = gsap.context(() => {
      Flip.from(state, buildFlipZoneVars())
    })
    return () => ctx.revert()
  }, [zone, prefersReduced])

  return (
    <div
      ref={rootRef}
      className={cn('relative w-full', className)}
      // Tall track so the scrubbed flip has room to play out as you scroll.
      style={{ height: '220vh' }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2">
          {/* Zone 0 — larger resting spot, paired with the first label */}
          <div className="flex flex-col items-start gap-6">
            <p className="text-2xl font-semibold tracking-tight md:text-4xl">{firstLabel}</p>
            <div
              ref={(el) => {
                zoneRefs.current[0] = el
              }}
              className="relative aspect-[3/4] w-full max-w-sm rotate-[8deg]"
            >
              {zone === 0 && (
                <div ref={mediaRef} className="absolute inset-0">
                  {media ?? <PlaceholderCard />}
                </div>
              )}
            </div>
          </div>

          {/* Zone 1 — smaller upright destination, paired with the second label */}
          <div className="flex flex-col items-end gap-6">
            <p className="text-2xl font-semibold tracking-tight md:text-4xl">{secondLabel}</p>
            <div
              ref={(el) => {
                zoneRefs.current[1] = el
              }}
              className="relative aspect-[3/4] w-3/4 max-w-[16rem]"
            >
              {zone === 1 && (
                <div ref={mediaRef} className="absolute inset-0">
                  {media ?? <PlaceholderCard />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Default placeholder so the lab card has something to flip without an asset. */
function PlaceholderCard() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-foreground text-background">
      <span className="text-sm font-medium uppercase tracking-widest">Media</span>
    </div>
  )
}
