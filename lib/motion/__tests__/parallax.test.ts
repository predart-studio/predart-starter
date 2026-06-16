import { describe, it, expect } from 'vitest'
import { parallaxYPercent, DEFAULT_PARALLAX } from '@/lib/motion/parallax'

describe('parallaxYPercent', () => {
  it('is neutral (0) at mid-viewport progress 0.5', () => {
    // toBeCloseTo treats -0 and 0 as equal (negative speed yields -0).
    expect(parallaxYPercent(0.5, DEFAULT_PARALLAX.speed)).toBeCloseTo(0)
    expect(parallaxYPercent(0.5, 1)).toBeCloseTo(0)
    expect(parallaxYPercent(0.5, -3.7)).toBeCloseTo(0)
  })

  it('gives opposite signs at progress 0 and 1', () => {
    const at0 = parallaxYPercent(0, DEFAULT_PARALLAX.speed)
    const at1 = parallaxYPercent(1, DEFAULT_PARALLAX.speed)
    expect(Math.sign(at0)).toBe(-Math.sign(at1))
    expect(at0).not.toBe(0)
    expect(at1).not.toBe(0)
  })

  it('scales magnitude with |speed|', () => {
    const small = Math.abs(parallaxYPercent(1, -0.2))
    const large = Math.abs(parallaxYPercent(1, -0.8))
    expect(large).toBeGreaterThan(small)
    // 4x the speed magnitude → 4x the translate magnitude
    expect(large).toBeCloseTo(small * 4)
  })

  it('clamps out-of-range progress to [0, 1]', () => {
    expect(parallaxYPercent(-5, 1)).toBe(parallaxYPercent(0, 1))
    expect(parallaxYPercent(99, 1)).toBe(parallaxYPercent(1, 1))
  })
})
