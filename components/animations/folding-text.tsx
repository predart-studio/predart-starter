'use client'

import { useRef, useEffect, type ElementType, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitFoldChars,
  buildFoldVars,
  DEFAULT_FOLD_PERSPECTIVE,
  DEFAULT_FOLD_ROTATION,
  DEFAULT_FOLD_STAGGER,
  type FoldStaggerFrom,
} from '@/lib/motion/folding-text'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FoldingTextProps {
  /** The headline to fold open, one character at a time. */
  text: string
  /**
   * Degrees each character is rotated about its left hinge before unfolding.
   * Reference alternates +90 / -90 per line — pass a negative value to fold
   * from the other side.
   */
  rotation?: number
  /** Seconds between consecutive character folds. */
  stagger?: number
  /** Which end the fold wave starts from (reference runs from `end`). */
  staggerFrom?: FoldStaggerFrom
  /** CSS perspective depth (px) on the fold container. */
  perspective?: number
  className?: string
  as?: ElementType
}

/**
 * FoldingText — GSAP ScrollTrigger wrapper (page/element-scoped).
 *
 * A headline whose characters are folded 90° away on a left hinge and unfold
 * flat as you scroll — a confident, architectural reveal for hero/section
 * titles in the monochrome aesthetic. The fold is scrub-linked: progress is
 * tied to scroll position, so it re-folds on scroll-up. Renders the final,
 * readable text server-side (no layout shift, no-JS safe); the 3D fold layers
 * on the client. Respects prefers-reduced-motion (no tween, no ScrollTrigger,
 * text stays flat). Do NOT also bind Framer Motion to these characters'
 * transform/opacity.
 *
 * Clean-room reference: annnimate "FoldingText" — behavior only.
 * Implementation is standard GSAP ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function FoldingText({
  text,
  rotation = DEFAULT_FOLD_ROTATION,
  stagger = DEFAULT_FOLD_STAGGER,
  staggerFrom = 'end',
  perspective = DEFAULT_FOLD_PERSPECTIVE,
  className,
  as: Tag = 'span',
}: FoldingTextProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const chars = el.querySelectorAll<HTMLElement>('[data-fold-char]')
      if (!chars.length) return

      const { from, to } = buildFoldVars({ rotation, stagger, staggerFrom })

      gsap.fromTo(chars, from, {
        ...to,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [text, rotation, stagger, staggerFrom, prefersReduced])

  const tokens = splitFoldChars(text)

  return (
    <Tag
      ref={ref}
      aria-label={text}
      className={cn(
        'inline-block [transform-style:preserve-3d] [backface-visibility:hidden]',
        `[perspective:var(--fold-perspective)]`,
        className,
      )}
      // CSS variable only (no visual inline styling); the arbitrary Tailwind
      // class above reads it so perspective stays prop-driven without inline transforms.
      style={{ '--fold-perspective': `${perspective}px` } as CSSProperties}
    >
      {tokens.map((token, i) =>
        token.isSpace ? (
          <span key={i} aria-hidden className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            data-fold-char
            aria-hidden
            className="inline-block origin-left [backface-visibility:hidden]"
          >
            {token.char}
          </span>
        ),
      )}
    </Tag>
  )
}
