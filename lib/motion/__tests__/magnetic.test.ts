import { describe, it, expect } from 'vitest'
import { computeMagneticOffset } from '@/lib/motion/magnetic'

const rect = { left: 100, top: 100, width: 200, height: 100 } // center = (200, 150)

describe('computeMagneticOffset', () => {
  it('returns zero offset when the pointer is at the element center', () => {
    expect(computeMagneticOffset({ x: 200, y: 150 }, rect, 25)).toEqual({ x: 0, y: 0 })
  })

  it('pulls toward the pointer (positive x when pointer is to the right)', () => {
    const off = computeMagneticOffset({ x: 280, y: 150 }, rect, 50)
    expect(off.x).toBeGreaterThan(0)
    expect(off.y).toBe(0)
  })

  it('scales with strength (higher strength = larger offset)', () => {
    const weak = computeMagneticOffset({ x: 280, y: 150 }, rect, 25)
    const strong = computeMagneticOffset({ x: 280, y: 150 }, rect, 75)
    expect(Math.abs(strong.x)).toBeGreaterThan(Math.abs(weak.x))
  })

  it('clamps the offset to at most half the element size', () => {
    const off = computeMagneticOffset({ x: 100000, y: 100000 }, rect, 100)
    expect(off.x).toBeLessThanOrEqual(rect.width / 2)
    expect(off.y).toBeLessThanOrEqual(rect.height / 2)
  })
})
