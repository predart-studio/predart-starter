/**
 * Pure tokenizer for the Text Reveal effect. Splits a string into the pieces
 * that get individually revealed — by word or by character. Framework-free +
 * DOM-free so it is unit-testable; the <TextReveal> wrapper wraps each token in
 * a masked span and staggers them in with GSAP.
 *
 * Clean-room reference: good-fella.com "Text Reveal" — behavior only.
 */
export type RevealBy = 'word' | 'char'

export interface TextRevealConfig {
  by?: RevealBy
  /** Seconds between consecutive tokens. */
  stagger?: number
  /** Reveal duration per token. */
  duration?: number
}

// Observed on the reference demo: word-masked slide-up, data-anm-stagger="0.1".
export const DEFAULT_TEXT_REVEAL = {
  by: 'word' as RevealBy,
  stagger: 0.1,
  duration: 0.8,
}

/**
 * Split text into reveal tokens. Word mode keeps trailing spaces attached so the
 * rejoined tokens reproduce the original string exactly.
 */
export function splitTokens(text: string, by: RevealBy = 'word'): string[] {
  if (by === 'char') return Array.from(text)
  // Word mode: capture each word plus the whitespace that follows it.
  const matches = text.match(/\S+\s*/g)
  return matches ? matches : []
}
