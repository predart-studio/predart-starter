/**
 * Direction-aware show/hide decision for a sticky header. Framework-free +
 * DOM-free so it is unit-testable; the HideHeader wrapper calls
 * decideHeaderState() inside ScrollTrigger.onUpdate and feeds the result to
 * gsap.to() (translateY 0 vs -100%).
 *
 * Behavior observed: scrolling DOWN past a threshold hides the bar (slides up
 * out of view), scrolling UP reveals it, and while the page is at/above the
 * threshold the bar is always pinned visible. The threshold keeps the header
 * put near the very top so it never flickers in the hero.
 *
 * Clean-room reference: annnimate "HideHeader" — behavior only.
 */

export type HeaderState = 'show' | 'hide'

/** Scroll direction as reported by ScrollTrigger.direction (1 = down, -1 = up). */
export type ScrollDirection = 1 | -1

export interface HeaderDecisionInput {
  /** Direction of the latest scroll: 1 = down, -1 = up. */
  direction: ScrollDirection
  /** Current scroll position in px. */
  scrollY: number
  /** Below this scroll position the header always stays visible. */
  threshold: number
}

/** Default px before the header is allowed to hide on scroll-down. */
export const DEFAULT_HIDE_THRESHOLD = 80

/** Default transition duration (s). CSS source used 0.4s. */
export const DEFAULT_HIDE_DURATION = 0.4

/**
 * Default ease — a slight overshoot, mapping the observed CSS
 * cubic-bezier(0.34, 1.56, 0.64, 1) to GSAP's back.out.
 */
export const DEFAULT_HIDE_EASE = 'back.out(1.7)'

/**
 * Decide whether the header should be shown or hidden.
 *
 * - At/above the threshold: always `show` (header pinned visible near the top).
 * - Past the threshold, scrolling down: `hide`.
 * - Past the threshold, scrolling up: `show`.
 */
export function decideHeaderState({
  direction,
  scrollY,
  threshold,
}: HeaderDecisionInput): HeaderState {
  if (scrollY <= threshold) return 'show'
  return direction === 1 ? 'hide' : 'show'
}

/**
 * Build the gsap.to() vars for a given target state. `hidden` translates the
 * bar up by its full height (-100%); `show` returns it to rest.
 */
export function buildHideHeaderVars(
  state: HeaderState,
  duration: number = DEFAULT_HIDE_DURATION,
  ease: string = DEFAULT_HIDE_EASE,
) {
  return {
    yPercent: state === 'hide' ? -100 : 0,
    duration,
    ease,
  }
}
