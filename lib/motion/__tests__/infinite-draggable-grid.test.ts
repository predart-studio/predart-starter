import { describe, it, expect } from 'vitest'
import {
  wrap,
  wrapAxis,
  pitchX,
  pitchY,
  spanX,
  spanY,
  computeCellPlacements,
  recycledItemIndex,
  DEFAULT_GRID,
  type GridConfig,
} from '@/lib/motion/infinite-draggable-grid'

const cfg: GridConfig = { cols: 4, rows: 3, cellW: 100, cellH: 100, gap: 20 }

describe('wrap (positive modulo)', () => {
  it('wraps a positive offset within the span', () => {
    expect(wrap(130, 100)).toBe(30)
  })

  it('wraps a negative offset back into [0, span) (not negative like JS %)', () => {
    expect(wrap(-30, 100)).toBe(70)
    // sanity: native % would give -30
    expect(-30 % 100).toBe(-30)
  })

  it('returns 0 for a non-positive span (guard against div-by-zero)', () => {
    expect(wrap(50, 0)).toBe(0)
    expect(wrap(50, -10)).toBe(0)
  })
})

describe('pitch / span geometry', () => {
  it('pitch is cell size plus gap', () => {
    expect(pitchX(cfg)).toBe(120)
    expect(pitchY(cfg)).toBe(120)
  })

  it('span is cols/rows times the pitch', () => {
    expect(spanX(cfg)).toBe(4 * 120)
    expect(spanY(cfg)).toBe(3 * 120)
  })
})

describe('wrapAxis (centered band)', () => {
  it('centers the wrapped value around zero (subtracts half a span)', () => {
    const span = spanX(cfg) // 480
    // base+offset = 240 -> wrap = 240 -> minus span/2 (240) -> 0
    expect(wrapAxis(240, 0, span)).toBe(0)
  })

  it('recycles: an offset of exactly one span maps to the same position', () => {
    const span = spanY(cfg) // 360
    expect(wrapAxis(50, 0, span)).toBeCloseTo(wrapAxis(50, span, span))
    expect(wrapAxis(50, 0, span)).toBeCloseTo(wrapAxis(50, -span, span))
  })

  it('keeps results within the centered band (-span/2 .. +span/2)', () => {
    const span = spanX(cfg)
    for (const off of [-1000, -123, 0, 77, 999]) {
      const v = wrapAxis(180, off, span)
      expect(v).toBeGreaterThanOrEqual(-span / 2)
      expect(v).toBeLessThan(span / 2)
    }
  })
})

describe('computeCellPlacements', () => {
  it('produces one placement per buffer cell with stable indices', () => {
    const placements = computeCellPlacements(cfg, 0, 0)
    expect(placements).toHaveLength(cfg.cols * cfg.rows)
    expect(placements.map((p) => p.index)).toEqual([
      ...Array(cfg.cols * cfg.rows).keys(),
    ])
  })

  it('shifts every cell by the drag offset, modulo the span (cells may recycle)', () => {
    const base = computeCellPlacements(cfg, 0, 0)
    const moved = computeCellPlacements(cfg, 10, -15)
    const sx = spanX(cfg)
    const sy = spanY(cfg)
    // Each cell either shifts by the raw delta, or — if it crossed an edge — by
    // the delta minus one full span (it recycled to the opposite side).
    for (let i = 0; i < base.length; i++) {
      expect(wrap(moved[i].x - base[i].x - 10, sx)).toBeCloseTo(0)
      expect(wrap(moved[i].y - base[i].y - -15, sy)).toBeCloseTo(0)
    }
  })

  it('wraps a cell that crosses the span boundary back to the opposite side', () => {
    const span = spanX(cfg)
    // drag exactly one full span -> identical layout to no drag (infinite tile)
    const base = computeCellPlacements(cfg, 0, 0)
    const wrapped = computeCellPlacements(cfg, span, 0)
    for (let i = 0; i < base.length; i++) {
      expect(wrapped[i].x).toBeCloseTo(base[i].x)
    }
  })
})

describe('recycledItemIndex', () => {
  it('cycles cell indices through the available items', () => {
    expect(recycledItemIndex(0, 3)).toBe(0)
    expect(recycledItemIndex(3, 3)).toBe(0)
    expect(recycledItemIndex(4, 3)).toBe(1)
    expect(recycledItemIndex(7, 3)).toBe(1)
  })

  it('guards an empty item set', () => {
    expect(recycledItemIndex(5, 0)).toBe(0)
  })
})

describe('DEFAULT_GRID', () => {
  it('matches the studied annnimate buffer (6x6, 240x320, gap 132)', () => {
    expect(DEFAULT_GRID).toMatchObject({
      cols: 6,
      rows: 6,
      cellW: 240,
      cellH: 320,
      gap: 132,
    })
  })
})
