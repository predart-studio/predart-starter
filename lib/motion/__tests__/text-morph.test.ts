import { describe, it, expect } from 'vitest'
import {
  diffChars,
  tagChars,
  flipIdFor,
  nextPhraseIndex,
} from '@/lib/motion/text-morph'

describe('flipIdFor / tagChars', () => {
  it('encodes char code + occurrence and disambiguates repeats', () => {
    // "nn" -> both 'n' (code 110) but occurrence 1 and 2
    const tagged = tagChars('nn')
    expect(tagged[0].flipId).toBe(flipIdFor('n', 1))
    expect(tagged[1].flipId).toBe(flipIdFor('n', 2))
    expect(tagged[0].flipId).not.toBe(tagged[1].flipId)
    expect(tagged[0].flipId).toBe('char-110-1')
  })
})

describe('diffChars', () => {
  it('marks a glyph present in both words (by occurrence) as shared with a stable id', () => {
    // 'a' (occurrence 1) exists in both -> shared, same flipId in both directions
    const out = diffChars('cat', 'car')
    const a = out.find((c) => c.char === 'a' && c.role !== 'exit')
    expect(a).toBeDefined()
    expect(a!.role).toBe('shared')
    expect(a!.flipId).toBe(flipIdFor('a', 1))
    // 'c' shared too
    expect(out.find((c) => c.char === 'c')!.role).toBe('shared')
  })

  it('classifies new-only chars as enter and old-only chars as exit', () => {
    const out = diffChars('cat', 'car')
    // 'r' is only in the new word -> enter
    const r = out.find((c) => c.char === 'r')
    expect(r).toBeDefined()
    expect(r!.role).toBe('enter')
    // 't' is only in the old word -> exit (appended after new chars)
    const t = out.find((c) => c.char === 't')
    expect(t).toBeDefined()
    expect(t!.role).toBe('exit')
  })

  it('treats every char as enter when morphing from empty', () => {
    const out = diffChars('', 'hi')
    expect(out).toHaveLength(2)
    expect(out.every((c) => c.role === 'enter')).toBe(true)
  })

  it('treats every char as exit when morphing to empty', () => {
    const out = diffChars('hi', '')
    expect(out).toHaveLength(2)
    expect(out.every((c) => c.role === 'exit')).toBe(true)
  })

  it('handles a real word pair (Running Shoes -> Trail Boots) without losing shared chars', () => {
    const out = diffChars('Running Shoes', 'Trail Boots')
    const newChars = out.filter((c) => c.role !== 'exit')
    expect(newChars.map((c) => c.char).join('')).toBe('Trail Boots')
    // shared 'o' (occurrence 1) appears in both ("Shoes" o#1, "Boots" o#1)
    const sharedO = out.find((c) => c.char === 'o' && c.role === 'shared')
    expect(sharedO).toBeDefined()
  })
})

describe('nextPhraseIndex', () => {
  it('advances and wraps back to 0 at the end', () => {
    expect(nextPhraseIndex(0, 3)).toBe(1)
    expect(nextPhraseIndex(1, 3)).toBe(2)
    expect(nextPhraseIndex(2, 3)).toBe(0)
  })

  it('is safe for empty / single-item lists', () => {
    expect(nextPhraseIndex(0, 0)).toBe(0)
    expect(nextPhraseIndex(0, 1)).toBe(0)
  })
})
