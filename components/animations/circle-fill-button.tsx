'use client'

import {
  useRef,
  useEffect,
  type ElementType,
  type ReactNode,
  type MouseEvent,
} from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  computeCoverScale,
  DEFAULT_CIRCLE_SIZE,
  DEFAULT_FILL_DURATION,
  DEFAULT_LEAVE_DURATION,
  DEFAULT_FILL_EASE,
} from '@/lib/motion/circle-fill-button'
import { cn } from '@/lib/utils'

interface CircleFillButtonProps {
  children: ReactNode
  /** Click handler (forwarded to the underlying element). */
  onClick?: (e: MouseEvent<HTMLElement>) => void
  /** Diameter of the origin circle in px before scaling. */
  circleSize?: number
  /** Fill (enter) duration in seconds. */
  fillDuration?: number
  /** Shrink (leave) duration in seconds. */
  leaveDuration?: number
  /**
   * Optional Material-style label color swap. When set, the label tweens to
   * this color as the circle fills and back on leave. Off by default — the
   * reference demo keeps the label color fixed (dark on both base and fill).
   */
  fillTextColor?: string
  className?: string
  /** Class applied to the fill circle (use to set its color, e.g. bg-primary). */
  circleClassName?: string
  as?: ElementType
}

/**
 * CircleFillButton — GSAP hover-fill button (element-scoped).
 *
 * A pill button whose background is painted in by a small circle that scales up
 * from the exact point where the cursor enters, fully covering the button, then
 * shrinks back to that point on leave. The label sits above the circle so it
 * stays legible throughout (optionally swapping color as the fill lands). The
 * circle is positioned per pointer-entry and scaled via computeCoverScale() so
 * coverage is correct regardless of entry side. Renders its final (un-filled)
 * state server-side — no-JS / SSR safe; the fill layers on the client. Respects
 * prefers-reduced-motion: no listeners, no tween, the circle stays hidden.
 *
 * Do NOT also bind Framer Motion to the circle's transform (scale) — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "CircleFillButton" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function CircleFillButton({
  children,
  onClick,
  circleSize = DEFAULT_CIRCLE_SIZE,
  fillDuration = DEFAULT_FILL_DURATION,
  leaveDuration = DEFAULT_LEAVE_DURATION,
  fillTextColor,
  className,
  circleClassName,
  as: Tag = 'button',
}: CircleFillButtonProps) {
  const rootRef = useRef<HTMLElement>(null)
  const circleRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    const circle = circleRef.current
    if (!root || !circle) return

    const half = circleSize / 2

    const ctx = gsap.context(() => {
      gsap.set(circle, { scale: 0, transformOrigin: 'center center' })
      const labelColorAtRest =
        fillTextColor && labelRef.current
          ? getComputedStyle(labelRef.current).color
          : null

      const onEnter = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect()
        const origin = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        const scale = computeCoverScale({
          origin,
          width: rect.width,
          height: rect.height,
          circleSize,
        })

        // Place the circle so its center sits at the entry point, then grow.
        gsap.set(circle, { left: origin.x - half, top: origin.y - half })
        gsap.to(circle, {
          scale,
          duration: fillDuration,
          ease: DEFAULT_FILL_EASE,
          overwrite: 'auto',
        })
        if (fillTextColor && labelRef.current) {
          gsap.to(labelRef.current, {
            color: fillTextColor,
            duration: fillDuration * 0.5,
            ease: DEFAULT_FILL_EASE,
            overwrite: 'auto',
          })
        }
      }

      const onLeave = () => {
        gsap.to(circle, {
          scale: 0,
          duration: leaveDuration,
          ease: DEFAULT_FILL_EASE,
          overwrite: 'auto',
        })
        if (fillTextColor && labelRef.current && labelColorAtRest) {
          gsap.to(labelRef.current, {
            color: labelColorAtRest,
            duration: leaveDuration * 0.6,
            ease: DEFAULT_FILL_EASE,
            overwrite: 'auto',
          })
        }
      }

      root.addEventListener('pointerenter', onEnter)
      root.addEventListener('pointerleave', onLeave)

      return () => {
        root.removeEventListener('pointerenter', onEnter)
        root.removeEventListener('pointerleave', onLeave)
      }
    }, root)

    return () => ctx.revert()
  }, [circleSize, fillDuration, leaveDuration, fillTextColor, prefersReduced])

  return (
    <Tag
      ref={rootRef}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3',
        className,
      )}
    >
      <span
        ref={circleRef}
        aria-hidden
        className={cn(
          'pointer-events-none absolute h-6 w-6 scale-0 rounded-full bg-foreground',
          circleClassName,
        )}
      />
      <span ref={labelRef} className="relative z-[1]">
        {children}
      </span>
    </Tag>
  )
}
