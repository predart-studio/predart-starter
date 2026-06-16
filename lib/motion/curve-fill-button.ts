/**
 * Path geometry for the "curve fill button" hover fill. The button owns a
 * full-bleed <svg viewBox="0 0 100 100" preserveAspectRatio="none"> whose single
 * <path> morphs its `d` string so a coloured fill sweeps UP from the bottom on
 * hover, led by a curved (quadratic) front edge, and drains back down on leave.
 * Framework-free + DOM-free so it is unit-testable; the CurveFillButton wrapper
 * feeds the result to a gsap.to() proxy whose onUpdate rewrites the path `d`.
 *
 * Progress model (`p`):
 *   p = 0  -> fill collapsed flat at the BOTTOM (y=100). Button reads as its base
 *             colour, no fill. Path: `M 0 100 V 100 Q 50 100 100 100 V 100 z`.
 *   p = 1  -> fill covers the whole button. Leading top edge at y=0 with the
 *             quadratic control bulging UP to y=-25 (the curved front sweeping
 *             past the top). Path: `M 0 100 V 0 Q 50 -25 100 0 V 0 H 0 z`.
 *
 * The leading edge rises to viewBox-y = 100 - 100*p (bottom-up). The quadratic
 * control point sits `DIP * p` units ABOVE that edge (negative y = above, since
 * y grows downward), so the fill front leads with an upward-bulging curve that is
 * flat at rest and deepest when full. The "liquid"/lag feel during the sweep
 * comes from the overshoot ease the wrapper tweens the proxy with (back.out),
 * not from the geometry. Reduced motion renders the final static state by passing
 * p directly (no tween, no morph).
 *
 * Clean-room reference: annnimate "CurveFillButton" — behavior only.
 */

export interface CurveFillPathInput {
  /** Fill progress, 0 (empty/bottom) -> 1 (full/covered). Clamped. */
  progress: number
  /**
   * How far (in viewBox units) the quadratic control point bulges ABOVE the
   * leading edge at full fill — the curved front. 0 = flat (straight) edge.
   * Scales with progress so the edge is flat at rest and most curved when full.
   */
  dip?: number
}

/** Default curve depth — control point reaches y = -25 (25 units above the edge) at full fill. */
export const DEFAULT_CURVE_FILL_DIP = 25

/** Rise/drain duration (s) for the fill on hover/leave. */
export const DEFAULT_CURVE_FILL_DURATION = 0.6

/** Ease for the fill rise / drain — overshooting "liquid" front (snappy lead, settle). */
export const DEFAULT_CURVE_FILL_EASE = 'back.out(1.4)'

/** Fill colour of the front (annnimate orange). Override via the wrapper prop. */
export const DEFAULT_CURVE_FILL_COLOR = '#FF4200'

/** Base (resting) button colour observed on the reference (peach). */
export const DEFAULT_CURVE_FILL_BASE = '#FF885E'

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/**
 * Build the SVG path `d` for a given fill progress.
 *
 * Geometry (viewBox 0..100 both axes; y grows downward):
 *   - bottom edge anchored at y=100
 *   - leading top edge at y = 100 - 100*p  (rises bottom-up as p -> 1)
 *   - quadratic control at (50, topEdge - dip*p): bulges `dip*p` units above the
 *     edge, giving the curved fill front (flat at p=0, deepest at p=1).
 */
export function buildCurveFillPath(input: CurveFillPathInput): string {
  const { progress, dip = DEFAULT_CURVE_FILL_DIP } = input
  const p = clamp01(progress)
  const topEdge = 100 - 100 * p
  const control = topEdge - dip * p
  const fmt = (n: number) => Number(n.toFixed(4)).toString()
  return `M 0 100 V ${fmt(topEdge)} Q 50 ${fmt(control)} 100 ${fmt(topEdge)} V 0 H 0 z`
}

/** The resting (empty) path — flat collapsed line at the bottom (matches reference rest). */
export const CURVE_FILL_REST_PATH = buildCurveFillPath({ progress: 0 })

/** The fully-filled path — curved front bulged above the top (reduced-motion / settled hover). */
export const CURVE_FILL_FULL_PATH = buildCurveFillPath({ progress: 1 })
