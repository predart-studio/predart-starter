/**
 * Pure reveal-order math for the Character Appear effect. Given a character
 * count and an order mode, returns the per-character stagger delay (seconds),
 * indexed by the character's original position. Random order uses a seeded PRNG
 * so it is deterministic and unit-testable. Framework-free + DOM-free; the
 * <CharacterAppear> wrapper feeds these delays to a GSAP stagger function.
 *
 * Clean-room reference: annnimate "Character Appear" — behavior only.
 */
export type CharAppearOrder = 'sequential' | 'random'

export interface CharAppearDelaysInput {
  count: number
  order?: CharAppearOrder
  /** Seconds between consecutive character reveals. */
  step?: number
  /** Seed for deterministic random order. */
  seed?: number
}

// Observed on the reference demo: data-anm-stagger="0.02", random scatter default.
export const DEFAULT_CHAR_APPEAR = { step: 0.02, seed: 1 } as const

/** Small deterministic PRNG (mulberry32). */
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

/** Returns a permutation of [0..count-1] — the order characters reveal in. */
export function buildRevealOrder(
  count: number,
  order: CharAppearOrder = 'sequential',
  seed: number = DEFAULT_CHAR_APPEAR.seed,
): number[] {
  const idx = Array.from({ length: count }, (_, i) => i)
  if (order === 'sequential') return idx
  const rand = mulberry32(seed)
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

/**
 * Delay (seconds) for each character, indexed by its original position.
 * delay[originalIndex] = positionInRevealOrder * step.
 */
export function buildRevealDelays(input: CharAppearDelaysInput): number[] {
  const {
    count,
    order = 'sequential',
    step = DEFAULT_CHAR_APPEAR.step,
    seed = DEFAULT_CHAR_APPEAR.seed,
  } = input
  const revealOrder = buildRevealOrder(count, order, seed)
  const delays = new Array<number>(count)
  revealOrder.forEach((originalIndex, position) => {
    delays[originalIndex] = position * step
  })
  return delays
}
