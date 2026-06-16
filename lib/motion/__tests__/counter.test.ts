import { describe, it, expect } from 'vitest'
import { formatThousands, toTokens, digitRollY } from '@/lib/motion/counter'

describe('formatThousands', () => {
  it('groups thousands with a comma', () => {
    expect(formatThousands(10482)).toBe('10,482')
  })

  it('leaves sub-thousand values ungrouped', () => {
    expect(formatThousands(5)).toBe('5')
  })

  it('groups every three digits for large values', () => {
    expect(formatThousands(1000000)).toBe('1,000,000')
  })

  it('respects a custom separator', () => {
    expect(formatThousands(10482, '.')).toBe('10.482')
  })
})

describe('toTokens', () => {
  it('splits into per-character digit and separator tokens', () => {
    expect(toTokens(10482)).toEqual(['1', '0', ',', '4', '8', '2'])
  })

  it('has one token per formatted character', () => {
    expect(toTokens(1000000)).toHaveLength('1,000,000'.length)
  })
})

describe('digitRollY', () => {
  it('is 0 for digit 0', () => {
    expect(digitRollY(0)).toBe(0)
  })

  it('shifts up 10% (one of ten cells) per digit', () => {
    expect(digitRollY(7)).toBe(-70)
    expect(digitRollY(4)).toBe(-40)
  })
})
