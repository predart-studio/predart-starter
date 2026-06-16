import { describe, it, expect } from 'vitest'
import {
  maskClipPath,
  buildMaskRevealVars,
  DEFAULT_MASK_REVEALED_RX,
  DEFAULT_MASK_REVEALED_RY,
  DEFAULT_MASK_ORIGIN,
} from '@/lib/motion/mask-reveal'

function radii(clip: string): [number, number] {
  const m = clip.match(/ellipse\(([\d.]+)% ([\d.]+)%/)
  if (!m) throw new Error(`unparseable clip-path: ${clip}`)
  return [parseFloat(m[1]), parseFloat(m[2])]
}

describe('maskClipPath', () => {
  it('is fully collapsed at progress 0 (content hidden)', () => {
    const clip = maskClipPath({ progress: 0 })
    expect(clip).toBe(`ellipse(0% 0% at ${DEFAULT_MASK_ORIGIN})`)
    expect(radii(clip)).toEqual([0, 0])
  })

  it('is half the revealed radii at progress 0.5', () => {
    const [rx, ry] = radii(maskClipPath({ progress: 0.5 }))
    expect(rx).toBeCloseTo(DEFAULT_MASK_REVEALED_RX / 2)
    expect(ry).toBeCloseTo(DEFAULT_MASK_REVEALED_RY / 2)
  })

  it('reaches the revealed radii at progress 1 (anchored above top-center)', () => {
    const clip = maskClipPath({ progress: 1 })
    expect(clip).toBe(
      `ellipse(${DEFAULT_MASK_REVEALED_RX}% ${DEFAULT_MASK_REVEALED_RY}% at ${DEFAULT_MASK_ORIGIN})`,
    )
  })

  it('grows monotonically as progress increases', () => {
    const xs = [0, 0.25, 0.5, 0.75, 1].map((p) => radii(maskClipPath({ progress: p }))[0])
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i]).toBeGreaterThan(xs[i - 1])
    }
  })

  it('clamps out-of-range progress to [0,1]', () => {
    expect(radii(maskClipPath({ progress: -2 }))).toEqual([0, 0])
    expect(radii(maskClipPath({ progress: 5 }))).toEqual([
      DEFAULT_MASK_REVEALED_RX,
      DEFAULT_MASK_REVEALED_RY,
    ])
  })

  it('honors custom radii and origin', () => {
    const clip = maskClipPath({
      progress: 1,
      revealedRadiusX: 120,
      revealedRadiusY: 90,
      origin: '50% 100%',
    })
    expect(clip).toBe('ellipse(120% 90% at 50% 100%)')
  })
})

describe('buildMaskRevealVars', () => {
  it('produces hidden→revealed fromTo vars with a linear ease (scrubbed)', () => {
    const vars = buildMaskRevealVars()
    expect(vars.from.clipPath).toBe(`ellipse(0% 0% at ${DEFAULT_MASK_ORIGIN})`)
    expect(vars.to.clipPath).toBe(
      `ellipse(${DEFAULT_MASK_REVEALED_RX}% ${DEFAULT_MASK_REVEALED_RY}% at ${DEFAULT_MASK_ORIGIN})`,
    )
    expect(vars.to.ease).toBe('none')
  })
})
