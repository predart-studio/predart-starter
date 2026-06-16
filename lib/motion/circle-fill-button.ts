/**
 * Pure geometry for the circle-fill hover effect. Given the pointer's entry
 * point (relative to the button box) and the button's size, computes the scale
 * a small origin circle must reach to fully cover the button — the radius is the
 * distance from the entry point to the FARTHEST corner, converted to a scale
 * factor against the circle's base radius (plus a small safety margin so the
 * easing tail never reveals an uncovered edge). Framework-free + DOM-free so it
 * is unit-testable; the <CircleFillButton> wrapper feeds the result to gsap.to().
 *
 * Clean-room reference: annnimate "CircleFillButton" — behavior only.
 */
export interface Point {
  x: number
  y: number
}

export interface CoverScaleInput {
  /** Pointer entry point, in button-local coordinates (0,0 = top-left). */
  origin: Point
  /** Button width in px. */
  width: number
  /** Button height in px. */
  height: number
  /** Diameter of the un-scaled origin circle in px. */
  circleSize?: number
  /** Extra multiplier so the easing tail fully covers the button. */
  safety?: number
}

/** Base diameter of the origin circle (matches the studied demo). */
export const DEFAULT_CIRCLE_SIZE = 24

/** Coverage safety margin — final scale is the exact-cover scale times this. */
export const DEFAULT_COVER_SAFETY = 1.08

/** Enter (fill) duration in seconds. */
export const DEFAULT_FILL_DURATION = 0.6

/** Leave (shrink) duration in seconds. */
export const DEFAULT_LEAVE_DURATION = 0.5

/** Decelerating ease for both fill and shrink (snappy then settle). */
export const DEFAULT_FILL_EASE = 'power2.out'

/**
 * The scale the origin circle must reach to cover the whole button from `origin`.
 * radius needed = distance to the farthest of the four corners; scale = that
 * radius / the circle's own radius, then padded by `safety`.
 */
export function computeCoverScale(input: CoverScaleInput): number {
  const {
    origin,
    width,
    height,
    circleSize = DEFAULT_CIRCLE_SIZE,
    safety = DEFAULT_COVER_SAFETY,
  } = input

  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  ]

  let maxDist = 0
  for (const c of corners) {
    const dx = c.x - origin.x
    const dy = c.y - origin.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d > maxDist) maxDist = d
  }

  const baseRadius = circleSize / 2
  // Guard against a zero/negative circle size.
  if (baseRadius <= 0) return 0

  return (maxDist / baseRadius) * safety
}
