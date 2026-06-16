import { describe, it, expect } from 'vitest'
import {
  computeIconSwap,
  buildIconSwapVars,
  DEFAULT_ICON_SIZE,
  DEFAULT_SWAP_DURATION,
  DEFAULT_SWAP_EASE,
} from '@/lib/motion/icon-button'

describe('computeIconSwap', () => {
  it('defaults to a 20px up-right diagonal swap', () => {
    const g = computeIconSwap()
    expect(g.primaryRest).toEqual({ x: 0, y: 0 })
    // primary exits up-and-right: +x, -y, full icon size
    expect(g.primaryHover).toEqual({ x: DEFAULT_ICON_SIZE, y: -DEFAULT_ICON_SIZE })
    // duplicate waits at the opposite corner (down-left), then lands centered
    expect(g.duplicateRest).toEqual({ x: -DEFAULT_ICON_SIZE, y: DEFAULT_ICON_SIZE })
    expect(g.duplicateHover).toEqual({ x: 0, y: 0 })
  })

  it('both icons travel the same vector (duplicate slides into primary slot)', () => {
    const g = computeIconSwap({ size: 16, direction: 'up-right' })
    const primaryDelta = { x: g.primaryHover.x - g.primaryRest.x, y: g.primaryHover.y - g.primaryRest.y }
    const dupDelta = { x: g.duplicateHover.x - g.duplicateRest.x, y: g.duplicateHover.y - g.duplicateRest.y }
    expect(primaryDelta).toEqual(dupDelta)
    expect(primaryDelta).toEqual({ x: 16, y: -16 })
  })

  it('scales travel distance with the icon size', () => {
    const small = computeIconSwap({ size: 12 })
    const large = computeIconSwap({ size: 40 })
    expect(Math.abs(small.primaryHover.x)).toBeLessThan(Math.abs(large.primaryHover.x))
    expect(large.primaryHover).toEqual({ x: 40, y: -40 })
  })

  it('honors each diagonal direction', () => {
    expect(computeIconSwap({ size: 10, direction: 'down-right' }).primaryHover).toEqual({ x: 10, y: 10 })
    expect(computeIconSwap({ size: 10, direction: 'up-left' }).primaryHover).toEqual({ x: -10, y: -10 })
    expect(computeIconSwap({ size: 10, direction: 'down-left' }).primaryHover).toEqual({ x: -10, y: 10 })
  })

  it('keeps the duplicate at the inverse corner of the primary exit', () => {
    const g = computeIconSwap({ size: 24, direction: 'down-right' })
    expect(g.duplicateRest).toEqual({ x: -g.primaryHover.x, y: -g.primaryHover.y })
  })
})

describe('buildIconSwapVars', () => {
  it('applies the studied defaults', () => {
    expect(buildIconSwapVars()).toEqual({ duration: DEFAULT_SWAP_DURATION, ease: DEFAULT_SWAP_EASE })
  })

  it('respects overrides', () => {
    expect(buildIconSwapVars({ duration: 0.8, ease: 'power2.out' })).toEqual({
      duration: 0.8,
      ease: 'power2.out',
    })
  })
})
