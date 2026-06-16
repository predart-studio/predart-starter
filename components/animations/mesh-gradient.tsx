'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  meshBackground,
  DEFAULT_MESH_BLOBS,
  DEFAULT_MESH_PERIOD,
  DEFAULT_MESH_DRIFT,
  DEFAULT_MESH_BLUR,
  type MeshBlob,
} from '@/lib/motion/mesh-gradient'
import { cn } from '@/lib/utils'

interface MeshGradientProps {
  /** Color blobs to drift. Defaults to the observed pink / purple / orange set. */
  blobs?: MeshBlob[]
  /** Seconds for one full drift loop. Default 16 (slow, matches the demo feel). */
  period?: number
  /** How far each blob wanders, as a viewport fraction. Default 0.12. */
  drift?: number
  /** Blur radius (px) on the blob layer for the soft mesh look. Default 80. */
  blur?: number
  /** Base fill behind the blobs. Default near-black to match the demo shell. */
  baseColor?: string
  /** Overlay content (rendered above the gradient). */
  children?: ReactNode
  className?: string
}

/**
 * MeshGradient — GSAP drifting-blob gradient background (page/section-scoped).
 *
 * A full-bleed animated mesh-gradient backdrop: a stack of large blurred
 * radial-gradient color blobs that slowly orbit their anchor points, so the
 * background reads as a continuously morphing mesh. A single tweened `progress`
 * proxy (0->1, ease 'none', repeat -1) drives `meshBackground(t)`, rewriting the
 * blob `background-image` each frame; positions come from the pure drift math in
 * lib/motion/mesh-gradient. Renders a static first frame server-side (no layout
 * shift, no-JS safe); the drift layers on the client. Respects
 * prefers-reduced-motion: no tween, the static first frame stays put.
 *
 * Wraps overlay content and is meant to fill its container — give it a sized,
 * `relative` full-width section.
 *
 * Do NOT also bind Framer Motion to this element's background-image.
 *
 * DEGRADED: the original annnimate "MeshGradient" is a three.js r169 WebGL
 * fragment shader (noise-warped color field). This is the honest DOM
 * approximation — drifting blurred radial-gradient blobs via GSAP, no WebGL —
 * which captures the look and slow morph but not the shader's organic noise warp.
 *
 * Clean-room reference: annnimate "MeshGradient" — behavior only.
 * Implementation is standard core GSAP (see gsap-core / gsap-react skills).
 */
export function MeshGradient({
  blobs = DEFAULT_MESH_BLOBS,
  period = DEFAULT_MESH_PERIOD,
  drift = DEFAULT_MESH_DRIFT,
  blur = DEFAULT_MESH_BLUR,
  baseColor = '#0a0a0a',
  children,
  className,
}: MeshGradientProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = layerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      const proxy = { t: 0 }
      gsap.to(proxy, {
        t: 1,
        duration: period,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          el.style.backgroundImage = meshBackground(blobs, proxy.t, drift)
        },
      })
    }, el)

    return () => ctx.revert()
  }, [blobs, period, drift, prefersReduced])

  // Static first frame (t=0) for SSR / no-JS / reduced motion.
  const initialBg = meshBackground(blobs, 0, drift)

  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      style={{ backgroundColor: baseColor }}
    >
      <div
        ref={layerRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        // Dynamic values only: the animated gradient stack + its blur/scale.
        // GSAP rewrites backgroundImage each frame; blur/transform stay constant.
        style={{
          backgroundImage: initialBg,
          filter: `blur(${blur}px)`,
          transform: 'scale(1.25)', // hide blurred edges that pull in from the frame
        }}
      />
      {children}
    </div>
  )
}
