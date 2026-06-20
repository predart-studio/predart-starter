import { describe, it, expect } from 'vitest'
import {
  buildShortSlideDownVars,
  splitWords,
  SHORT_SLIDE_DOWN_ENTER_EASE_ID,
  SHORT_SLIDE_DOWN_EXIT_EASE_ID,
} from '@/lib/motion/short-slide-down'

describe('splitWords', () => {
  it('splits into one unit per word, with whitespace as its own unit', () => {
    expect(splitWords('Drop into place')).toEqual([
      { text: 'Drop', isWord: true },
      { text: ' ', isWord: false },
      { text: 'into', isWord: true },
      { text: ' ', isWord: false },
      { text: 'place', isWord: true },
    ])
  })

  it('flags whitespace runs as non-words so they stay static', () => {
    const units = splitWords('a  b')
    expect(units.map((u) => u.isWord)).toEqual([true, false, true])
    // Reassembling the chunks reproduces the original spacing verbatim.
    expect(units.map((u) => u.text).join('')).toBe('a  b')
  })

  it('keeps punctuation attached to its word (no per-character split)', () => {
    expect(splitWords('Drop into place.')).toEqual([
      { text: 'Drop', isWord: true },
      { text: ' ', isWord: false },
      { text: 'into', isWord: true },
      { text: ' ', isWord: false },
      { text: 'place.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildShortSlideDownVars', () => {
  it('starts hidden, above, blurred and slightly shrunk (top-down drop)', () => {
    const { from } = buildShortSlideDownVars()
    expect(from).toEqual({
      opacity: 0,
      y: -24,
      filter: 'blur(2.4px)',
      scale: 0.992,
    })
  })

  it('resolves to visible, settled, crisp and full-scale', () => {
    const { to } = buildShortSlideDownVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.filter).toBe('blur(0px)')
    expect(to.scale).toBe(1)
  })

  it('applies the spec defaults (0.52s duration, 0ms stagger, enter ease)', () => {
    const { to } = buildShortSlideDownVars()
    expect(to.duration).toBe(0.52)
    expect(to.stagger).toBe(0)
    expect(to.ease).toBe(SHORT_SLIDE_DOWN_ENTER_EASE_ID)
  })

  it('lets callers override timing, travel, blur and scale', () => {
    const { from, to } = buildShortSlideDownVars({
      duration: 0.8,
      stagger: 0.06,
      yFrom: -36,
      blurFrom: 4,
      scaleFrom: 0.95,
    })
    expect(to.duration).toBe(0.8)
    expect(to.stagger).toBe(0.06)
    expect(from.y).toBe(-36)
    expect(from.filter).toBe('blur(4px)')
    expect(from.scale).toBe(0.95)
  })

  it('lets callers override the ease', () => {
    const { to } = buildShortSlideDownVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
  })

  it('exposes the spec exit phase for swap wrappers (drift down, fade, soft blur)', () => {
    const { exit } = buildShortSlideDownVars()
    expect(exit.from).toEqual({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
    })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(10)
    expect(exit.to.filter).toBe('blur(1.2px)')
    expect(exit.to.duration).toBe(0.32)
    expect(exit.to.stagger).toBe(0)
    expect(exit.to.ease).toBe(SHORT_SLIDE_DOWN_EXIT_EASE_ID)
  })
})
