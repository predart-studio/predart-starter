import { describe, it, expect } from 'vitest'
import {
  buildSharedAxisYVars,
  splitWords,
  SHARED_AXIS_Y_EASE_ID,
  SHARED_AXIS_Y_MICRO_DELAY,
} from '@/lib/motion/shared-axis-y'

describe('splitWords', () => {
  it('splits into one unit per word, with whitespace as its own unit', () => {
    expect(splitWords('Layered navigation.')).toEqual([
      { text: 'Layered', isWord: true },
      { text: ' ', isWord: false },
      { text: 'navigation.', isWord: true },
    ])
  })

  it('flags whitespace runs as non-words so they stay static', () => {
    const units = splitWords('a  b')
    expect(units.map((u) => u.isWord)).toEqual([true, false, true])
    // Reassembling the chunks reproduces the original spacing verbatim.
    expect(units.map((u) => u.text).join('')).toBe('a  b')
  })

  it('keeps punctuation attached to its word (no per-character split)', () => {
    expect(splitWords('Hierarchy made clear.')).toEqual([
      { text: 'Hierarchy', isWord: true },
      { text: ' ', isWord: false },
      { text: 'made', isWord: true },
      { text: ' ', isWord: false },
      { text: 'clear.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildSharedAxisYVars', () => {
  it('enters from hidden, hard-cutting to visible (no movement)', () => {
    const { enter } = buildSharedAxisYVars()
    expect(enter.from).toEqual({ opacity: 0, y: 0, scale: 1 })
    expect(enter.to.opacity).toBe(1)
    expect(enter.to.y).toBe(0)
    expect(enter.to.scale).toBe(1)
  })

  it('exits from visible, hard-cutting to hidden (no movement)', () => {
    const { exit } = buildSharedAxisYVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, scale: 1 })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(0)
    expect(exit.to.scale).toBe(1)
  })

  it('applies the spec enter defaults (0.18s duration, 78ms stagger, stepped ease)', () => {
    const { enter } = buildSharedAxisYVars()
    expect(enter.to.duration).toBe(0.18)
    expect(enter.to.stagger).toBe(0.078)
    expect(enter.to.ease).toBe(SHARED_AXIS_Y_EASE_ID)
  })

  it('applies the spec exit defaults (0.14s duration, 78ms stagger, stepped ease)', () => {
    const { exit } = buildSharedAxisYVars()
    expect(exit.to.duration).toBe(0.14)
    expect(exit.to.stagger).toBe(0.078)
    expect(exit.to.ease).toBe(SHARED_AXIS_Y_EASE_ID)
  })

  it('translates steps(1, end) to the GSAP steps(1) ease string', () => {
    expect(SHARED_AXIS_Y_EASE_ID).toBe('steps(1)')
  })

  it('exposes the spec swap micro-delay (28ms)', () => {
    expect(SHARED_AXIS_Y_MICRO_DELAY).toBe(0.028)
  })

  it('lets callers override enter/exit timing', () => {
    const { enter, exit } = buildSharedAxisYVars({
      enterDuration: 0.3,
      exitDuration: 0.25,
      enterStagger: 0.05,
      exitStagger: 0.04,
    })
    expect(enter.to.duration).toBe(0.3)
    expect(enter.to.stagger).toBe(0.05)
    expect(exit.to.duration).toBe(0.25)
    expect(exit.to.stagger).toBe(0.04)
  })

  it('lets callers thread y/scale through both phases', () => {
    const { enter, exit } = buildSharedAxisYVars({ y: 12, scale: 0.9 })
    expect(enter.from.y).toBe(12)
    expect(enter.from.scale).toBe(0.9)
    expect(exit.to.y).toBe(12)
    expect(exit.to.scale).toBe(0.9)
  })

  it('lets callers override the ease', () => {
    const { enter, exit } = buildSharedAxisYVars({ ease: 'none' })
    expect(enter.to.ease).toBe('none')
    expect(exit.to.ease).toBe('none')
  })
})
