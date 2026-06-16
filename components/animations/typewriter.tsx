'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildTypewriterTimeline,
  DEFAULT_TYPEWRITER,
} from '@/lib/motion/typewriter'
import { cn } from '@/lib/utils'

interface TypewriterProps {
  /** Phrases to cycle through. The first renders statically for SSR / no-JS. */
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseAfterType?: number
  pauseAfterDelete?: number
  /** Show the blinking block cursor. */
  cursor?: boolean
  className?: string
  as?: ElementType
}

/**
 * Typewriter — GSAP timeline text cycler (element-scoped).
 *
 * Types each phrase character-by-character, holds, deletes, then moves to the
 * next — looping forever. Pure GSAP timeline sequencing (a tweened proxy count
 * drives textContent); no setInterval / setTimeout. Renders the first phrase
 * server-side so there is no layout shift and a no-JS fallback. Respects
 * prefers-reduced-motion: shows the first phrase statically, no timeline.
 *
 * Do NOT also bind Framer Motion to this element's text.
 *
 * Clean-room reference: annnimate "Typewriter" — behavior only.
 * Implementation is standard GSAP timeline (see gsap-timeline / gsap-core).
 */
export function Typewriter({
  phrases,
  typeSpeed = DEFAULT_TYPEWRITER.typeSpeed,
  deleteSpeed = DEFAULT_TYPEWRITER.deleteSpeed,
  pauseAfterType = DEFAULT_TYPEWRITER.pauseAfterType,
  pauseAfterDelete = DEFAULT_TYPEWRITER.pauseAfterDelete,
  cursor = true,
  className,
  as: Tag = 'span',
}: TypewriterProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el || phrases.length === 0) return

    const segments = buildTypewriterTimeline({
      phrases,
      typeSpeed,
      deleteSpeed,
      pauseAfterType,
      pauseAfterDelete,
    })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 })
      const proxy = { n: 0 }

      for (const seg of segments) {
        const write = () => {
          el.textContent = seg.phrase.slice(0, Math.round(proxy.n))
        }

        proxy.n = 0
        tl.set(proxy, { n: 0 })
          .to(proxy, {
            n: seg.phrase.length,
            duration: seg.typeDuration,
            ease: 'none',
            onUpdate: write,
          })
          .to({}, { duration: seg.pauseAfterType }) // hold typed
          .to(proxy, {
            n: 0,
            duration: seg.deleteDuration,
            ease: 'none',
            onUpdate: write,
          })
          .to({}, { duration: seg.pauseAfterDelete }) // hold empty
      }
    }, el)

    return () => ctx.revert()
  }, [
    phrases,
    typeSpeed,
    deleteSpeed,
    pauseAfterType,
    pauseAfterDelete,
    prefersReduced,
  ])

  return (
    <Tag
      ref={ref}
      data-cursor={cursor ? '' : undefined}
      className={cn(
        cursor &&
          "after:ml-0.5 after:inline-block after:w-[0.6ch] after:animate-pulse after:content-['▌']",
        className,
      )}
    >
      {phrases[0] ?? ''}
    </Tag>
  )
}
