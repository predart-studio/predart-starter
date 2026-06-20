import { describe, it, expect } from 'vitest'
import {
  buildMicroScaleFadeVars,
  buildMicroScaleFadeExitVars,
  splitWhole,
  MICRO_SCALE_FADE_ENTER_EASE_ID,
  MICRO_SCALE_FADE_EXIT_EASE_ID,
} from '@/lib/motion/micro-scale-fade'

describe('splitWhole', () => {
  it('does not split — returns the text as a single unit', () => {
    expect(splitWhole('Welcome to motion.')).toEqual(['Welcome to motion.'])
  })

  it('keeps the whole string intact regardless of spaces or punctuation', () => {
    expect(splitWhole('Hi! 😀')).toEqual(['Hi! 😀'])
  })

  it('returns a one-element array for an empty string', () => {
    expect(splitWhole('')).toEqual([''])
  })
})

describe('buildMicroScaleFadeVars', () => {
  it('starts hidden and slightly shrunk', () => {
    const { from } = buildMicroScaleFadeVars()
    expect(from).toEqual({ opacity: 0, scale: 0.96 })
  })

  it('resolves to visible and full scale', () => {
    const { to } = buildMicroScaleFadeVars()
    expect(to.opacity).toBe(1)
    expect(to.scale).toBe(1)
  })

  it('applies the spec defaults (0.6s duration, 0 stagger, enter ease)', () => {
    const { to } = buildMicroScaleFadeVars()
    expect(to.duration).toBe(0.6)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(MICRO_SCALE_FADE_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildMicroScaleFadeVars({
      duration: 1,
      stagger: 0.03,
      scaleFrom: 0.9,
    })
    expect(to.duration).toBe(1)
    expect(to.stagger).toBe(0.03)
    expect(from.scale).toBe(0.9)
  })
})

describe('buildMicroScaleFadeExitVars', () => {
  it('fades out while shrinking back to 0.96', () => {
    const { to } = buildMicroScaleFadeExitVars()
    expect(to.opacity).toBe(0)
    expect(to.scale).toBe(0.96)
  })

  it('applies the spec exit defaults (0.4s duration, exit ease)', () => {
    const { to } = buildMicroScaleFadeExitVars()
    expect(to.duration).toBe(0.4)
    expect(to.ease).toBe(MICRO_SCALE_FADE_EXIT_EASE_ID)
  })

  it('lets callers override the exit timing and travel', () => {
    const { to } = buildMicroScaleFadeExitVars({ duration: 0.25, scaleTo: 0.9 })
    expect(to.duration).toBe(0.25)
    expect(to.scale).toBe(0.9)
  })
})
