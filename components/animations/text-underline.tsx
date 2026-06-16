'use client'

import { useRef, useEffect, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildUnderlineVars } from '@/lib/motion/text-underline'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextUnderlineProps {
  children: ReactNode
  /**
   * - `hover` : draw the underline in on mouseenter, retract on mouseleave (default).
   * - `scroll`: draw it in once when the text scrolls into view (stays).
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
 * TextUnderline — GSAP scaleX underline wipe (element-scoped).
 *
 * Wraps a word/link with a 1px bar spanning its width. On hover the bar draws in
 * left-to-right (transform-origin left, scaleX 0 -> 1); on leave it retracts off
 * to the right (origin right, scaleX -> 0), so the line reads as a continuous
 * rightward wipe. With trigger='scroll' it draws in once on enter and stays.
 *
 * The bar renders collapsed (scaleX 0) server-side via Tailwind classes, so there
 * is no layout shift and no underline flash before hydration. Respects
 * prefers-reduced-motion: under reduced motion NO listeners/tweens are attached
 * and the bar stays in its final static state (collapsed for hover, drawn for
 * scroll). Do NOT also bind Framer Motion to this bar's transform.
 *
 * Clean-room reference: annnimate "TextUnderline" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
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

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    const bar = barRef.current
    if (!el || !bar) return

    const ctx = gsap.context(() => {
      if (trigger === 'scroll') {
        const v = buildUnderlineVars({ phase: 'reveal', duration, ease })
        gsap.set(bar, { transformOrigin: v.transformOrigin })
        gsap.to(bar, {
          scaleX: v.scaleX,
          duration: v.duration,
          ease: v.ease,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
        return
      }

      // hover
      const onEnter = () => {
        const v = buildUnderlineVars({ phase: 'reveal', duration, ease })
        gsap.set(bar, { transformOrigin: v.transformOrigin })
        gsap.to(bar, { scaleX: v.scaleX, duration: v.duration, ease: v.ease, overwrite: true })
      }
      const onLeave = () => {
        const v = buildUnderlineVars({ phase: 'hide', duration, ease })
        gsap.set(bar, { transformOrigin: v.transformOrigin })
        gsap.to(bar, { scaleX: v.scaleX, duration: v.duration, ease: v.ease, overwrite: true })
      }

      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)

      return () => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      }
    }, el)

    return () => ctx.revert()
  }, [trigger, duration, ease, prefersReduced])

  return (
    <Tag ref={ref} className={cn('relative inline-block', className)}>
      {children}
      <span
        ref={barRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-current',
          underlineClassName,
        )}
      />
    </Tag>
  )
}
