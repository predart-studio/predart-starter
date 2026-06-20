import { describe, it, expect } from 'vitest'
import {
  buildScaleDownFadeVars,
  splitWhole,
  SCALE_DOWN_FADE_ENTER_EASE_ID,
  SCALE_DOWN_FADE_EXIT_EASE_ID,
  SCALE_DOWN_FADE_MICRO_DELAY,
} from '@/lib/motion/scale-down-fade'

describe('splitWhole', () => {
  it('returns the host element itself (whole target — no split)', () => {
    const host = { tagName: 'SPAN' } as unknown as HTMLElement
    expect(splitWhole(host)).toBe(host)
  })
})

describe('buildScaleDownFadeVars enter', () => {
  it('starts hidden, low and slightly over-scaled', () => {
    const { enter } = buildScaleDownFadeVars()
    expect(enter.from).toEqual({ opacity: 0, y: 8, scale: 1.04 })
  })

  it('resolves to visible, settled and full-scale', () => {
    const { enter } = buildScaleDownFadeVars()
    expect(enter.to.opacity).toBe(1)
    expect(enter.to.y).toBe(0)
    expect(enter.to.scale).toBe(1)
  })

  it('applies the spec enter defaults (0.52s duration, enter ease)', () => {
    const { enter } = buildScaleDownFadeVars()
    expect(enter.to.duration).toBe(0.52)
    expect(enter.to.ease).toBe(SCALE_DOWN_FADE_ENTER_EASE_ID)
  })
})

describe('buildScaleDownFadeVars exit', () => {
  it('starts from the settled, visible state', () => {
    const { exit } = buildScaleDownFadeVars()
    expect(exit.from).toEqual({ opacity: 1, y: 0, scale: 1 })
  })

  it('resolves to faded, lifted up and shrunk', () => {
    const { exit } = buildScaleDownFadeVars()
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.y).toBe(-8)
    expect(exit.to.scale).toBe(0.94)
  })

  it('applies the spec exit defaults (0.38s duration, exit ease)', () => {
    const { exit } = buildScaleDownFadeVars()
    expect(exit.to.duration).toBe(0.38)
    expect(exit.to.ease).toBe(SCALE_DOWN_FADE_EXIT_EASE_ID)
  })
})

describe('buildScaleDownFadeVars overrides', () => {
  it('lets callers override timing, travel and scale', () => {
    const { enter, exit } = buildScaleDownFadeVars({
      enterDuration: 0.7,
      exitDuration: 0.5,
      yFrom: 16,
      yExit: -16,
      scaleFrom: 1.1,
      scaleExit: 0.9,
    })
    expect(enter.to.duration).toBe(0.7)
    expect(enter.from.y).toBe(16)
    expect(enter.from.scale).toBe(1.1)
    expect(exit.to.duration).toBe(0.5)
    expect(exit.to.y).toBe(-16)
    expect(exit.to.scale).toBe(0.9)
  })

  it('lets callers override the eases', () => {
    const { enter, exit } = buildScaleDownFadeVars({
      enterEase: 'power2.out',
      exitEase: 'power2.in',
    })
    expect(enter.to.ease).toBe('power2.out')
    expect(exit.to.ease).toBe('power2.in')
  })
})

describe('SCALE_DOWN_FADE_MICRO_DELAY', () => {
  it('matches the spec swap micro-delay (20ms in seconds)', () => {
    expect(SCALE_DOWN_FADE_MICRO_DELAY).toBe(0.02)
  })
})
