/**
 * Pure mega-menu state + timing logic. Resolves which dropdown panel is active
 * given the hovered/clicked trigger index, and builds the GSAP open/close vars
 * (height-auto + scaleY reveal, transform-origin top) plus the staggered
 * content-reveal vars. Framework-free + DOM-free so it is unit-testable; the
 * <MegaMenu> wrapper feeds the result to gsap.to() / gsap.fromTo().
 *
 * Clean-room reference: annnimate "MegaMenu" — behavior only.
 */

/** Panel open/close tween duration in seconds (studied: ~0.45s settle). */
export const DEFAULT_MEGA_MENU_DURATION = 0.45

/** GSAP ease for the panel open (height 0 -> auto, scaleY 0 -> 1): snappy then settles. */
export const DEFAULT_MEGA_MENU_EASE_OPEN = 'power3.out'

/** GSAP ease for the panel close / morph-down. */
export const DEFAULT_MEGA_MENU_EASE_CLOSE = 'power2.inOut'

/** Per-item stagger (s) for the left-to-right content reveal (studied: ~0.05s apart). */
export const DEFAULT_MEGA_MENU_STAGGER = 0.05

/** Content items enter from this x offset in px (studied: ~ -18px slide-in). */
export const DEFAULT_MEGA_MENU_ITEM_X = -18

/**
 * Hover-intent open delay in ms — the panel waits briefly before opening so a
 * pointer passing across triggers does not flash every menu (studied: ~0.12s).
 */
export const DEFAULT_MEGA_MENU_OPEN_DELAY = 120

/** Close delay in ms after the pointer leaves the nav, to forgive small gaps. */
export const DEFAULT_MEGA_MENU_CLOSE_DELAY = 120

export interface ActiveMenuInput {
  /** Index currently active (open), or null if closed. */
  active: number | null
  /** Index the pointer just entered / clicked. */
  index: number
  /** Number of menus available (for bounds). */
  count: number
  /** Click-to-toggle (true) vs hover (false). Clicking the active trigger closes it. */
  toggle?: boolean
}

/**
 * Resolve the next active-menu index from an interaction.
 *
 * - Out-of-bounds index -> no change (returns current active).
 * - toggle mode: entering the already-active index closes it (-> null);
 *   entering a different index switches to it (panel morphs, stays open).
 * - hover mode: entering any valid index makes it active (switching just
 *   re-points the open panel; the wrapper morphs height instead of closing).
 */
export function nextActiveMenu({ active, index, count, toggle = false }: ActiveMenuInput): number | null {
  if (index < 0 || index >= count) return active
  if (toggle && active === index) return null
  return index
}

export interface MegaMenuOpenVars {
  duration: number
  ease: string
}

/**
 * Build the panel open tween vars (height -> auto + scaleY -> 1).
 * The wrapper sets transform-origin: top so the panel unrolls downward.
 */
export function buildMegaMenuOpenVars(duration = DEFAULT_MEGA_MENU_DURATION): MegaMenuOpenVars & {
  height: 'auto'
  scaleY: number
  autoAlpha: number
} {
  return { height: 'auto', scaleY: 1, autoAlpha: 1, duration, ease: DEFAULT_MEGA_MENU_EASE_OPEN }
}

/** Build the panel close tween vars (height -> 0 + scaleY -> 0, then hide). */
export function buildMegaMenuCloseVars(duration = DEFAULT_MEGA_MENU_DURATION): MegaMenuOpenVars & {
  height: number
  scaleY: number
  autoAlpha: number
} {
  return { height: 0, scaleY: 0, autoAlpha: 0, duration: duration * 0.7, ease: DEFAULT_MEGA_MENU_EASE_CLOSE }
}

/**
 * Build the staggered content-reveal fromTo vars for the active panel's items.
 * Items slide in from `x` with a left-to-right stagger and fade up to full.
 */
export function buildMegaMenuContentVars(opts?: {
  duration?: number
  stagger?: number
  x?: number
}) {
  const duration = opts?.duration ?? DEFAULT_MEGA_MENU_DURATION
  const stagger = opts?.stagger ?? DEFAULT_MEGA_MENU_STAGGER
  const x = opts?.x ?? DEFAULT_MEGA_MENU_ITEM_X
  return {
    from: { autoAlpha: 0, x },
    to: {
      autoAlpha: 1,
      x: 0,
      duration,
      ease: DEFAULT_MEGA_MENU_EASE_OPEN,
      stagger,
    },
  }
}
