'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import gsap from 'gsap'
import { CaretDown } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  nextOpenState,
  DEFAULT_ACCORDION_DURATION,
  DEFAULT_ACCORDION_EASE_OPEN,
  DEFAULT_ACCORDION_EASE_CLOSE,
  DEFAULT_ACCORDION_CHEVRON_DEG,
} from '@/lib/motion/accordion'
import { cn } from '@/lib/utils'

export interface MotionAccordionItem {
  title: ReactNode
  content: ReactNode
}

interface MotionAccordionProps {
  items: MotionAccordionItem[]
  /** Allow multiple panels open at once. Default false (single-open). */
  multiple?: boolean
  /** Indices open on first render. Default [0] (first panel open). */
  defaultOpen?: number[]
  /** Height tween duration in seconds. */
  duration?: number
  className?: string
}

/**
 * MotionAccordion — GSAP height-auto accordion wrapper (component-scoped).
 *
 * Expand/collapse panels with a real height 0 <-> auto tween (GSAP measures the
 * panel and animates `height: 'auto'`), a 180deg chevron rotation, and a subtle
 * content fade/lift on open. Single-open by default (opening one collapses the
 * rest); pass `multiple` for independent toggles — the open-set transition is
 * the pure nextOpenState() reducer. Content renders server-side (no-JS readable,
 * no layout shift); JS layers the motion on top. Respects
 * prefers-reduced-motion: panels toggle instantly with no height tween and no
 * chevron animation.
 *
 * Do NOT also bind Framer Motion to a panel's height/transform — the two
 * libraries will fight over the same properties.
 *
 * Clean-room reference: annnimate "Accordion" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function MotionAccordion({
  items,
  multiple = false,
  defaultOpen = [0],
  duration = DEFAULT_ACCORDION_DURATION,
  className,
}: MotionAccordionProps) {
  const prefersReduced = usePrefersReducedMotion()
  const [open, setOpen] = useState<number[]>(() =>
    defaultOpen.filter((i) => i >= 0 && i < items.length),
  )
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const chevronRefs = useRef<(HTMLSpanElement | null)[]>([])

  const animate = useCallback(
    (index: number, shouldOpen: boolean) => {
      const panel = panelRefs.current[index]
      const chevron = chevronRefs.current[index]

      if (prefersReduced) {
        // Reduced motion: snap to the final state, no tween.
        if (panel) gsap.set(panel, { height: shouldOpen ? 'auto' : 0 })
        if (chevron) {
          gsap.set(chevron, { rotation: shouldOpen ? DEFAULT_ACCORDION_CHEVRON_DEG : 0 })
        }
        return
      }

      if (panel) {
        gsap.killTweensOf(panel)
        if (shouldOpen) {
          gsap.to(panel, {
            height: 'auto',
            duration,
            ease: DEFAULT_ACCORDION_EASE_OPEN,
          })
          const inner = panel.firstElementChild
          if (inner) {
            gsap.fromTo(
              inner,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration, ease: DEFAULT_ACCORDION_EASE_OPEN },
            )
          }
        } else {
          gsap.to(panel, {
            height: 0,
            duration,
            ease: DEFAULT_ACCORDION_EASE_CLOSE,
          })
        }
      }

      if (chevron) {
        gsap.to(chevron, {
          rotation: shouldOpen ? DEFAULT_ACCORDION_CHEVRON_DEG : 0,
          duration,
          ease: DEFAULT_ACCORDION_EASE_OPEN,
        })
      }
    },
    [duration, prefersReduced],
  )

  const handleClick = useCallback(
    (index: number) => {
      const next = nextOpenState({ open, index, multiple })
      const wasOpen = new Set(open)
      const nowOpen = new Set(next)
      // Animate every panel whose open-state changed.
      for (let i = 0; i < items.length; i++) {
        if (wasOpen.has(i) !== nowOpen.has(i)) animate(i, nowOpen.has(i))
      }
      setOpen(next)
    },
    [open, multiple, items.length, animate],
  )

  return (
    <div className={cn('divide-y divide-border rounded-lg border', className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(i)
        return (
          <div key={i} className="overflow-hidden">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => handleClick(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium transition-colors hover:bg-muted/50"
              >
                <span>{item.title}</span>
                <span
                  ref={(el) => {
                    chevronRefs.current[i] = el
                  }}
                  className="inline-flex shrink-0"
                  style={{ rotate: isOpen ? `${DEFAULT_ACCORDION_CHEVRON_DEG}deg` : undefined }}
                  aria-hidden
                >
                  <CaretDown size={18} weight="bold" />
                </span>
              </button>
            </h3>
            <div
              ref={(el) => {
                panelRefs.current[i] = el
              }}
              className="overflow-hidden"
              style={{ height: isOpen ? 'auto' : 0 }}
            >
              <div className="px-5 pb-5 text-sm text-muted-foreground">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
