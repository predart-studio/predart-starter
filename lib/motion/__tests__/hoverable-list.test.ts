import { describe, it, expect } from 'vitest'
import {
  buildHoverablePath,
  clamp01,
  HOVERABLE_REST_PATH,
  HOVERABLE_FULL_PATH,
  DEFAULT_HOVERABLE_BULGE,
} from '@/lib/motion/hoverable-list'

describe('buildHoverablePath', () => {
  it('renders the empty/rest path at progress 0 (fill collapsed)', () => {
    expect(buildHoverablePath({ progress: 0 })).toBe('M 0 100 V 0 Q 50 0 100 0 V 0 H 0 z')
    expect(HOVERABLE_REST_PATH).toBe('M 0 100 V 0 Q 50 0 100 0 V 0 H 0 z')
  })

  it('renders the full path at progress 1 (matches reference, bulge = +25)', () => {
    // topEdge = 100, control = 100 * (1 + 0.25) = 125
    expect(buildHoverablePath({ progress: 1 })).toBe('M 0 100 V 100 Q 50 125 100 100 V 0 H 0 z')
    expect(HOVERABLE_FULL_PATH).toBe('M 0 100 V 100 Q 50 125 100 100 V 0 H 0 z')
  })

  it('places the top edge proportionally at an intermediate progress', () => {
    // progress 0.5 -> topEdge 50, control 50 * 1.25 = 62.5
    expect(buildHoverablePath({ progress: 0.5 })).toBe('M 0 100 V 50 Q 50 62.5 100 50 V 0 H 0 z')
  })

  it('control-point bulge scales with the configured bulge factor', () => {
    const flat = buildHoverablePath({ progress: 0.5, bulge: 0 })
    // bulge 0 -> control equals top edge (no dip)
    expect(flat).toBe('M 0 100 V 50 Q 50 50 100 50 V 0 H 0 z')
    expect(DEFAULT_HOVERABLE_BULGE).toBe(0.25)
  })

  it('clamps out-of-range progress (no fill below 0, full above 1)', () => {
    expect(buildHoverablePath({ progress: -5 })).toBe(HOVERABLE_REST_PATH)
    expect(buildHoverablePath({ progress: 9 })).toBe(HOVERABLE_FULL_PATH)
  })
})

describe('clamp01', () => {
  it('clamps to [0, 1] and coerces NaN to 0', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.3)).toBe(0.3)
    expect(clamp01(2)).toBe(1)
    expect(clamp01(NaN)).toBe(0)
  })
})
