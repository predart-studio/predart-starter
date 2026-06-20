import { describe, it, expect } from 'vitest'
import {
  buildDepthParallaxWordsVars,
  splitWords,
  DEPTH_PARALLAX_WORDS_ENTER_EASE_ID,
  DEPTH_PARALLAX_WORDS_EXIT_EASE_ID,
} from '@/lib/motion/depth-parallax-words'

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
    expect(splitWords('Depth in every word.')).toEqual([
      { text: 'Depth', isWord: true },
      { text: ' ', isWord: false },
      { text: 'in', isWord: true },
      { text: ' ', isWord: false },
      { text: 'every', isWord: true },
      { text: ' ', isWord: false },
      { text: 'word.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildDepthParallaxWordsVars', () => {
  it('starts hidden, low, small and blurred', () => {
    const { from } = buildDepthParallaxWordsVars()
    expect(from).toEqual({ opacity: 0, y: 18, scale: 0.92, filter: 'blur(3px)' })
  })

  it('resolves to visible, settled, full-scale and crisp', () => {
    const { to } = buildDepthParallaxWordsVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.scale).toBe(1)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.7s duration, 70ms stagger, enter ease)', () => {
    const { to } = buildDepthParallaxWordsVars()
    expect(to.duration).toBe(0.7)
    expect(to.stagger).toBe(0.07)
    expect(to.ease).toBe(DEPTH_PARALLAX_WORDS_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildDepthParallaxWordsVars({
      duration: 1,
      stagger: 0.05,
      yFrom: 24,
      scaleFrom: 0.8,
      blurFrom: 6,
    })
    expect(to.duration).toBe(1)
    expect(to.stagger).toBe(0.05)
    expect(from.y).toBe(24)
    expect(from.scale).toBe(0.8)
    expect(from.filter).toBe('blur(6px)')
  })

  it('lets callers override the ease', () => {
    const { to } = buildDepthParallaxWordsVars({ ease: 'power2.out' })
    expect(to.ease).toBe('power2.out')
  })

  it('exposes the spec exit phase for swap wrappers (drift up, scale past, re-blur, fade out)', () => {
    const { exit } = buildDepthParallaxWordsVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-10)
    expect(exit.to.scale).toBe(1.05)
    expect(exit.to.filter).toBe('blur(2px)')
    expect(exit.to.duration).toBe(0.5)
    expect(exit.to.stagger).toBe(0.045)
    expect(exit.to.ease).toBe(DEPTH_PARALLAX_WORDS_EXIT_EASE_ID)
  })
})
