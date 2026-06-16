import { describe, it, expect } from 'vitest'
import {
  computeTilt,
  buildFlipVars,
  DEFAULT_TILT_MAX_X,
  DEFAULT_TILT_MAX_Y,
  DEFAULT_FLIP_ROTATION,
  DEFAULT_FLIP_DURATION,
} from '@/lib/motion/card-3d-flip'

const rect = { left: 100, top: 100, width: 400, height: 200 } // center = (300, 200)

describe('computeTilt', () => {
  it('returns zero tilt when the pointer is at the card center', () => {
    const t = computeTilt({ pointer: { x: 300, y: 200 }, rect })
    expect(t.rotateX).toBe(0)
    expect(t.rotateY).toBe(0)
  })

  it('saturates to ±max at the edges with correct signs', () => {
    // top-right corner: pointer above center → +rotateX, right of center → +rotateY
    const tr = computeTilt({ pointer: { x: 500, y: 100 }, rect })
    expect(tr.rotateX).toBeCloseTo(DEFAULT_TILT_MAX_X)
    expect(tr.rotateY).toBeCloseTo(DEFAULT_TILT_MAX_Y)

    // bottom-left corner: below center → -rotateX, left of center → -rotateY
    const bl = computeTilt({ pointer: { x: 100, y: 300 }, rect })
    expect(bl.rotateX).toBeCloseTo(-DEFAULT_TILT_MAX_X)
    expect(bl.rotateY).toBeCloseTo(-DEFAULT_TILT_MAX_Y)
  })

  it('clamps pointers outside the card to the max angle (no overshoot)', () => {
    const t = computeTilt({ pointer: { x: 99999, y: -99999 }, rect })
    expect(t.rotateY).toBeLessThanOrEqual(DEFAULT_TILT_MAX_Y)
    expect(t.rotateX).toBeLessThanOrEqual(DEFAULT_TILT_MAX_X)
    expect(Math.abs(t.rotateY)).toBeCloseTo(DEFAULT_TILT_MAX_Y)
    expect(Math.abs(t.rotateX)).toBeCloseTo(DEFAULT_TILT_MAX_X)
  })

  it('respects custom max angles', () => {
    const t = computeTilt({ pointer: { x: 500, y: 100 }, rect, maxX: 12, maxY: 8 })
    expect(t.rotateX).toBeCloseTo(12)
    expect(t.rotateY).toBeCloseTo(8)
  })

  it('scales linearly between center and edge', () => {
    // halfway to the right edge → half the max yaw
    const half = computeTilt({ pointer: { x: 400, y: 200 }, rect })
    expect(half.rotateY).toBeCloseTo(DEFAULT_TILT_MAX_Y / 2)
    expect(half.rotateX).toBe(0)
  })
})

describe('buildFlipVars', () => {
  it('applies sensible defaults', () => {
    const v = buildFlipVars()
    expect(v.rotateY).toBe(DEFAULT_FLIP_ROTATION)
    expect(v.duration).toBe(DEFAULT_FLIP_DURATION)
    expect(typeof v.ease).toBe('string')
  })

  it('respects passed params', () => {
    const v = buildFlipVars({ rotation: -180, duration: 1, ease: 'expo.out' })
    expect(v.rotateY).toBe(-180)
    expect(v.duration).toBe(1)
    expect(v.ease).toBe('expo.out')
  })
})
