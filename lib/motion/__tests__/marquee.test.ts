import { describe, it, expect } from 'vitest'
import {
  directionSign,
  loopDuration,
  DEFAULT_MARQUEE,
} from '@/lib/motion/marquee'

describe('directionSign', () => {
  it('returns -1 for left', () => {
    expect(directionSign('left')).toBe(-1)
  })

  it('returns +1 for right', () => {
    expect(directionSign('right')).toBe(1)
  })
})

describe('loopDuration', () => {
  it('scales linearly with track width', () => {
    const narrow = loopDuration(500, 2)
    const wide = loopDuration(1000, 2)
    expect(wide).toBeCloseTo(narrow * 2)
  })

  it('scales inversely with speed (faster = shorter duration)', () => {
    const slow = loopDuration(1000, 1)
    const fast = loopDuration(1000, 4)
    expect(fast).toBeLessThan(slow)
    expect(fast).toBeCloseTo(slow / 4)
  })

  it('matches the documented unit width / (speed * 100)', () => {
    expect(loopDuration(1000, 2)).toBeCloseTo(1000 / (2 * 100))
  })

  it('guards zero speed without producing Infinity or NaN', () => {
    const d = loopDuration(1000, 0)
    expect(Number.isFinite(d)).toBe(true)
    expect(Number.isNaN(d)).toBe(false)
    expect(d).toBeGreaterThan(0)
  })

  it('guards negative speed without producing Infinity or NaN', () => {
    const d = loopDuration(1000, -5)
    expect(Number.isFinite(d)).toBe(true)
    expect(d).toBeGreaterThan(0)
  })

  it('returns 0 for a non-positive track width (nothing to scroll)', () => {
    expect(loopDuration(0, 2)).toBe(0)
    expect(loopDuration(-100, 2)).toBe(0)
  })

  it('exposes sensible defaults', () => {
    expect(DEFAULT_MARQUEE).toEqual({
      speed: 2,
      direction: 'left',
      pauseOnHover: false,
    })
  })
})
