/**
 * Pure spawn-decision logic for a pointer image-trail. Given the distance the
 * pointer has travelled since the last spawn and a running spawn counter, it
 * decides whether a new trail image should drop and which image from the pool
 * to use (round-robin). Framework-free + DOM-free so it is unit-testable; the
 * <ImageTrail> wrapper feeds the result to gsap.set()/gsap.to().
 *
 * Observed behavior (annnimate "ImageTrail"): a fresh <img> is dropped at the
 * pointer roughly every ~50px of travel; the pool of source images cycles in
 * order; each dropped image scales in from 0 with a slight overshoot, holds,
 * then scales back to 0 and is removed (~1s total lifetime, opacity constant).
 *
 * Clean-room reference: annnimate "ImageTrail" — behavior only.
 */

/** Pointer travel (px) required before another trail image is dropped. */
export const DEFAULT_TRAIL_THRESHOLD = 50

/** Number of distinct source images cycled through. */
export const DEFAULT_TRAIL_POOL_SIZE = 5

/** Scale-in duration (s) — image grows from 0 with a back.out overshoot. */
export const DEFAULT_TRAIL_IN_DURATION = 0.5

/** Scale-out duration (s) — image collapses back to 0 before removal. */
export const DEFAULT_TRAIL_OUT_DURATION = 0.5

/** Peak overshoot scale reached on entrance before settling to 1. */
export const DEFAULT_TRAIL_OVERSHOOT = 1.12

export interface Point {
  x: number
  y: number
}

/** Euclidean distance between two points. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Should a new trail image spawn given how far the pointer has moved since the
 * last spawn? True once travel meets or exceeds the threshold.
 */
export function shouldSpawn(
  travelSinceLastSpawn: number,
  threshold = DEFAULT_TRAIL_THRESHOLD,
): boolean {
  return travelSinceLastSpawn >= threshold
}

/**
 * Which image index in the pool to use for spawn number `spawnCount`
 * (0-based). Wraps round-robin across the pool.
 */
export function poolIndex(
  spawnCount: number,
  poolSize = DEFAULT_TRAIL_POOL_SIZE,
): number {
  if (poolSize <= 0) return 0
  // guard against negative counts wrapping to negative indices
  return ((spawnCount % poolSize) + poolSize) % poolSize
}
