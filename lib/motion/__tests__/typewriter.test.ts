import { describe, it, expect } from 'vitest'
import {
  buildTypewriterTimeline,
  DEFAULT_TYPEWRITER,
} from '@/lib/motion/typewriter'

describe('buildTypewriterTimeline', () => {
  it('produces one segment per phrase', () => {
    const segs = buildTypewriterTimeline({ phrases: ['ab', 'cde'] })
    expect(segs).toHaveLength(2)
    expect(segs.map((s) => s.phrase)).toEqual(['ab', 'cde'])
  })

  it('scales type/delete duration by phrase length and speed', () => {
    const segs = buildTypewriterTimeline({
      phrases: ['abcd'],
      typeSpeed: 0.1,
      deleteSpeed: 0.05,
    })
    expect(segs[0].typeDuration).toBeCloseTo(0.4)
    expect(segs[0].deleteDuration).toBeCloseTo(0.2)
  })

  it('applies default timing when omitted', () => {
    const [seg] = buildTypewriterTimeline({ phrases: ['x'] })
    expect(seg.typeDuration).toBeCloseTo(DEFAULT_TYPEWRITER.typeSpeed)
    expect(seg.pauseAfterType).toBe(DEFAULT_TYPEWRITER.pauseAfterType)
    expect(seg.pauseAfterDelete).toBe(DEFAULT_TYPEWRITER.pauseAfterDelete)
  })

  it('handles an empty phrase list', () => {
    expect(buildTypewriterTimeline({ phrases: [] })).toEqual([])
  })
})
