'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitZoomState,
  DEFAULT_SPLIT_ZOOM,
  type SplitZoomOpts,
} from '@/lib/motion/text-split-zoom'
import { cn } from '@/lib/utils'

interface TextSplitZoomProps extends SplitZoomOpts {
  /** Text before the image. */
  before: string
  /** Text after the image. */
  after: string
  src: string
  alt?: string
  className?: string
}

/**
 * TextSplitZoom — GSAP scrubbed inline image zoom that splits a headline.
 *
 * An inline image grows from nothing to full size as the section scrolls
 * (scrubbed: start "top bottom" → end "top center"), pushing the before/after
 * text apart as its width expands. Renders full-size server-side (no-JS safe).
 * Respects prefers-reduced-motion: image stays at full size, text apart, no
 * scrub.
 *
 * Do NOT also bind Framer Motion to the image transform.
 *
 * Clean-room reference: annnimate "Text Split Zoom" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger scrub (see gsap-scrolltrigger).
 */
export function TextSplitZoom({
  before,
  after,
  src,
  alt = '',
  maxWidth = DEFAULT_SPLIT_ZOOM.maxWidth,
  minScale = DEFAULT_SPLIT_ZOOM.minScale,
  maxScale = DEFAULT_SPLIT_ZOOM.maxScale,
  className,
}: TextSplitZoomProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLSpanElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const wrap = wrapRef.current
    const imgWrap = imgWrapRef.current
    const img = imgRef.current
    if (!wrap || !imgWrap || !img) return

    const apply = (progress: number) => {
      const { width, scale } = splitZoomState(progress, { maxWidth, minScale, maxScale })
      gsap.set(imgWrap, { width })
      gsap.set(img, { scale })
    }

    const ctx = gsap.context(() => {
      apply(0)
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top bottom',
        end: 'top center',
        scrub: 1,
        onUpdate: (self) => apply(self.progress),
      })
    }, wrap)

    return () => ctx.revert()
  }, [maxWidth, minScale, maxScale, prefersReduced])

  return (
    <div
      ref={wrapRef}
      className={cn('flex items-center justify-center gap-2 whitespace-nowrap', className)}
    >
      <span>{before}</span>
      <span
        ref={imgWrapRef}
        className={cn('inline-block overflow-hidden', !prefersReduced && 'w-0')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={src} alt={alt} className="block h-auto w-full object-cover" />
      </span>
      <span>{after}</span>
    </div>
  )
}
