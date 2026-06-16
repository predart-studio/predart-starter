'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  distance,
  shouldSpawn,
  poolIndex,
  DEFAULT_TRAIL_THRESHOLD,
  DEFAULT_TRAIL_IN_DURATION,
  DEFAULT_TRAIL_OUT_DURATION,
  DEFAULT_TRAIL_OVERSHOOT,
  type Point,
} from '@/lib/motion/image-trail'
import { cn } from '@/lib/utils'

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/trail1/240/300',
  'https://picsum.photos/seed/trail2/240/300',
  'https://picsum.photos/seed/trail3/240/300',
  'https://picsum.photos/seed/trail4/240/300',
  'https://picsum.photos/seed/trail5/240/300',
]

interface ImageTrailProps {
  /** Source images cycled (round-robin) as the cursor moves. */
  images?: string[]
  /** Pointer travel (px) between dropped images. Lower = denser trail. */
  threshold?: number
  className?: string
  children?: React.ReactNode
}

/**
 * ImageTrail — GSAP pointer image-trail (area-scoped).
 *
 * Moving the cursor across the area drops a trail of images at the pointer:
 * each clone scales in from 0 with a slight overshoot, holds, then collapses
 * back to 0 and is removed (~1s lifetime, opacity constant). A new image is
 * dropped every `threshold` px of travel; the source list cycles round-robin.
 * Built for a bold, kinetic hero band ("move fast, leave a mark").
 *
 * The trail images are plain absolutely-positioned <img> clones (not
 * next/image): they are transient, pointer-driven, and need no layout box to
 * optimize. Do NOT also bind Framer Motion to their transform — GSAP owns the
 * matrix. Renders just its static content server-side / under reduced motion:
 * NO listeners are attached and NO images spawn (the area is fully usable).
 *
 * Clean-room reference: annnimate "ImageTrail" — behavior only.
 * Implementation is standard core GSAP (see gsap-core / gsap-react skills).
 */
export function ImageTrail({
  images = PLACEHOLDER_IMAGES,
  threshold = DEFAULT_TRAIL_THRESHOLD,
  className,
  children,
}: ImageTrailProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const area = areaRef.current
    if (!area) return
    if (images.length === 0) return

    const ctx = gsap.context(() => {
      let spawnCount = 0
      let lastSpawn: Point | null = null

      const spawn = (x: number, y: number) => {
        const src = images[poolIndex(spawnCount, images.length)]
        spawnCount += 1

        const img = document.createElement('img')
        img.src = src
        img.alt = ''
        img.setAttribute('aria-hidden', 'true')
        img.className =
          'pointer-events-none absolute left-0 top-0 z-0 h-[300px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-md object-cover will-change-transform'
        area.appendChild(img)

        // Position at the pointer (relative to the area), scale in with a slight
        // overshoot, hold, then collapse to 0 and remove. Opacity stays at 1.
        gsap.set(img, { x, y, scale: 0, transformOrigin: 'center center' })
        const tl = gsap.timeline({
          onComplete: () => img.remove(),
        })
        tl.to(img, {
          scale: DEFAULT_TRAIL_OVERSHOOT,
          duration: DEFAULT_TRAIL_IN_DURATION,
          ease: 'back.out(2)',
        })
          .to(img, { scale: 1, duration: 0.15, ease: 'power1.out' })
          .to(img, {
            scale: 0,
            duration: DEFAULT_TRAIL_OUT_DURATION,
            ease: 'power2.in',
          })
      }

      const onMove = (e: PointerEvent) => {
        const rect = area.getBoundingClientRect()
        const p: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        if (!lastSpawn) {
          lastSpawn = p
          spawn(p.x, p.y)
          return
        }
        if (shouldSpawn(distance(p, lastSpawn), threshold)) {
          lastSpawn = p
          spawn(p.x, p.y)
        }
      }

      area.addEventListener('pointermove', onMove)

      return () => {
        area.removeEventListener('pointermove', onMove)
      }
    }, area)

    return () => ctx.revert()
  }, [images, threshold, prefersReduced])

  return (
    <div
      ref={areaRef}
      className={cn('relative isolate overflow-hidden', className)}
    >
      {children}
    </div>
  )
}
