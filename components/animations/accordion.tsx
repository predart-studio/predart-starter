'use client'

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  nextOpenState,
  DEFAULT_ACCORDION_DURATION,
  DEFAULT_ACCORDION_EASE,
  DEFAULT_ACCORDION_ICON_ROTATION,
  DEFAULT_ACCORDION_STAGGER,
} from '@/lib/motion/accordion'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText)
}

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
  /** Height + icon tween duration in seconds. */
  duration?: number
  className?: string
}

/**
 * MotionAccordion — GSAP accordion, matched 1:1 to the annnimate source.
 *
 * Each item owns a paused GSAP timeline that, on open, tweens height 0 -> auto,
 * rotates the plus icon by -180deg, and fades the icon's vertical bar to 0 so
 * the "+" morphs into a "−"; the timeline is reversed on close. ~200ms after a
 * panel opens, its body text is split into lines (GSAP SplitText, line-masked)
 * and staggered up from behind the mask. Single-open by default (opening one
 * collapses the rest) — the open-set transition is the pure nextOpenState()
 * reducer. Content renders server-side (no-JS readable, no layout shift); JS
 * layers the motion on top. Respects prefers-reduced-motion: panels toggle
 * instantly, no height/icon/text animation.
 *
 * Do NOT also bind Framer Motion to a panel's height or the icon's transform.
 *
 * Reference: official annnimate "Accordion" source — height 0<->auto on a
 * play/reverse timeline (expo.inOut, 0.8s), iconRotation -180, vertical-bar
 * fade, and the SplitText line stagger (0.6s dur, 0.15 stagger, expo.out,
 * yPercent 110, 200ms start delay).
 */
export function MotionAccordion({
  items,
  multiple = false,
  defaultOpen = [0],
  duration = DEFAULT_ACCORDION_DURATION,
  className,
}: MotionAccordionProps) {
  const [open, setOpen] = useState<number[]>(() =>
    defaultOpen.filter((i) => i >= 0 && i < items.length),
  )

  const handleClick = useCallback(
    (index: number) => {
      setOpen((prev) => nextOpenState({ open: prev, index, multiple }))
    },
    [multiple],
  )

  return (
    <div className={cn('divide-y divide-border rounded-lg border', className)}>
      {items.map((item, i) => (
        <AccordionRow
          key={i}
          title={item.title}
          content={item.content}
          isOpen={open.includes(i)}
          duration={duration}
          onToggle={() => handleClick(i)}
        />
      ))}
    </div>
  )
}

