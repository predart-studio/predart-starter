import { describe, it, expect } from 'vitest'
import {
  meshBlobOffset,
  meshFrame,
  meshBackground,
  DEFAULT_MESH_BLOBS,
  DEFAULT_MESH_DRIFT,
  DEFAULT_MESH_PERIOD,
  type MeshBlob,
} from '@/lib/motion/mesh-gradient'

const blob: MeshBlob = { color: '#fff', base: [0.5, 0.5], phase: 0, freq: [1, 1] }

describe('meshBlobOffset', () => {
  it('is periodic: offset at t=0 equals offset at t=1', () => {
    const a = meshBlobOffset(blob, 0)
    const b = meshBlobOffset(blob, 1)
    expect(b.x).toBeCloseTo(a.x, 10)
    expect(b.y).toBeCloseTo(a.y, 10)
  })

  it('stays within [base-drift, base+drift] (and clamped to [0,1])', () => {
    const drift = DEFAULT_MESH_DRIFT
    for (let i = 0; i <= 20; i++) {
      const o = meshBlobOffset(blob, i / 20, drift)
      expect(o.x).toBeGreaterThanOrEqual(0)
      expect(o.x).toBeLessThanOrEqual(1)
      expect(o.x).toBeLessThanOrEqual(blob.base[0] + drift + 1e-9)
      expect(o.x).toBeGreaterThanOrEqual(blob.base[0] - drift - 1e-9)
      expect(o.y).toBeLessThanOrEqual(blob.base[1] + drift + 1e-9)
      expect(o.y).toBeGreaterThanOrEqual(blob.base[1] - drift - 1e-9)
    }
  })

  it('offset at t=0 is base + (sin 0 * drift, cos 0 * drift) = (base.x, base.y + drift)', () => {
    const drift = 0.1
    const o = meshBlobOffset(blob, 0, drift)
    expect(o.x).toBeCloseTo(0.5, 10) // sin(0) = 0
    expect(o.y).toBeCloseTo(0.6, 10) // cos(0) = 1 -> +drift
  })

  it('clamps positions that would exceed the viewport to [0,1]', () => {
    const edge: MeshBlob = { color: '#fff', base: [0.98, 0.02], phase: 0, freq: [1, 1] }
    const o = meshBlobOffset(edge, 0.25, 0.2) // sin(pi/2)=1 -> x = 0.98+0.2 clamped
    expect(o.x).toBe(1)
    expect(o.y).toBeGreaterThanOrEqual(0)
  })
})

describe('meshFrame / defaults', () => {
  it('exposes the 3 observed default blobs (orange, pink, purple)', () => {
    expect(DEFAULT_MESH_BLOBS).toHaveLength(3)
    expect(DEFAULT_MESH_BLOBS.map((b) => b.color)).toEqual([
      '#fb923c',
      '#f9a8d4',
      '#a855f7',
    ])
    expect(DEFAULT_MESH_PERIOD).toBeGreaterThan(0)
  })

  it('returns one offset per blob', () => {
    const frame = meshFrame(DEFAULT_MESH_BLOBS, 0.4)
    expect(frame).toHaveLength(DEFAULT_MESH_BLOBS.length)
  })
})

describe('meshBackground', () => {
  it('produces one radial-gradient per blob with its color', () => {
    const bg = meshBackground(DEFAULT_MESH_BLOBS, 0)
    expect(bg.split('radial-gradient').length - 1).toBe(3)
    for (const b of DEFAULT_MESH_BLOBS) expect(bg).toContain(b.color)
  })

  it('encodes the blob position as a percentage center', () => {
    const single = meshBackground([blob], 0, 0.1)
    // base [0.5,0.5], t=0 -> x 50%, y 60%
    expect(single).toContain('circle at 50.00% 60.00%')
  })
})
