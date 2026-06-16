import { describe, it, expect } from 'vitest'
import {
  splitFoldChars,
  buildFoldVars,
  DEFAULT_FOLD_ROTATION,
  DEFAULT_FOLD_STAGGER,
  DEFAULT_FOLD_ORIGIN,
} from '@/lib/motion/folding-text'

describe('splitFoldChars', () => {
  it('splits a single word into one token per character, none flagged as space', () => {
    const tokens = splitFoldChars('SHOES')
    expect(tokens).toHaveLength(5)
    expect(tokens.map((t) => t.char).join('')).toBe('SHOES')
    expect(tokens.every((t) => !t.isSpace)).toBe(true)
  })

  it('keeps word gaps as a single non-folding space token', () => {
    const tokens = splitFoldChars('RUNNING SHOES')
    const spaces = tokens.filter((t) => t.isSpace)
    expect(spaces).toHaveLength(1)
    expect(spaces[0].char).toBe(' ')
    expect(tokens.filter((t) => !t.isSpace)).toHaveLength(12) // RUNNINGSHOES
  })

  it('collapses consecutive whitespace into one space token', () => {
    const tokens = splitFoldChars('A   B')
    expect(tokens.filter((t) => t.isSpace)).toHaveLength(1)
    expect(tokens.map((t) => t.char).join('')).toBe('A B')
  })
})

describe('buildFoldVars', () => {
  it('applies the studied defaults (rotateY 90 -> 0, opacity 0 -> 1, left hinge)', () => {
    const { from, to } = buildFoldVars()
    expect(from.rotationY).toBe(DEFAULT_FOLD_ROTATION)
    expect(from.opacity).toBe(0)
    expect(from.transformOrigin).toBe(DEFAULT_FOLD_ORIGIN)
    expect(to.rotationY).toBe(0)
    expect(to.opacity).toBe(1)
  })

  it('staggers from the trailing edge by default (right-to-left wave)', () => {
    const { to } = buildFoldVars()
    expect(to.stagger).toEqual({ each: DEFAULT_FOLD_STAGGER, from: 'end' })
  })

  it('respects passed rotation, stagger, staggerFrom, and ease', () => {
    const { from, to } = buildFoldVars({
      rotation: -90,
      stagger: 0.1,
      staggerFrom: 'center',
      ease: 'expo.out',
    })
    expect(from.rotationY).toBe(-90)
    expect(to.ease).toBe('expo.out')
    expect(to.stagger).toEqual({ each: 0.1, from: 'center' })
  })
})
