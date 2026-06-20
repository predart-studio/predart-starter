/**
 * Pure construction of the "Line-by-Line Slide" reveal — each line slides in
 * from the left as opacity lifts, one line after another (Apple's section-subhead
 * "breathing" reveal where copy lands line by line).
 *
 * Framework-free + DOM-free so it is unit-testable; the <LineByLineSlide> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-line block spans.
 *
 * Clean-room reference: pixel-point/animate-text `line-by-line-slide` portable
 * contract — per-line, enter 900ms / 120ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, x -48px } to { opacity 1, x 0 }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping enter→hold→exit→swap showcase playback is demo-only and intentionally
 * not reproduced. The exit vars below exist for completeness (the spec defines a
 * swap exit), but TEMPLATE A never tweens them.
 *
 * Distinct from soft-blur (per-character, vertical drift + blur): Line-by-Line
 * Slide moves whole lines horizontally with no blur.
 */
export interface LineByLineSlideVarsInput {
  /** Tween duration per line (seconds). */
  duration?: number
  /** Per-line delay step (seconds). */
  stagger?: number
  /** Starting horizontal offset in px (slides in from the left to 0). */
  xFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** Enter CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1). */
export const LINE_SLIDE_ENTER_EASE_ID = 'lineByLineSlideEnter'
export const LINE_SLIDE_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** Exit CustomEase id + SVG-path equivalent of cubic-bezier(0.64, 0, 0.78, 0). */
export const LINE_SLIDE_EXIT_EASE_ID = 'lineByLineSlideExit'
export const LINE_SLIDE_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Split text into per-line animated units on the explicit "\n" separator. Each
 * line becomes its own animated block (the spec's per-line target rule). Blank
 * lines are preserved as empty strings so spacing stays intact.
 */
export function splitLines(text: string): string[] {
  return text.split('\n')
}

export function buildLineByLineSlideVars(input: LineByLineSlideVarsInput = {}) {
  const {
    duration = 0.9,
    stagger = 0.12,
    xFrom = -48,
    ease = LINE_SLIDE_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, x: xFrom },
    to: { opacity: 1, x: 0, duration, stagger, ease },
    // Swap exit (catalog demo-only — not driven by TEMPLATE A). Lines fade as
    // they slide off to the right over 600ms / 80ms stagger.
    exit: {
      opacity: 0,
      x: 48,
      duration: 0.6,
      stagger: 0.08,
      ease: LINE_SLIDE_EXIT_EASE_ID,
    },
  }
}
