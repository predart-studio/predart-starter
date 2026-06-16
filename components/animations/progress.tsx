'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  ringCircumference,
  progressDashoffset,
  progressPercent,
  DEFAULT_PROGRESS_RADIUS,
  DEFAULT_PROGRESS_STROKE,
  DEFAULT_PROGRESS_SIZE,
} from '@/lib/motion/progress'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollProgressProps {
  /** 'bar' = thin fixed top bar (scaleX). 'ring' = circular SVG ring with % label. */
  variant?: 'bar' | 'ring'
  /**
   * What the progress tracks. 'page' = whole document scroll. Pass a CSS selector
   * (or omit and pass `target`) to scrub against a specific section instead.
   */
  target?: string
  /** Ring radius in px (ring variant only). */
  radius?: number
  /** Ring/bar stroke thickness in px. */
  stroke?: number
  /** Show the integer percentage in the ring center (ring variant only). */
  showLabel?: boolean
  className?: string
}

/**
 * ScrollProgress — GSAP ScrollTrigger wrapper (page-scoped, scrubbed).
 *
 * A scroll-linked progress indicator. As the page (or a target section) scrolls,
 * it fills LINEARLY with scroll progress. The 'ring' variant is a circular SVG
 * whose progress stroke fills clockwise from the top (rotated -90°) by animating
 * stroke-dashoffset from circumference (empty) to 0 (full), with an optional
 * integer percentage label in the center. The 'bar' variant is a thin fixed bar
 * at the top of the viewport that scales on the x-axis from 0 to 1.
 *
 * Exported as `ScrollProgress` (NOT `Progress`) because components/ui/progress.tsx
 * already exports a shadcn `Progress` primitive — avoid the name collision.
 *
 * Renders its final/empty state in JSX (no layout shift, no-JS safe); the scrub
 * layers on the client. Respects prefers-reduced-motion: under reduced motion no
 * ScrollTrigger is created. A progress indicator is informational rather than
 * decorative, so under reduced motion it still tracks scroll position — but via a
 * cheap passive scroll listener with no smoothing/scrub, not a tween.
 *
 * Do NOT also bind Framer Motion to this element's transform / stroke-dashoffset.
 *
 * Clean-room reference: annnimate "Progress" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger scrub (see gsap-scrolltrigger).
 */
export function ScrollProgress({
  variant = 'ring',
  target,
  radius = DEFAULT_PROGRESS_RADIUS,
  stroke = DEFAULT_PROGRESS_STROKE,
  showLabel = true,
  className,
}: ScrollProgressProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [percent, setPercent] = useState(0)

  const circumference = ringCircumference(radius)

  // Apply the driven state for a given progress (0..1). Shared by scrub + reduced.
  const applyProgress = (p: number) => {
    if (variant === 'ring' && arcRef.current) {
      gsap.set(arcRef.current, { strokeDashoffset: progressDashoffset(p, radius) })
    }
    if (variant === 'bar' && barRef.current) {
      gsap.set(barRef.current, { scaleX: Math.max(0, Math.min(1, p)) })
    }
    if (showLabel) setPercent(progressPercent(p))
  }

  useEffect(() => {
    const scrollTrigger = {
      trigger: target ?? document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
    }

    // Reduced motion: track scroll position cheaply, no scrub/tween.
    if (prefersReduced) {
      const st = ScrollTrigger.create({
        ...scrollTrigger,
        onUpdate: (self) => applyProgress(self.progress),
      })
      applyProgress(st.progress)
      return () => st.kill()
    }

    const el = rootRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        ...scrollTrigger,
        scrub: 0.5,
        onUpdate: (self) => applyProgress(self.progress),
      })
    }, el)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, target, radius, stroke, showLabel, prefersReduced])

  if (variant === 'bar') {
    return (
      <div
        ref={rootRef}
        className={cn(
          'fixed inset-x-0 top-0 z-50 origin-left bg-foreground',
          className,
        )}
        style={{ height: stroke }}
        aria-hidden
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-foreground"
        />
      </div>
    )
  }

  const size = Math.max(DEFAULT_PROGRESS_SIZE, radius * 2 + stroke * 2)
  const center = size / 2

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="col-start-1 row-start-1"
      >
        {/* track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-foreground/15"
        />
        {/* progress arc — starts at top (-90deg), fills clockwise */}
        <circle
          ref={arcRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${center} ${center})`}
          className="text-foreground"
        />
      </svg>
      {showLabel && (
        <span
          ref={labelRef}
          className="col-start-1 row-start-1 text-lg font-semibold tabular-nums text-foreground"
        >
          {percent}%
        </span>
      )}
    </div>
  )
}
