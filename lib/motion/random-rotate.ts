/**
 * Pure random-rotation math for the Random Rotate effect. Maps an element's
 * (index, seed) into a target rotation (degrees) drawn from a [min, max] range
 * using a seeded PRNG (mulberry32) — so a given index+seed always yields the
 * same angle. This makes the "random" target deterministic, unit-testable, and
 * stable between server and client render (no Math.random at render time).
 * Framework-free + DOM-free; the <RandomRotate> wrapper feeds the result to
 * gsap.to({ rotation }).
 *
 * Clean-room reference: annnimate "RandomRotate" — behavior only.
 */
export interface RandomRotateInput {
  /** Per-element index — distinct indexes get distinct angles for one seed. */
  index: number
  /** Seed for deterministic output. */
  seed?: number
  /** Lower bound of the random rotation, in degrees. */
  min?: number
  /** Upper bound of the random rotation, in degrees. */
  max?: number
}

// Observed on the reference demo: data-anm-min=-10, data-anm-max=10,
// data-anm-duration=0.4, data-anm-ease="back.out(1.7)". Hover-driven: enter →
// random angle in [min,max]; leave → back to the element's initial rotation.
export const DEFAULT_RANDOM_ROTATE_MIN = -10
export const DEFAULT_RANDOM_ROTATE_MAX = 10
export const DEFAULT_RANDOM_ROTATE_DURATION = 0.4
export const DEFAULT_RANDOM_ROTATE_EASE = 'back.out(1.7)'
export const DEFAULT_RANDOM_ROTATE_SEED = 1

/** Small deterministic PRNG (mulberry32) — mirrors character-appear.ts. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministic target rotation (degrees) for an element, drawn from [min, max].
 * The PRNG is advanced `index + 1` times so each index yields a distinct,
 * reproducible angle for a given seed.
 */
export function randomRotation(input: RandomRotateInput): number {
  const {
    index,
    seed = DEFAULT_RANDOM_ROTATE_SEED,
    min = DEFAULT_RANDOM_ROTATE_MIN,
    max = DEFAULT_RANDOM_ROTATE_MAX,
  } = input
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const rand = mulberry32(seed)
  let r = 0
  for (let i = 0; i <= index; i++) r = rand()
  return lo + r * (hi - lo)
}
