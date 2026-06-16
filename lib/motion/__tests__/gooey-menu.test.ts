import { describe, it, expect } from 'vitest'
import {
  computeGooeyItemOffset,
  DEFAULT_GOOEY_RADIUS,
} from '@/lib/motion/gooey-menu'

describe('computeGooeyItemOffset', () => {
  it('reproduces the observed 5-item fan (radius 70, 160° spread)', () => {
    // Observed translations from the live sandbox, in DOM order.
    const expected = [
      { x: -68.94, y: -12.16 }, // 170°
      { x: -45.0, y: -53.62 }, //  130°
      { x: 0, y: -70 }, //        90° (straight up)
      { x: 45.0, y: -53.62 }, //  50°
      { x: 68.94, y: -12.16 }, //  10°
    ]
    expected.forEach((want, i) => {
      const got = computeGooeyItemOffset({ index: i, count: 5 })
      expect(got.x).toBeCloseTo(want.x, 1)
      expect(got.y).toBeCloseTo(want.y, 1)
    })
  })

  it('places a lone item straight up at the center angle', () => {
    const got = computeGooeyItemOffset({ index: 0, count: 1 })
    expect(got.x).toBeCloseTo(0, 5)
    expect(got.y).toBeCloseTo(-DEFAULT_GOOEY_RADIUS, 5)
  })

  it('keeps every item on the same radius from the FAB center', () => {
    const count = 4
    for (let i = 0; i < count; i++) {
      const { x, y } = computeGooeyItemOffset({ index: i, count })
      expect(Math.hypot(x, y)).toBeCloseTo(DEFAULT_GOOEY_RADIUS, 5)
    }
  })

  it('is symmetric about the vertical axis for an odd count', () => {
    const count = 5
    const first = computeGooeyItemOffset({ index: 0, count })
    const last = computeGooeyItemOffset({ index: count - 1, count })
    // Mirror images: opposite x, same y.
    expect(first.x).toBeCloseTo(-last.x, 5)
    expect(first.y).toBeCloseTo(last.y, 5)
  })

  it('honors custom radius and spread', () => {
    const got = computeGooeyItemOffset({
      index: 0,
      count: 1,
      radius: 100,
    })
    expect(Math.hypot(got.x, got.y)).toBeCloseTo(100, 5)
  })
})
