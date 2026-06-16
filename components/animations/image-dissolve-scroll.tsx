'use client'

import { useRef, useEffect, useId } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildDissolveFrame,
  dissolveAlphaMatrix,
  DEFAULT_MAX_DISPLACEMENT,
  DEFAULT_EDGE_HARDNESS,
  DEFAULT_DISSOLVE_BASE_FREQUENCY,
  DEFAULT_DISSOLVE_OCTAVES,
} from '@/lib/motion/image-dissolve-scroll'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PLACEHOLDER_SRC =
  'https://annnimate.b-cdn.net/preview-assets/images/sports/running-hero-female-3.avif'

interface ImageDissolveScrollProps {
  /** Image to dissolve. Falls back to the reference placeholder. */
  src?: string
  alt?: string
  /** Peak feDisplacementMap scale (px) — how hard noise warps the edges. */
  maxDisplacement?: number
  /** Alpha-threshold steepness — higher = harder, grainier dissolve edge. */
  edgeHardness?: number
  /** Noise grain size (feTurbulence baseFrequency). */
  baseFrequency?: number
  /**
   * Extra scroll distance (× viewport height) the dissolve is scrubbed across.
   * The section is pinned for this length, like the live demo's scrubbed range.
   */
  scrollLength?: number
  className?: string
}

/**
 * ImageDissolveScroll — GSAP ScrollTrigger + SVG image dissolve (page-scoped, scrubbed).
 *
 * A full-bleed image that disintegrates as you scroll through a pinned range:
 * fractal noise (feTurbulence) warps the edges via feDisplacementMap while an
 * alpha-threshold feColorMatrix progressively eats the image away to nothing —
 * a genuine DOM "dissolve", scrubbed linearly against scroll position. Renders
 * the intact image server-side (no layout shift, no-JS safe); the dissolve
 * filter layers on the client and is driven by ScrollTrigger scrub. Respects
 * prefers-reduced-motion: NO ScrollTrigger, no filter — the intact image is
 * shown static. Do NOT also bind Framer Motion to this image's filter/opacity.
 *
 * DEGRADED: the original annnimate "ImageDissolveScroll" is a THREE.js (r169)
 * WebGL canvas running a dissolve shader that samples a noise field over the
 * texture, scrubbed by gsap + ScrollTrigger. A WebGL fragment shader is not
 * reproducible in GSAP/DOM, so this is the closest honest DOM approximation: a
 * scroll-scrubbed SVG feTurbulence + feDisplacementMap + alpha-threshold
 * feColorMatrix dissolve. The scroll-driven disintegration reads the same; the
 * per-pixel particle/threshold fidelity of the original WebGL does not.
 *
 * Clean-room reference: annnimate "ImageDissolveScroll" — behavior only.
 * Implementation is standard GSAP ScrollTrigger + SVG filters (see gsap-scrolltrigger skill).
 */
export function ImageDissolveScroll({
  src = PLACEHOLDER_SRC,
  alt = '',
  maxDisplacement = DEFAULT_MAX_DISPLACEMENT,
  edgeHardness = DEFAULT_EDGE_HARDNESS,
  baseFrequency = DEFAULT_DISSOLVE_BASE_FREQUENCY,
  scrollLength = 1.5,
  className,
}: ImageDissolveScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null)
  const matrixRef = useRef<SVGFEColorMatrixElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const rawId = useId().replace(/[:]/g, '')
  const filterId = `ids-filter-${rawId}`

  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    const img = imgRef.current
    const displace = displaceRef.current
    const matrix = matrixRef.current
    if (!section || !img || !displace || !matrix) return

    const ctx = gsap.context(() => {
      const apply = (progress: number) => {
        const frame = buildDissolveFrame({ progress, maxDisplacement, edgeHardness })
        displace.setAttribute('scale', String(frame.displacement))
        matrix.setAttribute('values', frame.alphaMatrix)
        gsap.set(img, { opacity: frame.opacity })
      }
      apply(0)

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${Math.round(scrollLength * 100)}%`,
        scrub: true,
        pin: true,
        onUpdate: (self) => apply(self.progress),
      })
    }, section)

    return () => ctx.revert()
  }, [maxDisplacement, edgeHardness, baseFrequency, scrollLength, prefersReduced])

  return (
    <div
      ref={sectionRef}
      className={cn('relative h-screen w-full overflow-hidden bg-black', className)}
    >
      {/* Dissolve filter: fractal noise warps the image (feDisplacementMap),
          then an alpha-threshold feColorMatrix eats it away. Driven live by
          ScrollTrigger scrub. */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={DEFAULT_DISSOLVE_OCTAVES}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="SourceGraphic"
              in2="noise"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feColorMatrix
              ref={matrixRef}
              in="displaced"
              type="matrix"
              values={dissolveAlphaMatrix({ progress: 0, edgeHardness })}
            />
          </filter>
        </defs>
      </svg>

      {/* The image being dissolved. Intact server-side; filter applied on client
          only (skipped under reduced motion, so it renders fully). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={prefersReduced ? undefined : { filter: `url(#${filterId})` }}
      />

      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/70">
        Scroll to dissolve
      </span>
    </div>
  )
}
