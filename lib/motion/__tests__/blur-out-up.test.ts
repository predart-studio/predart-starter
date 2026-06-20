import { describe, it, expect } from 'vitest'
import {
  buildBlurOutUpVars,
  splitWords,
  BLUR_OUT_UP_ENTER_EASE_ID,
  BLUR_OUT_UP_EXIT_EASE_ID,
  BLUR_OUT_UP_MICRO_DELAY,
} from '@/lib/motion/blur-out-up'

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
    expect(splitWords('Clear in, airy out.')).toEqual([
      { text: 'Clear', isWord: true },
      { text: ' ', isWord: false },
      { text: 'in,', isWord: true },
      { text: ' ', isWord: false },
      { text: 'airy', isWord: true },
      { text: ' ', isWord: false },
      { text: 'out.', isWord: true },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildBlurOutUpVars enter', () => {
  it('starts hidden, low and lightly blurred', () => {
    const { enter } = buildBlurOutUpVars()
    expect(enter.from).toEqual({ opacity: 0, y: 10, filter: 'blur(6px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { enter } = buildBlurOutUpVars()
    expect(enter.to.opacity).toBe(1)
    expect(enter.to.y).toBe(0)
    expect(enter.to.filter).toBe('blur(0px)')
  })

  it('applies the spec enter defaults (0.56s duration, 28ms stagger, enter ease)', () => {
    const { enter } = buildBlurOutUpVars()
    expect(enter.to.duration).toBe(0.56)
    expect(enter.to.stagger).toBe(0.028)
    expect(enter.to.ease).toBe(BLUR_OUT_UP_ENTER_EASE_ID)
  })
})

describe('buildBlurOutUpVars exit', () => {
  it('starts from the settled, visible, crisp state', () => {
    const { exit } = buildBlurOutUpVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, filter: 'blur(0px)' })
  })

  it('resolves to faded, lifted up and heavily blurred (the signature exit)', () => {
    const { exit } = buildBlurOutUpVars()
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-14)
    expect(exit.to.filter).toBe('blur(8px)')
  })

  it('applies the spec exit defaults (0.48s duration, 24ms stagger, exit ease)', () => {
    const { exit } = buildBlurOutUpVars()
    expect(exit.to.duration).toBe(0.48)
    expect(exit.to.stagger).toBe(0.024)
    expect(exit.to.ease).toBe(BLUR_OUT_UP_EXIT_EASE_ID)
  })
})

describe('buildBlurOutUpVars overrides', () => {
  it('lets callers override timing, travel and blur on both phases', () => {
    const { enter, exit } = buildBlurOutUpVars({
      enterDuration: 0.7,
      exitDuration: 0.6,
      enterStagger: 0.05,
      exitStagger: 0.04,
      yFrom: 16,
      yExit: -24,
      blurFrom: 10,
      blurExit: 14,
    })
    expect(enter.to.duration).toBe(0.7)
    expect(enter.to.stagger).toBe(0.05)
    expect(enter.from.y).toBe(16)
    expect(enter.from.filter).toBe('blur(10px)')
    expect(exit.to.duration).toBe(0.6)
    expect(exit.to.stagger).toBe(0.04)
    expect(exit.to.y).toBe(-24)
    expect(exit.to.filter).toBe('blur(14px)')
  })

  it('lets callers override the eases', () => {
    const { enter, exit } = buildBlurOutUpVars({
      enterEase: 'power2.out',
      exitEase: 'power2.in',
    })
    expect(enter.to.ease).toBe('power2.out')
    expect(exit.to.ease).toBe('power2.in')
  })
})

describe('BLUR_OUT_UP_MICRO_DELAY', () => {
  it('matches the spec swap micro-delay (35ms in seconds)', () => {
    expect(BLUR_OUT_UP_MICRO_DELAY).toBe(0.035)
  })
})
