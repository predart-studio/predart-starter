import { describe, it, expect } from 'vitest'
import {
  parallaxOffset,
  directionSign,
  stepDurationFor,
  wrapIndex,
  DEFAULT_INFINITE_PARALLAX_SLIDER,
} from '@/lib/motion/infinite-parallax-slider'

describe('parallaxOffset', () => {
  it('is zero for the centered slide regardless of factor', () => {
    expect(parallaxOffset(0, 1 / 6)).toBeCloseTo(0, 10)
    expect(parallaxOffset(0, 0.5)).toBeCloseTo(0, 10)
  })

  it('drifts opposite to the slide offset (negative sign)', () => {
    expect(parallaxOffset(405, 1 / 6)).toBeLessThan(0) // slide right of center → img drifts left
    expect(parallaxOffset(-405, 1 / 6)).toBeGreaterThan(0) // slide left of center → img drifts right
  })

  it('matches the measured ≈ -1/6 ratio from the live demo', () => {
    // demo: distFromCenter 405 → imgTx -67.6
    expect(parallaxOffset(405, 1 / 6)).toBeCloseTo(-67.5, 1)
  })

  it('scales linearly with distance', () => {
    const near = Math.abs(parallaxOffset(200, 1 / 6))
    const far = Math.abs(parallaxOffset(800, 1 / 6))
    expect(far).toBeCloseTo(near * 4, 5)
  })
})

describe('directionSign', () => {
  it('maps left → -1 and right → +1', () => {
    expect(directionSign('left')).toBe(-1)
    expect(directionSign('right')).toBe(1)
  })
})

describe('stepDurationFor', () => {
  it('returns 0 for a non-positive step', () => {
    expect(stepDurationFor(0, 2)).toBe(0)
    expect(stepDurationFor(-50, 2)).toBe(0)
  })

  it('is always finite and positive even with a non-positive speed', () => {
    const d = stepDurationFor(400, 0)
    expect(Number.isFinite(d)).toBe(true)
    expect(d).toBeGreaterThan(0)
  })

  it('grows with step distance and shrinks with speed', () => {
    expect(stepDurationFor(800, 2)).toBeGreaterThan(stepDurationFor(400, 2))
    expect(stepDurationFor(400, 4)).toBeLessThan(stepDurationFor(400, 2))
  })
})

describe('wrapIndex', () => {
  it('wraps positive overflow and negative underflow into range', () => {
    expect(wrapIndex(6, 6)).toBe(0)
    expect(wrapIndex(7, 6)).toBe(1)
    expect(wrapIndex(-1, 6)).toBe(5)
    expect(wrapIndex(2, 6)).toBe(2)
  })

  it('is safe for an empty set', () => {
    expect(wrapIndex(3, 0)).toBe(0)
  })
})

describe('defaults', () => {
  it('match the studied values', () => {
    expect(DEFAULT_INFINITE_PARALLAX_SLIDER.parallaxFactor).toBeCloseTo(1 / 6, 5)
    expect(DEFAULT_INFINITE_PARALLAX_SLIDER.imgScale).toBe(1.3)
    expect(DEFAULT_INFINITE_PARALLAX_SLIDER.direction).toBe('left')
  })
})
