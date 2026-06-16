import { describe, it, expect } from 'vitest'
import {
  multiFlipState,
  multiFlipGathered,
  multiFlipScattered,
  DEFAULT_MULTI_FLIP,
} from '@/lib/motion/multi-flip'

const COUNT = 4

describe('multiFlipState', () => {
  it('at progress 0 equals the gathered (stacked) state', () => {
    for (let i = 0; i < COUNT; i++) {
      expect(multiFlipState(0, i, COUNT)).toEqual(multiFlipGathered(i))
    }
  })

  it('at progress 1 equals the scattered state', () => {
    for (let i = 0; i < COUNT; i++) {
      expect(multiFlipState(1, i, COUNT)).toEqual(multiFlipScattered(i, COUNT))
    }
  })

  it('keeps scale constant at 1 across the whole range', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      expect(multiFlipState(p, 2, COUNT).scale).toBe(1)
    }
  })

  it('clamps progress outside [0,1] to the boundary states', () => {
    expect(multiFlipState(-3, 1, COUNT)).toEqual(multiFlipGathered(1))
    expect(multiFlipState(9, 1, COUNT)).toEqual(multiFlipScattered(1, COUNT))
  })

  it('diverges per index: cards scatter to distinct positions', () => {
    const seen = new Set<string>()
    for (let i = 0; i < COUNT; i++) {
      const s = multiFlipScattered(i, COUNT)
      seen.add(`${s.x},${s.y}`)
    }
    expect(seen.size).toBe(COUNT)
  })

  it('scatter pushes cards farther from the gather origin than the rest state', () => {
    // Total spread (sum of |x|) should grow from gathered to scattered.
    const dist = (p: number) =>
      Array.from({ length: COUNT }, (_, i) => Math.abs(multiFlipState(p, i, COUNT).x))
        .reduce((a, b) => a + b, 0)
    expect(dist(1)).toBeGreaterThan(dist(0))
  })

  it('respects a custom spread config (bigger spread = bigger scatter)', () => {
    const tight = multiFlipScattered(1, COUNT, { spread: 100 })
    const wide = multiFlipScattered(1, COUNT, { spread: 600 })
    const mag = (s: { x: number; y: number }) => Math.hypot(s.x, s.y)
    expect(mag(wide)).toBeGreaterThan(mag(tight))
  })

  it('exposes sane defaults', () => {
    expect(DEFAULT_MULTI_FLIP.spread).toBeGreaterThan(0)
    expect(DEFAULT_MULTI_FLIP.maxRotation).toBeGreaterThan(0)
  })
})
