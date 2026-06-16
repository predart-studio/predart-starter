/**
 * Pure marquee timing math. Computes the direction sign and the per-loop
 * duration for an infinite horizontal marquee, given the rendered track width
 * and a speed factor. Framework-free + DOM-free so it is unit-testable; the
 * <Marquee> wrapper feeds the result to gsap.to().
 *
 * Clean-room reference: annnimate "Marquee" — behavior only.
 */
export type MarqueeDirection = 'left' | 'right'

export const DEFAULT_MARQUEE = {
  speed: 2,
  direction: 'left' as const,
  pauseOnHover: false,
}

/** left → -1 (content travels toward the left edge), right → +1. */
export function directionSign(direction: MarqueeDirection): number {
  return direction === 'right' ? 1 : -1
}

/**
 * Seconds for one full track width to traverse at the given speed. Higher speed
 * = shorter duration; wider track = longer duration. Guards a non-positive speed
 * by clamping to a small floor so the result is always a finite positive number
 * (never Infinity / NaN). A non-positive width yields 0 (nothing to scroll).
 */
export function loopDuration(trackWidthPx: number, speed: number): number {
  const width = Math.max(0, trackWidthPx)
  if (width === 0) return 0
  const safeSpeed = speed > 0 ? speed : 0.01
  return width / (safeSpeed * 100)
}
