import { describe, it, expect } from 'vitest'
import {
  buildBottomUpLettersVars,
  buildBottomUpLettersExitVars,
  splitChars,
  BOTTOM_UP_LETTERS_EASE_ID,
  BOTTOM_UP_LETTERS_EXIT_EASE_ID,
} from '@/lib/motion/bottom-up-letters'

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

describe('buildBottomUpLettersVars', () => {
  it('starts hidden and lifted from below (no blur)', () => {
    const { from } = buildBottomUpLettersVars()
    expect(from).toEqual({ opacity: 0, y: 46 })
    // Zero blur is the signature — there must be no filter field at all.
    expect('filter' in from).toBe(false)
  })

  it('resolves to visible and settled (no blur)', () => {
    const { to } = buildBottomUpLettersVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect('filter' in to).toBe(false)
  })

  it('applies the spec defaults (0.4s duration, 88ms stagger, bottom-up ease)', () => {
    const { to } = buildBottomUpLettersVars()
    expect(to.duration).toBe(0.4)
    expect(to.stagger).toBe(0.088)
    expect(to.ease).toBe(BOTTOM_UP_LETTERS_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildBottomUpLettersVars({
      duration: 0.6,
      stagger: 0.1,
      yFrom: 36,
    })
    expect(to.duration).toBe(0.6)
    expect(to.stagger).toBe(0.1)
    expect(from.y).toBe(36)
  })
})

describe('buildBottomUpLettersExitVars', () => {
  it('starts visible and settled, lifts up and out (no blur)', () => {
    const { from, to } = buildBottomUpLettersExitVars()
    expect(from).toEqual({ opacity: 1, y: 0 })
    expect(to.opacity).toBe(0)
    expect(to.y).toBe(-14)
    expect('filter' in to).toBe(false)
  })

  it('applies the spec exit defaults (0.28s duration, 28ms stagger, exit ease)', () => {
    const { to } = buildBottomUpLettersExitVars()
    expect(to.duration).toBe(0.28)
    expect(to.stagger).toBe(0.028)
    expect(to.ease).toBe(BOTTOM_UP_LETTERS_EXIT_EASE_ID)
  })

  it('lets callers override exit timing and travel', () => {
    const { to } = buildBottomUpLettersExitVars({
      duration: 0.4,
      stagger: 0.05,
      yTo: -24,
    })
    expect(to.duration).toBe(0.4)
    expect(to.stagger).toBe(0.05)
    expect(to.y).toBe(-24)
  })
})
