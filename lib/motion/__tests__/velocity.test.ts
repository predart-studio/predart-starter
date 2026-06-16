import { describe, it, expect } from 'vitest'
import { velocityToSkew } from '@/lib/motion/velocity'

describe('velocityToSkew', () => {
  it('is zero at zero velocity', () => {
    expect(velocityToSkew(0)).toBe(0)
  })

  it('produces positive skew for positive velocity, negative for negative', () => {
    expect(velocityToSkew(1000)).toBeGreaterThan(0)
    expect(velocityToSkew(-1000)).toBeLessThan(0)
  })

  it('clamps to +/- max (default 10deg)', () => {
    expect(velocityToSkew(1_000_000)).toBe(10)
    expect(velocityToSkew(-1_000_000)).toBe(-10)
  })

  it('respects custom max and scale', () => {
    expect(velocityToSkew(1_000_000, 20)).toBe(20)
    const a = velocityToSkew(500, 10, 0.002)
    const b = velocityToSkew(500, 10, 0.01)
    expect(Math.abs(b)).toBeGreaterThan(Math.abs(a))
  })
})
