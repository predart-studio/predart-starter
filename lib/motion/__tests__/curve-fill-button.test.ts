import { describe, it, expect } from 'vitest'
import {
  buildCurveFillPath,
  clamp01,
  CURVE_FILL_REST_PATH,
  CURVE_FILL_FULL_PATH,
  DEFAULT_CURVE_FILL_DIP,
} from '@/lib/motion/curve-fill-button'

// Pull the V (topEdge) and Q control-y out of a `d` string for assertions.
function parse(d: string) {
  const m = d.match(/V ([\-\d.]+) Q 50 ([\-\d.]+) 100 ([\-\d.]+)/)
  if (!m) throw new Error(`unparseable path: ${d}`)
  return { topEdge: Number(m[1]), controlY: Number(m[2]), topEdge2: Number(m[3]) }
}

describe('buildCurveFillPath', () => {
  it('progress 0 -> flat fill collapsed at the bottom (y=100, no curve)', () => {
    const p = parse(buildCurveFillPath({ progress: 0 }))
    expect(p.topEdge).toBe(100)
    expect(p.controlY).toBe(100) // control == edge => flat (straight) front
    expect(CURVE_FILL_REST_PATH).toBe(buildCurveFillPath({ progress: 0 }))
  })

  it('progress 1 -> fully filled, curved front bulging above the top', () => {
    const p = parse(buildCurveFillPath({ progress: 1 }))
    expect(p.topEdge).toBe(0)
    expect(p.controlY).toBe(-DEFAULT_CURVE_FILL_DIP) // -25: control sits above the edge
    expect(p.controlY).toBeLessThan(p.topEdge) // curve leads upward
    expect(CURVE_FILL_FULL_PATH).toBe(buildCurveFillPath({ progress: 1 }))
  })

  it('progress 0.5 -> edge halfway up, control above it by half the dip', () => {
    const p = parse(buildCurveFillPath({ progress: 0.5 }))
    expect(p.topEdge).toBe(50) // 100 - 100*0.5
    expect(p.controlY).toBe(50 - DEFAULT_CURVE_FILL_DIP * 0.5) // 50 - 12.5 = 37.5
    expect(p.controlY).toBeLessThan(p.topEdge) // already curved (leads the sweep)
  })

  it('topEdge rises monotonically (bottom-up) as progress increases', () => {
    const a = parse(buildCurveFillPath({ progress: 0.2 })).topEdge
    const b = parse(buildCurveFillPath({ progress: 0.6 })).topEdge
    const c = parse(buildCurveFillPath({ progress: 0.9 })).topEdge
    expect(a).toBeGreaterThan(b)
    expect(b).toBeGreaterThan(c) // higher progress => lower y => higher fill
  })

  it('dip scales the curve depth (bigger dip = control further above edge)', () => {
    const shallow = parse(buildCurveFillPath({ progress: 1, dip: 10 }))
    const deep = parse(buildCurveFillPath({ progress: 1, dip: 40 }))
    expect(shallow.controlY).toBe(-10)
    expect(deep.controlY).toBe(-40)
    expect(deep.controlY).toBeLessThan(shallow.controlY)
  })

  it('clamps out-of-range progress', () => {
    expect(buildCurveFillPath({ progress: -3 })).toBe(CURVE_FILL_REST_PATH)
    expect(buildCurveFillPath({ progress: 5 })).toBe(CURVE_FILL_FULL_PATH)
    expect(clamp01(NaN)).toBe(0)
  })
})
