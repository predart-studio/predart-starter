'use client'

import {
  useRef,
  useEffect,
  Children,
  type ReactNode,
  type ElementType,
} from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  randomRotation,
  DEFAULT_RANDOM_ROTATE_MIN,
  DEFAULT_RANDOM_ROTATE_MAX,
  DEFAULT_RANDOM_ROTATE_DURATION,
  DEFAULT_RANDOM_ROTATE_EASE,
  DEFAULT_RANDOM_ROTATE_SEED,
} from '@/lib/motion/random-rotate'

interface RandomRotateProps {
  /** One or more cards/items; each becomes an independently hoverable target. */
  children: ReactNode
  /** Lower bound of the random hover rotation, in degrees. */
  min?: number
  /** Upper bound of the random hover rotation, in degrees. */
  max?: number
  /** Tween duration (seconds) for both the enter and the settle-back. */
  duration?: number
  /** Settle ease — the demo overshoots then settles (back.out). */
  ease?: string
  /**
   * Seed for the deterministic resting rotation each item starts at. The hover
   * target is freshly random per hover; the rest angle is seeded so SSR matches
   * the client and items fan out consistently.
   */
  seed?: number
  /** Spread of the seeded resting fan-out, in degrees (0 = all flat). */
  restSpread?: number
  className?: string
  /** Tag for each item wrapper. */
  itemAs?: ElementType
  /** Tag for the group container. */
  as?: ElementType
}

/**
 * RandomRotate — GSAP hover-driven random rotation (element-scoped).
 *
 * Each child rests at a seeded resting angle and, on hover/focus, tweens to a
 * fresh random rotation within [min, max]; on leave/blur it springs back to its
 * resting angle. The settle uses an overshooting `back.out` ease. Renders the
 * settled (rotation 0) state server-side — no layout shift, no-JS safe; the
 * resting fan-out and hover interactivity layer on the client. Respects
 * prefers-reduced-motion: items stay flat (rotation 0), no listeners, no tween.
 *
 * Do NOT also bind Framer Motion to these elements' rotation.
 *
 * Clean-room reference: annnimate "RandomRotate" — behavior only.
 * Implementation is standard GSAP core (see gsap-core).
 */
export function RandomRotate({
  children,
  min = DEFAULT_RANDOM_ROTATE_MIN,
  max = DEFAULT_RANDOM_ROTATE_MAX,
  duration = DEFAULT_RANDOM_ROTATE_DURATION,
  ease = DEFAULT_RANDOM_ROTATE_EASE,
  seed = DEFAULT_RANDOM_ROTATE_SEED,
  restSpread = 12,
  className,
  itemAs: ItemTag = 'div',
  as: Tag = 'div',
}: RandomRotateProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const items = Children.toArray(children)

  useEffect(() => {
    if (prefersReduced) return
    const root = ref.current
    if (!root) return

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>('[data-rr-item]'),
    )
    if (targets.length === 0) return

    const ctx = gsap.context(() => {
      const cleanups: Array<() => void> = []

      targets.forEach((el, index) => {
        // Seeded resting angle (deterministic per index+seed) so the fan-out is
        // stable; the live demo's `initialRotation` analog.
        const initialRotation = randomRotation({
          index,
          seed,
          min: -restSpread,
          max: restSpread,
        })
        gsap.set(el, { rotation: initialRotation })

        let tween: gsap.core.Tween | null = null

        const enter = () => {
          // Fresh random target each hover — like the reference's Math.random()
          // draw — but reproducible would also work; freshness reads livelier.
          const lo = Math.min(min, max)
          const hi = Math.max(min, max)
          const target = lo + Math.random() * (hi - lo)
          tween?.kill()
          tween = gsap.to(el, { rotation: target, duration, ease })
        }
        const leave = () => {
          tween?.kill()
          tween = gsap.to(el, { rotation: initialRotation, duration, ease })
        }

        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
        el.addEventListener('focus', enter)
        el.addEventListener('blur', leave)
        cleanups.push(() => {
          el.removeEventListener('mouseenter', enter)
          el.removeEventListener('mouseleave', leave)
          el.removeEventListener('focus', enter)
          el.removeEventListener('blur', leave)
        })
      })

      return () => cleanups.forEach((fn) => fn())
    }, root)

    return () => ctx.revert()
  }, [min, max, duration, ease, seed, restSpread, items.length, prefersReduced])

  return (
    <Tag ref={ref} className={cn(className)}>
      {items.map((child, i) => (
        <ItemTag key={i} data-rr-item="" tabIndex={0}>
          {child}
        </ItemTag>
      ))}
    </Tag>
  )
}
