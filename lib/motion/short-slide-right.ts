/**
 * Pure construction of the "Short Slide Right" reveal — the whole phrase glides
 * in from the left as ONE compact horizontal move, while the individual words
 * are revealed in sequence ONLY through an opacity stagger (Keynote-style
 * editorial headings where motion is present but tightly restrained).
 *
 * The defining trait (renderer: shared-slide-opacity-stage): the shared x-slide
 * + blur live on the HOST element so the phrase reads as one move; the word
 * spans never translate — they only fade in, staggered, to communicate order.
 * That split is why this factory returns TWO concern groups (`title` + `word`)
 * instead of one from/to like the per-character effects.
 *
 * Framework-free + DOM-free so it is unit-testable; the <ShortSlideRight>
 * wrapper feeds `title.from`/`title.to` to the host via gsap.set()/gsap.to() and
 * `word.from`/`word.to` to the per-word spans (opacity only, with the stagger).
 *
 * Clean-room reference: pixel-point/animate-text `short-slide-right` portable
 * contract — per-word, shared title slide enter 520ms,
 * cubic-bezier(0.2, 0.8, 0.2, 1), from { x -24px, blur 1.2px }; word opacity
 * build 210ms / 92ms stagger, from 0 → 1.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback (hold → exit → gap → next phrase) is demo-only and
 * intentionally not reproduced — but the title-level exit vars from the spec are
 * exposed here so a future swap wrapper can drive both phases from one factory.
 *
 * Distinct from per-word-crossfade (each word translates + fades independently):
 * here ONLY the host translates, and words carry opacity alone.
 */
export interface ShortSlideRightVarsInput {
  /** Duration of the shared title slide (seconds). */
  duration?: number
  /** Per-word opacity delay step (seconds). */
  stagger?: number
  /** Shared starting horizontal offset in px (the phrase slides from this to 0). */
  xFrom?: number
  /** Shared starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** Duration of each word's opacity fade (seconds). */
  wordDuration?: number
  /** GSAP ease — defaults to the registered enter CustomEase id (shared by title + words). */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0.8, 0.2, 1) — shared enter curve. */
export const SHORT_SLIDE_RIGHT_ENTER_EASE_ID = 'shortSlideRightEnter'
export const SHORT_SLIDE_RIGHT_ENTER_EASE_PATH = 'M0,0 C0.2,0.8 0.2,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.4, 0, 0.2, 1) — title exit/swap only. */
export const SHORT_SLIDE_RIGHT_EXIT_EASE_ID = 'shortSlideRightExit'
export const SHORT_SLIDE_RIGHT_EXIT_EASE_PATH = 'M0,0 C0.4,0 0.2,1 1,1'

/**
 * A split unit: a word or a run of whitespace. Only `word` units receive the
 * opacity stagger; the whitespace units stay static so word spacing is preserved
 * exactly. (The shared x-slide lives on the host, not on these units.)
 */
export interface WordUnit {
  text: string
  isWord: boolean
}

/**
 * Split text into per-word units while keeping whitespace runs as their own
 * (static) units. `/(\S+|\s+)/g` captures words AND the gaps between them, so
 * reassembling the spans reproduces the original spacing verbatim.
 */
export function splitWords(text: string): WordUnit[] {
  const matches = text.match(/(\S+|\s+)/g) ?? []
  return matches.map((chunk) => ({
    text: chunk,
    isWord: /\S/.test(chunk),
  }))
}

export function buildShortSlideRightVars(input: ShortSlideRightVarsInput = {}) {
  const {
    duration = 0.52,
    stagger = 0.092,
    xFrom = -24,
    blurFrom = 1.2,
    wordDuration = 0.21,
    ease = SHORT_SLIDE_RIGHT_ENTER_EASE_ID,
  } = input

  return {
    // The shared phrase move: one compact slide-in + blur dissolve on the host.
    // No stagger here — the whole phrase travels as a single transform.
    title: {
      from: { x: xFrom, filter: `blur(${blurFrom}px)` },
      to: { x: 0, filter: 'blur(0px)', duration, ease },
    },
    // The per-word reveal: opacity ONLY, staggered to read the word order.
    word: {
      from: { opacity: 0 },
      to: { opacity: 1, duration: wordDuration, stagger, ease },
    },
    // Title-level exit from the spec — only a swap wrapper consumes this; the
    // one-shot ENTER component never tweens to it.
    exit: {
      from: { opacity: 1, x: 0, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        x: 12,
        filter: 'blur(1px)',
        duration: 0.32,
        ease: SHORT_SLIDE_RIGHT_EXIT_EASE_ID,
      },
    },
  }
}
