'use client'

import { useRef, useEffect, type ReactNode, type MouseEventHandler } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildFillVars } from '@/lib/motion/background-fill-button'
import { cn } from '@/lib/utils'

interface BackgroundFillButtonProps {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  /**
   * When true, the fill exits out the TOP edge on leave (origin-flip, like
   * text-underline). Default false reproduces the live demo, where the fill
   * retracts back down to the bottom edge it came from.
   */
  flipOnLeave?: boolean
  duration?: number
  ease?: string
  /** className for the fill panel (its color via bg-*). Defaults to bg-primary. */
  fillClassName?: string
  /** classes added to the label only while hovered (e.g. a color swap). */
  labelHoverClassName?: string
  className?: string
}

/**
 * BackgroundFillButton — GSAP scaleY background sweep (element-scoped).
 *
 * A button whose colored fill panel sweeps UP from the bottom edge on hover
 * (scaleY 0 -> 1, transform-origin bottom) to cover the button, then retracts
 * back DOWN to the same bottom edge on leave (origin stays bottom, scaleY -> 0).
 * Set `flipOnLeave` to instead send the panel out the top edge on leave (the
 * text-underline origin-flip applied to scaleY). The label sits above the fill
 * (z-indexed) and can swap classes on hover via `labelHoverClassName`.
 *
 * The fill renders collapsed (scale-y-0) server-side via Tailwind, so there is
 * no layout shift and no fill flash before hydration. Respects
 * prefers-reduced-motion: under reduced motion NO listeners/tweens are attached
 * and the fill stays collapsed (button shows its base background + label). Do
 * NOT also bind Framer Motion to this fill's transform.
 *
 * Clean-room reference: annnimate "BackgroundFillButton" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function BackgroundFillButton({
  children,
  onClick,
  flipOnLeave = false,
  duration,
  ease,
  fillClassName,
  labelHoverClassName,
  className,
}: BackgroundFillButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    const fill = fillRef.current
    const label = labelRef.current
    if (!el || !fill) return

    const hoverClasses = labelHoverClassName
      ? labelHoverClassName.split(/\s+/).filter(Boolean)
      : []

    const ctx = gsap.context(() => {
      const onEnter = () => {
        const v = buildFillVars({ phase: 'enter', flipOnLeave, duration, ease })
        gsap.set(fill, { transformOrigin: v.transformOrigin })
        gsap.to(fill, { scaleY: v.scaleY, duration: v.duration, ease: v.ease, overwrite: true })
        if (label && hoverClasses.length) label.classList.add(...hoverClasses)
      }
      const onLeave = () => {
        const v = buildFillVars({ phase: 'leave', flipOnLeave, duration, ease })
        gsap.set(fill, { transformOrigin: v.transformOrigin })
        gsap.to(fill, { scaleY: v.scaleY, duration: v.duration, ease: v.ease, overwrite: true })
        if (label && hoverClasses.length) label.classList.remove(...hoverClasses)
      }

      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)

      return () => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      }
    }, el)

    return () => ctx.revert()
  }, [flipOnLeave, duration, ease, labelHoverClassName, prefersReduced])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-md bg-secondary px-6 py-3 text-secondary-foreground',
        className,
      )}
    >
      <span
        ref={fillRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-primary',
          fillClassName,
        )}
      />
      <span ref={labelRef} className="relative z-10">
        {children}
      </span>
    </button>
  )
}
