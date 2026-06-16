'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  directionSign,
  loopDuration,
  DEFAULT_MARQUEE,
  type MarqueeDirection,
} from '@/lib/motion/marquee'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: ReactNode
  /** Speed factor — higher scrolls faster. Default 2. */
  speed?: number
  /** Travel direction: 'left' or 'right'. Default 'left'. */
  direction?: MarqueeDirection
  /** Pause the loop while the pointer hovers the marquee. Default false. */
  pauseOnHover?: boolean
  className?: string
}

/**
 * Marquee — GSAP infinite horizontal marquee (container-scoped).
 *
 * An endless ticker: the children are rendered TWICE back-to-back, and the
 * track group is tweened by exactly -50% (one full content set) on an `ease:
 * 'none'`, `repeat: -1` loop, so the second copy slides in seamlessly as the
 * first exits — no gap, no snap. Direction flips the sign; speed drives the
 * loop duration via loopDuration() so the on-screen pixel velocity stays
 * constant regardless of track width. Optional pause-on-hover. On-brand as a
 * monochrome trust/category ticker ("EYEWEAR · APPAREL · RUNNING · …").
 *
 * Reduced motion: renders the children ONCE, static — no second copy, no tween,
 * no listeners. The JSX already reads as plain inline content with no JS.
 *
 * Do NOT also bind Framer Motion to the track's transform (x / xPercent) — the
 * two libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "Marquee" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function Marquee({
  children,
  speed = DEFAULT_MARQUEE.speed,
  direction = DEFAULT_MARQUEE.direction,
  pauseOnHover = DEFAULT_MARQUEE.pauseOnHover,
  className,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const ctx = gsap.context(() => {
      // Track holds two identical content sets; its full width is the doubled
      // content. One content set is half of that — derive the loop duration
      // from that single-set width so pixel velocity is width-independent.
      const singleSetWidth = track.scrollWidth / 2
      const duration = loopDuration(singleSetWidth, speed)
      if (duration <= 0) return

      const tween = gsap.to(track, {
        xPercent: directionSign(direction) * -50,
        duration,
        ease: 'none',
        repeat: -1,
      })

      if (!pauseOnHover) return

      const onEnter = () => tween.pause()
      const onLeave = () => tween.resume()
      container.addEventListener('mouseenter', onEnter)
      container.addEventListener('mouseleave', onLeave)

      return () => {
        container.removeEventListener('mouseenter', onEnter)
        container.removeEventListener('mouseleave', onLeave)
      }
    }, container)

    return () => ctx.revert()
  }, [speed, direction, pauseOnHover, prefersReduced])

  // Reduced motion: render a single static copy, no animation, no listeners.
  if (prefersReduced) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <div className="flex w-max flex-nowrap">{children}</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('overflow-hidden', className)}>
      <div ref={trackRef} className="flex w-max flex-nowrap">
        {/* Two identical sets back-to-back: the -50% tween wraps seamlessly. */}
        <div className="flex flex-nowrap" aria-hidden={false}>
          {children}
        </div>
        <div className="flex flex-nowrap" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
