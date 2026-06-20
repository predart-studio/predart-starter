import { describe, it, expect } from 'vitest'
import {
  buildTypewriterStepsVars,
  splitChars,
  TYPEWRITER_STEPS_EASE,
  TYPEWRITER_STEPS_EXIT_EASE_ID,
} from '@/lib/motion/typewriter-steps'

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

describe('buildTypewriterStepsVars', () => {
  it('starts hidden, in place (opacity-only enter, no travel)', () => {
    const { from } = buildTypewriterStepsVars()
    expect(from).toEqual({ opacity: 0, y: 0 })
  })

  it('resolves to fully visible, in place', () => {
    const { to } = buildTypewriterStepsVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
  })

  it('applies the spec defaults (0.24s duration, 46ms stagger, steps(1) ease)', () => {
    const { to } = buildTypewriterStepsVars()
    expect(to.duration).toBe(0.24)
    expect(to.stagger).toBe(0.046)
    expect(to.ease).toBe(TYPEWRITER_STEPS_EASE)
    expect(TYPEWRITER_STEPS_EASE).toBe('steps(1)')
  })

  it('lets callers override timing', () => {
    const { to } = buildTypewriterStepsVars({ duration: 0.4, stagger: 0.08 })
    expect(to.duration).toBe(0.4)
    expect(to.stagger).toBe(0.08)
  })

  it('lets callers override the enter ease', () => {
    const { to } = buildTypewriterStepsVars({ ease: 'steps(3)' })
    expect(to.ease).toBe('steps(3)')
  })

  it('exposes exit vars for swap playback (fade out + 4px lift, exit ease)', () => {
    const { exit } = buildTypewriterStepsVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0 })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-4)
    expect(exit.to.duration).toBe(0.26)
    expect(exit.to.stagger).toBe(0.01)
    expect(exit.to.ease).toBe(TYPEWRITER_STEPS_EXIT_EASE_ID)
  })
})
