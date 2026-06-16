import { describe, it, expect } from 'vitest'
import {
  computeCoverScale,
  DEFAULT_CIRCLE_SIZE,
  DEFAULT_COVER_SAFETY,
} from '@/lib/motion/circle-fill-button'

const W = 310
const H = 54

describe('computeCoverScale', () => {
  it('needs a LARGER scale from a corner than from the center', () => {
    const center = computeCoverScale({ origin: { x: W / 2, y: H / 2 }, width: W, height: H })
    const corner = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H })
    expect(corner).toBeGreaterThan(center)
  })

  it('covers the button from the center (radius = half-diagonal × safety)', () => {
    const scale = computeCoverScale({ origin: { x: W / 2, y: H / 2 }, width: W, height: H })
    const halfDiag = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2)
    const expected = (halfDiag / (DEFAULT_CIRCLE_SIZE / 2)) * DEFAULT_COVER_SAFETY
    expect(scale).toBeCloseTo(expected, 5)
  })

  it('covers the button from a corner (radius = full diagonal × safety)', () => {
    const scale = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H })
    const fullDiag = Math.sqrt(W ** 2 + H ** 2)
    const expected = (fullDiag / (DEFAULT_CIRCLE_SIZE / 2)) * DEFAULT_COVER_SAFETY
    expect(scale).toBeCloseTo(expected, 5)
  })

  it('scales inversely with circle size (bigger origin circle needs less scale)', () => {
    const small = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H, circleSize: 12 })
    const big = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H, circleSize: 48 })
    expect(small).toBeGreaterThan(big)
  })

  it('applies the safety margin above the exact-cover scale', () => {
    const safe = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H, safety: 1.2 })
    const exact = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H, safety: 1 })
    expect(safe).toBeCloseTo(exact * 1.2, 5)
  })

  it('returns 0 for a degenerate (zero-size) circle instead of Infinity', () => {
    const scale = computeCoverScale({ origin: { x: 0, y: 0 }, width: W, height: H, circleSize: 0 })
    expect(scale).toBe(0)
  })
})
