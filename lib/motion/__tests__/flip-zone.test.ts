import { describe, it, expect } from 'vitest'
import {
  zoneForProgress,
  buildFlipZoneVars,
  DEFAULT_FLIP_ZONE_VARS,
  DEFAULT_FLIP_ZONE_CONFIG,
} from '@/lib/motion/flip-zone'

describe('zoneForProgress', () => {
  it('holds the media in zone 0 before the flip window starts', () => {
    expect(zoneForProgress(0)).toBe(0)
    expect(zoneForProgress(0.3)).toBe(0)
    expect(zoneForProgress(DEFAULT_FLIP_ZONE_CONFIG.flipStart - 0.01)).toBe(0)
  })

  it('settles the media in the last zone at/after the flip window end', () => {
    expect(zoneForProgress(1)).toBe(1)
    expect(zoneForProgress(2)).toBe(1) // clamps progress > 1
  })

  it('flips at the midpoint of the flip window for two zones', () => {
    // window 0.6..1.0 -> midpoint 0.8
    expect(zoneForProgress(0.7)).toBe(0) // before midpoint
    expect(zoneForProgress(0.9)).toBe(1) // after midpoint
  })

  it('respects a custom flip window', () => {
    const cfg = { flipStart: 0.2, flipEnd: 0.4 }
    expect(zoneForProgress(0.1, cfg)).toBe(0)
    expect(zoneForProgress(0.5, cfg)).toBe(1)
  })

  it('clamps negative progress to zone 0', () => {
    expect(zoneForProgress(-0.5)).toBe(0)
  })
})

describe('buildFlipZoneVars', () => {
  it('uses scrub-safe studied defaults (ease none, absolute, scale)', () => {
    const vars = buildFlipZoneVars()
    expect(vars.ease).toBe('none')
    expect(vars.absolute).toBe(true)
    expect(vars.scale).toBe(true)
    expect(vars).toEqual(DEFAULT_FLIP_ZONE_VARS)
  })

  it('merges overrides over the defaults', () => {
    const vars = buildFlipZoneVars({ ease: 'power2.inOut' })
    expect(vars.ease).toBe('power2.inOut')
    expect(vars.absolute).toBe(true) // untouched default preserved
  })
})
