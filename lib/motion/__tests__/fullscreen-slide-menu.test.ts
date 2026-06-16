import { describe, it, expect } from 'vitest'
import {
  buildOverlayVars,
  planLinkStagger,
  edgeToHiddenVars,
  DEFAULT_OVERLAY_DURATION,
  DEFAULT_OVERLAY_EASE,
  DEFAULT_LINK_STAGGER,
  DEFAULT_LINK_START_DELAY,
} from '@/lib/motion/fullscreen-slide-menu'

describe('planLinkStagger', () => {
  it('produces strictly increasing delays, one per link', () => {
    const delays = planLinkStagger({ count: 4 })
    expect(delays).toHaveLength(4)
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1])
    }
  })

  it('starts the first link at startDelay and steps by stagger', () => {
    const delays = planLinkStagger({ count: 3, stagger: 0.1, startDelay: 0.4 })
    expect(delays).toHaveLength(3)
    expect(delays[0]).toBeCloseTo(0.4)
    expect(delays[1]).toBeCloseTo(0.5)
    expect(delays[2]).toBeCloseTo(0.6)
  })

  it('uses observed defaults and returns empty for non-positive counts', () => {
    const delays = planLinkStagger({ count: 2 })
    expect(delays[0]).toBeCloseTo(DEFAULT_LINK_START_DELAY)
    expect(delays[1] - delays[0]).toBeCloseTo(DEFAULT_LINK_STAGGER)
    expect(planLinkStagger({ count: 0 })).toEqual([])
    expect(planLinkStagger({ count: -3 })).toEqual([])
  })
})

describe('buildOverlayVars', () => {
  it('defaults to a bottom slide (yPercent 100 -> 0) with observed duration/ease', () => {
    const vars = buildOverlayVars()
    expect(vars.axis).toBe('yPercent')
    expect(vars.hidden).toEqual({ yPercent: 100 })
    expect(vars.shown.yPercent).toBe(0)
    expect(vars.shown.duration).toBe(DEFAULT_OVERLAY_DURATION)
    expect(vars.shown.ease).toBe(DEFAULT_OVERLAY_EASE)
  })

  it('mirrors close (closed) back to the hidden edge value', () => {
    const vars = buildOverlayVars()
    expect(vars.closed.yPercent).toBe(vars.hidden.yPercent)
    expect(vars.closed.duration).toBe(vars.shown.duration)
  })

  it('respects a different slide edge', () => {
    const vars = buildOverlayVars({ from: 'right', duration: 0.5, ease: 'expo.out' })
    expect(vars.axis).toBe('xPercent')
    expect(vars.hidden).toEqual({ xPercent: 100 })
    expect(vars.shown.xPercent).toBe(0)
    expect(vars.shown.duration).toBe(0.5)
    expect(vars.shown.ease).toBe('expo.out')
  })
})

describe('edgeToHiddenVars', () => {
  it('maps each edge to the correct axis and off-screen value', () => {
    expect(edgeToHiddenVars('top')).toEqual({ axis: 'yPercent', hidden: -100 })
    expect(edgeToHiddenVars('bottom')).toEqual({ axis: 'yPercent', hidden: 100 })
    expect(edgeToHiddenVars('left')).toEqual({ axis: 'xPercent', hidden: -100 })
    expect(edgeToHiddenVars('right')).toEqual({ axis: 'xPercent', hidden: 100 })
  })
})
