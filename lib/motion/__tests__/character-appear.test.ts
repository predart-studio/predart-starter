import { describe, it, expect } from 'vitest'
import {
  buildRevealOrder,
  buildRevealDelays,
} from '@/lib/motion/character-appear'

describe('buildRevealOrder', () => {
  it('is the identity order when sequential', () => {
    expect(buildRevealOrder(4, 'sequential')).toEqual([0, 1, 2, 3])
  })

  it('returns a valid permutation when random', () => {
    const order = buildRevealOrder(6, 'random', 42)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('is deterministic for a fixed seed', () => {
    expect(buildRevealOrder(8, 'random', 7)).toEqual(
      buildRevealOrder(8, 'random', 7),
    )
  })
})

describe('buildRevealDelays', () => {
  it('staggers sequential characters by step', () => {
    expect(buildRevealDelays({ count: 3, step: 0.1 })).toEqual([0, 0.1, 0.2])
  })

  it('keeps one delay per character, all non-negative', () => {
    const delays = buildRevealDelays({ count: 5, order: 'random', step: 0.05 })
    expect(delays).toHaveLength(5)
    expect(delays.every((d) => d >= 0)).toBe(true)
  })
})
