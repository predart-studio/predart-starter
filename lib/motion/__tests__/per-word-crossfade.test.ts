import { describe, it, expect } from 'vitest'
import {
  buildPerWordCrossfadeVars,
  splitWords,
  PER_WORD_CROSSFADE_ENTER_EASE_ID,
  PER_WORD_CROSSFADE_EXIT_EASE_ID,
} from '@/lib/motion/per-word-crossfade'

describe('splitWords', () => {
  it('splits into one unit per word, with whitespace as its own unit', () => {
    expect(splitWords('hello world')).toEqual([
      { text: 'hello', isWord: true },
      { text: ' ', isWord: false },
      { text: 'world', isWord: true },
    ])
  })

  it('flags whitespace runs as non-words so they stay static', () => {
    const units = splitWords('a  b')
    expect(units.map((u) => u.isWord)).toEqual([true, false, true])
    // Reassembling the chunks reproduces the original spacing verbatim.
    expect(units.map((u) => u.text).join('')).toBe('a  b')
  })

  it('keeps punctuation attached to its word (no per-character split)', () => {
    expect(splitWords('Beautifully, simple.')).toEqual([
      { text: 'Beautifully,', isWord: true },
      { text: ' ', isWord: false },
      { text: 'simple.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildPerWordCrossfadeVars', () => {
  it('starts hidden and slightly low', () => {
    const { from } = buildPerWordCrossfadeVars()
    expect(from).toEqual({ opacity: 0, y: 8 })
  })

  it('resolves to visible and settled', () => {
    const { to } = buildPerWordCrossfadeVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
  })

  it('applies the spec defaults (0.7s duration, 70ms stagger, enter ease)', () => {
    const { to } = buildPerWordCrossfadeVars()
    expect(to.duration).toBe(0.7)
    expect(to.stagger).toBe(0.07)
    expect(to.ease).toBe(PER_WORD_CROSSFADE_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildPerWordCrossfadeVars({
      duration: 1,
      stagger: 0.05,
      yFrom: 16,
    })
    expect(to.duration).toBe(1)
    expect(to.stagger).toBe(0.05)
    expect(from.y).toBe(16)
  })

  it('lets callers override the ease', () => {
    const { to } = buildPerWordCrossfadeVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
  })

  it('exposes the spec exit phase for swap wrappers (drift up, fade out)', () => {
    const { exit } = buildPerWordCrossfadeVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0 })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-6)
    expect(exit.to.duration).toBe(0.5)
    expect(exit.to.stagger).toBe(0.04)
    expect(exit.to.ease).toBe(PER_WORD_CROSSFADE_EXIT_EASE_ID)
  })
})
