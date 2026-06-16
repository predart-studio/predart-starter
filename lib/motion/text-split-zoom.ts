/**
 * Pure scroll-progress → geometry mapping for the Text Split Zoom effect. Given
 * a scrub progress (0..1), returns the inline image's current width and scale.
 * As width grows it pushes the surrounding split text apart. Framework-free +
 * DOM-free so it is unit-testable; the <TextSplitZoom> wrapper applies the
 * result inside a scrubbed ScrollTrigger onUpdate.
 *
 * Clean-room reference: annnimate "Text Split Zoom" — behavior only (observed:
 * scrub 1, start "top bottom", end "top center", image scales 0 → full).
 */
export interface SplitZoomOpts {
  /** Final inline image width in px. */
  maxWidth?: number
  /** Image scale at progress 0. */
  minScale?: number
  /** Image scale at progress 1. */
  maxScale?: number
}

export const DEFAULT_SPLIT_ZOOM = {
  maxWidth: 240,
  minScale: 0.4,
  maxScale: 1,
}

export interface SplitZoomState {
  width: number
  scale: number
}

export function splitZoomState(
  progress: number,
  opts: SplitZoomOpts = {},
): SplitZoomState {
  const {
    maxWidth = DEFAULT_SPLIT_ZOOM.maxWidth,
    minScale = DEFAULT_SPLIT_ZOOM.minScale,
    maxScale = DEFAULT_SPLIT_ZOOM.maxScale,
  } = opts
  const p = Math.max(0, Math.min(1, progress))
  return {
    width: p * maxWidth,
    scale: minScale + (maxScale - minScale) * p,
  }
}
