import { describe, it, expect } from 'vitest'
import {
  buildTooltipHiddenVars,
  buildTooltipVisibleVars,
  tooltipTransformOrigin,
  DEFAULT_TOOLTIP_OFFSET,
  DEFAULT_TOOLTIP_SCALE_FROM,
} from '@/lib/motion/tooltip'

describe('buildTooltipHiddenVars', () => {
  it('applies sensible defaults (top side: hidden, scaled down, pushed below anchor)', () => {
    expect(buildTooltipHiddenVars()).toEqual({
      opacity: 0,
      scale: DEFAULT_TOOLTIP_SCALE_FROM,
      x: 0,
      y: DEFAULT_TOOLTIP_OFFSET,
    })
  })

  it('flips the offset axis/sign per side', () => {
    expect(buildTooltipHiddenVars({ side: 'top', offset: 8 }).y).toBe(8)
    expect(buildTooltipHiddenVars({ side: 'bottom', offset: 8 }).y).toBe(-8)
    expect(buildTooltipHiddenVars({ side: 'left', offset: 8 }).x).toBe(8)
    expect(buildTooltipHiddenVars({ side: 'right', offset: 8 }).x).toBe(-8)
  })

  it('respects passed scaleFrom and offset', () => {
    const v = buildTooltipHiddenVars({ side: 'right', scaleFrom: 0.5, offset: 20 })
    expect(v.scale).toBe(0.5)
    expect(v.x).toBe(-20)
    expect(v.opacity).toBe(0)
  })
})

describe('buildTooltipVisibleVars', () => {
  it('is the fully settled state (no offset, no scale, full opacity)', () => {
    expect(buildTooltipVisibleVars()).toEqual({ opacity: 1, scale: 1, x: 0, y: 0 })
  })
})

describe('tooltipTransformOrigin', () => {
  it('anchors the origin to the edge nearest the trigger for each side', () => {
    expect(tooltipTransformOrigin('top')).toBe('center bottom')
    expect(tooltipTransformOrigin('bottom')).toBe('center top')
    expect(tooltipTransformOrigin('left')).toBe('right center')
    expect(tooltipTransformOrigin('right')).toBe('left center')
  })
})
