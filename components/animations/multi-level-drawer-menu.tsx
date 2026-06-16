'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { List, X, CaretRight, CaretLeft } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import {
  pushLevel,
  popLevel,
  trackOffset,
  stackDepth,
  resolveLevels,
  hasChildren,
  DEFAULT_DRAWER_DURATION,
  DEFAULT_DRAWER_EASE,
  DEFAULT_SCRIM_DURATION,
  DEFAULT_DRAWER_SIDE,
  type DrawerItem,
  type DrawerSide,
} from '@/lib/motion/multi-level-drawer-menu'

const DEFAULT_ITEMS: DrawerItem[] = [
  {
    label: 'Running',
    children: [
      { label: 'Road', href: '#road' },
      { label: 'Trail', href: '#trail' },
      { label: 'Track', href: '#track' },
    ],
  },
  {
    label: 'Cycling',
    children: [
      { label: 'Gravel', href: '#gravel' },
      { label: 'Road Bikes', href: '#road-bikes' },
    ],
  },
  { label: 'Events', href: '#events' },
  { label: 'About', href: '#about' },
]

interface MultiLevelDrawerMenuProps {
  /** Nested navigation tree. Items with `children` open a sub-level; leaves are links. */
  items?: DrawerItem[]
  /** Edge the drawer enters from. */
  side?: DrawerSide
  /** Drawer width (px). The level track shifts by this much per level. */
  width?: number
  /** Slide duration (s) for open + level transitions. */
  duration?: number
  /** GSAP ease for the slides. */
  ease?: string
  className?: string
}

/**
 * MultiLevelDrawerMenu — GSAP core wrapper (self-contained widget, element-scoped).
 *
 * A hamburger button opens a drawer that slides in from a side over a fading
 * scrim. The drawer holds a horizontal track of equal-width level panels;
 * tapping a parent item slides the track to the nested sub-level (translateX by
 * one panel width), and a back affordance slides it back. Closed by default via
 * internal open state, and the fixed overlay is only mounted while open, so it
 * never hijacks the page (e.g. /lab) when shut.
 *
 * Renders nothing but the trigger button until opened. Respects
 * prefers-reduced-motion: open/close and every level change snap instantly with
 * no tween. All offset/stack math comes from lib/motion/multi-level-drawer-menu
 * (unit-tested). Do NOT also bind Framer Motion to the track's transform.
 *
 * Clean-room reference: annnimate "MultiLevelDrawerMenu" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function MultiLevelDrawerMenu({
  items = DEFAULT_ITEMS,
  side = DEFAULT_DRAWER_SIDE,
  width = 340,
  duration = DEFAULT_DRAWER_DURATION,
  ease = DEFAULT_DRAWER_EASE,
  className,
}: MultiLevelDrawerMenuProps) {
  const prefersReduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [stack, setStack] = useState<number[]>([])

  const overlayRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const depth = stackDepth(stack)
  const levels = resolveLevels(items, stack)

  // Open / close drawer (slide from edge + scrim fade).
  useEffect(() => {
    const scrim = scrimRef.current
    const drawer = drawerRef.current
    if (!scrim || !drawer) return

    const hidden = side === 'right' ? width : -width

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(drawer, { x: open ? 0 : hidden })
        gsap.set(scrim, { autoAlpha: open ? 1 : 0 })
        return
      }
      if (open) {
        gsap.to(scrim, { autoAlpha: 1, duration: DEFAULT_SCRIM_DURATION, ease: 'power2.out' })
        gsap.to(drawer, { x: 0, duration, ease })
      } else {
        gsap.to(scrim, { autoAlpha: 0, duration: DEFAULT_SCRIM_DURATION, ease: 'power2.in' })
        gsap.to(drawer, { x: hidden, duration, ease: 'power3.in' })
      }
    })

    return () => ctx.revert()
  }, [open, side, width, duration, ease, prefersReduced])

  // Slide the level track to the active depth.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const x = trackOffset(depth, width)

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(track, { x })
      } else {
        gsap.to(track, { x, duration, ease })
      }
    })

    return () => ctx.revert()
  }, [depth, width, duration, ease, prefersReduced])

  // Reset to root whenever the drawer fully closes.
  const close = useCallback(() => {
    setOpen(false)
    setStack([])
  }, [])

  const onItem = useCallback(
    (levelIndex: number, itemIndex: number, item: DrawerItem) => {
      if (hasChildren(item)) {
        // only push from the currently active (deepest) level
        if (levelIndex === stack.length) setStack((s) => pushLevel(s, itemIndex))
      } else if (item.href) {
        close()
      }
    },
    [stack.length, close],
  )

  // Escape key closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <div className={cn('inline-block', className)}>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <List size={18} weight="bold" />
        Menu
      </button>

      {open && (
        <div ref={overlayRef} className="fixed inset-0 z-[120]">
          <div
            ref={scrimRef}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            onClick={close}
            onKeyDown={(e) => e.key === 'Enter' && close()}
            className="absolute inset-0 bg-black/60 opacity-0"
          />

          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cn(
              'absolute inset-y-0 flex flex-col overflow-hidden bg-background shadow-2xl',
              side === 'right' ? 'right-0' : 'left-0',
            )}
            style={{ width }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              {depth > 0 ? (
                <button
                  type="button"
                  aria-label="Back to previous level"
                  onClick={() => setStack((s) => popLevel(s))}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CaretLeft size={16} weight="bold" />
                  Back
                </button>
              ) : (
                <span className="text-sm font-semibold tracking-wide">Menu</span>
              )}
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Horizontal track of level panels; trackRef slides by -depth*width. */}
            <div className="relative flex-1 overflow-hidden">
              <div ref={trackRef} className="flex h-full">
                {levels.map((level, levelIndex) => (
                  <ul
                    key={levelIndex}
                    aria-hidden={levelIndex !== depth}
                    className="flex shrink-0 flex-col gap-1 overflow-y-auto p-3"
                    style={{ width }}
                  >
                    {level.map((item, itemIndex) => {
                      const parent = hasChildren(item)
                      const content = (
                        <span className="flex w-full items-center justify-between">
                          <span>{item.label}</span>
                          {parent && <CaretRight size={16} weight="bold" className="opacity-60" />}
                        </span>
                      )
                      const cls =
                        'w-full rounded-md px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-muted'
                      return (
                        <li key={item.label}>
                          {parent || !item.href ? (
                            <button
                              type="button"
                              onClick={() => onItem(levelIndex, itemIndex, item)}
                              className={cls}
                            >
                              {content}
                            </button>
                          ) : (
                            <a href={item.href} onClick={close} className={cls}>
                              {content}
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
