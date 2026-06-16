import { describe, it, expect } from 'vitest'
import {
  buildRainbowButtonVars,
  DEFAULT_RAINBOW_PERIOD,
  DEFAULT_RAINBOW_TRACK_WIDTH,
  DEFAULT_RAINBOW_COLORS,
} from '@/lib/motion/rainbow-button'

describe('buildRainbowButtonVars', () => {
  it('applies sensible defaults (2s linear loop, 200% sweep, repeat forever)', () => {
    const vars = buildRainbowButtonVars()
    expect(vars['--rainbow-pos']).toBe(`${DEFAULT_RAINBOW_TRACK_WIDTH}%`)
    expect(vars.duration).toBe(DEFAULT_RAINBOW_PERIOD)
    expect(vars.ease).toBe('none')
    expect(vars.repeat).toBe(-1)
  })

  it('respects a custom period and track width', () => {
    const vars = buildRainbowButtonVars({ period: 4, trackWidth: 300 })
    expect(vars.duration).toBe(4)
    expect(vars['--rainbow-pos']).toBe('300%')
  })

  it('falls back to the default period when given a non-positive value', () => {
    expect(buildRainbowButtonVars({ period: 0 }).duration).toBe(DEFAULT_RAINBOW_PERIOD)
    expect(buildRainbowButtonVars({ period: -1 }).duration).toBe(DEFAULT_RAINBOW_PERIOD)
  })

  it('always loops forever and stays linear (no easing on a continuous sweep)', () => {
    const vars = buildRainbowButtonVars({ period: 10 })
    expect(vars.repeat).toBe(-1)
    expect(vars.ease).toBe('none')
  })

  it('exposes the 5 observed rainbow stops in order', () => {
    expect(DEFAULT_RAINBOW_COLORS).toHaveLength(5)
    expect(DEFAULT_RAINBOW_COLORS[0]).toBe('#ff4242')
    expect(DEFAULT_RAINBOW_COLORS[4]).toBe('#a166ff')
  })
})
