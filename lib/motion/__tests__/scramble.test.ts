import { describe, it, expect } from 'vitest'
import { buildScrambleVars, DEFAULT_SCRAMBLE_CHARS } from '@/lib/motion/scramble'

describe('buildScrambleVars', () => {
  it('passes the target text into scrambleText', () => {
    const vars = buildScrambleVars({ text: 'PREDART' })
    expect(vars.scrambleText.text).toBe('PREDART')
  })

  it('applies the default character set when none is given', () => {
    const vars = buildScrambleVars({ text: 'X' })
    expect(vars.scrambleText.chars).toBe(DEFAULT_SCRAMBLE_CHARS)
  })

  it('lets callers override chars, speed, duration and delay', () => {
    const vars = buildScrambleVars({
      text: 'X',
      chars: '01',
      speed: 0.8,
      duration: 2,
      revealDelay: 0.3,
    })
    expect(vars.scrambleText.chars).toBe('01')
    expect(vars.scrambleText.speed).toBe(0.8)
    expect(vars.duration).toBe(2)
    expect(vars.delay).toBe(0.3)
  })

  it('uses a linear ease so the scramble cadence is even', () => {
    expect(buildScrambleVars({ text: 'X' }).ease).toBe('none')
  })
})
