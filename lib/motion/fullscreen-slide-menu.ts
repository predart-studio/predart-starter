/**
 * Pure planners for the Fullscreen Slide Menu effect. Frame-free + DOM-free so
 * they are unit-testable; the <FullscreenSlideMenu> wrapper feeds the results to
 * gsap.to() / gsap.timeline().
 *
 * Two pieces of extractable logic:
 *  1. `buildOverlayVars` — the GSAP "from" vars for the fullscreen panel that
 *     slides up to cover the viewport (yPercent 100 -> 0) plus its mirror "to"
 *     vars for the close reverse.
 *  2. `planLinkStagger` — per-link reveal delays so nav links mask-slide in one
 *     after another once the panel has settled.
 *
 * Observed on the live demo (1200x800): the menu layer is revealed by a full-
 * viewport panel motion lasting ~1.1s on an in-out acceleration curve (slow
 * start ~180ms, midpoint ~0.6s, settle ~1.1s); close reverses the same path on
 * the same edge. Nav links read as a top-to-bottom diagonal stagger. Reduced
 * motion snaps straight to the covered final state with all links visible.
 *
 * Clean-room reference: annnimate "FullscreenSlideMenu" — behavior only.
 */

export interface OverlayVarsInput {
  /** Total panel slide duration, seconds. */
  duration?: number
  /** GSAP ease for the panel slide. */
  ease?: string
  /** Edge the panel slides from. 'bottom' => yPercent 100 -> 0 (observed). */
  from?: 'top' | 'bottom' | 'left' | 'right'
}

export interface LinkStaggerInput {
  /** Number of nav links to reveal. */
  count: number
  /** Seconds between consecutive links. */
  stagger?: number
  /** Delay before the first link starts (lets the panel settle first), seconds. */
  startDelay?: number
}

// Observed defaults (rounded from the live capture).
export const DEFAULT_OVERLAY_DURATION = 1.0
export const DEFAULT_OVERLAY_EASE = 'power3.inOut'
export const DEFAULT_OVERLAY_FROM = 'bottom' as const
export const DEFAULT_LINK_STAGGER = 0.08
export const DEFAULT_LINK_START_DELAY = 0.35
export const DEFAULT_LINK_DURATION = 0.6
export const DEFAULT_LINK_EASE = 'power3.out'

/**
 * Map a slide edge to the GSAP transform key + its hidden value. The panel is
 * full-viewport, so a percentage transform reads as a clean off-screen slide.
 */
export function edgeToHiddenVars(from: OverlayVarsInput['from'] = DEFAULT_OVERLAY_FROM): {
  axis: 'xPercent' | 'yPercent'
  hidden: number
} {
  switch (from) {
    case 'top':
      return { axis: 'yPercent', hidden: -100 }
    case 'left':
      return { axis: 'xPercent', hidden: -100 }
    case 'right':
      return { axis: 'xPercent', hidden: 100 }
    case 'bottom':
    default:
      return { axis: 'yPercent', hidden: 100 }
  }
}

/**
 * Build the panel slide vars. `hidden` is the gsap.set state (off-screen),
 * `shown` is the open tween target (covering the viewport), and `closed` mirrors
 * `hidden` for the close reverse — same edge, same duration/ease.
 */
export function buildOverlayVars(input: OverlayVarsInput = {}) {
  const {
    duration = DEFAULT_OVERLAY_DURATION,
    ease = DEFAULT_OVERLAY_EASE,
    from = DEFAULT_OVERLAY_FROM,
  } = input
  const { axis, hidden } = edgeToHiddenVars(from)

  return {
    axis,
    hidden: { [axis]: hidden } as Record<string, number>,
    shown: { [axis]: 0, duration, ease } as Record<string, number | string>,
    closed: { [axis]: hidden, duration, ease } as Record<string, number | string>,
  }
}

/**
 * Per-link reveal plan: each link's absolute start time (seconds from the open
 * timeline origin). Monotonically increasing; index 0 starts at `startDelay`.
 */
export function planLinkStagger(input: LinkStaggerInput): number[] {
  const {
    count,
    stagger = DEFAULT_LINK_STAGGER,
    startDelay = DEFAULT_LINK_START_DELAY,
  } = input
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => startDelay + i * stagger)
}
