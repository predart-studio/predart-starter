'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  resolveCursorConfig,
  resolveCursorState,
  type CustomCursorConfig,
} from '@/lib/motion/custom-cursor'
import { cn } from '@/lib/utils'

interface CustomCursorProps {
  children: ReactNode
  /**
   * Selector (within this scope) for elements that activate the cursor's
   * hover state. Defaults to `[data-cursor-hover]`. Such elements may also set
   * `data-cursor-text`, `data-cursor-bg`, `data-cursor-color` to turn the dot
   * into a labelled pill.
   */
  hoverSelector?: string
  /** Override the studied follow/scale/colour defaults. */
  config?: Partial<CustomCursorConfig>
  className?: string
}

/**
 * CustomCursor — GSAP smoothed pointer follower (container-scoped).
 *
 * Wraps a region so a custom dot trails the pointer with quickTo smoothing
 * (studied: duration 0.7, ease expo.out) and reacts to hovering interactive
 * elements: a plain `[data-cursor-hover]` target grows the dot to `hoverScale`,
 * while a target carrying `data-cursor-text` expands it into a labelled pill
 * (optionally recoloured via `data-cursor-bg` / `data-cursor-color`). The
 * native cursor is hidden ONLY inside this container's bounds, so the rest of
 * the page (and the /lab grid) keeps its normal pointer.
 *
 * Desktop-only: the effect mounts nothing unless `(pointer: fine)` matches, so
 * touch devices keep their native behaviour. Respects prefers-reduced-motion —
 * under reduced motion NO follower is created and the native cursor stays.
 *
 * Do NOT also bind Framer Motion to the follower's transform (x/y) — the two
 * libraries will fight over the matrix.
 *
 * Clean-room reference: annnimate "CustomCursor" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function CustomCursor({
  children,
  hoverSelector = '[data-cursor-hover]',
  config: configOverrides,
  className,
}: CustomCursorProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    // Desktop-only: skip touch / coarse pointers entirely.
    if (
      typeof window === 'undefined' ||
      !window.matchMedia?.('(pointer: fine)').matches
    ) {
      return
    }

    const scope = scopeRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!scope || !dot || !label) return

    const config = resolveCursorConfig(configOverrides)

    const ctx = gsap.context(() => {
      gsap.set(dot, {
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        scale: 1,
      })

      const xTo = gsap.quickTo(dot, 'x', {
        duration: config.followDuration,
        ease: config.followEase,
      })
      const yTo = gsap.quickTo(dot, 'y', {
        duration: config.followDuration,
        ease: config.followEase,
      })

      const onMove = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
      }

      const applyState = (target: HTMLElement | null) => {
        const data = target
          ? {
              text: target.getAttribute('data-cursor-text'),
              bg: target.getAttribute('data-cursor-bg'),
              color: target.getAttribute('data-cursor-color'),
            }
          : null
        const state = resolveCursorState(data, config)
        label.textContent = state.text
        gsap.to(dot, {
          scale: state.scale,
          backgroundColor: state.bg,
          color: state.color,
          paddingLeft: state.mode === 'text' ? 16 : 0,
          paddingRight: state.mode === 'text' ? 16 : 0,
          duration: config.stateDuration,
          ease: config.stateEase,
        })
      }

      const onEnterScope = () => gsap.to(dot, { autoAlpha: 1, duration: 0.25 })
      const onLeaveScope = () => {
        gsap.to(dot, { autoAlpha: 0, duration: 0.25 })
        applyState(null)
      }

      const targets = Array.from(
        scope.querySelectorAll<HTMLElement>(hoverSelector),
      )
      const targetCleanups = targets.map((t) => {
        const onEnter = () => applyState(t)
        const onLeave = () => applyState(null)
        t.addEventListener('pointerenter', onEnter)
        t.addEventListener('pointerleave', onLeave)
        return () => {
          t.removeEventListener('pointerenter', onEnter)
          t.removeEventListener('pointerleave', onLeave)
        }
      })

      scope.addEventListener('pointermove', onMove)
      scope.addEventListener('pointerenter', onEnterScope)
      scope.addEventListener('pointerleave', onLeaveScope)

      return () => {
        scope.removeEventListener('pointermove', onMove)
        scope.removeEventListener('pointerenter', onEnterScope)
        scope.removeEventListener('pointerleave', onLeaveScope)
        targetCleanups.forEach((off) => off())
      }
    }, scope)

    return () => ctx.revert()
  }, [hoverSelector, configOverrides, prefersReduced])

  return (
    <div
      ref={scopeRef}
      className={cn(
        'relative [&_[data-cursor-hover]]:cursor-none',
        // hide the native cursor only within this scope on fine pointers
        '[@media(pointer:fine)]:cursor-none',
        className,
      )}
    >
      {children}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 flex min-h-3 min-w-3 items-center justify-center whitespace-nowrap rounded-full bg-foreground text-[13px] leading-none text-background opacity-0"
      >
        <span ref={labelRef} />
      </div>
    </div>
  )
}
