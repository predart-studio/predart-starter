'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import {
  toTokens,
  digitRollY,
  formatThousands,
  DEFAULT_COUNTER,
} from '@/lib/motion/counter'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

interface CounterProps {
  /** Target integer to roll up to, e.g. 10482. */
  value: number
  /** Roll duration in seconds. */
  duration?: number
  /** Thousands separator rendered statically between digit groups. */
  separator?: string
  className?: string
  as?: ElementType
}

/**
 * Counter — GSAP ScrollTrigger odometer counter (element-scoped).
 *
 * Renders the target number as per-digit vertical strips (0–9 stacked); on
 * scroll into view each strip rolls up to land on its final digit, slot-machine
 * style, with a slight per-column stagger. Separators are static spans. Renders
 * the final formatted number server-side (strips pre-positioned on the correct
 * digit — no layout shift, no-JS safe); the roll layers on the client. Respects
 * prefers-reduced-motion: renders the plain formatted number, no tween.
 *
 * Do NOT also bind Framer Motion to the property this drives (the strip yPercent).
 *
 * Clean-room reference: annnimate "Counter" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger).
 */
export function Counter({
  value,
  duration = DEFAULT_COUNTER.duration,
  separator = DEFAULT_COUNTER.separator,
  className,
  as: Tag = 'span',
}: CounterProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const tokens = toTokens(value, separator)

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const strips = Array.from(
      el.querySelectorAll<HTMLElement>('[data-counter-strip]'),
    )
    if (strips.length === 0) return

    const ctx = gsap.context(() => {
      // Start each strip at the top (showing 0), then roll to the final digit.
      gsap.set(strips, { yPercent: 0 })
      gsap.to(strips, {
        yPercent: (i, target) =>
          digitRollY(Number((target as HTMLElement).dataset.counterFinal)),
        duration,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [value, duration, separator, prefersReduced])

  // Reduced motion: plain, settled number.
  if (prefersReduced) {
    return (
      <Tag ref={ref} className={className}>
        {formatThousands(value, separator)}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      className={cn('inline-flex items-baseline tabular-nums leading-none', className)}
      aria-label={formatThousands(value, separator)}
    >
      {tokens.map((token, i) => {
        const digit = Number(token)
        if (Number.isNaN(digit)) {
          // Separator — static span.
          return (
            <span key={i} aria-hidden="true">
              {token}
            </span>
          )
        }
        return (
          <span
            key={i}
            aria-hidden="true"
            className="relative inline-block h-[1em] overflow-hidden align-baseline"
          >
            {/* Vertical strip of digits 0–9; SSR-positioned on the final digit. */}
            <span
              data-counter-strip
              data-counter-final={digit}
              className="flex flex-col will-change-transform"
            >
              {DIGITS.map((d) => (
                <span key={d} className="block h-[1em] leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </Tag>
  )
}
