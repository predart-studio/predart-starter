import { describe, it, expect } from 'vitest'
import {
  buildFocusBlurResolveVars,
  splitWhole,
  FOCUS_BLUR_RESOLVE_ENTER_EASE_ID,
  FOCUS_BLUR_RESOLVE_EXIT_EASE_ID,
} from '@/lib/motion/focus-blur-resolve'

describe('splitWhole', () => {
  it('keeps the whole string as a single animated unit', () => {
    expect(splitWhole('Focus resolves clearly.')).toEqual([
      'Focus resolves clearly.',
    ])
  })

  it('does not split on spaces or punctuation (target: whole)', () => {
    expect(splitWhole('Detail emerges.')).toHaveLength(1)
  })

  it('preserves an empty string as one unit', () => {
    expect(splitWhole('')).toEqual([''])
  })
})

describe('buildFocusBlurResolveVars — enter', () => {
  it('starts hidden, low, scaled up and blurred', () => {
    const { from } = buildFocusBlurResolveVars()
    expect(from).toEqual({
      opacity: 0,
      y: 14,
      scale: 1.01,
      filter: 'blur(14px)',
    })
  })

  it('resolves to visible, settled, unscaled and crisp', () => {
    const { to } = buildFocusBlurResolveVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.scale).toBe(1)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec enter defaults (0.76s duration, 0 stagger, enter ease)', () => {
    const { to } = buildFocusBlurResolveVars()
    expect(to.duration).toBe(0.76)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(FOCUS_BLUR_RESOLVE_ENTER_EASE_ID)
  })
})

describe('buildFocusBlurResolveVars — exit', () => {
  it('starts from the crisp settled state', () => {
    const { exit } = buildFocusBlurResolveVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
  })

  it('blurs back out, lifts and fades on the exit ease', () => {
    const { exit } = buildFocusBlurResolveVars()
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-10)
    expect(exit.to.filter).toBe('blur(10px)')
    expect(exit.to.duration).toBe(0.52)
    expect(exit.to.ease).toBe(FOCUS_BLUR_RESOLVE_EXIT_EASE_ID)
  })
})

describe('buildFocusBlurResolveVars — overrides', () => {
  it('lets callers override enter timing and travel', () => {
    const { from, to } = buildFocusBlurResolveVars({
      duration: 1.1,
      stagger: 0.02,
      yFrom: 24,
      blurFrom: 8,
      scaleFrom: 1.05,
    })
    expect(to.duration).toBe(1.1)
    expect(to.stagger).toBe(0.02)
    expect(from.y).toBe(24)
    expect(from.filter).toBe('blur(8px)')
    expect(from.scale).toBe(1.05)
  })

  it('lets callers override the enter ease while keeping the fixed exit ease', () => {
    const { to, exit } = buildFocusBlurResolveVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
    expect(exit.to.ease).toBe(FOCUS_BLUR_RESOLVE_EXIT_EASE_ID)
  })
})
