import { describe, it, expect } from 'vitest'
import {
  backgroundColorAt,
  hexToRgb,
  lerpRgb,
  DEFAULT_BACKGROUND_STOPS,
} from '@/lib/motion/background-color'

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#0a0a0a')).toEqual({ r: 10, g: 10, b: 10 })
    expect(hexToRgb('#fafafa')).toEqual({ r: 250, g: 250, b: 250 })
  })

  it('expands 3-digit shorthand', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('lerpRgb', () => {
  it('returns the midpoint at t=0.5', () => {
    expect(lerpRgb({ r: 10, g: 10, b: 10 }, { r: 250, g: 250, b: 250 }, 0.5)).toBe('rgb(130, 130, 130)')
  })

  it('clamps t outside 0..1', () => {
    expect(lerpRgb({ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }, 2)).toBe('rgb(100, 100, 100)')
    expect(lerpRgb({ r: 0, g: 0, b: 0 }, { r: 100, g: 100, b: 100 }, -1)).toBe('rgb(0, 0, 0)')
  })
})

describe('backgroundColorAt', () => {
  it('returns the first stop at progress 0', () => {
    expect(backgroundColorAt(0, DEFAULT_BACKGROUND_STOPS)).toBe('rgb(10, 10, 10)')
  })

  it('returns the last stop at progress 1', () => {
    expect(backgroundColorAt(1, DEFAULT_BACKGROUND_STOPS)).toBe('rgb(250, 250, 250)')
  })

  it('interpolates between adjacent stops at the midpoint', () => {
    // 2 stops → single segment, midpoint is the rgb average
    expect(backgroundColorAt(0.5, DEFAULT_BACKGROUND_STOPS)).toBe('rgb(130, 130, 130)')
  })

  it('picks the correct segment with 3+ stops', () => {
    const stops = ['#000000', '#808080', '#ffffff']
    // progress 0.25 → first half of segment 0 (black→gray), t=0.5 → gray-ish midpoint
    expect(backgroundColorAt(0.25, stops)).toBe('rgb(64, 64, 64)')
    // progress 0.5 → exactly the middle stop
    expect(backgroundColorAt(0.5, stops)).toBe('rgb(128, 128, 128)')
    // progress 0.75 → midpoint of segment 1 (gray→white)
    expect(backgroundColorAt(0.75, stops)).toBe('rgb(192, 192, 192)')
  })

  it('returns the single stop unchanged when only one is given', () => {
    expect(backgroundColorAt(0.7, ['#0a0a0a'])).toBe('rgb(10, 10, 10)')
  })
})
