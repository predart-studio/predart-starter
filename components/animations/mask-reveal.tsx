'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildMaskRevealVars,
  MASK_HIDDEN_CLIP,
  DEFAULT_MASK_REVEALED_RX,
  DEFAULT_MASK_REVEALED_RY,
  DEFAULT_MASK_ORIGIN,
} from '@/lib/motion/mask-reveal'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface MaskRevealProps {
  /** Custom content to reveal. If omitted, renders <img src> (or a placeholder). */
  children?: ReactNode
  /** Image source to reveal. Used when `children` is not provided. */
  src?: string
  /** Alt text for the image variant. */
  alt?: string
  /**
   * - `scroll`: reveal once when scrolled into view (default).
   * - `scrub` : reveal progress tied to scroll position (matches the live demo's
   *   pinned, scrubbed feel).
   */
  trigger?: 'scroll' | 'scrub'
  /** Reveal tween duration (ignored when `trigger === 'scrub'`). */
  duration?: number
  /** Ellipse X radius (%) at full reveal. */
  revealedRadiusX?: number
  /** Ellipse Y radius (%) at full reveal. */
  revealedRadiusY?: number
  /** Ellipse center, e.g. `50% -25%`. */
  origin?: string
  className?: string
}

const FALLBACK_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#141414'/><text x='50%' y='50%' fill='#eeeeee' font-family='monospace' font-size='30' letter-spacing='2' text-anchor='middle' dominant-baseline='middle'>MASK REVEAL</text></svg>",
  )

/**
 * MaskReveal — GSAP ScrollTrigger clip-path wrapper (element/page-scoped).
 *
 * Wipes content into view with a growing ellipse mask anchored above the
 * top-center, scrubbed (or fired once) against scroll — the cinematic "uncover"
 * behind the monochrome, confident feel of the portfolio. Renders its final,
 * fully-revealed state server-side (no clip-path in JSX, no layout shift,
 * no-JS safe); the mask is layered on the client and tweened open. Respects
 * prefers-reduced-motion: no tween, no ScrollTrigger, content stays revealed.
 * Do NOT also bind Framer Motion to this element's clip-path.
 *
 * Clean-room reference: annnimate "MaskReveal" — behavior only.
 * Implementation is standard GSAP ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function MaskReveal({
  children,
  src,
  alt = '',
  trigger = 'scroll',
  duration = 1.1,
  revealedRadiusX = DEFAULT_MASK_REVEALED_RX,
  revealedRadiusY = DEFAULT_MASK_REVEALED_RY,
  origin = DEFAULT_MASK_ORIGIN,
  className,
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildMaskRevealVars({ revealedRadiusX, revealedRadiusY, origin })

    const ctx = gsap.context(() => {
      if (trigger === 'scrub') {
        gsap.fromTo(el, from, {
          ...to,
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 60%', scrub: true },
        })
        return
      }
      gsap.fromTo(el, from, {
        clipPath: to.clipPath,
        duration,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [trigger, duration, revealedRadiusX, revealedRadiusY, origin, prefersReduced])

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      {children ?? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src ?? FALLBACK_SRC} alt={alt} className="block h-full w-full object-cover" />
      )}
    </div>
  )
}

export { MASK_HIDDEN_CLIP }
