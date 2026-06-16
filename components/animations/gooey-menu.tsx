'use client'

import { useRef, useEffect, useState, useId, type ReactNode } from 'react'
import gsap from 'gsap'
import { Plus, EnvelopeSimple, ChatCircle, Phone, ShareNetwork } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  computeGooeyItemOffset,
  DEFAULT_GOOEY_RADIUS,
  DEFAULT_GOOEY_SPREAD,
  DEFAULT_GOOEY_CENTER_ANGLE,
  DEFAULT_GOOEY_STAGGER,
  DEFAULT_GOOEY_DURATION,
  DEFAULT_GOOEY_EASE,
  DEFAULT_GOOEY_FAB_ROTATION,
  DEFAULT_GOOEY_BLUR,
  DEFAULT_GOOEY_COLOR_MATRIX,
} from '@/lib/motion/gooey-menu'
import { cn } from '@/lib/utils'

export interface GooeyMenuItem {
  /** Accessible label for the action button. */
  label: string
  /** Icon node (defaults provided when omitted). */
  icon?: ReactNode
  onClick?: () => void
}

interface GooeyMenuProps {
  /** Action items to fan out. Falls back to a 5-item placeholder set. */
  items?: GooeyMenuItem[]
  /** Travel distance from the FAB center, px. */
  radius?: number
  /** Angular spread of the fan, degrees. */
  spread?: number
  /** Center angle of the fan, degrees (90 = straight up). */
  centerAngle?: number
  className?: string
}

const DEFAULT_ITEMS: GooeyMenuItem[] = [
  { label: 'Send email', icon: <EnvelopeSimple weight="bold" size={20} /> },
  { label: 'Open chat', icon: <ChatCircle weight="bold" size={20} /> },
  { label: 'Book a call', icon: <Phone weight="bold" size={20} /> },
  { label: 'Share', icon: <ShareNetwork weight="bold" size={20} /> },
]

/**
 * GooeyMenu — GSAP floating-action-button cluster (element-scoped, inline).
 *
 * A FAB that, on click, fans a set of action buttons out along an arc. The
 * buttons travel from under the FAB to their open positions with a staggered
 * back-ease pop; an inline SVG goo filter (feGaussianBlur + feColorMatrix on the
 * alpha channel) makes the round blobs visually MERGE and separate as they move,
 * and the FAB's plus icon rotates 45° into a close (×). Geometry comes from
 * computeGooeyItemOffset(); GSAP drives x/y/scale/opacity per item. Renders
 * closed server-side (no layout shift). Respects prefers-reduced-motion: items
 * snap open/closed instantly with no goo travel and no filter.
 *
 * Self-contained and scoped to its own relative box — NOT a global fixed overlay.
 * Do NOT also bind Framer Motion to the items' transform.
 *
 * Clean-room reference: annnimate "GooeyMenu" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function GooeyMenu({
  items = DEFAULT_ITEMS,
  radius = DEFAULT_GOOEY_RADIUS,
  spread = DEFAULT_GOOEY_SPREAD,
  centerAngle = DEFAULT_GOOEY_CENTER_ANGLE,
  className,
}: GooeyMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const fabIconRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)

  // Unique filter id so multiple instances don't collide.
  const rawId = useId()
  const filterId = `gm-goo-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const count = items.length

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const buttons = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const icon = fabIconRef.current

    if (prefersReduced) {
      // Instant final state, no travel, no goo.
      buttons.forEach((btn, i) => {
        const off = computeGooeyItemOffset({ index: i, count, radius, spread, centerAngle })
        gsap.set(btn, {
          x: open ? off.x : 0,
          y: open ? off.y : 0,
          scale: 1,
          autoAlpha: open ? 1 : 0,
        })
      })
      if (icon) gsap.set(icon, { rotation: open ? DEFAULT_GOOEY_FAB_ROTATION : 0 })
      return
    }

    const ctx = gsap.context(() => {
      if (icon) {
        gsap.to(icon, {
          rotation: open ? DEFAULT_GOOEY_FAB_ROTATION : 0,
          duration: DEFAULT_GOOEY_DURATION,
          ease: 'power3.out',
        })
      }

      buttons.forEach((btn, i) => {
        const off = computeGooeyItemOffset({ index: i, count, radius, spread, centerAngle })
        // Stagger from the FAB outward when opening; reverse when closing.
        const delay = (open ? i : count - 1 - i) * DEFAULT_GOOEY_STAGGER
        gsap.to(btn, {
          x: open ? off.x : 0,
          y: open ? off.y : 0,
          scale: open ? 1 : 0.2,
          autoAlpha: open ? 1 : 0,
          duration: DEFAULT_GOOEY_DURATION,
          ease: open ? DEFAULT_GOOEY_EASE : 'power2.in',
          delay,
        })
      })
    }, root)

    return () => ctx.revert()
  }, [open, prefersReduced, count, radius, spread, centerAngle])

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-flex h-44 w-72 items-end justify-center', className)}
    >
      {/* Inline goo filter: blur rounds the blobs, the colorMatrix alpha row
          snaps the soft edges back to a hard threshold so overlapping items
          merge into one blob and separate as they travel apart. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        className="absolute"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={DEFAULT_GOOEY_BLUR} result="blur" />
            <feColorMatrix in="blur" type="matrix" values={DEFAULT_GOOEY_COLOR_MATRIX} result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* The blob layer (FAB + items) shares one goo filter so they merge. */}
      <div
        className="relative flex h-16 w-16 items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        {/* Action items — absolutely centered on the FAB, translated out by GSAP. */}
        {items.map((item, i) => (
          <button
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            aria-label={item.label}
            onClick={item.onClick}
            className={cn(
              'absolute flex h-12 w-12 items-center justify-center rounded-full',
              'bg-foreground text-background opacity-0',
            )}
          >
            {item.icon ?? <span className="text-sm font-bold">{i + 1}</span>}
          </button>
        ))}

        {/* FAB trigger. */}
        <button
          type="button"
          aria-label={open ? 'Close actions' : 'Open actions'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'relative z-10 flex h-16 w-16 items-center justify-center rounded-full',
            'bg-foreground text-background',
          )}
        >
          <span ref={fabIconRef} className="inline-flex">
            <Plus weight="bold" size={26} />
          </span>
        </button>
      </div>
    </div>
  )
}
