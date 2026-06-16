/**
 * Pure magnetic-offset math. Given a pointer position, the element's bounding
 * rect, and a strength (0-100), returns how far the element should shift toward
 * the pointer — clamped so it never travels more than half its own size.
 * Framework-free + DOM-free so it is unit-testable; the <Magnetic> wrapper
 * feeds the result to gsap.quickTo().
 *
 * Clean-room reference: annnimate "Magnetic Button" — behavior only.
 */
export interface Point {
  x: number
  y: number
}

export interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

export function computeMagneticOffset(
  pointer: Point,
  rect: RectLike,
  strength = 25,
): Point {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const factor = strength / 100
  const rawX = (pointer.x - centerX) * factor
  const rawY = (pointer.y - centerY) * factor
  const maxX = rect.width / 2
  const maxY = rect.height / 2
  return {
    x: Math.max(-maxX, Math.min(maxX, rawX)),
    y: Math.max(-maxY, Math.min(maxY, rawY)),
  }
}
