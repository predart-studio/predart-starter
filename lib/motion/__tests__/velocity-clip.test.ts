import { describe, it, expect } from 'vitest'
import {
  velocityToShear,
  buildClipPolygon,
  RECT_CLIP,
  DEFAULT_VELOCITY_CLIP,
} from '@/lib/motion/velocity-clip'

describe('velocityToShear', () => {
  it('is zero at rest', () => {
    expect(velocityToShear(0)).toBe(0)
  })

  it('scales with velocity and keeps its sign', () => {
    expect(velocityToShear(300, { sensitivity: 300, maxShear: 8 })).toBe(1)
    expect(velocityToShear(-300, { sensitivity: 300, maxShear: 8 })).toBe(-1)
  })

  it('clamps to maxShear', () => {
    expect(velocityToShear(100000)).toBe(DEFAULT_VELOCITY_CLIP.maxShear)
    expect(velocityToShear(-100000)).toBe(-DEFAULT_VELOCITY_CLIP.maxShear)
  })
})

describe('buildClipPolygon', () => {
  it('is a clean rectangle at zero shear', () => {
    expect(buildClipPolygon(0)).toBe('polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)')
    expect(RECT_CLIP).toBe(buildClipPolygon(0))
  })

  it('shears the top-left/bottom-right for positive shear', () => {
    expect(buildClipPolygon(5)).toBe('polygon(0% 5%, 100% 0%, 100% 95%, 0% 100%)')
  })

  it('shears the opposite corners for negative shear', () => {
    expect(buildClipPolygon(-5)).toBe('polygon(0% 0%, 100% 5%, 100% 100%, 0% 95%)')
  })
})
