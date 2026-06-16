'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildGridDelays,
  DEFAULT_GRID_STEP,
  DEFAULT_GRID_PATTERN,
  DEFAULT_GRID_SEED,
  DEFAULT_GRID_Y,
  DEFAULT_GRID_DURATION,
  DEFAULT_GRID_EASE,
  type GridStaggerPattern,
} from '@/lib/motion/animated-grid'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedGridProps {
  /** Number of grid columns. */
  cols?: number
  /** Number of grid rows. Defaults to fill all children given `cols`. */
  rows?: number
  /** Stagger order across the grid. */
  pattern?: GridStaggerPattern
  /** Seconds between consecutive stagger ranks. */
  step?: number
  /** Per-cell tween duration (s). */
  duration?: number
  /** y-offset (px) each cell travels up from before settling. */
  y?: number
  /** Seed for the random-seeded pattern. */
  seed?: number
  /** Custom cells. When omitted, renders `cols * rows` placeholder tiles. */
  children?: ReactNode[]
  className?: string
}

/**
 * AnimatedGrid — GSAP scroll-triggered grid entrance (container-scoped).
 *
 * Lays its children out in a CSS grid and slides each cell up from a y-offset to
 * its resting position as the grid scrolls into view, sequenced by a grid-aware
 * stagger (diagonal wavefront by default; also center, rows, random-seeded).
 * Pure y travel — opacity and scale stay at 1 — matching the reference. Renders
 * the final, settled grid server-side (no layout shift, no-JS safe); the slide
 * layers on the client. Respects prefers-reduced-motion: the grid renders
 * settled with no tween and no ScrollTrigger.
 *
 * Do NOT also bind Framer Motion to the cells' y/transform — the two libraries
 * will fight over the matrix.
 *
 * Clean-room reference: annnimate "AnimatedGrid" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger).
 */
export function AnimatedGrid({
  cols = 4,
  rows,
  pattern = DEFAULT_GRID_PATTERN,
  step = DEFAULT_GRID_STEP,
  duration = DEFAULT_GRID_DURATION,
  y = DEFAULT_GRID_Y,
  seed = DEFAULT_GRID_SEED,
  children,
  className,
}: AnimatedGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const cellCount = children?.length ?? cols * (rows ?? 3)
  const effectiveRows = rows ?? Math.max(1, Math.ceil(cellCount / cols))

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const cells = Array.from(
      el.querySelectorAll<HTMLElement>('[data-grid-cell]'),
    )
    if (cells.length === 0) return

    const delays = buildGridDelays({
      cols,
      rows: effectiveRows,
      step,
      pattern,
      seed,
    })

    const ctx = gsap.context(() => {
      gsap.set(cells, { y })
      gsap.to(cells, {
        y: 0,
        duration,
        ease: DEFAULT_GRID_EASE,
        // Per-cell timing via a stagger FUNCTION (deterministic order from
        // lib/motion). A function `delay` would yield NaN and stall the tween;
        // `stagger` is the correct per-target mechanism.
        stagger: (i: number) => delays[i] ?? 0,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [cols, effectiveRows, pattern, step, duration, y, seed, prefersReduced])

  const cells: ReactNode[] =
    children ??
    Array.from({ length: cellCount }, (_, i) => (
      <div
        key={i}
        className="aspect-square rounded-md bg-foreground/10"
        aria-hidden
      />
    ))

  return (
    <div
      ref={ref}
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, i) => (
        <div data-grid-cell key={i}>
          {cell}
        </div>
      ))}
    </div>
  )
}
