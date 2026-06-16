'use client'

import { useRef, useEffect, type ReactNode, type MouseEventHandler } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildCurveFillPath,
  CURVE_FILL_REST_PATH,
  DEFAULT_CURVE_FILL_DIP,
  DEFAULT_CURVE_FILL_DURATION,
  DEFAULT_CURVE_FILL_EASE,
  DEFAULT_CURVE_FILL_COLOR,
  DEFAULT_CURVE_FILL_BASE,
} from '@/lib/motion/curve-fill-button'
import { cn } from '@/lib/utils'

interface CurveFillButtonProps {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Resting button background colour (shown before the fill rises). */
  baseColor?: string
  /** Colour of the rising curved fill front. */
  fillColor?: string
  /** Label colour at rest (over baseColor). */
  labelColor?: string
  /** Label colour once the fill covers the text. Defaults to labelColor (no swap, matches reference). */
  labelColorActive?: string
  /** Rise/drain duration in seconds. */
  duration?: number
  /** Curve depth: viewBox units the front bulges above its edge at full fill. */
  dip?: number
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

/**
 * CurveFillButton — GSAP curved-fill hover button (element-scoped).
 *
 * A button whose background fills bottom-up on hover, led by a curved
 * (quadratic) front edge that sweeps past the top. The fill is a single
 * full-bleed <svg> <path> that morphs its `d` from a collapsed line at the
 * bottom (rest) to a full cover with an upward-bulging curve (hover) — driven by
 * gsap.to() on a {progress} proxy whose onUpdate rewrites the path via
 * buildCurveFillPath (same proxy-morph approach as HoverableList). The overshoot
 * ease (back.out) gives the "liquid" lead/lag of the front. Leaving drains the
 * fill back down the same way. The label can optionally swap colour as the fill
 * covers it (default: no swap, matching the reference's dark-on-both look).
 *
 * Renders its final resting state server-side (the path ships collapsed =
 * invisible, button shows baseColor, label is plain text), so it is no-JS safe
 * with no layout shift. Respects prefers-reduced-motion: NO listeners are
 * attached and the fill stays collapsed (button reads as its base state). Do NOT
 * also bind Framer Motion to this path's `attr` — the two libraries will fight
 * over the same `d`.
 *
 * Clean-room reference: annnimate "CurveFillButton" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function CurveFillButton({
  children,
  onClick,
  baseColor = DEFAULT_CURVE_FILL_BASE,
  fillColor = DEFAULT_CURVE_FILL_COLOR,
  labelColor = '#0A0A0A',
  labelColorActive,
  duration = DEFAULT_CURVE_FILL_DURATION,
  dip = DEFAULT_CURVE_FILL_DIP,
  type = 'button',
  className,
}: CurveFillButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const button = buttonRef.current
    if (!button) return

    const ctx = gsap.context(() => {
      const path = button.querySelector<SVGPathElement>('[data-curve-fill-path]')
      const label = button.querySelector<HTMLElement>('[data-curve-fill-label]')
      if (!path) return

      // Proxy whose `progress` GSAP tweens; onUpdate writes the path morph.
      const state = { progress: 0 }
      const swap = labelColorActive ?? labelColor
      const render = () => {
        path.setAttribute('d', buildCurveFillPath({ progress: state.progress, dip }))
        if (label && labelColorActive) {
          // Swap once the fill front has covered most of the label.
          label.style.color = state.progress > 0.55 ? swap : labelColor
        }
      }

      const tweenTo = (progress: number) =>
        gsap.to(state, {
          progress,
          duration,
          ease: DEFAULT_CURVE_FILL_EASE,
          overwrite: true,
          onUpdate: render,
        })

      const onEnter = () => tweenTo(1)
      const onLeave = () => tweenTo(0)

      button.addEventListener('pointerenter', onEnter)
      button.addEventListener('pointerleave', onLeave)

      return () => {
        button.removeEventListener('pointerenter', onEnter)
        button.removeEventListener('pointerleave', onLeave)
      }
    }, button)

    return () => ctx.revert()
  }, [duration, dip, labelColor, labelColorActive, prefersReduced])

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      className={cn(
        'relative isolate inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 text-base font-medium',
        className,
      )}
      style={{ backgroundColor: baseColor }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        style={{ color: fillColor }}
      >
        <path data-curve-fill-path d={CURVE_FILL_REST_PATH} fill="currentColor" />
      </svg>
      <span data-curve-fill-label className="relative z-10" style={{ color: labelColor }}>
        {children}
      </span>
    </button>
  )
}
