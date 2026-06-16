/**
 * Pure grid-stagger math for the Animated Grid effect. Given a cell's (row, col)
 * position, the grid dimensions, and a stagger pattern, returns the per-cell
 * entrance delay (seconds). Framework-free + DOM-free so it is unit-testable;
 * the <AnimatedGrid> wrapper feeds the resulting delays array to a GSAP
 * `stagger: (i) => delays[i]` function (NOT a function `delay`, which NaNs).
 *
 * Observed on the reference demo (single 5-col row): each cell slides up from a
 * y-offset to 0 with a smooth power-style decay (opacity + scale stay at 1), and
 * the cells settle in sequence across the axis — a grid-aware diagonal stagger.
 * Generalized here to a full rows x cols grid with selectable patterns.
 *
 * Clean-room reference: annnimate "AnimatedGrid" — behavior only.
 */

export type GridStaggerPattern = 'center' | 'diagonal' | 'rows' | 'random-seeded'

export interface GridDelaysInput {
  cols: number
  rows: number
  /** Seconds between consecutive stagger "ranks". */
  step?: number
  pattern?: GridStaggerPattern
  /** Seed for the deterministic random-seeded pattern. */
  seed?: number
}

// Observed feel: short per-rank step, snappy-then-settle decay, pure y travel.
export const DEFAULT_GRID_STEP = 0.06
export const DEFAULT_GRID_PATTERN: GridStaggerPattern = 'diagonal'
export const DEFAULT_GRID_SEED = 1
/** y-offset (px) each cell travels up from before settling to 0. */
export const DEFAULT_GRID_Y = 40
/** Per-cell tween duration (s) and ease, mapped from the observed decay. */
export const DEFAULT_GRID_DURATION = 0.7
export const DEFAULT_GRID_EASE = 'power3.out'

/** Small deterministic PRNG (mulberry32) — keeps random-seeded testable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Stagger "rank" for one cell — a non-negative number; lower ranks animate
 * first. The wrapper multiplies rank by `step` to get the delay in seconds.
 */
export function cellRank(
  row: number,
  col: number,
  cols: number,
  rows: number,
  pattern: GridStaggerPattern,
  rand?: () => number,
): number {
  switch (pattern) {
    case 'rows':
      // Row by row, left to right within each row.
      return row * cols + col
    case 'diagonal':
      // Wavefront sweeping from the top-left corner: equal-rank anti-diagonals.
      return row + col
    case 'center': {
      // Middle cell(s) first, corners last — Chebyshev distance from center.
      const cr = (rows - 1) / 2
      const cc = (cols - 1) / 2
      return Math.max(Math.abs(row - cr), Math.abs(col - cc))
    }
    case 'random-seeded': {
      // Deterministic scatter; rand() is supplied by buildGridDelays so the
      // whole grid shares one PRNG stream.
      const r = rand ? rand() : 0.5
      return r * (rows + cols)
    }
  }
}

/**
 * Per-cell entrance delay (seconds), row-major indexed (i = row * cols + col).
 * delays[i] = cellRank(...) * step, normalized so the earliest cell starts at 0.
 */
export function buildGridDelays(input: GridDelaysInput): number[] {
  const {
    cols,
    rows,
    step = DEFAULT_GRID_STEP,
    pattern = DEFAULT_GRID_PATTERN,
    seed = DEFAULT_GRID_SEED,
  } = input

  if (cols <= 0 || rows <= 0) return []

  const rand = pattern === 'random-seeded' ? mulberry32(seed) : undefined
  const ranks: number[] = new Array(rows * cols)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ranks[row * cols + col] = cellRank(row, col, cols, rows, pattern, rand)
    }
  }

  const min = Math.min(...ranks)
  return ranks.map((r) => (r - min) * step)
}
