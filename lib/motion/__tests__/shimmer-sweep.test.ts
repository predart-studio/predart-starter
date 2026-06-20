import { describe, it, expect } from 'vitest'
import {
  buildShimmerSweepVars,
  buildShimmerSweepExitVars,
  splitWhole,
  SHIMMER_SWEEP_EASE_ID,
  SHIMMER_SWEEP_EXIT_EASE_ID,
} from '@/lib/motion/shimmer-sweep'

describe('splitWhole', () => {
  it('does not split — returns the full text as one unit', () => {
    expect(splitWhole('Shiny details.')).toEqual(['Shiny details.'])
  })

  it('keeps spaces, punctuation and astral characters intact in the single unit', () => {
    expect(splitWhole('a b! 😀')).toEqual(['a b! 😀'])
  })

  it('returns exactly one animated unit regardless of length', () => {
    expect(splitWhole('Glide with intent.')).toHaveLength(1)
  })
})

describe('buildShimmerSweepVars', () => {
  it('starts hidden, offset left and blurred', () => {
    const { from } = buildShimmerSweepVars()
    expect(from).toEqual({ opacity: 0, x: -22, filter: 'blur(8px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { to } = buildShimmerSweepVars()
    expect(to.opacity).toBe(1)
    expect(to.x).toBe(0)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.85s duration, 0 stagger, enter ease)', () => {
    const { to } = buildShimmerSweepVars()
    expect(to.duration).toBe(0.85)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(SHIMMER_SWEEP_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildShimmerSweepVars({
      duration: 1.1,
      stagger: 0.02,
      xFrom: -40,
      blurFrom: 12,
    })
    expect(to.duration).toBe(1.1)
    expect(to.stagger).toBe(0.02)
    expect(from.x).toBe(-40)
    expect(from.filter).toBe('blur(12px)')
  })
})

describe('buildShimmerSweepExitVars', () => {
  it('starts visible and settled', () => {
    const { from } = buildShimmerSweepExitVars()
    expect(from).toEqual({ opacity: 1, x: 0, filter: 'blur(0px)' })
  })

  it('resolves to hidden, offset right and blurred', () => {
    const { to } = buildShimmerSweepExitVars()
    expect(to.opacity).toBe(0)
    expect(to.x).toBe(22)
    expect(to.filter).toBe('blur(8px)')
  })

  it('applies the spec exit defaults (0.65s duration, 0 stagger, exit ease)', () => {
    const { to } = buildShimmerSweepExitVars()
    expect(to.duration).toBe(0.65)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(SHIMMER_SWEEP_EXIT_EASE_ID)
  })

  it('lets callers override exit timing and travel', () => {
    const { to } = buildShimmerSweepExitVars({
      duration: 0.9,
      stagger: 0.01,
      xTo: 48,
      blurTo: 14,
    })
    expect(to.duration).toBe(0.9)
    expect(to.stagger).toBe(0.01)
    expect(to.x).toBe(48)
    expect(to.filter).toBe('blur(14px)')
  })
})
