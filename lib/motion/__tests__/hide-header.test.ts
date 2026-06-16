import { describe, it, expect } from 'vitest'
import {
  decideHeaderState,
  buildHideHeaderVars,
  DEFAULT_HIDE_THRESHOLD,
} from '@/lib/motion/hide-header'

describe('decideHeaderState', () => {
  it('hides when scrolling down past the threshold', () => {
    expect(
      decideHeaderState({ direction: 1, scrollY: 600, threshold: 80 }),
    ).toBe('hide')
  })

  it('shows when scrolling up (any position past the threshold)', () => {
    expect(
      decideHeaderState({ direction: -1, scrollY: 600, threshold: 80 }),
    ).toBe('show')
  })

  it('always shows at or above the threshold even when scrolling down', () => {
    expect(
      decideHeaderState({ direction: 1, scrollY: 40, threshold: 80 }),
    ).toBe('show')
    expect(
      decideHeaderState({ direction: 1, scrollY: 80, threshold: 80 }),
    ).toBe('show')
  })

  it('uses the default threshold sensibly', () => {
    expect(
      decideHeaderState({
        direction: 1,
        scrollY: DEFAULT_HIDE_THRESHOLD - 1,
        threshold: DEFAULT_HIDE_THRESHOLD,
      }),
    ).toBe('show')
    expect(
      decideHeaderState({
        direction: 1,
        scrollY: DEFAULT_HIDE_THRESHOLD + 1,
        threshold: DEFAULT_HIDE_THRESHOLD,
      }),
    ).toBe('hide')
  })
})

describe('buildHideHeaderVars', () => {
  it('hides by translating up 100%', () => {
    expect(buildHideHeaderVars('hide').yPercent).toBe(-100)
  })

  it('shows by returning to rest', () => {
    expect(buildHideHeaderVars('show').yPercent).toBe(0)
  })

  it('carries duration and ease defaults', () => {
    const vars = buildHideHeaderVars('hide')
    expect(vars.duration).toBeGreaterThan(0)
    expect(typeof vars.ease).toBe('string')
  })
})
