import { describe, it, expect } from 'vitest'
import {
  buildDualScrambleVars,
  DEFAULT_DUAL_SCRAMBLE_CHARS,
  DEFAULT_DUAL_SCRAMBLE_DURATION,
} from '@/lib/motion/dual-scramble'

describe('buildDualScrambleVars', () => {
  it('builds a ScrambleText tween targeting the final text', () => {
    const v = buildDualScrambleVars({ text: 'Running' })
    expect(v.scrambleText.text).toBe('Running')
    expect(v.ease).toBe('none')
    expect(v.duration).toBe(DEFAULT_DUAL_SCRAMBLE_DURATION)
  })

  it('defaults to the symbol-rich charset', () => {
    const v = buildDualScrambleVars({ text: 'x' })
    expect(v.scrambleText.chars).toBe(DEFAULT_DUAL_SCRAMBLE_CHARS)
    expect(v.scrambleText.chars).toMatch(/[!*^?#]/) // includes glitch symbols
  })

  it('honours custom duration and revealDelay', () => {
    const v = buildDualScrambleVars({ text: 'x', duration: 1, revealDelay: 0.3 })
    expect(v.duration).toBe(1)
    expect(v.delay).toBe(0.3)
  })
})
