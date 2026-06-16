import { describe, it, expect } from 'vitest'
import {
  buildUnderlineVars,
  DEFAULT_UNDERLINE_DURATION,
  DEFAULT_UNDERLINE_EASE,
} from '@/lib/motion/text-underline'

describe('buildUnderlineVars', () => {
  it('reveal phase grows from the left to scaleX 1 with defaults', () => {
    const v = buildUnderlineVars({ phase: 'reveal' })
    expect(v.transformOrigin).toBe('left')
    expect(v.scaleX).toBe(1)
    expect(v.duration).toBe(DEFAULT_UNDERLINE_DURATION)
    expect(v.ease).toBe(DEFAULT_UNDERLINE_EASE)
  })

  it('hide phase collapses to the right at scaleX 0', () => {
    const v = buildUnderlineVars({ phase: 'hide' })
    expect(v.transformOrigin).toBe('right')
    expect(v.scaleX).toBe(0)
  })

  it('respects passed duration and ease overrides', () => {
    const v = buildUnderlineVars({ phase: 'reveal', duration: 1.2, ease: 'power2.out' })
    expect(v.duration).toBe(1.2)
    expect(v.ease).toBe('power2.out')
  })

  it('reveal and hide use opposite transform origins (continuous rightward feel)', () => {
    const reveal = buildUnderlineVars({ phase: 'reveal' })
    const hide = buildUnderlineVars({ phase: 'hide' })
    expect(reveal.transformOrigin).not.toBe(hide.transformOrigin)
  })
})
