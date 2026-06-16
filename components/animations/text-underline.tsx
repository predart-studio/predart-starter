'use client'

import { useRef, useEffect, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildUnderlineVars } from '@/lib/motion/text-underline'
import { cn } from '@/lib/utils'

interface TextUnderlineProps {
  children: ReactNode
  /**
   * - `hover` : draw the underline in on hover/focus, retract on leave (default).
   *   Pure CSS — no GSAP, no listeners, works before hydration, free
   *   `:focus-within` (keyboard) support.
   * - `scroll`: draw it in once when the text scrolls into view (stays). Uses
   *   GSAP + ScrollTrigger.
   */
  trigger?: 'hover' | 'scroll'
  duration?: number
  ease?: string
  className?: string
  /** className applied to the underline bar (e.g. its color via bg-*). */
  underlineClassName?: string
  as?: ElementType
}

/**
 * TextUnderline — underline that slides through on hover (element-scoped).
 *
 * A 1px bar spanning the text width. The signature move is the origin swap: at
 * rest the bar is collapsed with transform-origin RIGHT; on hover it scales to
 * full from the LEFT; on leave it collapses back toward the right — so the line
 * reads as one continuous rightward wipe "through" the text.
 *
 * Default (`trigger='hover'`) is **pure CSS** — no GSAP, no event listeners, no
 * hydration needed, and it reacts to `:focus-within` for keyboard users.
 * `trigger='scroll'` opts into a GSAP + ScrollTrigger draw-in-once on enter.
 *
 * The bar renders collapsed (scaleX 0) server-side via Tailwind classes, so
 * there is no layout shift and no underline flash before hydration. Respects
 * prefers-reduced-motion: the CSS path drops its transition; the scroll path
 * attaches no tween and the bar stays in its final static state.
 *
 * Clean-room reference, confirmed against the official annnimate source: their
 * hover variant is CSS-only (::after + transition + origin swap). This mirrors
 * it with Tailwind. Do NOT also bind Framer Motion to this bar's transform.
 */
export function TextUnderline({
  children,
  trigger = 'hover',
  duration,
  ease,
  className,
  underlineClassName,
  as: Tag = 'span',
}: TextUnderlineProps) {
  const ref = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const isScroll = trigger === 'scroll'

  // Scroll variant only: draw the bar in once when it enters the viewport.
  // The hover variant is pure CSS (see the bar's classNames) — no JS here.
  useEffect(() => {
    if (!isScroll || prefersReduced) return
    const el = ref.current
    const bar = barRef.current
    if (!el || !bar) return

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const v = buildUnderlineVars({ phase: 'reveal', duration, ease })
      gsap.set(bar, { transformOrigin: v.transformOrigin })
      gsap.to(bar, {
        scaleX: v.scaleX,
        duration: v.duration,
        ease: v.ease,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [isScroll, duration, ease, prefersReduced])

  return (
    <Tag ref={ref} className={cn('group relative inline-block cursor-pointer', className)}>
      {children}
      <span
        ref={barRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current',
          // Hover variant: pure-CSS slide-through. The origin swaps right -> left
          // on hover/focus so the line wipes in from the left and exits right.
          !isScroll && [
            'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
            'group-hover:origin-left group-hover:scale-x-100',
            'group-focus-within:origin-left group-focus-within:scale-x-100',
          ],
          underlineClassName,
        )}
      />
    </Tag>
  )
}
