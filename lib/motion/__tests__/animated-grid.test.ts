import { describe, it, expect } from 'vitest'
import {
  buildGridDelays,
  cellRank,
  DEFAULT_GRID_STEP,
  DEFAULT_GRID_PATTERN,
} from '@/lib/motion/animated-grid'

describe('buildGridDelays', () => {
  it('applies sensible defaults (diagonal, normalized so first cell starts at 0)', () => {
    expect(DEFAULT_GRID_PATTERN).toBe('diagonal')
    const delays = buildGridDelays({ cols: 3, rows: 3 })
    expect(delays).toHaveLength(9)
    // top-left cell (0,0) is the wavefront origin → delay 0
    expect(delays[0]).toBe(0)
    // (0,1) and (1,0) share the next anti-diagonal → one step
    expect(delays[1]).toBeCloseTo(DEFAULT_GRID_STEP)
    expect(delays[3]).toBeCloseTo(DEFAULT_GRID_STEP)
    // bottom-right corner is last
    expect(delays[8]).toBeCloseTo(4 * DEFAULT_GRID_STEP)
  })

  it('center pattern: the middle cell starts before any corner', () => {
    const cols = 5
    const rows = 5
    const delays = buildGridDelays({ cols, rows, pattern: 'center' })
    const middle = delays[2 * cols + 2] // (row 2, col 2)
    const topLeft = delays[0]
    const bottomRight = delays[(rows - 1) * cols + (cols - 1)]
    expect(middle).toBe(0)
    expect(middle).toBeLessThan(topLeft)
    expect(middle).toBeLessThan(bottomRight)
  })

  it('diagonal pattern is monotonic non-decreasing along a row and down a column', () => {
    const cols = 4
    const rows = 4
    const delays = buildGridDelays({ cols, rows, pattern: 'diagonal' })
    // along the top row: each step right increases the delay
    for (let col = 1; col < cols; col++) {
      expect(delays[col]).toBeGreaterThan(delays[col - 1])
    }
    // down the first column: each step down increases the delay
    for (let row = 1; row < rows; row++) {
      expect(delays[row * cols]).toBeGreaterThan(delays[(row - 1) * cols])
    }
  })

  it('rows pattern increments strictly in row-major order', () => {
    const cols = 3
    const rows = 2
    const delays = buildGridDelays({ cols, rows, pattern: 'rows' })
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeCloseTo(i * DEFAULT_GRID_STEP)
    }
  })

  it('random-seeded is deterministic for a given seed and differs across seeds', () => {
    const a = buildGridDelays({ cols: 4, rows: 4, pattern: 'random-seeded', seed: 7 })
    const b = buildGridDelays({ cols: 4, rows: 4, pattern: 'random-seeded', seed: 7 })
    const c = buildGridDelays({ cols: 4, rows: 4, pattern: 'random-seeded', seed: 99 })
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
    // earliest cell is normalized to 0
    expect(Math.min(...a)).toBe(0)
  })

  it('handles degenerate grids without throwing', () => {
    expect(buildGridDelays({ cols: 0, rows: 5 })).toEqual([])
    expect(buildGridDelays({ cols: 1, rows: 1 })).toEqual([0])
  })
})

describe('cellRank', () => {
  it('diagonal rank equals row + col', () => {
    expect(cellRank(0, 0, 4, 4, 'diagonal')).toBe(0)
    expect(cellRank(2, 1, 4, 4, 'diagonal')).toBe(3)
  })
})
