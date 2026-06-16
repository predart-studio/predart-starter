'use client'

import { useRef, useEffect, useId } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  gooeyRevealRadius,
  gooeyColorMatrix,
  buildGooeyRevealVars,
  DEFAULT_GOOEY_REVEAL_RADIUS,
  DEFAULT_GOOEY_BLUR,
  DEFAULT_GOOEY_CONTRAST,
} from '@/lib/motion/gooey-hover-reveal'
import { cn } from '@/lib/utils'

const PLACEHOLDER_SRC =
  'https://annnimate.b-cdn.net/preview-assets/images/sports/running-hero-female-3.avif'

interface GooeyHoverRevealProps {
  /** Image to reveal. Falls back to the reference placeholder. */
  src?: string
  alt?: string
  /** Reveal blob radius (px) under the pointer. */
  revealRadius?: number
  /** Gooey blur stdDeviation — higher = more liquid fusion. */
  blur?: number
  /** Gooey alpha contrast — re-sharpens the blurred edge into a goo edge. */
  contrast?: number
  className?: string
}

/**
 * GooeyHoverReveal — GSAP + SVG gooey image reveal (container-scoped).
 *
 * A crisp image hidden under a blurred, desaturated "distorted" version of
 * itself. Moving / dragging the pointer across the surface PAINTS a reveal
 * trail: a soft blob chases the cursor (gsap.quickTo) over an SVG clip mask,
 * and a gooey filter (feGaussianBlur + alpha-contrast feColorMatrix) fuses the
 * trail into one liquid edge, so the sharp image bleeds through with a gooey
 * boundary. On pointer leave the reveal drains back to hidden. On-brand as a
 * tactile "draw across the surface to reveal" hero/showcase.
 *
 * Renders the blurred base + a fully-hidden reveal mask server-side (no layout
 * shift, no-JS safe — the base image is always visible). Respects
 * prefers-reduced-motion: NO listeners are attached and the crisp image is
 * shown fully revealed (static). Do NOT also bind Framer Motion to the mask
 * geometry — the two libraries will fight over the same attributes.
 *
 * DEGRADED: the original annnimate "GooeyHoverReveal" is a THREE.js (r169)
 * WebGL displacement shader sampling a pointer-driven distortion field over the
 * hero texture. A WebGL fragment shader is not reproducible in GSAP/DOM, so
 * this is the closest honest DOM approximation: a clip-mask reveal with a gooey
 * SVG-filtered edge, GSAP-driven. The liquid edge and pointer-paint reveal read
 * the same; the per-pixel fluid displacement of the original does not.
 *
 * Clean-room reference: annnimate "GooeyHoverReveal" — behavior only.
 * Implementation is standard core GSAP + SVG filters (see gsap-react skill).
 */
export function GooeyHoverReveal({
  src = PLACEHOLDER_SRC,
  alt = '',
  revealRadius = DEFAULT_GOOEY_REVEAL_RADIUS,
  blur = DEFAULT_GOOEY_BLUR,
  contrast = DEFAULT_GOOEY_CONTRAST,
  className,
}: GooeyHoverRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<SVGCircleElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const rawId = useId().replace(/[:]/g, '')
  const gooId = `ghr-goo-${rawId}`
  const maskId = `ghr-mask-${rawId}`

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    const blob = blobRef.current
    if (!container || !blob) return

    const ctx = gsap.context(() => {
      // Blob starts collapsed (hidden reveal).
      const state = { progress: 0 }
      const applyRadius = () =>
        blob.setAttribute('r', String(gooeyRevealRadius({ progress: state.progress, revealRadius })))
      gsap.set(blob, { attr: { r: 0 } })

      // Blob position chases the pointer: a proxy {cx,cy} eases toward the
      // pointer; onUpdate writes the circle's cx/cy attributes.
      const setCx = gsap.quickSetter(blob, 'attr_cx') as (v: number) => void
      const setCy = gsap.quickSetter(blob, 'attr_cy') as (v: number) => void
      const pos = { cx: 0, cy: 0 }
      const cxTo = gsap.quickTo(pos, 'cx', {
        duration: 0.3,
        ease: 'power3',
        onUpdate: () => setCx(pos.cx),
      })
      const cyTo = gsap.quickTo(pos, 'cy', {
        duration: 0.3,
        ease: 'power3',
        onUpdate: () => setCy(pos.cy),
      })

      const tweenProgress = (to: number) =>
        gsap.to(state, { ...buildGooeyRevealVars({ to }), onUpdate: applyRadius })

      const onEnter = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        pos.cx = x
        pos.cy = y
        setCx(x)
        setCy(y)
        tweenProgress(1)
      }
      const onMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect()
        cxTo(e.clientX - rect.left)
        cyTo(e.clientY - rect.top)
      }
      const onLeave = () => tweenProgress(0)

      container.addEventListener('pointerenter', onEnter)
      container.addEventListener('pointermove', onMove)
      container.addEventListener('pointerleave', onLeave)

      return () => {
        container.removeEventListener('pointerenter', onEnter)
        container.removeEventListener('pointermove', onMove)
        container.removeEventListener('pointerleave', onLeave)
      }
    }, container)

    return () => ctx.revert()
  }, [prefersReduced, revealRadius])

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-[4/3] w-full overflow-hidden', className)}
    >
      {/* SVG filter + mask definitions (gooey edge + pointer-painted reveal). */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id={gooId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix in="blur" type="matrix" values={gooeyColorMatrix(contrast)} />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <g filter={`url(#${gooId})`}>
              <circle ref={blobRef} cx={0} cy={0} r={0} fill="white" />
            </g>
          </mask>
        </defs>
      </svg>

      {/* Base layer: blurred / desaturated "distorted" version (always visible). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-md saturate-50"
        draggable={false}
      />

      {/* Reveal layer: crisp image, clipped to the gooey pointer-painted mask.
          Under reduced motion it is shown fully (mask removed via class). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          prefersReduced ? '' : '[mask-type:alpha]',
        )}
        style={prefersReduced ? undefined : { maskImage: `url(#${maskId})`, WebkitMaskImage: `url(#${maskId})` }}
      />

      {/* Hint, mirrors the reference prompt. */}
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/70">
        Move across the surface to reveal
      </span>
    </div>
  )
}
