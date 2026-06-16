import { describe, it, expect } from 'vitest'
import {
  charPhaseOffset,
  charPhaseRadians,
  buildShimmerWavePlan,
  DEFAULT_SHIMMER_PERIOD,
  DEFAULT_SHIMMER_WAVES,
} from '@/lib/motion/text-shimmer-wave'

describe('charPhaseOffset', () => {
  it('crests char 0 at t=0 and increases the offset per index (wave travels)', () => {
    const count = 8
    expect(charPhaseOffset(0, count)).toBe(0)
    const o1 = charPhaseOffset(1, count)
    const o2 = charPhaseOffset(2, count)
    expect(o1).toBeGreaterThan(0)
    expect(o2).toBeGreaterThan(o1)
  })

  it('spreads one full wave evenly across the string over the period', () => {
    const count = 4
    // waves=1: offsets are 0, P/4, P/2, 3P/4
    const P = DEFAULT_SHIMMER_PERIOD
    expect(charPhaseOffset(0, count)).toBeCloseTo(0)
    expect(charPhaseOffset(1, count)).toBeCloseTo(P / 4)
    expect(charPhaseOffset(2, count)).toBeCloseTo(P / 2)
    expect(charPhaseOffset(3, count)).toBeCloseTo((3 * P) / 4)
  })

  it('wraps the phase within one period (never reaches or exceeds the period)', () => {
    const count = 10
    for (let i = 0; i < count; i++) {
      const off = charPhaseOffset(i, count)
      expect(off).toBeGreaterThanOrEqual(0)
      expect(off).toBeLessThan(DEFAULT_SHIMMER_PERIOD)
    }
  })

  it('honors a custom period', () => {
    expect(charPhaseOffset(1, 2, 4)).toBeCloseTo(2) // half of period 4
  })

  it('returns 0 for an empty/invalid count', () => {
    expect(charPhaseOffset(0, 0)).toBe(0)
    expect(charPhaseRadians(3, 0)).toBe(0)
  })
})

describe('charPhaseRadians', () => {
  it('maps index 0 to 0 and the midpoint to ~PI for a single wave', () => {
    expect(charPhaseRadians(0, 8)).toBeCloseTo(0)
    expect(charPhaseRadians(4, 8)).toBeCloseTo(Math.PI) // halfway = trough
  })
})

describe('buildShimmerWavePlan', () => {
  it('produces one offset per char and the default period', () => {
    const plan = buildShimmerWavePlan({ count: 5 })
    expect(plan.offsets).toHaveLength(5)
    expect(plan.period).toBe(DEFAULT_SHIMMER_PERIOD)
    expect(plan.offsets[0]).toBe(0)
  })

  it('uses defaults (waves) when not provided', () => {
    const plan = buildShimmerWavePlan({ count: 3 })
    const manual = [0, 1, 2].map((i) =>
      charPhaseOffset(i, 3, DEFAULT_SHIMMER_PERIOD, DEFAULT_SHIMMER_WAVES),
    )
    expect(plan.offsets).toEqual(manual)
  })

  it('emits monotonically increasing offsets across a single wave', () => {
    const plan = buildShimmerWavePlan({ count: 6 })
    for (let i = 1; i < plan.offsets.length; i++) {
      expect(plan.offsets[i]).toBeGreaterThan(plan.offsets[i - 1])
    }
  })
})
