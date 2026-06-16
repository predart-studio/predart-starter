import { describe, it, expect } from 'vitest'
import {
  randomRotation,
  DEFAULT_RANDOM_ROTATE_MIN,
  DEFAULT_RANDOM_ROTATE_MAX,
} from '@/lib/motion/random-rotate'

describe('randomRotation', () => {
  it('is deterministic for a given index + seed', () => {
    expect(randomRotation({ index: 3, seed: 7 })).toBe(
      randomRotation({ index: 3, seed: 7 }),
    )
  })

  it('stays within the [min, max] range (inclusive bounds)', () => {
    for (let i = 0; i < 50; i++) {
      const r = randomRotation({ index: i, seed: 42, min: -10, max: 10 })
      expect(r).toBeGreaterThanOrEqual(-10)
      expect(r).toBeLessThanOrEqual(10)
    }
  })

  it('falls back to default bounds and respects custom ranges', () => {
    const def = randomRotation({ index: 5, seed: 1 })
    expect(def).toBeGreaterThanOrEqual(DEFAULT_RANDOM_ROTATE_MIN)
    expect(def).toBeLessThanOrEqual(DEFAULT_RANDOM_ROTATE_MAX)

    const wide = randomRotation({ index: 5, seed: 1, min: -30, max: 30 })
    expect(wide).toBeGreaterThanOrEqual(-30)
    expect(wide).toBeLessThanOrEqual(30)
  })

  it('produces distinct angles across indexes for the same seed', () => {
    const a = randomRotation({ index: 0, seed: 9 })
    const b = randomRotation({ index: 1, seed: 9 })
    const c = randomRotation({ index: 2, seed: 9 })
    expect(new Set([a, b, c]).size).toBe(3)
  })

  it('normalizes reversed bounds (min > max)', () => {
    const r = randomRotation({ index: 4, seed: 3, min: 10, max: -10 })
    expect(r).toBeGreaterThanOrEqual(-10)
    expect(r).toBeLessThanOrEqual(10)
  })
})
