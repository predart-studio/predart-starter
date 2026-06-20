import { describe, it, expect } from 'vitest'
import {
  buildSharedAxisZVars,
  buildSharedAxisZExitVars,
  splitWhole,
  SHARED_AXIS_Z_ENTER_EASE_ID,
  SHARED_AXIS_Z_EXIT_EASE_ID,
  SHARED_AXIS_Z_MICRO_DELAY,
} from '@/lib/motion/shared-axis-z'

describe('splitWhole', () => {
  it('does not split — returns the text as a single unit', () => {
    expect(splitWhole('Zooming between states.')).toEqual(['Zooming between states.'])
  })

  it('keeps the whole string intact regardless of spaces or punctuation', () => {
    expect(splitWhole('Hi! 😀')).toEqual(['Hi! 😀'])
  })

  it('returns a one-element array for an empty string', () => {
    expect(splitWhole('')).toEqual([''])
  })
})

describe('buildSharedAxisZVars', () => {
  it('starts hidden, shrunk and blurred (zooming forward from behind)', () => {
    const { from } = buildSharedAxisZVars()
    expect(from).toEqual({ opacity: 0, scale: 0.9, filter: 'blur(2px)' })
  })

  it('resolves to visible, full scale and crisp', () => {
    const { to } = buildSharedAxisZVars()
    expect(to.opacity).toBe(1)
    expect(to.scale).toBe(1)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.52s duration, 0 stagger, enter ease)', () => {
    const { to } = buildSharedAxisZVars()
    expect(to.duration).toBe(0.52)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(SHARED_AXIS_Z_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildSharedAxisZVars({
      duration: 1,
      stagger: 0.03,
      scaleFrom: 0.8,
      blurFrom: 4,
    })
    expect(to.duration).toBe(1)
    expect(to.stagger).toBe(0.03)
    expect(from.scale).toBe(0.8)
    expect(from.filter).toBe('blur(4px)')
  })

  it('lets callers override the ease', () => {
    const { to } = buildSharedAxisZVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
  })
})

describe('buildSharedAxisZExitVars', () => {
  it('starts settled and crisp', () => {
    const { from } = buildSharedAxisZExitVars()
    expect(from).toEqual({ opacity: 1, scale: 1, filter: 'blur(0px)' })
  })

  it('fades out while zooming past 1 with a faint blur (toward the viewer)', () => {
    const { to } = buildSharedAxisZExitVars()
    expect(to.opacity).toBe(0)
    expect(to.scale).toBe(1.06)
    expect(to.filter).toBe('blur(1px)')
  })

  it('applies the spec exit defaults (0.36s duration, exit ease)', () => {
    const { to } = buildSharedAxisZExitVars()
    expect(to.duration).toBe(0.36)
    expect(to.ease).toBe(SHARED_AXIS_Z_EXIT_EASE_ID)
  })

  it('lets callers override exit timing and travel', () => {
    const { to } = buildSharedAxisZExitVars({
      duration: 0.5,
      scaleTo: 1.2,
      blurTo: 3,
    })
    expect(to.duration).toBe(0.5)
    expect(to.scale).toBe(1.2)
    expect(to.filter).toBe('blur(3px)')
  })
})

describe('SHARED_AXIS_Z_MICRO_DELAY', () => {
  it('matches the spec swap micro-delay (20ms)', () => {
    expect(SHARED_AXIS_Z_MICRO_DELAY).toBe(0.02)
  })
})
