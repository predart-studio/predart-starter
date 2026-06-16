'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildHoverablePath,
  HOVERABLE_REST_PATH,
  DEFAULT_HOVERABLE_DURATION,
  DEFAULT_HOVERABLE_EASE,
} from '@/lib/motion/hoverable-list'
import { cn } from '@/lib/utils'

export interface HoverableListItem {
  label: string
  href?: string
}

interface HoverableListProps {
  items: HoverableListItem[]
  /** Fill colour of the rising indicator. Maps to the SVG `color` (currentColor). */
  fillColor?: string
  /** Rise/drain duration in seconds. */
  duration?: number
  className?: string
}

/**
 * HoverableList — GSAP liquid-fill hover list (container-scoped).
 *
 * A vertical index of rows. Hovering a row sweeps a coloured fill up from the
 * bottom behind its text via a quadratic-edged SVG path that morphs its `d`
 * (gsap.to on a per-row proxy → buildHoverablePath); leaving drains it back
 * down. Siblings are untouched (no dim, no shift) — only the hovered row reacts,
 * matching the reference. On-brand as a confident "work / collections" index
 * that reads as plain typography until the colour washes in on hover.
 *
 * Renders its final resting state server-side (rows are plain links/text, each
 * SVG path ships collapsed = invisible), so it is no-JS safe with no layout
 * shift. Respects prefers-reduced-motion: NO listeners are attached and the
 * fill stays collapsed (rows remain plain text). Do NOT also bind Framer Motion
 * to these paths' `attr` — the two libraries will fight over the same `d`.
 *
 * Clean-room reference: annnimate "HoverableList" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function HoverableList({
  items,
  fillColor = '#FF4200',
  duration = DEFAULT_HOVERABLE_DURATION,
  className,
}: HoverableListProps) {
  const containerRef = useRef<HTMLUListElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const rows = Array.from(
        container.querySelectorAll<HTMLLIElement>('[data-hoverable-item]'),
      )

      const cleanups = rows.map((row) => {
        const path = row.querySelector<SVGPathElement>('[data-hoverable-path]')
        if (!path) return () => {}

        // Proxy object whose `progress` GSAP tweens; onUpdate writes the morph.
        const state = { progress: 0 }
        const render = () =>
          path.setAttribute('d', buildHoverablePath({ progress: state.progress }))

        const tweenTo = (progress: number) =>
          gsap.to(state, {
            progress,
            duration,
            ease: DEFAULT_HOVERABLE_EASE,
            overwrite: true,
            onUpdate: render,
          })

        const onEnter = () => tweenTo(1)
        const onLeave = () => tweenTo(0)

        row.addEventListener('pointerenter', onEnter)
        row.addEventListener('pointerleave', onLeave)

        return () => {
          row.removeEventListener('pointerenter', onEnter)
          row.removeEventListener('pointerleave', onLeave)
        }
      })

      return () => cleanups.forEach((off) => off())
    }, container)

    return () => ctx.revert()
  }, [items, duration, prefersReduced])

  return (
    <ul ref={containerRef} className={cn('w-full', className)}>
      {items.map((item) => {
        const content = (
          <>
            <span className="absolute inset-x-0 top-0 h-px bg-foreground/10" aria-hidden />
            <span className="relative z-10 text-2xl font-medium md:text-4xl">
              {item.label}
            </span>
            <svg
              data-hoverable-path-svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ color: fillColor }}
            >
              <path data-hoverable-path d={HOVERABLE_REST_PATH} fill="currentColor" />
            </svg>
          </>
        )

        const rowClass =
          'relative flex items-center px-6 py-5 md:py-7'

        return (
          <li
            key={item.label}
            data-hoverable-item
            className="relative border-b border-foreground/10 last:border-b-0"
          >
            {item.href ? (
              <Link href={item.href} className={rowClass}>
                {content}
              </Link>
            ) : (
              <span className={cn(rowClass, 'cursor-default')}>{content}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
