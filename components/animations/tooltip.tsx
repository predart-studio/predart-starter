'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildTooltipHiddenVars,
  buildTooltipVisibleVars,
  tooltipTransformOrigin,
  DEFAULT_TOOLTIP_SIDE,
  DEFAULT_TOOLTIP_OFFSET,
  DEFAULT_TOOLTIP_SCALE_FROM,
  DEFAULT_TOOLTIP_SHOW_DURATION,
  DEFAULT_TOOLTIP_HIDE_DURATION,
  DEFAULT_TOOLTIP_SHOW_EASE,
  DEFAULT_TOOLTIP_HIDE_EASE,
  DEFAULT_TOOLTIP_HIDE_DELAY,
  type TooltipSide,
} from '@/lib/motion/tooltip'
import { cn } from '@/lib/utils'

interface MotionTooltipProps {
  /** The hover/focus target the tooltip is anchored to. */
  children: ReactNode
  /** Tooltip body — string or arbitrary node. */
  content: ReactNode
  /** Which side of the trigger the tooltip sits on. Default `top`. */
  side?: TooltipSide
  /** Px gap between tooltip and trigger (also the slide distance). Default 8. */
  offset?: number
  className?: string
  /** Extra classes for the floating tooltip bubble. */
  contentClassName?: string
}

/**
 * MotionTooltip — GSAP core hover/focus tooltip (element-scoped).
 *
 * Wraps a trigger; on hover/focus a bubble anchored to the trigger animates in
 * with a scale 0.9 -> 1, an 8px slide toward the trigger, and a 0 -> 1 fade
 * (~0.28s, power2.out) — growing out of the edge nearest the trigger. On leave
 * it reverses (power2.in) after a short grace delay so quick pointer wobbles
 * don't flicker it. The tooltip ANCHORS to the trigger (it does not track the
 * cursor). Final hidden/visible states are rendered deterministically; the
 * animation only layers transitions between them.
 *
 * Respects prefers-reduced-motion: under reduced motion no GSAP runs and the
 * tooltip toggles instantly via opacity only (no scale, no slide). Do NOT also
 * bind Framer Motion to the bubble's transform/opacity.
 *
 * Named MotionTooltip to avoid colliding with the shadcn `components/ui/tooltip`
 * primitive.
 *
 * Clean-room reference: annnimate "Tooltip" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function MotionTooltip({
  children,
  content,
  side = DEFAULT_TOOLTIP_SIDE,
  offset = DEFAULT_TOOLTIP_OFFSET,
  className,
  contentClassName,
}: MotionTooltipProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = bubbleRef.current
    if (!el) return

    if (prefersReduced) {
      // Reduced motion: instant show/hide via opacity only, no GSAP, no transforms.
      el.style.transform = ''
      el.style.opacity = open ? '1' : '0'
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { transformOrigin: tooltipTransformOrigin(side) })

      if (open) {
        gsap.to(el, {
          ...buildTooltipVisibleVars(),
          duration: DEFAULT_TOOLTIP_SHOW_DURATION,
          ease: DEFAULT_TOOLTIP_SHOW_EASE,
          overwrite: true,
        })
      } else {
        gsap.to(el, {
          ...buildTooltipHiddenVars({
            side,
            offset,
            scaleFrom: DEFAULT_TOOLTIP_SCALE_FROM,
          }),
          duration: DEFAULT_TOOLTIP_HIDE_DURATION,
          delay: DEFAULT_TOOLTIP_HIDE_DELAY,
          ease: DEFAULT_TOOLTIP_HIDE_EASE,
          overwrite: true,
        })
      }
    }, el)

    return () => ctx.revert()
  }, [open, side, offset, prefersReduced])

  // Position classes: anchor the bubble on the chosen side of the trigger.
  const sidePos: Record<TooltipSide, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        // The wrapper span handles static anchor positioning (translate for
        // centering); GSAP only drives the inner bubble's enter/exit transform.
        className={cn('pointer-events-none absolute z-50', sidePos[side])}
        aria-hidden={!open}
      >
        <div
          ref={bubbleRef}
          role="tooltip"
          className={cn(
            'whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-sm text-background shadow-md',
            'opacity-0',
            contentClassName,
          )}
        >
          {content}
        </div>
      </span>
    </span>
  )
}
