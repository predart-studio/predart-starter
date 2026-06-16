import { describe, it, expect } from 'vitest'
import {
  DEFAULT_RECTANGLE_REVEAL,
  resolveRectangleRevealConfig,
  buildBarVars,
  buildTextVars,
  textStartTime,
  barStartTime,
  splitIntoLines,
} from '@/lib/motion/rectangle-text-reveal'

describe('resolveRectangleRevealConfig', () => {
  it('applies the studied defaults when given nothing', () => {
    expect(resolveRectangleRevealConfig()).toEqual(DEFAULT_RECTANGLE_REVEAL)
  })

  it('respects passed params and merges over defaults', () => {
    const c = resolveRectangleRevealConfig({ distance: 120, stagger: 0.2 })
    expect(c.distance).toBe(120)
    expect(c.stagger).toBe(0.2)
    expect(c.barEase).toBe(DEFAULT_RECTANGLE_REVEAL.barEase) // untouched
  })

  it('clamps textOverlap into [0, 1] and floors negatives at 0', () => {
    expect(resolveRectangleRevealConfig({ textOverlap: 5 }).textOverlap).toBe(1)
    expect(resolveRectangleRevealConfig({ textOverlap: -2 }).textOverlap).toBe(0)
    expect(resolveRectangleRevealConfig({ distance: -50 }).distance).toBe(0)
    expect(resolveRectangleRevealConfig({ stagger: -1 }).stagger).toBe(0)
  })
})

describe('buildBarVars', () => {
  it('collapses the bar to scaleX 0 anchored at the left edge', () => {
    const v = buildBarVars()
    expect(v.scaleX).toBe(0)
    expect(v.transformOrigin).toBe('left center')
    expect(v.duration).toBe(DEFAULT_RECTANGLE_REVEAL.barDuration)
  })
})

describe('buildTextVars', () => {
  it('starts the text offset by `distance` on x and fully transparent', () => {
    const v = buildTextVars({ distance: 80 })
    expect(v.x).toBe(80)
    expect(v.opacity).toBe(0)
    expect(v.ease).toBe(DEFAULT_RECTANGLE_REVEAL.textEase)
  })
})

describe('timeline positioning', () => {
  it('staggers bar start times monotonically by line index', () => {
    const t0 = barStartTime(0)
    const t1 = barStartTime(1)
    const t2 = barStartTime(2)
    expect(t0).toBe(0)
    expect(t1).toBeGreaterThan(t0)
    expect(t2).toBeGreaterThan(t1)
  })

  it('starts each line text after its bar begins (overlap offset)', () => {
    const c = { barDuration: 0.5, textOverlap: 0.7, stagger: 0.12 }
    // line 0 text starts at barDuration * overlap = 0.35
    expect(textStartTime(0, c)).toBeCloseTo(0.35, 5)
    // line 1 text shifted by one stagger
    expect(textStartTime(1, c)).toBeCloseTo(0.35 + 0.12, 5)
    // text always starts at or after its own bar
    expect(textStartTime(0, c)).toBeGreaterThanOrEqual(barStartTime(0, c))
  })
})

describe('splitIntoLines', () => {
  it('splits on explicit newlines and trims blank lines', () => {
    expect(splitIntoLines('one\ntwo\n\nthree')).toEqual(['one', 'two', 'three'])
  })

  it('returns a single line when there are no breaks', () => {
    expect(splitIntoLines('just one line')).toEqual(['just one line'])
  })

  it('never returns an empty array (falls back to one empty line)', () => {
    expect(splitIntoLines('\n\n')).toEqual([''])
  })
})
