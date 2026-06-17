import { describe, it, expect } from 'vitest'
import {
  nextOpenState,
  DEFAULT_ACCORDION_DURATION,
  DEFAULT_ACCORDION_ICON_ROTATION,
  DEFAULT_ACCORDION_STAGGER,
} from '@/lib/motion/accordion'

describe('nextOpenState', () => {
  it('single-open: opening a panel closes all others', () => {
    expect(nextOpenState({ open: [0], index: 2, multiple: false })).toEqual([2])
  })

  it('single-open: opening from an empty set opens just the clicked panel', () => {
    expect(nextOpenState({ open: [], index: 1, multiple: false })).toEqual([1])
  })

  it('collapse: clicking an already-open panel closes it (single-open)', () => {
    expect(nextOpenState({ open: [3], index: 3, multiple: false })).toEqual([])
  })

  it('multi-open: opening a panel keeps the others open', () => {
    expect(nextOpenState({ open: [0, 2], index: 1, multiple: true })).toEqual([0, 1, 2])
  })

  it('multi-open: collapsing one leaves the rest untouched', () => {
    expect(nextOpenState({ open: [0, 1, 2], index: 1, multiple: true })).toEqual([0, 2])
  })

  it('returns a sorted, de-duplicated set', () => {
    expect(nextOpenState({ open: [2, 0], index: 1, multiple: true })).toEqual([0, 1, 2])
    // re-clicking an open index never duplicates it
    expect(nextOpenState({ open: [0, 1], index: 1, multiple: true })).toEqual([0])
  })

  it('exposes the source-matched motion defaults', () => {
    expect(DEFAULT_ACCORDION_DURATION).toBe(0.8)
    expect(DEFAULT_ACCORDION_ICON_ROTATION).toBe(-180)
    expect(DEFAULT_ACCORDION_STAGGER.yPercent).toBe(110)
    expect(DEFAULT_ACCORDION_STAGGER.ease).toBe('expo.out')
  })
})
