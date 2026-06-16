/**
 * Pure builders for the RectangleTextReveal effect. Each headline line sits in an
 * overflow-hidden wrapper holding (a) the text line and (b) an absolutely
 * positioned "rectangle" overlay bar (transform-origin: left center). On reveal,
 * a per-line GSAP timeline collapses the bar (scaleX 1 -> 0 toward the left,
 * sweeping across) while the text slides in (x: distance -> 0) and fades
 * (opacity 0 -> 1) slightly behind it. Lines play with a stagger.
 *
 * This module is framework-free + DOM-free so it is unit-testable; the
 * <RectangleTextReveal> wrapper splits the text into lines, builds these vars,
 * and feeds them to a gsap.timeline() driven by ScrollTrigger (once).
 *
 * Clean-room reference: annnimate "RectangleTextReveal" — behavior only.
 */

export interface RectangleRevealConfig {
  /** Travel of the text line on the X axis as it slides in, in px. */
  distance?: number
  /** Duration (s) of the overlay-bar collapse (the "wipe"). */
  barDuration?: number
  /** Duration (s) of the text slide + fade. */
  textDuration?: number
  /** Stagger (s) between consecutive lines. */
  stagger?: number
  /**
   * When the text reveal starts relative to the bar collapse, as a fraction of
   * the bar duration (0 = together, 1 = only after the bar finishes). Observed
   * behavior: text begins as the bar passes ~70% of its collapse.
   */
  textOverlap?: number
  /** Ease for the bar collapse. */
  barEase?: string
  /** Ease for the text slide + fade. */
  textEase?: string
}

export const DEFAULT_RECTANGLE_REVEAL: Required<RectangleRevealConfig> = {
  distance: 80,
  barDuration: 0.5,
  textDuration: 0.6,
  stagger: 0.12,
  textOverlap: 0.7,
  barEase: 'power3.inOut',
  textEase: 'power3.out',
}

/** Fill the config with studied defaults; clamps the few values that must stay sane. */
export function resolveRectangleRevealConfig(
  config: RectangleRevealConfig = {},
): Required<RectangleRevealConfig> {
  const merged = { ...DEFAULT_RECTANGLE_REVEAL, ...config }
  return {
    ...merged,
    distance: Math.max(0, merged.distance),
    barDuration: Math.max(0, merged.barDuration),
    textDuration: Math.max(0, merged.textDuration),
    stagger: Math.max(0, merged.stagger),
    // overlap is a fraction of the bar duration, kept in [0, 1]
    textOverlap: Math.min(1, Math.max(0, merged.textOverlap)),
  }
}

/** GSAP `from` vars for the overlay bar (collapses scaleX 1 -> 0, anchored left). */
export function buildBarVars(config: RectangleRevealConfig = {}) {
  const c = resolveRectangleRevealConfig(config)
  return {
    scaleX: 0,
    transformOrigin: 'left center',
    duration: c.barDuration,
    ease: c.barEase,
  }
}

/** GSAP `from` vars for the text line (slides x: distance -> 0, fades 0 -> 1). */
export function buildTextVars(config: RectangleRevealConfig = {}) {
  const c = resolveRectangleRevealConfig(config)
  return {
    x: c.distance,
    opacity: 0,
    duration: c.textDuration,
    ease: c.textEase,
  }
}

/**
 * Position (s, on a timeline) at which line `index`'s text reveal should start,
 * given the per-line stagger and the in-bar overlap offset. Monotonic in index.
 */
export function textStartTime(index: number, config: RectangleRevealConfig = {}): number {
  const c = resolveRectangleRevealConfig(config)
  return index * c.stagger + c.barDuration * c.textOverlap
}

/** Position (s) at which line `index`'s bar collapse starts. Monotonic in index. */
export function barStartTime(index: number, config: RectangleRevealConfig = {}): number {
  const c = resolveRectangleRevealConfig(config)
  return index * c.stagger
}

/**
 * Split a string into display lines. Honors explicit "\n" line breaks; if there
 * are none, returns the whole string as a single line. Trims blank lines.
 */
export function splitIntoLines(text: string): string[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  return lines.length > 0 ? lines : ['']
}
