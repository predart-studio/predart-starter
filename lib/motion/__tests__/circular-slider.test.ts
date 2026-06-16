import { describe, it, expect } from 'vitest'
import {
  angularStep,
  placeItem,
  ringRotation,
  advanceIndex,
  DEFAULT_RADIUS,
} from '@/lib/motion/circular-slider'

describe('angularStep', () => {
  it('divides the circle evenly by item count', () => {
    expect(angularStep(16)).toBeCloseTo(22.5)
    expect(angularStep(4)).toBe(90)
    expect(angularStep(8)).toBe(45)
  })

  it('returns 0 for a non-positive count', () => {
    expect(angularStep(0)).toBe(0)
  })
})

describe('placeItem', () => {
  it('puts item 0 at the top of the circle (x=0, y=-radius)', () => {
    const p = placeItem(0, 8, 300)
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(-300)
    expect(p.angle).toBe(0)
  })

  it('places items clockwise: a quarter-turn item sits at 3 o\'clock', () => {
    // count 4 -> step 90deg; index 1 is one quarter turn clockwise = right edge
    const p = placeItem(1, 4, 300)
    expect(p.x).toBeCloseTo(300) // right
    expect(p.y).toBeCloseTo(0)
    expect(p.angle).toBe(90)
  })

  it('keeps every item on the circle (distance from center == radius)', () => {
    for (let i = 0; i < 16; i++) {
      const p = placeItem(i, 16, DEFAULT_RADIUS)
      const dist = Math.hypot(p.x, p.y)
      expect(dist).toBeCloseTo(DEFAULT_RADIUS, 4)
    }
  })

  it('spaces adjacent items by exactly one angular step', () => {
    expect(placeItem(3, 16, 300).angle - placeItem(2, 16, 300).angle).toBeCloseTo(22.5)
  })
})

describe('ringRotation', () => {
  it('is zero when the first item is active', () => {
    expect(ringRotation(0, 16)).toBeCloseTo(0)
  })

  it('rotates the ring back by one step per index so the active item reaches the top', () => {
    expect(ringRotation(1, 16)).toBeCloseTo(-22.5)
    expect(ringRotation(2, 16)).toBeCloseTo(-45)
  })
})

describe('advanceIndex', () => {
  it('advances forward by one', () => {
    expect(advanceIndex(0, 1, 16)).toBe(1)
  })

  it('wraps around the end going forward', () => {
    expect(advanceIndex(15, 1, 16)).toBe(0)
  })

  it('wraps around the start going backward', () => {
    expect(advanceIndex(0, -1, 16)).toBe(15)
  })
})
