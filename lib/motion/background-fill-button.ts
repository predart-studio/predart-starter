/**
 * Pure state/vars builder for a straight-edge background-fill button sweep.
 * Framework-free + DOM-free so it is unit-testable; the <BackgroundFillButton>
 * wrapper feeds the result to gsap.to(fill, ...) on hover/leave.
 *
 * Studied behavior: a fill panel sits behind the label, collapsed at the BOTTOM
 * edge of the button at rest. On hover it sweeps UP — scaleY 0 -> 1 with a
 * transform-origin on the BOTTOM, so the colored panel rises from the bottom and
 * covers the button. On leave it reverses back down (origin stays BOTTOM, scaleY
 * 1 -> 0), so the panel retracts to the same bottom edge it came from. An
 * optional `flipOnLeave` flips the origin to the TOP on leave so the panel exits
 * out the opposite (top) edge instead — the text-underline origin-flip idea,
 * applied to scaleY. Enter and leave share the same duration / ease.
 *
 * Clean-room reference: annnimate "BackgroundFillButton" — behavior only.
 */

/** transform-origin y per phase. Enter always grows from the bottom. */
export const FILL_ORIGIN_BOTTOM = 'bottom' as const
export const FILL_ORIGIN_TOP = 'top' as const

export const DEFAULT_FILL_DURATION = 0.6
/** cubic-bezier(0.87, 0, 0.13, 1) ≈ easeInOutQuart, observed on the live demo. */
export const DEFAULT_FILL_EASE = 'power4.inOut'

export interface FillVarsInput {
  /** 'enter' sweeps the panel in (scaleY 0 -> 1); 'leave' retracts it (-> 0). */
  phase: 'enter' | 'leave'
  /**
   * When true, the leave phase flips the transform-origin to the TOP so the
   * panel exits out the top edge (opposite side) instead of collapsing back to
   * the bottom. Matches the live demo when false (same-side reverse).
   */
  flipOnLeave?: boolean
  duration?: number
  ease?: string
}

export interface FillVars {
  /** transformOrigin to set BEFORE the tween so the panel grows/collapses from the right edge. */
  transformOrigin: typeof FILL_ORIGIN_BOTTOM | typeof FILL_ORIGIN_TOP
  /** target scaleY for this phase. */
  scaleY: number
  duration: number
  ease: string
}

/**
 * Build the gsap vars for one phase of the background-fill sweep.
 * The wrapper sets `transformOrigin` first, then tweens `scaleY`.
 */
export function buildFillVars(input: FillVarsInput): FillVars {
  const {
    phase,
    flipOnLeave = false,
    duration = DEFAULT_FILL_DURATION,
    ease = DEFAULT_FILL_EASE,
  } = input

  const enter = phase === 'enter'
  return {
    // enter always grows from the bottom; leave collapses to the bottom unless
    // flipOnLeave, which sends it out the top edge.
    transformOrigin: enter ? FILL_ORIGIN_BOTTOM : flipOnLeave ? FILL_ORIGIN_TOP : FILL_ORIGIN_BOTTOM,
    scaleY: enter ? 1 : 0,
    duration,
    ease,
  }
}
