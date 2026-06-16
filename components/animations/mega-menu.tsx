'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  nextActiveMenu,
  buildMegaMenuOpenVars,
  buildMegaMenuContentVars,
  DEFAULT_MEGA_MENU_STAGGER,
  DEFAULT_MEGA_MENU_ITEM_X,
  DEFAULT_MEGA_MENU_OPEN_DELAY,
  DEFAULT_MEGA_MENU_CLOSE_DELAY,
} from '@/lib/motion/mega-menu'
import { cn } from '@/lib/utils'

export interface MegaMenuLink {
  label: string
  href?: string
}

export interface MegaMenuColumn {
  heading: string
  links: MegaMenuLink[]
}

export interface MegaMenuItem {
  label: string
  columns: MegaMenuColumn[]
}

interface MegaMenuProps {
  /** Top-level menus, each with a label and columns of links. */
  menus?: MegaMenuItem[]
  /** Brand / logo text shown at the start of the bar. */
  brand?: string
  /** 'hover' (default, matches reference) opens on pointer-enter; 'click' toggles. */
  trigger?: 'hover' | 'click'
  className?: string
}

const DEFAULT_MENUS: MegaMenuItem[] = [
  {
    label: 'Shop',
    columns: [
      {
        heading: 'Footwear',
        links: [{ label: 'Road' }, { label: 'Trail' }, { label: 'Track' }, { label: 'Spikes' }],
      },
      {
        heading: 'Apparel',
        links: [{ label: 'Tops' }, { label: 'Tights' }, { label: 'Outerwear' }, { label: 'Accessories' }],
      },
      {
        heading: 'Featured',
        links: [{ label: 'New Arrivals' }, { label: 'Best Sellers' }, { label: 'Shop the Drop' }],
      },
    ],
  },
  {
    label: 'Collections',
    columns: [
      {
        heading: 'Seasons',
        links: [{ label: 'Spring 26' }, { label: 'Winter 25' }, { label: 'Archive 24' }],
      },
      {
        heading: 'Themes',
        links: [{ label: 'Race Day' }, { label: 'Recovery' }, { label: 'Off-Season' }],
      },
      {
        heading: 'Limited',
        links: [{ label: 'Limited Drops' }, { label: 'Artist Series' }, { label: 'Pro Athletes' }],
      },
    ],
  },
  {
    label: 'Stories',
    columns: [
      {
        heading: 'Read',
        links: [{ label: 'Latest' }, { label: 'Training' }, { label: 'Gear Reviews' }],
      },
      {
        heading: 'Watch',
        links: [{ label: 'The Roster' }, { label: 'Films' }, { label: 'Behind the Drop' }],
      },
    ],
  },
]

