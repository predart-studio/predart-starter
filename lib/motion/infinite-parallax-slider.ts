/**
 * Pure math for the InfiniteParallaxSlider. Two concerns, both framework-free +
 * DOM-free so they unit-test cleanly; the <InfiniteParallaxSlider> wrapper feeds
 * the results to gsap:
 *
 *   1. parallaxOffset() — given a slide's horizontal distance from the track
 *      center (px) and a parallax factor, returns the inner <img>'s x translate
 *      (px). The image drifts OPPOSITE to the slide's offset (negative sign) at a
 *      fraction of that offset, so the centered slide's image sits flush (0) and
 *      off-center slides reveal depth. The img is scaled up (imgScale) to give
 *      headroom that hides the offset behind the clipped frame.
 *
 *   2. loop math — reuses the marquee concepts (directionSign / a duration
 *      derived from travel + speed) for the infinite carousel step, plus
 *      wrapIndex() to rotate the slide order endlessly.
 *
 * Clean-room reference: annnimate "InfiniteParallaxSlider" — behavior only.
 */

export type SliderDirection = 'left' | 'right'

export const DEFAULT_INFINITE_PARALLAX_SLIDER = {
  /** Inner-image drift as a fraction of the slide's offset-from-center. Measured ≈ 1/6. */
  parallaxFactor: 1 / 6,
  /** Image upscale that masks the parallax offset behind the clipped frame. Measured 1.3. */
  imgScale: 1.3,
  /** Seconds for one carousel step (one slide advance). Measured ≈ 0.7s. */
  stepDuration: 0.7,
  /** Settle ease for a step — snappy then ease out. */
  ease: 'power3.out',
  /** Advance direction when looping. */
  direction: 'left' as const,
}

/** left → -1 (track advances toward the left edge), right → +1. */
export function directionSign(direction: SliderDirection): number {
  return direction === 'right' ? 1 : -1
}

/**
 * Inner-image x translate (px) for a slide whose center is `distFromCenter` px
 * from the track center. Drifts opposite to the offset (hence the minus) at
 * `factor` of it; a centered slide (dist 0) yields 0. Pure linear map — matches
 * the live demo's continuous recompute through the transition (no snapping).
 */
export function parallaxOffset(distFromCenter: number, factor: number): number {
  return -distFromCenter * factor
}

/**
 * Seconds for one carousel step. Longer travel and lower speed → longer step;
 * floors speed so the result is always finite and positive (never Inf / NaN).
 * Kept marquee-shaped: duration scales with distance / speed.
 */
export function stepDurationFor(stepPx: number, speed: number): number {
  const dist = Math.max(0, stepPx)
  if (dist === 0) return 0
  const safeSpeed = speed > 0 ? speed : 0.01
  return dist / (safeSpeed * 600)
}

/**
 * Rotate an index into [0, length) so the slide order wraps infinitely in either
 * direction (the "infinite" in InfiniteParallaxSlider). Handles negative offsets.
 */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return ((index % length) + length) % length
}
