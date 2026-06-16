'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { List, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildOverlayVars,
  planLinkStagger,
  DEFAULT_LINK_DURATION,
  DEFAULT_LINK_EASE,
  type OverlayVarsInput,
} from '@/lib/motion/fullscreen-slide-menu'

export interface FullscreenSlideMenuLink {
  label: string
  href: string
}

const DEFAULT_LINKS: FullscreenSlideMenuLink[] = [
  { label: 'Work', href: '#work' },
  { label: 'Studio', href: '#studio' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

interface FullscreenSlideMenuProps {
  /** Nav links shown inside the overlay. Defaults to placeholder links. */
  links?: FullscreenSlideMenuLink[]
  /** Edge the panel slides in from. 'bottom' (observed default) covers up. */
  from?: OverlayVarsInput['from']
  /** Panel slide duration (s). */
  duration?: number
  /** Optional brand label rendered top-left inside the overlay. */
  brand?: string
  className?: string
}

/**
 * FullscreenSlideMenu — GSAP timeline-driven fullscreen overlay menu (self-scoped).
 *
 * A hamburger trigger opens a full-viewport panel that slides up to cover the
 * screen, then masked nav links reveal one after another (slide-up + fade);
 * a close X (and Escape) reverse the panel on the same edge. The overlay is
 * gated by internal open state and only mounts as fixed inset-0 while open, so
 * the component is drop-in safe anywhere. Respects prefers-reduced-motion:
 * the overlay appears instantly with links fully visible, no tweens.
 *
 * Do NOT also bind Framer Motion to the panel or link transforms.
 *
 * Clean-room reference: annnimate "FullscreenSlideMenu" — behavior only
 * (observed: full-viewport panel slide ~1.0s power3.inOut, top-to-bottom link
 * stagger, symmetric close on the same edge, reduced-motion = instant cover).
 * Implementation is standard GSAP (see gsap-core / gsap-timeline skills).
 */
export function FullscreenSlideMenu({
  links = DEFAULT_LINKS,
  from = 'bottom',
  duration = 1.0,
  brand = 'Studio',
  className,
}: FullscreenSlideMenuProps) {
  const [open, setOpen] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  const overlayRef = useRef<HTMLDivElement>(null)
  const linkInnersRef = useRef<HTMLSpanElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const close = useCallback(() => setOpen(false), [])

  // Reset collected inner refs each render so the array matches current links.
  linkInnersRef.current = []

  // Escape closes the menu while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Drive the GSAP open/close timeline whenever `open` flips.
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const inners = linkInnersRef.current.filter(Boolean)
    const { hidden, shown, closed } = buildOverlayVars({ from, duration })
    const linkDelays = planLinkStagger({ count: inners.length })

    // Reduced motion: snap to the relevant final state, no tween, no timeline.
    if (prefersReduced) {
      if (open) {
        gsap.set(overlay, { ...shown, duration: 0 })
        if (inners.length) gsap.set(inners, { yPercent: 0, opacity: 1 })
      } else {
        gsap.set(overlay, { ...hidden })
      }
      return
    }

    const ctx = gsap.context(() => {
      if (open) {
        const tl = gsap.timeline()
        tl.set(overlay, hidden)
        if (inners.length) tl.set(inners, { yPercent: 110, opacity: 0 }, 0)
        tl.to(overlay, shown, 0)
        inners.forEach((inner, i) => {
          tl.to(
            inner,
            {
              yPercent: 0,
              opacity: 1,
              duration: DEFAULT_LINK_DURATION,
              ease: DEFAULT_LINK_EASE,
            },
            linkDelays[i],
          )
        })
        tlRef.current = tl
      } else {
        // Close: links fall away first, then the panel slides back out the edge.
        const tl = gsap.timeline()
        if (inners.length) {
          tl.to(inners, {
            yPercent: 110,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            stagger: 0.04,
          })
        }
        tl.to(overlay, closed, inners.length ? '-=0.15' : 0)
        tlRef.current = tl
      }
    }, overlay)

    return () => ctx.revert()
  }, [open, from, duration, prefersReduced])

  return (
    <div className={cn('relative', className)}>
      {/* Visible hamburger trigger */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <List size={20} weight="bold" />
        Menu
      </button>

      {/* Fullscreen overlay — only present while open (fixed inset-0). */}
      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col bg-foreground text-background"
        >
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="text-sm font-semibold tracking-wide uppercase">
              {brand}
            </span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={close}
              className="inline-flex items-center gap-2 text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
            >
              Close
              <X size={22} weight="bold" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-6 sm:px-10">
            {links.map((link, i) => (
              <span
                key={link.href + i}
                className="block overflow-hidden"
              >
                <a
                  href={link.href}
                  onClick={close}
                  className="inline-block"
                >
                  <span
                    ref={(el) => {
                      if (el) linkInnersRef.current[i] = el
                    }}
                    className="inline-block text-5xl font-semibold tracking-tight sm:text-7xl"
                  >
                    {link.label}
                  </span>
                </a>
              </span>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