function AccordionRow({
  title,
  content,
  isOpen,
  duration,
  onToggle,
}: {
  title: ReactNode
  content: ReactNode
  isOpen: boolean
  duration: number
  onToggle: () => void
}) {
  const prefersReduced = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const vBarRef = useRef<SVGLineElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const splitRef = useRef<SplitText | null>(null)
  const textTweenRef = useRef<gsap.core.Tween | null>(null)

  // Captured ONCE for the SSR / first-paint seed. The inline styles below must
  // not change on toggle, or React would re-apply them mid-tween and fight GSAP
  // (and poison the tweens' captured start values). After mount GSAP owns these
  // properties exclusively; React only tracks isOpen for aria + coordination.
  const initiallyOpen = useRef(isOpen).current
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  const animateStagger = useCallback(() => {
    if (prefersReduced) return
    const inner = innerRef.current
    if (!inner || typeof SplitText === 'undefined') return
    // Tear down any previous split first.
    textTweenRef.current?.kill()
    splitRef.current?.revert()

    splitRef.current = new SplitText(inner, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'accordion_split_line',
    })
    const lines = splitRef.current.lines
    gsap.set(lines, { yPercent: DEFAULT_ACCORDION_STAGGER.yPercent, force3D: true })
    textTweenRef.current = gsap.to(lines, {
      yPercent: 0,
      duration: DEFAULT_ACCORDION_STAGGER.duration,
      stagger: DEFAULT_ACCORDION_STAGGER.delay,
      ease: DEFAULT_ACCORDION_STAGGER.ease,
      force3D: true,
    })
  }, [prefersReduced])

  const resetStagger = useCallback(() => {
    textTweenRef.current?.kill()
    textTweenRef.current = null
    splitRef.current?.revert()
    splitRef.current = null
  }, [])

  // Build the paused open/close timeline once (rebuild on duration change).
  useEffect(() => {
    if (prefersReduced) return
    const panel = panelRef.current
    if (!panel) return

    const ctx = gsap.context(() => {
      // Seed the CLOSED state first so the timeline's .to() tweens capture the
      // correct start values (height 0, icon 0deg, bar visible) regardless of
      // the inline first-paint seed — then progress(1) jumps an open row to end.
      gsap.set(panel, { height: 0, overflow: 'hidden', force3D: true })
      if (iconRef.current) gsap.set(iconRef.current, { rotation: 0 })
      if (vBarRef.current) gsap.set(vBarRef.current, { opacity: 1 })

      const tl = gsap.timeline({ paused: true, defaults: { duration, ease: DEFAULT_ACCORDION_EASE } })
      tl.to(panel, { height: 'auto', duration, ease: DEFAULT_ACCORDION_EASE }, 0)
      if (iconRef.current) {
        tl.to(iconRef.current, { rotation: DEFAULT_ACCORDION_ICON_ROTATION, duration, ease: DEFAULT_ACCORDION_EASE }, 0)
      }
      if (vBarRef.current) {
        // Fade the vertical bar mid-tween so "+" becomes "−".
        tl.to(vBarRef.current, { opacity: 0, duration: duration * 0.5, ease: 'power2.inOut' }, duration * 0.25)
      }
      tlRef.current = tl
      // If this row starts open, jump to the settled state (no open animation).
      if (isOpenRef.current) tl.progress(1)
    }, panel)

    return () => {
      ctx.revert()
      tlRef.current = null
    }
    // Intentionally not keyed on isOpen — the timeline persists across toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, prefersReduced])

  // React to open-state changes: play / reverse + run / reset the text stagger.
  useEffect(() => {
    if (prefersReduced) {
      const panel = panelRef.current
      if (panel) gsap.set(panel, { height: isOpen ? 'auto' : 0, overflow: 'hidden' })
      if (iconRef.current) gsap.set(iconRef.current, { rotation: isOpen ? DEFAULT_ACCORDION_ICON_ROTATION : 0 })
      if (vBarRef.current) gsap.set(vBarRef.current, { opacity: isOpen ? 0 : 1 })
      return
    }

    const tl = tlRef.current
    if (!tl) return

    if (isOpen) {
      tl.play()
      const id = window.setTimeout(() => {
        if (typeof document !== 'undefined' && document.fonts?.ready) {
          document.fonts.ready.then(animateStagger)
        } else {
          animateStagger()
        }
      }, DEFAULT_ACCORDION_STAGGER.startDelay)
      return () => window.clearTimeout(id)
    }

    tl.reverse()
    resetStagger()
  }, [isOpen, prefersReduced, animateStagger, resetStagger])

  // Revert any live split on unmount.
  useEffect(() => () => resetStagger(), [resetStagger])

  return (
    <div className="overflow-hidden">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium transition-colors hover:bg-muted/50"
        >
          <span>{title}</span>
          <span
            ref={iconRef}
            className="inline-flex shrink-0"
            style={{ rotate: initiallyOpen ? `${DEFAULT_ACCORDION_ICON_ROTATION}deg` : undefined }}
            aria-hidden
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {/* Horizontal bar — always visible (the "−"). */}
              <line x1="2.5" y1="8" x2="13.5" y2="8" />
              {/* Vertical bar — fades out on open so "+" morphs to "−". */}
              <line
                ref={vBarRef}
                x1="8"
                y1="2.5"
                x2="8"
                y2="13.5"
                style={{ opacity: initiallyOpen ? 0 : 1 }}
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        ref={panelRef}
        className="overflow-hidden"
        style={{ height: initiallyOpen ? 'auto' : 0 }}
      >
        <div ref={innerRef} className="px-5 pb-5 text-sm text-muted-foreground">
          {content}
        </div>
      </div>
    </div>
  )
}
