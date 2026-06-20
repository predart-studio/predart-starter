import { describe, it, expect } from 'vitest'
import {
  buildSoftBlurVars,
  splitChars,
  SOFT_BLUR_EASE_ID,
} from '@/lib/motion/soft-blur'

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

describe('buildSoftBlurVars', () => {
  it('starts hidden, low and blurred', () => {
    const { from } = buildSoftBlurVars()
    expect(from).toEqual({ opacity: 0, y: 16, filter: 'blur(12px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { to } = buildSoftBlurVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.9s duration, 25ms stagger, soft-blur ease)', () => {
    const { to } = buildSoftBlurVars()
    expect(to.duration).toBe(0.9)
    expect(to.stagger).toBe(0.025)
    expect(to.ease).toBe(SOFT_BLUR_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildSoftBlurVars({
      duration: 1.2,
      stagger: 0.04,
      yFrom: 24,
      blurFrom: 8,
    })
    expect(to.duration).toBe(1.2)
    expect(to.stagger).toBe(0.04)
    expect(from.y).toBe(24)
    expect(from.filter).toBe('blur(8px)')
  })
})
