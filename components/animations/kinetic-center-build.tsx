'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  computeCenteredPositions,
  buildKineticCenterBuildVars,
  KINETIC_CENTER_BUILD_ENTER_EASE_ID,
  KINETIC_CENTER_BUILD_ENTER_EASE_PATH,
} from '@/lib/motion/kinetic-center-build'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0.8, 0.2, 1) — registered once, reused by every instance.
  CustomEase.create(KINETIC_CENTER_BUILD_ENTER_EASE_ID, KINETIC_CENTER_BUILD_ENTER_EASE_PATH)
}

interface KineticCenterBuildProps {
  text: string
  /**
   * - `load`  : build once on mount.
   * - `scroll`: build when it scrolls into view (default).
   * - `hover` : re-build on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Push duration for each incoming word (seconds). */
  duration?: number
  /** Build cadence — delay between consecutive word entries (seconds). */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * KineticCenterBuild — a centered phrase assembled word by word. The first word
 * appears centered; each following word enters from the right with a soft blur
 * and pushes the existing line LEFT until the full phrase locks centered. GSAP +
 * CustomEase, element-scoped. Apple-keynote kinetic editorial typography.
 *
 * Layout-aware (unlike a plain stagger): words are absolutely centered inside a
 * relative inline host and animated by measured x, so the line physically slides
 * to stay centered as it grows — it reads as one moving line, not three isolated
 * reveals. The component splits the text, renders each word into an absolutely
 * centered span, measures widths, computes centered x positions via
 * `computeCenteredPositions`, then sequences a timeline: the incoming word enters
 * from targetX + entryOffset while already-placed words slide from their old x to
 * their new centered x (a soft reflow blur mid-push smooths the motion). After
 * each push, words snap to exact poses to avoid accumulated engine drift.
 *
 * Renders the full text server-side (no layout shift, no-JS / screen-reader safe
 * — the kinetic spans exist only during the animation and are torn down on
 * cleanup). Respects prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from PerWordCrossfade (words fade in place, no re-centering):
 * KineticCenterBuild moves the whole line as each word lands.
 *
 * Clean-room reference: pixel-point/animate-text `kinetic-center-build` —
 * behavior only. One-shot ENTER build via standard GSAP (the catalog phrase loop
 * is demo-only). Do NOT also bind Framer Motion to these spans'
 * transform/opacity/filter.
 */
export function KineticCenterBuild({
  text = 'Words push left.',
  trigger = 'scroll',
  duration = 0.43,
  stagger = 0.09,
  className,
  as: Tag = 'span',
}: KineticCenterBuildProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const vars = buildKineticCenterBuildVars({ duration, stagger })
    const { from, to, entryOffset, wordGap, reflowBlur } = vars

    const words = splitWords(text)
      .filter((u) => u.isWord)
      .map((u) => u.text)
    if (words.length === 0) return

    // Host becomes a relative inline stage; words are absolutely centered inside
    // it and positioned by transform only (no browser reflow drives the build).
    el.textContent = ''
    el.style.position = 'relative'
    el.style.display = 'inline-block'
    el.style.whiteSpace = 'nowrap'

    const spans = words.map((word) => {
      const s = document.createElement('span')
      s.textContent = word
      s.style.position = 'absolute'
      s.style.left = '50%'
      s.style.top = '50%'
      s.style.whiteSpace = 'nowrap'
      s.style.willChange = 'transform, opacity, filter'
      // Centered origin: translate(-50%, -50%) is the base; gsap x/y add to it.
      s.style.transform = 'translate(-50%, -50%)'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      const build = (extra: Record<string, unknown> = {}) => {
        const tl = gsap.timeline(extra)

        // Reset: every word parked off-stage, invisible.
        gsap.set(spans, { ...from, xPercent: -50, yPercent: -50 })

        let placed: number[] = [] // current x of each already-placed word

        words.forEach((_, i) => {
          const widths = spans.slice(0, i + 1).map((s) => s.offsetWidth)
          const targets = computeCenteredPositions(widths, wordGap)
          const incoming = spans[i]
          const incomingTargetX = targets[i]

          // The incoming word: enter from the right (targetX + entryOffset),
          // dissolving its blur/scale/opacity as it lands on its centered x.
          gsap.set(incoming, { x: incomingTargetX + entryOffset })
          tl.to(
            incoming,
            { ...to, x: incomingTargetX },
            i === 0 ? 0 : `+=${stagger}`,
          )

          // Already-placed words slide from their old x to their new centered x,
          // picking up a soft reflow blur mid-push so the shove feels smooth.
          if (i > 0) {
            const start = `<` // align with the incoming word's tween start
            spans.slice(0, i).forEach((s, j) => {
              const fromX = placed[j]
              const toX = targets[j]
              if (fromX === toX) return
              tl.to(
                s,
                {
                  keyframes: [
                    { filter: `blur(${reflowBlur}px)`, duration: to.duration * 0.52 },
                    { x: toX, filter: 'blur(0px)', duration: to.duration * 0.48 },
                  ],
                  ease: to.ease,
                },
                start,
              )
              // Drive x across the whole push (the keyframes above only animate
              // blur on the first segment; this carries x the full distance).
              tl.to(s, { x: toX, duration: to.duration, ease: to.ease }, start)
            })
          }

          placed = targets
        })

        // Snap to exact final poses to clear any accumulated engine drift.
        const finalWidths = spans.map((s) => s.offsetWidth)
        const finalX = computeCenteredPositions(finalWidths, wordGap)
        tl.add(() => {
          spans.forEach((s, i) => {
            gsap.set(s, { x: finalX[i], y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' })
          })
        })

        return tl
      }

      if (trigger === 'hover') {
        const onEnter = () => build()
        el.addEventListener('mouseenter', onEnter)
        return () => el.removeEventListener('mouseenter', onEnter)
      }
      if (trigger === 'scroll') {
        build({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        return
      }
      build() // 'load'
    }, el)

    return () => {
      ctx.revert()
      // Restore plain text + clear the imperative stage styles on cleanup.
      el.textContent = text
      el.style.position = ''
      el.style.display = ''
      el.style.whiteSpace = ''
    }
  }, [text, trigger, duration, stagger, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
