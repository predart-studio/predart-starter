/**
 * Pure logic for the Folding Text effect: a per-character split helper (spaces
 * preserved as non-folding gaps) and a GSAP-vars builder describing the 3D
 * "door-hinge" fold each character runs through (rotateY startAngle -> 0,
 * opacity 0 -> 1, staggered along the line). Framework-free + DOM-free so it is
 * unit-testable; the <FoldingText> wrapper feeds the split to the DOM and the
 * vars to gsap.fromTo() inside a scrubbed ScrollTrigger.
 *
 * Clean-room reference: annnimate "FoldingText" — behavior only.
 */

/** One unit of a split headline: either a foldable char or a literal space. */
export interface FoldToken {
  char: string
  /** A run of whitespace renders as a fixed gap and does NOT fold. */
  isSpace: boolean
}

// Observed on the reference demo: perspective 1200px, chars start at rotateY 90deg
// (alternating sign per line), ~0.04s stagger running from the trailing edge,
// scrub-linked over a "snappy then settle" power3.out feel.
export const DEFAULT_FOLD_PERSPECTIVE = 1200
export const DEFAULT_FOLD_ROTATION = 90
export const DEFAULT_FOLD_STAGGER = 0.04
export const DEFAULT_FOLD_EASE = 'power3.out'
export const DEFAULT_FOLD_ORIGIN = '0% 50%' // left hinge

/** Where the stagger wave begins, matching GSAP's stagger.from values. */
export type FoldStaggerFrom = 'start' | 'end' | 'center'

/**
 * Splits a string into per-character tokens, collapsing each run of whitespace
 * into a single space token (so word gaps survive but do not fold).
 */
export function splitFoldChars(text: string): FoldToken[] {
  const tokens: FoldToken[] = []
  let prevSpace = false
  for (const char of text) {
    const isSpace = /\s/.test(char)
    if (isSpace) {
      if (prevSpace) continue // collapse consecutive whitespace
      tokens.push({ char: ' ', isSpace: true })
      prevSpace = true
    } else {
      tokens.push({ char, isSpace: false })
      prevSpace = false
    }
  }
  return tokens
}

export interface FoldVarsInput {
  /** Degrees the character is rotated about Y before unfolding. */
  rotation?: number
  /** Seconds between consecutive character folds. */
  stagger?: number
  /** Which end the fold wave starts from. */
  staggerFrom?: FoldStaggerFrom
  ease?: string
}

/**
 * Builds the { from, to } gsap.fromTo() vars for the per-character fold. The
 * `from` is the folded-away state; the `to` is the flat, readable state. The
 * wrapper attaches a scrubbed ScrollTrigger so progress is tied to scroll.
 */
export function buildFoldVars(input: FoldVarsInput = {}) {
  const {
    rotation = DEFAULT_FOLD_ROTATION,
    stagger = DEFAULT_FOLD_STAGGER,
    staggerFrom = 'end',
    ease = DEFAULT_FOLD_EASE,
  } = input

  return {
    from: {
      rotationY: rotation,
      opacity: 0,
      transformOrigin: DEFAULT_FOLD_ORIGIN,
    },
    to: {
      rotationY: 0,
      opacity: 1,
      ease,
      stagger: { each: stagger, from: staggerFrom },
    },
  }
}
