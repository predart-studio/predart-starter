import { describe, it, expect } from 'vitest'
import {
  buildShortSlideRightVars,
  splitWords,
  SHORT_SLIDE_RIGHT_ENTER_EASE_ID,
  SHORT_SLIDE_RIGHT_EXIT_EASE_ID,
} from '@/lib/motion/short-slide-right'

describe('splitWords', () => {
  it('splits into one unit per word, with whitespace as its own unit', () => {
    expect(splitWords('Move with intent.')).toEqual([
      { text: 'Move', isWord: true },
      { text: ' ', isWord: false },
      { text: 'with', isWord: true },
      { text: ' ', isWord: false },
      { text: 'intent.', isWord: true },
    ])
  })

  it('flags whitespace runs as non-words so they stay static', () => {
    const units = splitWords('a  b')
    expect(units.map((u) => u.isWord)).toEqual([true, false, true])
    // Reassembling the chunks reproduces the original spacing verbatim.
    expect(units.map((u) => u.text).join('')).toBe('a  b')
  })

  it('keeps punctuation attached to its word (no per-character split)', () => {
    expect(splitWords('with intent.')).toEqual([
      { text: 'with', isWord: true },
      { text: ' ', isWord: false },
      { text: 'intent.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildShortSlideRightVars — shared title slide', () => {
  it('starts offset to the left and slightly blurred', () => {
    const { title } = buildShortSlideRightVars()
    expect(title.from).toEqual({ x: -24, filter: 'blur(1.2px)' })
  })

  it('resolves to settled and crisp (one shared move, no opacity)', () => {
    const { title } = buildShortSlideRightVars()
    expect(title.to.x).toBe(0)
    expect(title.to.filter).toBe('blur(0px)')
    // The shared move carries no opacity — opacity is the word concern only.
    expect('opacity' in title.from).toBe(false)
    expect('opacity' in title.to).toBe(false)
  })

  it('applies the spec defaults (0.52s slide, enter ease)', () => {
    const { title } = buildShortSlideRightVars()
    expect(title.to.duration).toBe(0.52)
    expect(title.to.ease).toBe(SHORT_SLIDE_RIGHT_ENTER_EASE_ID)
  })
})

describe('buildShortSlideRightVars — per-word opacity', () => {
  it('fades each word from hidden to visible, opacity only (no movement)', () => {
    const { word } = buildShortSlideRightVars()
    expect(word.from).toEqual({ opacity: 0 })
    expect(word.to.opacity).toBe(1)
    // Words must not translate — the shared slide is the only positional move.
    expect('x' in word.to).toBe(false)
    expect('y' in word.to).toBe(false)
  })

  it('applies the spec word-opacity defaults (0.21s fade, 92ms stagger, enter ease)', () => {
    const { word } = buildShortSlideRightVars()
    expect(word.to.duration).toBe(0.21)
    expect(word.to.stagger).toBe(0.092)
    expect(word.to.ease).toBe(SHORT_SLIDE_RIGHT_ENTER_EASE_ID)
  })
})

describe('buildShortSlideRightVars — overrides & exit', () => {
  it('lets callers override timing and travel', () => {
    const { title, word } = buildShortSlideRightVars({
      duration: 0.8,
      stagger: 0.108,
      xFrom: -18,
      blurFrom: 0.6,
      wordDuration: 0.24,
    })
    expect(title.to.duration).toBe(0.8)
    expect(title.from.x).toBe(-18)
    expect(title.from.filter).toBe('blur(0.6px)')
    expect(word.to.stagger).toBe(0.108)
    expect(word.to.duration).toBe(0.24)
  })

  it('lets callers override the shared ease', () => {
    const { title, word } = buildShortSlideRightVars({ ease: 'power2.out' })
    expect(title.to.ease).toBe('power2.out')
    expect(word.to.ease).toBe('power2.out')
  })

  it('exposes the spec title-level exit phase for swap wrappers (slide right, fade out)', () => {
    const { exit } = buildShortSlideRightVars()
    expect(exit.from).toEqual({ opacity: 1, x: 0, filter: 'blur(0px)' })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.x).toBe(12)
    expect(exit.to.filter).toBe('blur(1px)')
    expect(exit.to.duration).toBe(0.32)
    expect(exit.to.ease).toBe(SHORT_SLIDE_RIGHT_EXIT_EASE_ID)
  })
})
