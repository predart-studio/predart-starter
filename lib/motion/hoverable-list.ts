/**
 * Path geometry for the "hoverable list" liquid-fill indicator. Each row owns a
 * full-bleed <svg viewBox="0 0 100 100" preserveAspectRatio="none"> whose single
 * <path> morphs its `d` string so an orange fill rises from the bottom on hover
 * and drains back down on leave. Framework-free + DOM-free so it is unit-testable;
 * the HoverableList wrapper feeds the result to gsap.quickTo()-driven path updates.
 *
 * Progress model (`p`):
 *   p = 0  -> fill collapsed at the BOTTOM (row reads as plain text, no fill)
 *   p = 1  -> fill covers the whole row
 * The fill's top edge sweeps up to viewBox-y = (100 * p), leading with a curved
 * (quadratic) edge that bulges ~0.25 * topEdge units below the edge mid-sweep —
 * the "liquid"/curtain feel. Reduced motion renders the final static state by
 * passing p directly (no tween, no morph).
 *
 * Clean-room reference: annnimate "HoverableList" — behavior only.
 */

export interface HoverablePathInput {
  /** Fill progress, 0 (empty/bottom) → 1 (full). Clamped. */
  progress: number
  /**
   * How far (in viewBox units, proportional to the top edge) the quadratic
   * control point dips below the leading edge — the bulge. 0 = flat edge.
   */
  bulge?: number
}

/** Default bulge factor observed on the reference (control y ≈ topEdge * 1.25). */
export const DEFAULT_HOVERABLE_BULGE = 0.25

/** Tween duration (s) for the fill rise on hover. */
export const DEFAULT_HOVERABLE_DURATION = 0.42

/** Ease for the fill rise / drain (snappy-in, settle-out). */
export const DEFAULT_HOVERABLE_EASE = 'power3.out'

/** Fill colour of the indicator (annnimate orange). Override via CSS `color`. */
export const DEFAULT_HOVERABLE_FILL = '#FF4200'

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/**
 * Build the SVG path `d` for a given fill progress.
 *
 * Geometry (viewBox 0..100 on both axes; y grows downward):
 *   - bottom edge anchored at y=100
 *   - leading top edge at y = 100 - 100*p  (rises as p → 1)
 *   - quadratic control point dips `bulge * topEdge` units below the edge
 *     midway across, giving the liquid sweep.
 */
export function buildHoverablePath(input: HoverablePathInput): string {
  const { progress, bulge = DEFAULT_HOVERABLE_BULGE } = input
  const p = clamp01(progress)
  // topEdge: 0 when empty (collapsed at top per reference rest state), 100 when full.
  const topEdge = 100 * p
  const control = topEdge + bulge * topEdge
  const fmt = (n: number) => Number(n.toFixed(4)).toString()
  return `M 0 100 V ${fmt(topEdge)} Q 50 ${fmt(control)} 100 ${fmt(topEdge)} V 0 H 0 z`
}

/** The resting (empty) path — matches the reference's untouched rows. */
export const HOVERABLE_REST_PATH = buildHoverablePath({ progress: 0 })

/** The fully-filled path — the reduced-motion / settled hover state. */
export const HOVERABLE_FULL_PATH = buildHoverablePath({ progress: 1 })
