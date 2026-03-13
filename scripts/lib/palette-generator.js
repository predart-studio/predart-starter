'use strict';

const { hexToRgb, rgbToOklch, oklchToString, hexToOklch, bestForeground } = require('./color-utils.js');

/**
 * Generate a complete tokens.json-shaped palette from primary + background hex.
 *
 * @param {object} opts
 * @param {string} opts.primaryHex       e.g. "#1a56db"
 * @param {string} [opts.backgroundHex]  default "#ffffff"
 * @param {string} [opts.radius]         default "0.5rem"
 * @param {string} [opts.fontName]       default "Inter"
 * @returns {{ _comment, light, dark, radius, font }}
 */
function generatePalette({
  primaryHex,
  backgroundHex = '#ffffff',
  radius = '0.5rem',
  fontName = 'Inter',
} = {}) {
  // ── Primary ───────────────────────────────────────────────────────────────
  const { r: pr, g: pg, b: pb } = hexToRgb(primaryHex);
  const primaryOklch = rgbToOklch(pr, pg, pb);

  const primaryStr = oklchToString(primaryOklch);
  const primaryFg = bestForeground(primaryHex);

  // ── Background / Foreground ───────────────────────────────────────────────
  const { r: br, g: bg, b: bb } = hexToRgb(backgroundHex);
  const bgOklch = rgbToOklch(br, bg, bb);
  const backgroundStr = oklchToString(bgOklch);

  // foreground: opposite of background lightness
  const fgL = bgOklch.l > 0.5 ? 0.145 : 0.985;
  const foregroundStr = `oklch(${fgL.toFixed(3)} 0 0)`;

  // ── Accent (primary hue, low chroma, high lightness) ─────────────────────
  const accentC = Math.min(primaryOklch.c * 0.15, 0.03);
  const accentStr = oklchToString({ l: 0.97, c: accentC, h: primaryOklch.h });
  const accentFgL = fgL === 0.145 ? 0.205 : 0.985;
  const accentFgStr = `oklch(${accentFgL.toFixed(3)} 0 0)`;

  // ── Muted (near-neutral with primary hue hint) ────────────────────────────
  const mutedC = Math.min(primaryOklch.c * 0.05, 0.005);
  const mutedStr = oklchToString({ l: 0.97, c: mutedC, h: primaryOklch.h });
  const mutedFgStr = 'oklch(0.556 0 0)';

  // ── Secondary (fully neutral) ─────────────────────────────────────────────
  const secondaryStr = 'oklch(0.97 0 0)';
  const secondaryFgL = fgL === 0.145 ? 0.205 : 0.985;
  const secondaryFgStr = `oklch(${secondaryFgL.toFixed(3)} 0 0)`;

  // ── Fixed tokens ─────────────────────────────────────────────────────────
  const destructiveStr = 'oklch(0.577 0.245 27.325)';
  const borderStr = 'oklch(0.922 0 0)';
  const inputStr = 'oklch(0.922 0 0)';
  const ringStr = 'oklch(0.708 0 0)';

  // ── Card / Popover — match background ────────────────────────────────────
  const cardStr = backgroundStr;
  const cardFgStr = foregroundStr;
  const popoverStr = backgroundStr;
  const popoverFgStr = foregroundStr;

  // ── Charts (default blue spectrum) ───────────────────────────────────────
  const charts = {
    'chart-1': 'oklch(0.809 0.105 251.813)',
    'chart-2': 'oklch(0.623 0.214 259.815)',
    'chart-3': 'oklch(0.546 0.245 262.881)',
    'chart-4': 'oklch(0.488 0.243 264.376)',
    'chart-5': 'oklch(0.424 0.199 265.638)',
  };

  // ── Sidebar (derived from core) ───────────────────────────────────────────
  const sidebarBgL = Math.min(bgOklch.l + 0.015, 1);
  const sidebarStr = oklchToString({ l: sidebarBgL, c: bgOklch.c, h: bgOklch.h });

  const light = {
    background: backgroundStr,
    foreground: foregroundStr,
    primary: primaryStr,
    'primary-foreground': primaryFg,
    secondary: secondaryStr,
    'secondary-foreground': secondaryFgStr,
    muted: mutedStr,
    'muted-foreground': mutedFgStr,
    accent: accentStr,
    'accent-foreground': accentFgStr,
    destructive: destructiveStr,
    border: borderStr,
    input: inputStr,
    ring: ringStr,
    card: cardStr,
    'card-foreground': cardFgStr,
    popover: popoverStr,
    'popover-foreground': popoverFgStr,
    ...charts,
    sidebar: sidebarStr,
    'sidebar-foreground': foregroundStr,
    'sidebar-primary': primaryStr,
    'sidebar-primary-foreground': primaryFg,
    'sidebar-accent': accentStr,
    'sidebar-accent-foreground': accentFgStr,
    'sidebar-border': borderStr,
    'sidebar-ring': ringStr,
  };

  // ── Dark mode (draft) ─────────────────────────────────────────────────────
  // Primary gets l=0.8 with reduced chroma
  const darkPrimaryC = Math.min(primaryOklch.c * 0.8, 0.18);
  const darkPrimaryStr = oklchToString({ l: 0.8, c: darkPrimaryC, h: primaryOklch.h });
  const darkPrimaryFg = 'oklch(0.145 0 0)';

  const dark = {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    primary: darkPrimaryStr,
    'primary-foreground': darkPrimaryFg,
    secondary: 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    'muted-foreground': 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    'accent-foreground': 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.556 0 0)',
    card: 'oklch(0.205 0 0)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.205 0 0)',
    'popover-foreground': 'oklch(0.985 0 0)',
    ...charts,
    sidebar: 'oklch(0.205 0 0)',
    'sidebar-foreground': 'oklch(0.985 0 0)',
    'sidebar-primary': darkPrimaryStr,
    'sidebar-primary-foreground': darkPrimaryFg,
    'sidebar-accent': 'oklch(0.269 0 0)',
    'sidebar-accent-foreground': 'oklch(0.985 0 0)',
    'sidebar-border': 'oklch(1 0 0 / 10%)',
    'sidebar-ring': 'oklch(0.556 0 0)',
  };

  return {
    _comment: 'Edit per client. Run: pnpm tokens after every change.',
    light,
    dark,
    radius,
    font: {
      sans: fontName,
      mono: 'Geist Mono',
    },
  };
}

module.exports = { generatePalette };
