import { describe, it, expect } from 'vitest'
import {
  splitWords,
  wordsOf,
  mix,
  computeCenteredPositions,
  buildKineticCenterBuildVars,
  KINETIC_CENTER_BUILD_ENTER_EASE_ID,
  KINETIC_CENTER_BUILD_EXIT_EASE_ID,
} from '@/lib/motion/kinetic-center-build'

describe('splitWords', () => {
  it('splits into word and whitespace units, marking words', () => {
    expect(splitWords('Words push left')).toEqual([
      { text: 'Words', isWord: true },
      { text: ' ', isWord: false },
      { text: 'push', isWord: true },
      { text: ' ', isWord: false },
      { text: 'left', isWord: true },
    ])
  })

  it('preserves whitespace runs as their own (non-word) units', () => {
    const units = splitWords('a   b')
    expect(units).toEqual([
      { text: 'a', isWord: true },
      { text: '   ', isWord: false },
      { text: 'b', isWord: true },
    ])
  })

  it('keeps astral characters intact inside a word', () => {
    expect(splitWords('hi😀 there')).toEqual([
      { text: 'hi😀', isWord: true },
      { text: ' ', isWord: false },
      { text: 'there', isWord: true },
    ])
  })

  it('handles empty input', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('wordsOf', () => {
  it('returns just the word strings, dropping whitespace', () => {
    expect(wordsOf('Words push left.')).toEqual(['Words', 'push', 'left.'])
  })

  it('returns an empty array for whitespace-only input', () => {
    expect(wordsOf('   ')).toEqual([])
  })
})

describe('mix', () => {
  it('blends linearly between two values', () => {
    expect(mix(0, 10, 0)).toBe(0)
    expect(mix(0, 10, 1)).toBe(10)
    expect(mix(0, 10, 0.58)).toBeCloseTo(5.8)
  })
})

describe('computeCenteredPositions', () => {
  it('returns an empty array for no words', () => {
    expect(computeCenteredPositions([], 10)).toEqual([])
  })

  it('centers a single word on the origin', () => {
    expect(computeCenteredPositions([40], 10)).toEqual([0])
  })

  it('centers a line so the whole phrase is symmetric about 0', () => {
    // widths 20 + 30 with a 10px gap → total 60, line spans -30..30.
    // first center: -30 + 10 = -20; second center: -30 + 20 + 10 + 15 = 15.
    const pos = computeCenteredPositions([20, 30], 10)
    expect(pos).toEqual([-20, 15])
    // symmetric: distance from each edge to the line center matches.
    const lineCenter = (pos[0] - 20 / 2 + (pos[1] + 30 / 2)) / 2
    expect(lineCenter).toBeCloseTo(0)
  })

  it('advances the cursor by width + gap for each word', () => {
    // three equal 20px words, 10px gaps → total 80, span -40..40.
    expect(computeCenteredPositions([20, 20, 20], 10)).toEqual([-30, 0, 30])
  })
})

describe('buildKineticCenterBuildVars', () => {
  it('starts an incoming word offset right, faded, blurred and slightly scaled', () => {
    const { from } = buildKineticCenterBuildVars()
    expect(from).toEqual({
      opacity: 0,
      x: 88,
      y: 6,
      scale: 0.992,
      filter: 'blur(3.5px)',
    })
  })

  it('resolves to a centered, crisp, opaque word', () => {
    const { to } = buildKineticCenterBuildVars()
    expect(to.opacity).toBe(1)
    expect(to.x).toBe(0)
    expect(to.y).toBe(0)
    expect(to.scale).toBe(1)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (push 0.43s, 0.09s cadence, enter ease)', () => {
    const { to } = buildKineticCenterBuildVars()
    expect(to.duration).toBe(0.43)
    expect(to.stagger).toBe(0.09)
    expect(to.ease).toBe(KINETIC_CENTER_BUILD_ENTER_EASE_ID)
  })

  it('exposes the layout knobs the component needs (entryOffset, wordGap, reflowBlur)', () => {
    const vars = buildKineticCenterBuildVars()
    expect(vars.entryOffset).toBe(88)
    expect(vars.wordGap).toBe(10)
    expect(vars.reflowBlur).toBe(0.8)
  })

  it('exposes the exit phase from the spec on the exit ease', () => {
    const { exit } = buildKineticCenterBuildVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, filter: 'blur(0px)' })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-6)
    expect(exit.to.filter).toBe('blur(2.5px)')
    expect(exit.to.ease).toBe(KINETIC_CENTER_BUILD_EXIT_EASE_ID)
  })

  it('lets callers override timing and layout', () => {
    const { from, to, entryOffset, wordGap } = buildKineticCenterBuildVars({
      duration: 0.6,
      stagger: 0.12,
      entryOffset: 120,
      wordGap: 16,
      yFrom: 10,
      scaleFrom: 0.98,
      blurFrom: 5,
    })
    expect(to.duration).toBe(0.6)
    expect(to.stagger).toBe(0.12)
    expect(entryOffset).toBe(120)
    expect(wordGap).toBe(16)
    expect(from.x).toBe(120)
    expect(from.y).toBe(10)
    expect(from.scale).toBe(0.98)
    expect(from.filter).toBe('blur(5px)')
  })
})
