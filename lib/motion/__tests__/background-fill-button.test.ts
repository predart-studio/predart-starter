import { describe, it, expect } from 'vitest'
import {
  buildFillVars,
  FILL_ORIGIN_BOTTOM,
  FILL_ORIGIN_TOP,
  DEFAULT_FILL_DURATION,
  DEFAULT_FILL_EASE,
} from '@/lib/motion/background-fill-button'

describe('buildFillVars', () => {
  it('enter grows from the bottom (origin bottom, scaleY -> 1)', () => {
    const v = buildFillVars({ phase: 'enter' })
    expect(v.transformOrigin).toBe(FILL_ORIGIN_BOTTOM)
    expect(v.scaleY).toBe(1)
  })

  it('leave retracts to the same bottom edge by default (origin bottom, scaleY -> 0)', () => {
    const v = buildFillVars({ phase: 'leave' })
    expect(v.transformOrigin).toBe(FILL_ORIGIN_BOTTOM)
    expect(v.scaleY).toBe(0)
  })

  it('leave with flipOnLeave exits out the top edge (origin flips to top)', () => {
    const v = buildFillVars({ phase: 'leave', flipOnLeave: true })
    expect(v.transformOrigin).toBe(FILL_ORIGIN_TOP)
    expect(v.scaleY).toBe(0)
  })

  it('flipOnLeave does not affect the enter phase (still bottom)', () => {
    const v = buildFillVars({ phase: 'enter', flipOnLeave: true })
    expect(v.transformOrigin).toBe(FILL_ORIGIN_BOTTOM)
  })

  it('applies sensible defaults for duration and ease', () => {
    const v = buildFillVars({ phase: 'enter' })
    expect(v.duration).toBe(DEFAULT_FILL_DURATION)
    expect(v.ease).toBe(DEFAULT_FILL_EASE)
  })

  it('respects passed duration and ease overrides', () => {
    const v = buildFillVars({ phase: 'enter', duration: 1.2, ease: 'expo.out' })
    expect(v.duration).toBe(1.2)
    expect(v.ease).toBe('expo.out')
  })
})
