import { describe, it, expect } from 'vitest'
import {
  buildStaggerFromEdgesVars,
  splitChars,
  STAGGER_FROM_EDGES_ENTER_EASE_ID,
  STAGGER_FROM_EDGES_EXIT_EASE_ID,
} from '@/lib/motion/stagger-from-edges'

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

describe('buildStaggerFromEdgesVars', () => {
  it('starts hidden, low and faintly blurred', () => {
    const { from } = buildStaggerFromEdgesVars()
    expect(from).toEqual({ opacity: 0, y: 12, filter: 'blur(3px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { to } = buildStaggerFromEdgesVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.62s duration, 22ms stagger, enter ease)', () => {
    const { to } = buildStaggerFromEdgesVars()
    expect(to.duration).toBe(0.62)
    expect(to.stagger).toBe(0.022)
    expect(to.ease).toBe(STAGGER_FROM_EDGES_ENTER_EASE_ID)
  })

  it('exposes the exit vars for swap/crossfade callers', () => {
    const { exitFrom, exitTo } = buildStaggerFromEdgesVars()
    expect(exitFrom).toEqual({ opacity: 1, y: 0, filter: 'blur(0px)' })
    expect(exitTo.opacity).toBe(0)
    expect(exitTo.y).toBe(-8)
    expect(exitTo.filter).toBe('blur(3px)')
    expect(exitTo.duration).toBe(0.42)
    expect(exitTo.stagger).toBe(0.016)
    expect(exitTo.ease).toBe(STAGGER_FROM_EDGES_EXIT_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildStaggerFromEdgesVars({
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
