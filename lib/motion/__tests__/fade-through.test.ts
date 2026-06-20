import { describe, it, expect } from 'vitest'
import {
  buildFadeThroughVars,
  splitWhole,
  FADE_THROUGH_ENTER_EASE_ID,
  FADE_THROUGH_EXIT_EASE_ID,
  FADE_THROUGH_MICRO_DELAY,
} from '@/lib/motion/fade-through'

describe('splitWhole', () => {
  it('returns the host element itself (whole target — no split)', () => {
    const host = { tagName: 'SPAN' } as unknown as HTMLElement
    expect(splitWhole(host)).toBe(host)
  })
})

describe('buildFadeThroughVars enter', () => {
  it('starts hidden, low, slightly shrunk and blurred', () => {
    const { enter } = buildFadeThroughVars()
    expect(enter.from).toEqual({ opacity: 0, y: 6, scale: 0.99, filter: 'blur(2px)' })
  })

  it('resolves to visible, settled, full-scale and crisp', () => {
    const { enter } = buildFadeThroughVars()
    expect(enter.to.opacity).toBe(1)
    expect(enter.to.y).toBe(0)
    expect(enter.to.scale).toBe(1)
    expect(enter.to.filter).toBe('blur(0px)')
  })

  it('applies the spec enter defaults (0.42s duration, enter ease)', () => {
    const { enter } = buildFadeThroughVars()
    expect(enter.to.duration).toBe(0.42)
    expect(enter.to.ease).toBe(FADE_THROUGH_ENTER_EASE_ID)
  })
})

describe('buildFadeThroughVars exit', () => {
  it('starts from the settled, visible state', () => {
    const { exit } = buildFadeThroughVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
  })

  it('resolves to faded and lifted up', () => {
    const { exit } = buildFadeThroughVars()
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-4)
    expect(exit.to.scale).toBe(1)
  })

  it('applies the spec exit defaults (0.26s duration, exit ease)', () => {
    const { exit } = buildFadeThroughVars()
    expect(exit.to.duration).toBe(0.26)
    expect(exit.to.ease).toBe(FADE_THROUGH_EXIT_EASE_ID)
  })
})

describe('buildFadeThroughVars overrides', () => {
  it('lets callers override timing, travel, scale and blur', () => {
    const { enter, exit } = buildFadeThroughVars({
      enterDuration: 0.6,
      exitDuration: 0.4,
      yFrom: 12,
      yExit: -10,
      scaleFrom: 0.95,
      blurFrom: 5,
    })
    expect(enter.to.duration).toBe(0.6)
    expect(enter.from.y).toBe(12)
    expect(enter.from.scale).toBe(0.95)
    expect(enter.from.filter).toBe('blur(5px)')
    expect(exit.to.duration).toBe(0.4)
    expect(exit.to.y).toBe(-10)
  })

  it('lets callers override the eases', () => {
    const { enter, exit } = buildFadeThroughVars({
      enterEase: 'power2.out',
      exitEase: 'power2.in',
    })
    expect(enter.to.ease).toBe('power2.out')
    expect(exit.to.ease).toBe('power2.in')
  })
})

describe('FADE_THROUGH_MICRO_DELAY', () => {
  it('matches the spec swap micro-delay (60ms in seconds)', () => {
    expect(FADE_THROUGH_MICRO_DELAY).toBe(0.06)
  })
})
