import { describe, it, expect } from 'vitest'
import {
  ringCircumference,
  clampProgress,
  progressDashoffset,
  progressPercent,
  DEFAULT_PROGRESS_RADIUS,
} from '@/lib/motion/progress'

describe('ringCircumference', () => {
  it('computes 2*pi*r', () => {
    expect(ringCircumference(99)).toBeCloseTo(622.0353454, 5)
  })
})

describe('progressDashoffset', () => {
  const c = ringCircumference(DEFAULT_PROGRESS_RADIUS)

  it('is the full circumference at progress 0 (empty ring)', () => {
    expect(progressDashoffset(0, DEFAULT_PROGRESS_RADIUS)).toBeCloseTo(c, 5)
  })

  it('is 0 at progress 1 (full ring)', () => {
    expect(progressDashoffset(1, DEFAULT_PROGRESS_RADIUS)).toBeCloseTo(0, 5)
  })

  it('is half the circumference at progress 0.5', () => {
    expect(progressDashoffset(0.5, DEFAULT_PROGRESS_RADIUS)).toBeCloseTo(c / 2, 5)
  })

  it('is linear with progress (monotonically decreasing)', () => {
    const a = progressDashoffset(0.25, DEFAULT_PROGRESS_RADIUS)
    const b = progressDashoffset(0.75, DEFAULT_PROGRESS_RADIUS)
    expect(a).toBeGreaterThan(b)
  })

  it('clamps out-of-range progress', () => {
    expect(progressDashoffset(-1, DEFAULT_PROGRESS_RADIUS)).toBeCloseTo(c, 5)
    expect(progressDashoffset(2, DEFAULT_PROGRESS_RADIUS)).toBeCloseTo(0, 5)
  })
})

describe('progressPercent', () => {
  it('maps 0/0.5/1 → 0/50/100', () => {
    expect(progressPercent(0)).toBe(0)
    expect(progressPercent(0.5)).toBe(50)
    expect(progressPercent(1)).toBe(100)
  })

  it('rounds to the nearest integer and clamps', () => {
    expect(progressPercent(0.294)).toBe(29)
    expect(progressPercent(1.4)).toBe(100)
    expect(progressPercent(-0.2)).toBe(0)
  })
})

describe('clampProgress', () => {
  it('clamps and guards NaN', () => {
    expect(clampProgress(-5)).toBe(0)
    expect(clampProgress(5)).toBe(1)
    expect(clampProgress(0.42)).toBe(0.42)
    expect(clampProgress(NaN)).toBe(0)
  })
})
