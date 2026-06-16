import { describe, it, expect } from 'vitest'
import {
  buildPoppingFromVars,
  buildPoppingToVars,
  buildPoppingScrollTrigger,
  DEFAULT_POP_DURATION,
  DEFAULT_POP_EASE,
  DEFAULT_POP_STAGGER,
  DEFAULT_POP_SCRUB,
} from '@/lib/motion/popping-text'

describe('buildPoppingFromVars', () => {
  it('starts chars hidden and collapsed (scale 0, opacity 0)', () => {
    expect(buildPoppingFromVars()).toEqual({ scale: 0, opacity: 0 })
  })

  it('respects a custom fromScale', () => {
    expect(buildPoppingFromVars({ fromScale: 0.4 })).toEqual({ scale: 0.4, opacity: 0 })
  })
})

describe('buildPoppingToVars', () => {
  it('applies sensible defaults (pops to full scale + opacity with a back ease)', () => {
    const v = buildPoppingToVars()
    expect(v.scale).toBe(1)
    expect(v.opacity).toBe(1)
    expect(v.duration).toBe(DEFAULT_POP_DURATION)
    expect(v.ease).toBe(DEFAULT_POP_EASE)
    expect(v.stagger).toBe(DEFAULT_POP_STAGGER)
    // overshoot ease, not linear — the "pop"
    expect(v.ease).toMatch(/back/)
  })

  it('respects passed params', () => {
    const v = buildPoppingToVars({ duration: 1.2, ease: 'elastic.out(1, 0.4)', stagger: 0.15 })
    expect(v.duration).toBe(1.2)
    expect(v.ease).toBe('elastic.out(1, 0.4)')
    expect(v.stagger).toBe(0.15)
    expect(v.scale).toBe(1)
  })
})

describe('buildPoppingScrollTrigger', () => {
  it('wires a scrubbed, unpinned per-line trigger by default', () => {
    const el = { tagName: 'DIV' }
    const st = buildPoppingScrollTrigger(el)
    expect(st.trigger).toBe(el)
    expect(st.scrub).toBe(DEFAULT_POP_SCRUB)
    expect(st.start).toMatch(/top/)
    expect(st.end).toMatch(/top/)
    expect('pin' in st).toBe(false)
  })

  it('respects custom start/end/scrub', () => {
    const st = buildPoppingScrollTrigger(null, { start: 'top 90%', end: 'top 30%', scrub: 1.5 })
    expect(st.start).toBe('top 90%')
    expect(st.end).toBe('top 30%')
    expect(st.scrub).toBe(1.5)
  })
})
