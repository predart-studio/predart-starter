import { describe, it, expect } from 'vitest'
import {
  buildPerCharacterRiseVars,
  buildPerCharacterRiseExitVars,
  splitChars,
  PER_CHARACTER_RISE_ENTER_EASE_ID,
  PER_CHARACTER_RISE_EXIT_EASE_ID,
} from '@/lib/motion/per-character-rise'

describe('splitChars', () => {
  it('splits into one unit per character', () => {
    expect(splitChars('Hi!')).toEqual(['H', 'i', '!'])
  })

  it('preserves spaces as their own units', () => {
    expect(splitChars('a b')).toEqual(['a', ' ', 'b'])
  })

  it('keeps astral characters (emoji) intact', () => {
    expect(splitChars('a😀')).toEqual(['a', '😀'])
  })
})

describe('buildPerCharacterRiseVars', () => {
  it('starts hidden and below the baseline, with no blur', () => {
    const { from } = buildPerCharacterRiseVars()
    expect(from).toEqual({ opacity: 0, y: 32 })
    expect('filter' in from).toBe(false)
  })

  it('resolves to visible and settled', () => {
    const { to } = buildPerCharacterRiseVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
  })

  it('applies the spec defaults (0.7s duration, 24ms stagger, rise ease)', () => {
    const { to } = buildPerCharacterRiseVars()
    expect(to.duration).toBe(0.7)
    expect(to.stagger).toBe(0.024)
    expect(to.ease).toBe(PER_CHARACTER_RISE_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildPerCharacterRiseVars({
      duration: 1.1,
      stagger: 0.018,
      yFrom: 48,
    })
    expect(to.duration).toBe(1.1)
    expect(to.stagger).toBe(0.018)
    expect(from.y).toBe(48)
  })

  it('lets callers override the ease', () => {
    const { to } = buildPerCharacterRiseVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
  })
})

describe('buildPerCharacterRiseExitVars', () => {
  it('starts visible and settled', () => {
    const { from } = buildPerCharacterRiseExitVars()
    expect(from).toEqual({ opacity: 1, y: 0 })
  })

  it('lifts up and fades out with the spec exit defaults', () => {
    const { to } = buildPerCharacterRiseExitVars()
    expect(to.opacity).toBe(0)
    expect(to.y).toBe(-24)
    expect(to.duration).toBe(0.42)
    expect(to.stagger).toBe(0.014)
    expect(to.ease).toBe(PER_CHARACTER_RISE_EXIT_EASE_ID)
  })

  it('lets callers override exit timing and travel', () => {
    const { to } = buildPerCharacterRiseExitVars({
      duration: 0.5,
      stagger: 0.02,
      yTo: -40,
    })
    expect(to.duration).toBe(0.5)
    expect(to.stagger).toBe(0.02)
    expect(to.y).toBe(-40)
  })
})
