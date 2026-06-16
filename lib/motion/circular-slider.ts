/**
 * Pure geometry for a circular slider: maps an item's index (and the active
 * index) to its position on a circle (polar -> cartesian) plus the rotation that
 * keeps each card tangent to the ring, and computes how far the whole ring must
 * rotate to bring a given index to the front (top / 12 o'clock).
 *
 * Framework-free + DOM-free so it is unit-testable; the <CircularSlider> wrapper
 * feeds the result to gsap.to() (ring rotation) and to per-item static styles.
 *
 * Model: item 0 sits at the top of the circle, items step clockwise by
 * `angularStep(count)` degrees. The ring element is rotated by
 * `ringRotation(activeIndex, count)` so the active item lands at the top.
 *
 * Clean-room reference: annnimate "CircularSlider" — behavior only.
 */

export const DEFAULT_RADIUS = 300
export const DEFAULT_DURATION = 0.8
export const DEFAULT_EASE = 'back.out(1.4)'

export interface ItemPlacement {
  /** x offset from the ring center (px). */
  x: number
  /** y offset from the ring center (px). Negative = up. */
  y: number
  /** Item's own rotation (deg) so it stays tangent to the circle. */
  angle: number
}

/** Degrees between adjacent items: 360 / count. */
export function angularStep(count: number): number {
  if (count <= 0) return 0
  return 360 / count
}

/**
 * Static placement of an item on the ring, before any ring rotation is applied.
 * Item 0 is at the top (12 o'clock); positive index advances clockwise.
 * Center of the circle is the origin (0,0); +x right, +y down.
 */
export function placeItem(
  index: number,
  count: number,
  radius = DEFAULT_RADIUS,
): ItemPlacement {
  const step = angularStep(count)
  const deg = index * step
  // 0deg = top of the circle, clockwise. Convert to standard math angle.
  const rad = (deg - 90) * (Math.PI / 180)
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  return {
    x: roundish(x),
    y: roundish(y),
    angle: normalizeDeg(deg),
  }
}

/**
 * Rotation (deg) to apply to the ring element so that `activeIndex` lands at the
 * top. Bringing item N to the top means rotating the ring back by N steps.
 * Returns a continuous (non-wrapped) value tracking the running index so the
 * tween always takes the short, monotonic path the caller drives.
 */
export function ringRotation(activeIndex: number, count: number): number {
  return -activeIndex * angularStep(count)
}

/**
 * Advance the active index by `dir` (+1 = next, -1 = prev), wrapping within
 * [0, count). Returns the new active index in range.
 */
export function advanceIndex(active: number, dir: number, count: number): number {
  if (count <= 0) return 0
  return ((active + dir) % count + count) % count
}

function normalizeDeg(deg: number): number {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

function roundish(n: number): number {
  // kill floating fuzz so positions are stable / testable
  return Math.round(n * 1e6) / 1e6
}
