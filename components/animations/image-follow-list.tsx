'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { followOffset } from '@/lib/motion/follow'
import { cn } from '@/lib/utils'

export interface FollowItem {
  label: string
  image: string
  href?: string
}

interface ImageFollowListProps {
  items: FollowItem[]
  className?: string
}

/**
 * ImageFollowList — GSAP cursor-follow hover list (container-scoped).
 *
 * A vertical index where hovering a row fades in a single floating thumbnail
 * that chases the cursor via gsap.quickTo() — ideal for a portfolio "work"
 * index (one row per project, the project still image trailing the pointer).
 * On-brand for the monochrome aesthetic: the list reads as plain typography
 * until the image layers in on hover.
 *
 * Reduced motion: NO listeners are attached and the floating <img> stays hidden
 * (it ships with the `opacity-0` class, so it is also invisible with no JS) —
 * the component degrades to a plain, fully usable text list / link list.
 *
 * The floating thumbnail is a plain <img> (not next/image) on purpose: a
 * fixed-position cursor follower has no layout box to optimize and must escape
 * next/image's intrinsic-size constraints. Do NOT also bind Framer Motion to
 * the thumbnail transform (x/y) — the two libraries will fight over the matrix.
 *
 * Clean-room reference: annnimate "Image Follow List" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-utils skills).
 */
export function ImageFollowList({ items, className }: ImageFollowListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const img = imageRef.current
      if (!img) return

      gsap.set(img, { autoAlpha: 0, scale: 0.85 })

      const xTo = gsap.quickTo(img, 'x', { duration: 0.5, ease: 'power3' })
      const yTo = gsap.quickTo(img, 'y', { duration: 0.5, ease: 'power3' })

      const onMove = (e: PointerEvent) => {
        const off = followOffset(
          { x: e.clientX, y: e.clientY },
          img.getBoundingClientRect(),
        )
        xTo(off.x)
        yTo(off.y)
      }
      const onLeaveContainer = () =>
        gsap.to(img, { autoAlpha: 0, scale: 0.85, duration: 0.3 })

      const rows = Array.from(
        container.querySelectorAll<HTMLElement>('[data-follow-item]'),
      )
      const rowCleanups = rows.map((row) => {
        const onEnter = () => {
          const src = row.dataset.image
          if (src) img.src = src
          gsap.to(img, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
        }
        row.addEventListener('pointerenter', onEnter)
        return () => row.removeEventListener('pointerenter', onEnter)
      })

      container.addEventListener('pointermove', onMove)
      container.addEventListener('pointerleave', onLeaveContainer)

      return () => {
        container.removeEventListener('pointermove', onMove)
        container.removeEventListener('pointerleave', onLeaveContainer)
        rowCleanups.forEach((off) => off())
      }
    }, container)

    return () => ctx.revert()
  }, [items, prefersReduced])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <ul>
        {items.map((item) =>
          item.href ? (
            <li key={item.label} className="border-b border-foreground/10">
              <Link
                href={item.href}
                data-follow-item
                data-image={item.image}
                className="block py-4 text-2xl transition-opacity hover:opacity-60"
              >
                {item.label}
              </Link>
            </li>
          ) : (
            <li key={item.label} className="border-b border-foreground/10">
              <span
                data-follow-item
                data-image={item.image}
                className="block py-4 text-2xl transition-opacity hover:opacity-60"
              >
                {item.label}
              </span>
            </li>
          ),
        )}
      </ul>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 h-40 w-64 object-cover opacity-0"
      />
    </div>
  )
}
