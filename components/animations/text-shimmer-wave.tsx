'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildShimmerWavePlan,
  DEFAULT_SHIMMER_PERIOD,
  DEFAULT_SHIMMER_WAVES,
  DEFAULT_SHIMMER_MIN_OPACITY,
  DEFAULT_SHIMMER_LIFT,
  DEFAULT_SHIMMER_SCALE,
} from '@/lib/motion/text-shimmer-wave'
import { cn } from '@/lib/utils'

interface TextShimmerWaveProps {
  /** The text to shimmer. Rendered statically server-side (no-JS safe). */
  text: string
  /** Seconds for the crest to travel the whole string once (full loop). */
  period?: number
  /** Visible sine waves across the text at once (1 = a single crest). */
  waves?: number
  /** Opacity at the wave trough (crest stays at 1). */
  minOpacity?: number
  /** Upward "pop" in px at the wave crest. */
  lift?: number
  /** Scale at the wave crest. */
  scale?: number
  className?: string
  as?: ElementType
}

/**
 * TextShimmerWave — GSAP timeline per-char shimmer wave (element-scoped).
 *
 * A sinusoidal crest of brightness/lift travels char-by-char across the text
 * and loops forever (auto-plays on mount, repeat: -1). The studied demo drove
 * brightness via color (theme-dependent peach→orange); this port drives
 * opacity + a small upward pop + scale instead, so it stays on-brand for the
 * monochrome aesthetic without hard-coding a hue. Each char is split into its
 * own span and tweened on a yoyo, placed at a per-char phase offset (the wave).
 *
 * Renders the final, full-opacity text server-side (no layout shift, no-JS
 * safe); the wave layers on the client. Respects prefers-reduced-motion (no
 * timeline, text stays full-opacity and static). Do NOT also bind Framer Motion
 * to these chars' opacity/transform.
 *
 * Clean-room reference: annnimate "TextShimmerWave" — behavior only.
 * Implementation is standard GSAP timeline (see gsap-timeline / gsap-core).
 */
export function TextShimmerWave({
  text,
  period = DEFAULT_SHIMMER_PERIOD,
  waves = DEFAULT_SHIMMER_WAVES,
  minOpacity = DEFAULT_SHIMMER_MIN_OPACITY,
  lift = DEFAULT_SHIMMER_LIFT,
  scale = DEFAULT_SHIMMER_SCALE,
  className,
  as: Tag = 'span',
}: TextShimmerWaveProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el || text.length === 0) return

    const chars = Array.from(text)
    const plan = buildShimmerWavePlan({ count: chars.length, period, waves })

    const ctx = gsap.context(() => {
      // Split text into per-char spans (rebuilt each effect run, reverted on cleanup).
      el.textContent = ''
      const spans = chars.map((ch) => {
        const span = document.createElement('span')
        // Preserve spaces; keep glyphs inline-block so y/scale transforms apply.
        span.textContent = ch === ' ' ? ' ' : ch
        span.style.display = 'inline-block'
        span.style.willChange = 'transform, opacity'
        return span
      })
      spans.forEach((s) => el.appendChild(s))

      // Each char runs the same half-cycle tween (full → trough) on a yoyo, but
      // shifted in time by its phase offset so the crest travels the string. A
      // sine.inOut ease makes the brightness/lift read as a smooth sinusoid.
      const half = plan.period / 2
      const tl = gsap.timeline({ repeat: -1 })

      spans.forEach((span, i) => {
        tl.fromTo(
          span,
          { opacity: 1, yPercent: -lift, scale },
          {
            opacity: minOpacity,
            yPercent: 0,
            scale: 1,
            duration: half,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          },
          plan.offsets[i], // place at this char's phase offset (the wave)
        )
      })
    }, el)

    return () => ctx.revert()
  }, [text, period, waves, minOpacity, lift, scale, prefersReduced])

  return (
    <Tag ref={ref} className={cn('inline-block', className)}>
      {text}
    </Tag>
  )
}
