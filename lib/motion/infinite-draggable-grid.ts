/**
 * Pure modulo-wrap math for an infinite, draggable 2D grid. A fixed buffer of
 * cells is laid out on a regular pitch; as the user pans (rawOffsetX/Y), each
 * cell's rendered position is the base position plus the drag offset, wrapped
 * by the total grid span so a cell that exits one edge instantly reappears on
 * the opposite edge — giving the illusion of an endless plane from a small,
 * recycled DOM set. Framework-free + DOM-free so it is unit-testable; the
 * <InfiniteDraggableGrid> wrapper feeds wrapped positions to gsap.set().
 *
 * Clean-room reference: annnimate "InfiniteDraggableGrid" — behavior only.
 */

export interface GridConfig {
  /** Number of buffer columns laid out horizontally. */
  cols: number
  /** Number of buffer rows laid out vertically. */
  rows: number
  /** Horizontal distance between adjacent cell origins, in px. */
  cellW: number
  /** Vertical distance between adjacent cell origins, in px. */
  cellH: number
  /** Gap added to each cell pitch, in px. */
  gap: number
}

export const DEFAULT_GRID: GridConfig = {
  cols: 6,
  rows: 6,
  cellW: 240,
  cellH: 320,
  gap: 132,
}

/** Horizontal pitch (origin-to-origin distance) of one cell. */
export function pitchX(config: GridConfig): number {
  return config.cellW + config.gap
}

/** Vertical pitch (origin-to-origin distance) of one cell. */
export function pitchY(config: GridConfig): number {
  return config.cellH + config.gap
}

/** Total horizontal span the grid repeats over (one full set of columns). */
export function spanX(config: GridConfig): number {
  return config.cols * pitchX(config)
}

/** Total vertical span the grid repeats over (one full set of rows). */
export function spanY(config: GridConfig): number {
  return config.rows * pitchY(config)
}

/**
 * Positive modulo: always returns a value in [0, span) even for negative input.
 * JS `%` keeps the sign of the dividend, which breaks wrapping when panning in
 * the negative direction — this normalizes that.
 */
export function wrap(value: number, span: number): number {
  if (span <= 0) return 0
  return ((value % span) + span) % span
}

/**
 * Wrap a single axis position into the centered visible band.
 *
 * `base` is the cell's resting origin on this axis; `offset` is the accumulated
 * drag on this axis. The summed position is wrapped into [0, span) then shifted
 * back by half a span so the recycled band stays centered on the viewport
 * rather than drifting to one side. The result is the px transform to apply.
 */
export function wrapAxis(base: number, offset: number, span: number): number {
  return wrap(base + offset, span) - span / 2
}

export interface CellPlacement {
  /** Stable index of the cell in the buffer (0 .. cols*rows-1). */
  index: number
  /** Wrapped x transform in px. */
  x: number
  /** Wrapped y transform in px. */
  y: number
}

/**
 * Compute wrapped transforms for every cell in the buffer given the current
 * raw drag offset. Cells are laid out on the col/row grid (centered around the
 * origin), then each axis is independently wrapped so the whole set tiles the
 * plane infinitely. This is the per-frame output the wrapper applies via
 * gsap.set / quickSetter.
 */
export function computeCellPlacements(
  config: GridConfig,
  rawOffsetX: number,
  rawOffsetY: number,
): CellPlacement[] {
  const px = pitchX(config)
  const py = pitchY(config)
  const sx = spanX(config)
  const sy = spanY(config)
  const out: CellPlacement[] = []

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const index = row * config.cols + col
      const baseX = col * px
      const baseY = row * py
      out.push({
        index,
        x: wrapAxis(baseX, rawOffsetX, sx),
        y: wrapAxis(baseY, rawOffsetY, sy),
      })
    }
  }
  return out
}

/**
 * Map a buffer cell index onto a content item, cycling through the supplied
 * items so the buffer is always full regardless of how many items exist. Used
 * to assign images/content to recycled cells.
 */
export function recycledItemIndex(cellIndex: number, itemCount: number): number {
  if (itemCount <= 0) return 0
  return ((cellIndex % itemCount) + itemCount) % itemCount
}
