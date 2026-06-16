import { describe, it, expect } from 'vitest'
import {
  dissolveDisplacement,
  dissolveAlphaMatrix,
  dissolveOpacity,
  buildDissolveFrame,
  DEFAULT_MAX_DISPLACEMENT,
  DEFAULT_EDGE_HARDNESS,
} from '@/lib/motion/image-dissolve-scroll'

describe('dissolveDisplacement', () => {
  it('is zero (intact) at progress 0', () => {
    expect(dissolveDisplacement({ progress: 0 })).toBe(0)
  })

  it('peaks mid-dissolve, not at the very end (warp collapses with the image)', () => {
    const mid = dissolveDisplacement({ progress: 0.6 })
    const end = dissolveDisplacement({ progress: 1 })
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeGreaterThan(end)
    expect(mid).toBeLessThanOrEqual(DEFAULT_MAX_DISPLACEMENT)
  })

  it('scales with maxDisplacement', () => {
    const small = dissolveDisplacement({ progress: 0.5, maxDisplacement: 50 })
    const big = dissolveDisplacement({ progress: 0.5, maxDisplacement: 200 })
    expect(big).toBeGreaterThan(small)
  })
})

describe('dissolveAlphaMatrix', () => {
  it('leaves alpha intact at progress 0 (no threshold)', () => {
    // alpha row = [..., slope, intercept]; intercept must be 0 at p=0.
    const m = dissolveAlphaMatrix({ progress: 0 }).split(' ').map(Number)
    expect(m[18]).toBe(DEFAULT_EDGE_HARDNESS) // slope
    expect(m[19]).toBe(0) // intercept (no pixels eaten)
  })

  it('raises the threshold monotonically with progress (more pixels eaten)', () => {
    const intercept = (p: number) => Number(dissolveAlphaMatrix({ progress: p }).split(' ')[19])
    // intercept = -slope*threshold, threshold rises with p, so intercept falls.
    expect(intercept(0.25)).toBeGreaterThan(intercept(0.5))
    expect(intercept(0.5)).toBeGreaterThan(intercept(1))
  })
})

describe('dissolveOpacity', () => {
  it('is fully visible until the tail of the range', () => {
    expect(dissolveOpacity({ progress: 0 })).toBe(1)
    expect(dissolveOpacity({ progress: 0.5 })).toBe(1)
    expect(dissolveOpacity({ progress: 0.85 })).toBe(1)
  })

  it('fades to zero (fully dissolved) at progress 1', () => {
    expect(dissolveOpacity({ progress: 1 })).toBe(0)
  })
})

describe('clamping', () => {
  it('clamps out-of-range progress', () => {
    expect(dissolveDisplacement({ progress: -5 })).toBe(0)
    expect(dissolveOpacity({ progress: 5 })).toBe(0)
    // negative progress -> threshold 0 -> intercept 0 (intact)
    expect(Number(dissolveAlphaMatrix({ progress: -1 }).split(' ')[19])).toBe(0)
  })
})

describe('buildDissolveFrame', () => {
  it('returns intact frame at progress 0 and dissolved frame at 1', () => {
    const intact = buildDissolveFrame({ progress: 0 })
    expect(intact.displacement).toBe(0)
    expect(intact.opacity).toBe(1)

    const gone = buildDissolveFrame({ progress: 1 })
    expect(gone.opacity).toBe(0)
    expect(typeof gone.alphaMatrix).toBe('string')
  })
})
