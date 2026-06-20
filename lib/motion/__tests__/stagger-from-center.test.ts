import { describe, it, expect } from 'vitest'
import {
  buildStaggerFromCenterVars,
  buildStaggerFromCenterExitVars,
  splitChars,
  STAGGER_FROM_CENTER_EASE_ID,
  STAGGER_FROM_CENTER_EXIT_EASE_ID,
} from '@/lib/motion/stagger-from-center'

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

describe('buildStaggerFromCenterVars', () => {
  it('starts hidden, low and softly blurred', () => {
    const { from } = buildStaggerFromCenterVars()
    expect(from).toEqual({ opacity: 0, y: 12, filter: 'blur(3px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { to } = buildStaggerFromCenterVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.62s duration, 22ms stagger, enter ease)', () => {
    const { to } = buildStaggerFromCenterVars()
    expect(to.duration).toBe(0.62)
    expect(to.stagger).toBe(0.022)
    expect(to.ease).toBe(STAGGER_FROM_CENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildStaggerFromCenterVars({
      duration: 0.8,
      stagger: 0.03,
      yFrom: 20,
      blurFrom: 6,
    })
    expect(to.duration).toBe(0.8)
    expect(to.stagger).toBe(0.03)
    expect(from.y).toBe(20)
    expect(from.filter).toBe('blur(6px)')
  })
})

describe('buildStaggerFromCenterExitVars', () => {
  it('starts visible and settled', () => {
    const { from } = buildStaggerFromCenterExitVars()
    expect(from).toEqual({ opacity: 1, y: 0, filter: 'blur(0px)' })
  })

  it('lifts up and dissolves out on the spec exit timing', () => {
    const { to } = buildStaggerFromCenterExitVars()
    expect(to.opacity).toBe(0)
    expect(to.y).toBe(-8)
    expect(to.filter).toBe('blur(3px)')
    expect(to.duration).toBe(0.42)
    expect(to.stagger).toBe(0.016)
    expect(to.ease).toBe(STAGGER_FROM_CENTER_EXIT_EASE_ID)
  })

  it('lets callers override exit timing and travel', () => {
    const { to } = buildStaggerFromCenterExitVars({
      duration: 0.5,
      stagger: 0.02,
      yTo: -12,
      blurTo: 5,
    })
    expect(to.duration).toBe(0.5)
    expect(to.stagger).toBe(0.02)
    expect(to.y).toBe(-12)
    expect(to.filter).toBe('blur(5px)')
  })
})
