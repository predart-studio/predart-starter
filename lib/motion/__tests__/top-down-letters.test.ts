import { describe, it, expect } from 'vitest'
import {
  buildTopDownLettersVars,
  splitChars,
  TOP_DOWN_LETTERS_EASE_ID,
} from '@/lib/motion/top-down-letters'

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

describe('buildTopDownLettersVars', () => {
  it('starts hidden and high above (negative y, no blur)', () => {
    const { from } = buildTopDownLettersVars()
    expect(from).toEqual({ opacity: 0, y: -46 })
  })

  it('resolves to visible and settled', () => {
    const { to } = buildTopDownLettersVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
  })

  it('applies the spec defaults (0.4s duration, 88ms stagger, top-down ease)', () => {
    const { to } = buildTopDownLettersVars()
    expect(to.duration).toBe(0.4)
    expect(to.stagger).toBe(0.088)
    expect(to.ease).toBe(TOP_DOWN_LETTERS_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildTopDownLettersVars({
      duration: 0.6,
      stagger: 0.1,
      yFrom: -36,
    })
    expect(to.duration).toBe(0.6)
    expect(to.stagger).toBe(0.1)
    expect(from.y).toBe(-36)
  })
})
