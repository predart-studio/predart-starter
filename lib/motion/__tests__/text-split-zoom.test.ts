import { describe, it, expect } from 'vitest'
import { splitZoomState, DEFAULT_SPLIT_ZOOM } from '@/lib/motion/text-split-zoom'

describe('splitZoomState', () => {
  it('is collapsed at progress 0', () => {
    const s = splitZoomState(0)
    expect(s.width).toBe(0)
    expect(s.scale).toBe(DEFAULT_SPLIT_ZOOM.minScale)
  })

  it('is full at progress 1', () => {
    const s = splitZoomState(1)
    expect(s.width).toBe(DEFAULT_SPLIT_ZOOM.maxWidth)
    expect(s.scale).toBe(DEFAULT_SPLIT_ZOOM.maxScale)
  })

  it('interpolates linearly at the midpoint', () => {
    const s = splitZoomState(0.5, { maxWidth: 200, minScale: 0, maxScale: 1 })
    expect(s.width).toBe(100)
    expect(s.scale).toBe(0.5)
  })

  it('clamps out-of-range progress', () => {
    expect(splitZoomState(-1).width).toBe(0)
    expect(splitZoomState(2).width).toBe(DEFAULT_SPLIT_ZOOM.maxWidth)
  })
})
