/**
 * DOM-side companion to the framework-free split helpers in `soft-blur.ts`.
 *
 * Splits a host element's text into per-character `<span>`s grouped by word:
 * each character is its own `inline-block` (so GSAP can drift/blur it), but the
 * characters of a word live inside a `white-space: nowrap` inline-block wrapper.
 * Without that wrapper every character is an independent line-break opportunity
 * and words shatter across line ends (e.g. "Cristian" wrapping mid-name).
 * Whitespace is emitted as plain text nodes, so breaks land only between words.
 *
 * Client-only (touches the DOM); call it from inside an effect. Returns the
 * character spans in reading order, ready to feed to gsap.set()/gsap.to().
 */
import { splitChars } from './soft-blur'

export function splitWordsToCharSpans(
  host: HTMLElement,
  text: string
): HTMLSpanElement[] {
  host.textContent = ''
  const spans: HTMLSpanElement[] = []
  for (const token of text.split(/(\s+)/)) {
    if (!token) continue
    if (/^\s/.test(token)) {
      host.appendChild(document.createTextNode(token))
      continue
    }
    const word = document.createElement('span')
    word.style.display = 'inline-block'
    word.style.whiteSpace = 'nowrap'
    for (const ch of splitChars(token)) {
      const s = document.createElement('span')
      s.textContent = ch
      s.style.display = 'inline-block'
      word.appendChild(s)
      spans.push(s)
    }
    host.appendChild(word)
  }
  return spans
}
