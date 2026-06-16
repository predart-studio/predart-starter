import { describe, it, expect } from 'vitest'
import {
  gooeyRevealRadius,
  gooeyColorMatrix,
  buildGooeyRevealVars,
  DEFAULT_GOOEY_REVEAL_RADIUS,
  DEFAULT_GOOEY_CONTRAST,
  DEFAULT_GOOEY_DURATION,
} from '@/lib/motion/gooey-hover-reveal'

describe('gooeyRevealRadius', () => {
  it('is 0 at progress 0 and the reveal radius at progress 1', () => {
    expect(gooeyRevealRadius({ progress: 0 })).toBe(0)
    expect(gooeyRevealRadius({ progress: 1 })).toBe(DEFAULT_GOOEY_REVEAL_RADIUS)
  })

  it('scales linearly and monotonically with progress', () => {
    const a = gooeyRevealRadius({ progress: 0.25 })
    const b = gooeyRevealRadius({ progress: 0.5 })
    const c = gooeyRevealRadius({ progress: 0.75 })
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
    expect(gooeyRevealRadius({ progress: 0.5 })).toBeCloseTo(DEFAULT_GOOEY_REVEAL_RADIUS / 2)
  })

  it('clamps out-of-range progress to [0,1]', () => {
    expect(gooeyRevealRadius({ progress: -5 })).toBe(0)
    expect(gooeyRevealRadius({ progress: 9 })).toBe(DEFAULT_GOOEY_REVEAL_RADIUS)
  })

  it('respects a custom reveal radius', () => {
    expect(gooeyRevealRadius({ progress: 1, revealRadius: 80 })).toBe(80)
    expect(gooeyRevealRadius({ progress: 0.5, revealRadius: 80 })).toBe(40)
  })
})

describe('gooeyColorMatrix', () => {
  it('returns a 20-value (4x5) matrix string', () => {
    const parts = gooeyColorMatrix().trim().split(/\s+/)
    expect(parts).toHaveLength(20)
  })

  it('puts the contrast slope and negative bias on the alpha row', () => {
    const parts = gooeyColorMatrix(DEFAULT_GOOEY_CONTRAST).trim().split(/\s+/).map(Number)
    // alpha row is the last 5 values: [0 0 0 contrast -contrast/2]
    expect(parts.slice(15)).toEqual([0, 0, 0, DEFAULT_GOOEY_CONTRAST, -(DEFAULT_GOOEY_CONTRAST / 2)])
  })

  it('honors a custom contrast', () => {
    const parts = gooeyColorMatrix(10).trim().split(/\s+/).map(Number)
    expect(parts[18]).toBe(10)
    expect(parts[19]).toBe(-5)
  })
})

describe('buildGooeyRevealVars', () => {
  it('produces clamped progress and default timing', () => {
    const vars = buildGooeyRevealVars({ to: 1 })
    expect(vars.progress).toBe(1)
    expect(vars.duration).toBe(DEFAULT_GOOEY_DURATION)
    expect(vars.overwrite).toBe('auto')
  })

  it('clamps the target progress and accepts overrides', () => {
    const vars = buildGooeyRevealVars({ to: 2, duration: 0.2, ease: 'none' })
    expect(vars.progress).toBe(1)
    expect(vars.duration).toBe(0.2)
    expect(vars.ease).toBe('none')
  })
})
