'use client'

import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  computeTilt,
  buildFlipVars,
  DEFAULT_TILT_MAX_X,
  DEFAULT_TILT_MAX_Y,
  DEFAULT_HOVER_SCALE,
  DEFAULT_PERSPECTIVE,
  DEFAULT_FLIP_ROTATION,
  DEFAULT_FLIP_DURATION,
  DEFAULT_FLIP_EASE,
} from '@/lib/motion/card-3d-flip'
import { cn } from '@/lib/utils'

interface Card3DFlipProps {
  /** Card front face (the resting content). */
  front: ReactNode
  /**
   * Card back face. Only used in `mode="flip"` — the card spins 180° about Y to
   * reveal it. Omit it for the default tilt-only card.
   */
  back?: ReactNode
  /**
   * `tilt` (default, the observed behavior): the card pitches/yaws toward the
   * cursor and scales up while hovered, easing back on leave.
   * `flip`: the card rotates 180° to reveal `back` — by hover or click.
   */
  mode?: 'tilt' | 'flip'
  /** For `mode="flip"`: what reveals the back face. */
  trigger?: 'hover' | 'click'
  /** Max pitch (deg) at the top/bottom edges (tilt mode). */
  maxTiltX?: number
  /** Max yaw (deg) at the left/right edges (tilt mode). */
  maxTiltY?: number
  /** Scale the card grows to while hovered (tilt mode). */
  hoverScale?: number
  /** Flip rotation (deg) about Y to reveal the back (flip mode). */
  flipRotation?: number
  /** CSS perspective depth (px) on the card container. */
  perspective?: number
  className?: string
}

/**
 * Card3DFlip — GSAP 3D card wrapper (element-scoped, pointer-driven).
 *
 * In the default `tilt` mode the card leans toward the cursor (a small,
 * smoothed rotateX/rotateY) and scales up slightly while hovered, springing
 * back on leave — the confident, tactile hero/feature card of the monochrome
 * aesthetic. In `flip` mode it instead spins 180° about Y on hover or click to
 * reveal a back face. Both run on cheap gsap.quickTo / gsap.to transforms.
 *
 * Renders both faces server-side (no layout shift, no-JS safe); the motion
 * layers on the client. Respects prefers-reduced-motion: no listeners, no
 * tween — the card sits flat at rest (front face up). Do NOT also bind Framer
 * Motion to this card's transform — the two libraries will fight over the
 * matrix.
 *
 * Clean-room reference: annnimate "Card3DFlip" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function Card3DFlip({
  front,
  back,
  mode = 'tilt',
  trigger = 'hover',
  maxTiltX = DEFAULT_TILT_MAX_X,
  maxTiltY = DEFAULT_TILT_MAX_Y,
  hoverScale = DEFAULT_HOVER_SCALE,
  flipRotation = DEFAULT_FLIP_ROTATION,
  perspective = DEFAULT_PERSPECTIVE,
  className,
}: Card3DFlipProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  // reduced-motion flip fallback: instant toggle, no tween
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const ctx = gsap.context(() => {
      if (mode === 'flip') {
        const vars = buildFlipVars({
          rotation: flipRotation,
          duration: DEFAULT_FLIP_DURATION,
          ease: DEFAULT_FLIP_EASE,
        })
        let isFlipped = false
        const toFront = () => gsap.to(inner, { ...vars, rotateY: 0 })
        const toBack = () => gsap.to(inner, vars)

        if (trigger === 'click') {
          const onClick = () => {
            isFlipped = !isFlipped
            isFlipped ? toBack() : toFront()
          }
          container.addEventListener('click', onClick)
          return () => container.removeEventListener('click', onClick)
        }
        // hover
        const onEnter = () => toBack()
        const onLeave = () => toFront()
        container.addEventListener('pointerenter', onEnter)
        container.addEventListener('pointerleave', onLeave)
        return () => {
          container.removeEventListener('pointerenter', onEnter)
          container.removeEventListener('pointerleave', onLeave)
        }
      }

      // mode === 'tilt' — pointer-driven tilt + hover scale (the observed default)
      const rxTo = gsap.quickTo(inner, 'rotateX', { duration: 0.4, ease: 'power3.out' })
      const ryTo = gsap.quickTo(inner, 'rotateY', { duration: 0.4, ease: 'power3.out' })
      const sTo = gsap.quickTo(inner, 'scale', { duration: 0.4, ease: 'power3.out' })

      const onMove = (e: PointerEvent) => {
        const { rotateX, rotateY } = computeTilt({
          pointer: { x: e.clientX, y: e.clientY },
          rect: container.getBoundingClientRect(),
          maxX: maxTiltX,
          maxY: maxTiltY,
        })
        rxTo(rotateX)
        ryTo(rotateY)
        sTo(hoverScale)
      }
      const onLeave = () => {
        rxTo(0)
        ryTo(0)
        sTo(1)
      }

      container.addEventListener('pointermove', onMove)
      container.addEventListener('pointerleave', onLeave)
      return () => {
        container.removeEventListener('pointermove', onMove)
        container.removeEventListener('pointerleave', onLeave)
      }
    }, container)

    return () => ctx.revert()
  }, [
    mode,
    trigger,
    maxTiltX,
    maxTiltY,
    hoverScale,
    flipRotation,
    prefersReduced,
  ])

  const showBack = prefersReduced && mode === 'flip' && flipped

  return (
    <div
      ref={containerRef}
      onClick={
        prefersReduced && mode === 'flip' && trigger === 'click'
          ? () => setFlipped((f) => !f)
          : undefined
      }
      className={cn(
        'relative inline-block [transform-style:preserve-3d]',
        '[perspective:var(--card-perspective)]',
        className,
      )}
      style={{ '--card-perspective': `${perspective}px` } as CSSProperties}
    >
      <div
        ref={innerRef}
        className="relative [transform-style:preserve-3d]"
      >
        {/* front face */}
        <div
          className={cn(
            '[backface-visibility:hidden]',
            mode === 'flip' && 'relative',
          )}
          aria-hidden={showBack}
        >
          {front}
        </div>

        {/* back face — only rendered/positioned for flip mode */}
        {mode === 'flip' && back != null && (
          <div
            className={cn(
              'absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]',
              // reduced-motion instant toggle: bring the back face flat-forward
              showBack && '[transform:rotateY(0deg)]',
            )}
            aria-hidden={!showBack}
          >
            {back}
          </div>
        )}
      </div>
    </div>
  )
}
