import { describe, it, expect } from 'vitest'
import {
  buildElementRevealVars,
  directionOffset,
  DEFAULT_REVEAL_DISTANCE,
  DEFAULT_REVEAL_DURATION,
  DEFAULT_REVEAL_EASE,
  DEFAULT_REVEAL_STAGGER,
} from '@/lib/motion/element-reveal'

describe('directionOffset', () => {
  it("'up' starts below (positive y, zero x)", () => {
    expect(directionOffset('up', 50)).toEqual({ x: 0, y: 50 })
  })

  it("'down' starts above (negative y, zero x)", () => {
    expect(directionOffset('down', 50)).toEqual({ x: 0, y: -50 })
  })

  it("'left' starts to the right (positive x, zero y)", () => {
    expect(directionOffset('left', 50)).toEqual({ x: 50, y: 0 })
  })

  it("'right' starts to the left (negative x, zero y)", () => {
    expect(directionOffset('right', 50)).toEqual({ x: -50, y: 0 })
  })
})

describe('buildElementRevealVars', () => {
  it('applies the studied defaults (y:+50, opacity 0, 0.6s power2.out)', () => {
    const vars = buildElementRevealVars()
    expect(vars.opacity).toBe(0)
    expect(vars.y).toBe(DEFAULT_REVEAL_DISTANCE)
    expect(vars.x).toBeUndefined()
    expect(vars.duration).toBe(DEFAULT_REVEAL_DURATION)
    expect(vars.ease).toBe(DEFAULT_REVEAL_EASE)
    expect(vars.stagger).toBe(DEFAULT_REVEAL_STAGGER)
  })

  it('maps a horizontal direction onto the x axis only', () => {
    const vars = buildElementRevealVars({ direction: 'right', distance: 80 })
    expect(vars.x).toBe(-80)
    expect(vars.y).toBeUndefined()
  })

  it('respects passed duration, ease and stagger', () => {
    const vars = buildElementRevealVars({ duration: 1.2, ease: 'expo.out', stagger: 0.2 })
    expect(vars.duration).toBe(1.2)
    expect(vars.ease).toBe('expo.out')
    expect(vars.stagger).toBe(0.2)
  })

  it('scales the offset with distance for vertical reveals', () => {
    expect(buildElementRevealVars({ direction: 'up', distance: 120 }).y).toBe(120)
    expect(buildElementRevealVars({ direction: 'down', distance: 120 }).y).toBe(-120)
  })
})
