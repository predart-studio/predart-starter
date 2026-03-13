'use strict';

/**
 * Pure color utility module — no external dependencies.
 * Conversions: sRGB hex → linear RGB → XYZ D65 → Oklab → Oklch
 */

/**
 * Parse a 6-digit hex color string to {r, g, b} in 0-255.
 * @param {string} hex  e.g. "#1a56db"
 * @returns {{r:number, g:number, b:number}}
 */
function hexToRgb(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Gamma-decode a single sRGB channel (0-255) to linear light (0-1).
 * @param {number} c  0-255
 * @returns {number}  0-1
 */
function linearize(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert sRGB (0-255 each) to Oklch {l, c, h}.
 * Pipeline: sRGB → linear → XYZ D65 → Oklab → Oklch
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{l:number, c:number, h:number}}
 */
function rgbToOklch(r, g, b) {
  // 1. Linearise
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // 2. sRGB linear → XYZ D65 (IEC 61966-2-1 matrix)
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // 3. XYZ → Oklab LMS cone responses (Björn Ottosson's matrix)
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  // 4. LMS → Oklab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // 5. Oklab → Oklch
  const C = Math.sqrt(a * a + bk * bk);
  let H = Math.atan2(bk, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/**
 * Stringify an Oklch object to CSS oklch() notation.
 * Omits hue when chroma is effectively zero.
 * @param {{l:number, c:number, h:number}} oklch
 * @returns {string}
 */
function oklchToString({ l, c, h }) {
  const lStr = l.toFixed(3);
  const cStr = c.toFixed(3);
  if (c < 0.001) {
    return `oklch(${lStr} 0 0)`;
  }
  const hStr = h.toFixed(3);
  return `oklch(${lStr} ${cStr} ${hStr})`;
}

/**
 * Convert a hex color to an oklch() CSS string.
 * @param {string} hex
 * @returns {string}
 */
function hexToOklch(hex) {
  const { r, g, b } = hexToRgb(hex);
  const oklch = rgbToOklch(r, g, b);
  return oklchToString(oklch);
}

/**
 * WCAG relative luminance from sRGB 0-255 values.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}  0-1
 */
function relativeLuminance(r, g, b) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * WCAG contrast ratio between two luminance values.
 * @param {number} lum1
 * @param {number} lum2
 * @returns {number}  1-21
 */
function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const WHITE_OKLCH = 'oklch(0.985 0 0)';
const BLACK_OKLCH = 'oklch(0.145 0 0)';

/**
 * Return the best foreground color (near-white or near-black) for a given
 * background hex, based on WCAG contrast ratio.
 * @param {string} bgHex
 * @returns {string}  oklch string
 */
function bestForeground(bgHex) {
  const { r, g, b } = hexToRgb(bgHex);
  const bgLum = relativeLuminance(r, g, b);

  // near-white foreground luminance ≈ linearize(251) * 3 channels
  const whiteLum = relativeLuminance(251, 251, 251);
  const blackLum = relativeLuminance(37, 37, 37);

  const contrastWhite = contrastRatio(bgLum, whiteLum);
  const contrastBlack = contrastRatio(bgLum, blackLum);

  return contrastWhite >= contrastBlack ? WHITE_OKLCH : BLACK_OKLCH;
}

module.exports = {
  hexToRgb,
  linearize,
  rgbToOklch,
  oklchToString,
  hexToOklch,
  relativeLuminance,
  contrastRatio,
  bestForeground,
};
