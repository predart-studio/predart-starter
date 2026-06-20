/**
 * Pure construction of the "Short Slide Down" reveal — per-word drop-in where
 * each word falls from above (negative y) into place with a faint blur and a
 * hair of scale, for a Keynote-style editorial heading that feels restrained.
 *
 * Framework-free + DOM-free so it is unit-testable; the <ShortSlideDown> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-word spans.
 *
 * Clean-room reference: pixel-point/animate-text `short-slide-down` portable
 * contract — per-word, enter 520ms / 0ms stagger,
 * cubic-bezier(0.2, 0.8, 0.2, 1), from { opacity 0, y -24px, blur 2.4px,
 * scale 0.992 }. We implement the one-shot ENTER phase only (scroll/load
 * reveal); the catalog's kinetic top-build showcase — where each new word drops
 * into its own line and pushes the existing stack downward until a centered
 * multi-line composition locks, then loops phrase by phrase — is demo-only and
 * intentionally NOT reproduced. The exit vars from the spec are exposed here so
 * a future swap wrapper can drive both phases from one factory.
 *
 * Distinct from per-word-crossfade (whole words, small drift, no blur): Short
 * Slide Down drops words from ABOVE (negative y) and adds the soft blur + micro
 * scale that give the top-down entry its weight.
 */
export interface ShortSlideDownVarsInput {
  /** Tween duration per word (seconds). */
  duration?: number
  /** Per-word delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px — negative so words drop in from above. */
  yFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** Starting scale (settles to 1). */
  scaleFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0.8, 0.2, 1). */
export const SHORT_SLIDE_DOWN_ENTER_EASE_ID = 'shortSlideDownEnter'
export const SHORT_SLIDE_DOWN_ENTER_EASE_PATH = 'M0,0 C0.2,0.8 0.2,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.4, 0, 0.2, 1) — exit/swap only. */
export const SHORT_SLIDE_DOWN_EXIT_EASE_ID = 'shortSlideDownExit'
export const SHORT_SLIDE_DOWN_EXIT_EASE_PATH = 'M0,0 C0.4,0 0.2,1 1,1'

/**
 * A split unit: a word or a run of whitespace. Only `word` units animate; the
 * whitespace units stay static so word spacing is preserved exactly.
 */
export interface WordUnit {
  text: string
  isWord: boolean
}

/**
 * Split text into per-word animated units while keeping whitespace runs as their
 * own (static) units. `/(\S+|\s+)/g` captures words AND the gaps between them,
 * so reassembling the spans reproduces the original spacing verbatim.
 */
export function splitWords(text: string): WordUnit[] {
  const matches = text.match(/(\S+|\s+)/g) ?? []
  return matches.map((chunk) => ({
    text: chunk,
    isWord: /\S/.test(chunk),
  }))
}

export function buildShortSlideDownVars(input: ShortSlideDownVarsInput = {}) {
  const {
    duration = 0.52,
    stagger = 0,
    yFrom = -24,
    blurFrom = 2.4,
    scaleFrom = 0.992,
    ease = SHORT_SLIDE_DOWN_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)`, scale: scaleFrom },
    to: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration, stagger, ease },
    // Exit phase from the spec — only a swap wrapper consumes this; the one-shot
    // ENTER component never tweens to it.
    exit: {
      from: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 },
      to: {
        opacity: 0,
        y: 10,
        filter: 'blur(1.2px)',
        scale: 1,
        duration: 0.32,
        stagger: 0,
        ease: SHORT_SLIDE_DOWN_EXIT_EASE_ID,
      },
    },
  }
}
