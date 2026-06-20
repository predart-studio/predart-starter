/**
 * Pure construction of the "Per-Word Crossfade" reveal — words fade into place
 * one after another with a short upward drift, for a calm keynote rhythm
 * (Apple's section-title cadence where words stay readable but feel alive).
 *
 * Framework-free + DOM-free so it is unit-testable; the <PerWordCrossfade>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-word spans.
 *
 * Clean-room reference: pixel-point/animate-text `per-word-crossfade` portable
 * contract — per-word, enter 700ms / 70ms stagger,
 * cubic-bezier(0.16, 1, 0.3, 1), from { opacity 0, y 8px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * crossfade swap (old text exits while new text enters) is demo-only and
 * intentionally not reproduced — but the exit vars from the spec are exposed
 * here so a future swap wrapper can drive both phases from one factory.
 *
 * Distinct from soft-blur (per-character + blur dissolve): Per-Word Crossfade
 * animates whole words with a smaller drift and no blur, keeping copy legible.
 */
export interface PerWordCrossfadeVarsInput {
  /** Tween duration per word (seconds). */
  duration?: number
  /** Per-word delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (drifts up to 0). */
  yFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.16, 1, 0.3, 1). */
export const PER_WORD_CROSSFADE_ENTER_EASE_ID = 'perWordCrossfadeEnter'
export const PER_WORD_CROSSFADE_ENTER_EASE_PATH = 'M0,0 C0.16,1 0.3,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.7, 0, 0.84, 0) — exit/swap only. */
export const PER_WORD_CROSSFADE_EXIT_EASE_ID = 'perWordCrossfadeExit'
export const PER_WORD_CROSSFADE_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

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

export function buildPerWordCrossfadeVars(input: PerWordCrossfadeVarsInput = {}) {
  const {
    duration = 0.7,
    stagger = 0.07,
    yFrom = 8,
    ease = PER_WORD_CROSSFADE_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom },
    to: { opacity: 1, y: 0, duration, stagger, ease },
    // Exit phase from the spec — only a swap wrapper consumes this; the one-shot
    // ENTER component never tweens to it.
    exit: {
      from: { opacity: 1, y: 0 },
      to: {
        opacity: 0,
        y: -6,
        duration: 0.5,
        stagger: 0.04,
        ease: PER_WORD_CROSSFADE_EXIT_EASE_ID,
      },
    },
  }
}
