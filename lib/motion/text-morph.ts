/**
 * Per-character diff + Flip-id assignment for the TextMorph effect. Given an OLD
 * word and a NEW word, classify each character position as shared / entering /
 * exiting and assign each a stable Flip id so GSAP Flip can tween the survivors
 * to their new slots while fading the rest. Framework-free + DOM-free so it is
 * unit-testable; the <TextMorph> wrapper renders the resulting char list and
 * feeds Flip.from() the shared-id deltas.
 *
 * Observed behavior (annnimate "TextMorph"): a "Search for <word>" bar whose
 * target word morphs character-by-character. Each char carries a
 * `data-flip-id="char-<charCode>-<nthOccurrence>"`. When the word changes,
 * characters that exist in BOTH words (matched by char + occurrence order) keep
 * their id and slide (opacity 1) to their new x; characters only in the new word
 * fade IN (~0.5 -> 1); characters only in the old word fade OUT (1 -> 0). Move +
 * fade run together over ~0.3s with an ease-out feel. The library demo drives it
 * from a text input; this port auto-cycles a phrase list on an interval instead.
 * Under reduced motion it renders the first phrase statically — no morph.
 *
 * Clean-room reference: annnimate "TextMorph" — behavior only.
 */

export type CharRole = 'shared' | 'enter' | 'exit'

export interface MorphChar {
  /** The character glyph. */
  char: string
  /** Stable Flip id: `char-<charCode>-<nthOccurrence>`. Identical glyphs are
   *  disambiguated by their occurrence index so Flip matches them in order. */
  flipId: string
  /** Role in the OLD -> NEW transition. */
  role: CharRole
}

export interface TextMorphDefaults {
  /** Words the bar cycles through, in order. First renders statically (SSR). */
  phrases: string[]
  /** Static prefix shown before the morphing word (e.g. "Search for "). */
  prefix: string
  /** Seconds for the move + fade of one morph. */
  duration: number
  /** Seconds each phrase is held before morphing to the next. */
  interval: number
  /** GSAP ease for the move/fade. */
  ease: string
}

/** Studied defaults: ~0.3s morph, ease-out, ~2.4s hold between phrases. */
export const DEFAULT_TEXT_MORPH: TextMorphDefaults = {
  phrases: ['Running Shoes', 'Trail Boots', 'Tennis Rackets', 'Yoga Mats'],
  prefix: 'Search for ',
  duration: 0.3,
  interval: 2.4,
  ease: 'power3.out',
}

/** Flip id namespace prefix (matches the observed `char-<code>-<n>` scheme). */
export const FLIP_ID_PREFIX = 'char'

/** Build the per-character flip id for a glyph at a given occurrence (1-based). */
export function flipIdFor(char: string, occurrence: number): string {
  return `${FLIP_ID_PREFIX}-${char.charCodeAt(0)}-${occurrence}`
}

/**
 * Assign a stable flip id to every character of `word`, numbering repeated
 * glyphs by their occurrence order (so the two 'n's in "Running" get distinct,
 * order-stable ids). Returns id-tagged chars in reading order.
 */
export function tagChars(word: string): { char: string; flipId: string }[] {
  const seen = new Map<string, number>()
  return Array.from(word).map((char) => {
    const next = (seen.get(char) ?? 0) + 1
    seen.set(char, next)
    return { char, flipId: flipIdFor(char, next) }
  })
}

/**
 * Diff OLD word -> NEW word at the character level. Produces:
 *  - every NEW char, marked `shared` if its (glyph, occurrence) also exists in
 *    OLD (Flip will slide it), else `enter` (fades in);
 *  - every OLD char whose (glyph, occurrence) is absent from NEW, marked `exit`
 *    (fades out), appended after the new chars so it can still be Flip-tracked.
 * Shared chars across both lists carry the SAME flipId — that pairing is what
 * makes GSAP Flip tween them between positions.
 */
export function diffChars(oldWord: string, newWord: string): MorphChar[] {
  const oldTagged = tagChars(oldWord)
  const newTagged = tagChars(newWord)
  const oldIds = new Set(oldTagged.map((c) => c.flipId))
  const newIds = new Set(newTagged.map((c) => c.flipId))

  const result: MorphChar[] = newTagged.map(({ char, flipId }) => ({
    char,
    flipId,
    role: oldIds.has(flipId) ? ('shared' as const) : ('enter' as const),
  }))

  for (const { char, flipId } of oldTagged) {
    if (!newIds.has(flipId)) {
      result.push({ char, flipId, role: 'exit' })
    }
  }

  return result
}

/** Next index in a phrase cycle, wrapping back to 0 at the end. */
export function nextPhraseIndex(current: number, length: number): number {
  if (length <= 0) return 0
  return (current + 1) % length
}
