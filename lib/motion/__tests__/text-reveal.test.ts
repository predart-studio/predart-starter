import { describe, it, expect } from 'vitest'
import { splitTokens } from '@/lib/motion/text-reveal'

describe('splitTokens', () => {
  it('splits into characters in char mode', () => {
    expect(splitTokens('abc', 'char')).toEqual(['a', 'b', 'c'])
  })

  it('splits into words and rejoins to the original in word mode', () => {
    const text = 'reveal me word by word'
    const tokens = splitTokens(text, 'word')
    expect(tokens).toHaveLength(5)
    expect(tokens.join('')).toBe(text)
  })

  it('returns an empty array for an empty string', () => {
    expect(splitTokens('', 'word')).toEqual([])
  })
})