/**
 * MegaMenu — GSAP hover/click mega-menu wrapper (component-scoped).
 *
 * A full-width nav bar where activating a top-level trigger unrolls a large
 * multi-column dropdown panel beneath it. The panel reveals with a combined
 * height 0->auto + scaleY 0->1 (transform-origin top, so it unrolls downward),
 * while its column links slide in from the left and fade up with a left-to-right
 * stagger. Switching to another trigger keeps the panel open and morphs its
 * height instead of closing/reopening; an underline indicator slides to the
 * active trigger. Closes when the pointer leaves the whole nav (short forgiving
 * delay). Hover by default (matches the reference); pass trigger="click" to
 * toggle. The panel is absolutely positioned WITHIN this component's box, not a
 * global fixed overlay. Content renders server-side (no-JS readable); JS layers
 * the motion. Respects prefers-reduced-motion: the panel toggles instantly with
 * no height/scale tween and no content stagger.
 *
 * Do NOT also bind Framer Motion to the panel's height/transform — the two
 * libraries will fight over the same properties.
 *
 * Clean-room reference: annnimate "MegaMenu" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function MegaMenu({
  menus = DEFAULT_MENUS,
  brand = 'Kinetic Athletics',
  trigger = 'hover',
  className,
}: MegaMenuProps) {
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState<number | null>(null)

  const rootRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }, [])

  // Move the underline indicator under the active trigger (or hide it).
  const moveIndicator = useCallback((index: number | null) => {
    const indicator = indicatorRef.current
    if (!indicator) return
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (index === null) {
      gsap.to(indicator, { autoAlpha: 0, duration: reduced ? 0 : 0.2, overwrite: true })
      return
    }
    const btn = triggerRefs.current[index]
    const root = rootRef.current
    if (!btn || !root) return
    const b = btn.getBoundingClientRect()
    const r = root.getBoundingClientRect()
    gsap.to(indicator, {
      autoAlpha: 1,
      width: b.width,
      x: b.left - r.left,
      duration: reduced ? 0 : 0.3,
      ease: 'power3.out',
      overwrite: true,
    })
  }, [])

  // Open / morph / close the panel for the given active index.
  const renderActive = useCallback(
    (index: number | null) => {
      const panel = panelRef.current
      const inner = innerRef.current
      if (!panel) return

      if (prefersReduced) {
        // Instant toggle — no height/scale tween, no stagger.
        gsap.set(panel, index === null ? { height: 0, autoAlpha: 0 } : { height: 'auto', autoAlpha: 1, scaleY: 1 })
        if (inner) gsap.set(inner.children, { autoAlpha: index === null ? 0 : 1, x: 0 })
        moveIndicator(index)
        return
      }

      if (index === null) {
        gsap.to(panel, {
          height: 0,
          scaleY: 0,
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })
        moveIndicator(null)
        return
      }

      const openVars = buildMegaMenuOpenVars()
      gsap.to(panel, { ...openVars, overwrite: true })

      if (inner) {
        const { from, to } = buildMegaMenuContentVars({
          stagger: DEFAULT_MEGA_MENU_STAGGER,
          x: DEFAULT_MEGA_MENU_ITEM_X,
        })
        gsap.fromTo(inner.children, from, to)
      }
      moveIndicator(index)
    },
    [prefersReduced, moveIndicator],
  )

  // Drive GSAP whenever the active index changes.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      if (panel) gsap.set(panel, { transformOrigin: 'top center' })
      renderActive(active)
    }, rootRef)
    return () => ctx.revert()
  }, [active, renderActive])

  const open = useCallback(
    (index: number) => {
      clearTimers()
      const apply = () => setActive((cur) => nextActiveMenu({ active: cur, index, count: menus.length }))
      if (prefersReduced || active !== null) {
        // Already open (switching) or reduced motion: no intent delay.
        apply()
      } else {
        openTimer.current = setTimeout(apply, DEFAULT_MEGA_MENU_OPEN_DELAY)
      }
    },
    [active, menus.length, prefersReduced, clearTimers],
  )

  const close = useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => setActive(null), prefersReduced ? 0 : DEFAULT_MEGA_MENU_CLOSE_DELAY)
  }, [clearTimers, prefersReduced])

  const handleTrigger = useCallback(
    (index: number) => {
      clearTimers()
      setActive((cur) => nextActiveMenu({ active: cur, index, count: menus.length, toggle: true }))
    },
    [menus.length, clearTimers],
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  const hoverProps =
    trigger === 'hover'
      ? { onMouseLeave: close }
      : {}

  return (
    <nav
      ref={rootRef}
      className={cn('relative w-full border-b border-border bg-background', className)}
      {...hoverProps}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <span className="text-base font-semibold tracking-tight">{brand}</span>

        <ul className="relative flex items-center gap-1">
          {menus.map((menu, i) => (
            <li key={menu.label}>
              <button
                type="button"
                ref={(el) => {
                  triggerRefs.current[i] = el
                }}
                aria-expanded={active === i}
                onMouseEnter={trigger === 'hover' ? () => open(i) : undefined}
                onFocus={trigger === 'hover' ? () => open(i) : undefined}
                onClick={trigger === 'click' ? () => handleTrigger(i) : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active === i ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {menu.label}
              </button>
            </li>
          ))}
          {/* sliding underline indicator */}
          <span
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 origin-left bg-foreground opacity-0"
          />
        </ul>

        <a
          href="#"
          className="ml-auto rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Sign in
        </a>
      </div>

      {/* Full-width dropdown panel — absolute within this nav's box. */}
      <div
        ref={panelRef}
        className="absolute inset-x-0 top-full z-20 overflow-hidden border-b border-border bg-background"
        style={{ height: 0 }}
      >
        <div ref={innerRef} className="mx-auto grid max-w-6xl grid-cols-3 gap-10 px-6 py-10">
          {(active !== null ? menus[active]?.columns : menus[0]?.columns)?.map((col, ci) => (
            <div key={ci}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href ?? '#'}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
