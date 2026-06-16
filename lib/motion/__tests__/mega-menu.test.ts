import { describe, it, expect } from 'vitest'
import {
  nextActiveMenu,
  buildMegaMenuOpenVars,
  buildMegaMenuCloseVars,
  buildMegaMenuContentVars,
  DEFAULT_MEGA_MENU_DURATION,
  DEFAULT_MEGA_MENU_EASE_OPEN,
  DEFAULT_MEGA_MENU_STAGGER,
  DEFAULT_MEGA_MENU_ITEM_X,
} from '@/lib/motion/mega-menu'

describe('nextActiveMenu', () => {
  it('opens a menu by entering its trigger when closed', () => {
    expect(nextActiveMenu({ active: null, index: 1, count: 3 })).toBe(1)
  })

  it('switches the open panel when entering a different trigger (hover stays open)', () => {
    expect(nextActiveMenu({ active: 0, index: 2, count: 3 })).toBe(2)
  })

  it('toggle mode closes the panel when re-entering the active trigger', () => {
    expect(nextActiveMenu({ active: 1, index: 1, count: 3, toggle: true })).toBeNull()
  })

  it('hover mode keeps the panel open when re-entering the active trigger', () => {
    expect(nextActiveMenu({ active: 1, index: 1, count: 3, toggle: false })).toBe(1)
  })

  it('ignores out-of-bounds indices (returns current active unchanged)', () => {
    expect(nextActiveMenu({ active: 2, index: 5, count: 3 })).toBe(2)
    expect(nextActiveMenu({ active: 2, index: -1, count: 3 })).toBe(2)
  })
})

describe('buildMegaMenuOpenVars / buildMegaMenuCloseVars', () => {
  it('open vars expand to auto height + full scaleY with the open ease', () => {
    const v = buildMegaMenuOpenVars()
    expect(v.height).toBe('auto')
    expect(v.scaleY).toBe(1)
    expect(v.autoAlpha).toBe(1)
    expect(v.ease).toBe(DEFAULT_MEGA_MENU_EASE_OPEN)
    expect(v.duration).toBe(DEFAULT_MEGA_MENU_DURATION)
  })

  it('close vars collapse to zero height + zero scaleY and are quicker than open', () => {
    const open = buildMegaMenuOpenVars()
    const close = buildMegaMenuCloseVars()
    expect(close.height).toBe(0)
    expect(close.scaleY).toBe(0)
    expect(close.autoAlpha).toBe(0)
    expect(close.duration).toBeLessThan(open.duration)
  })

  it('respects a custom duration', () => {
    expect(buildMegaMenuOpenVars(0.8).duration).toBe(0.8)
  })
})

describe('buildMegaMenuContentVars', () => {
  it('reveals items from a negative x slide + faded out, to settled + opaque', () => {
    const { from, to } = buildMegaMenuContentVars()
    expect(from.autoAlpha).toBe(0)
    expect(from.x).toBe(DEFAULT_MEGA_MENU_ITEM_X)
    expect(to.autoAlpha).toBe(1)
    expect(to.x).toBe(0)
    expect(to.stagger).toBe(DEFAULT_MEGA_MENU_STAGGER)
  })

  it('honors overrides for stagger and x distance', () => {
    const { from, to } = buildMegaMenuContentVars({ stagger: 0.1, x: -40 })
    expect(from.x).toBe(-40)
    expect(to.stagger).toBe(0.1)
  })
})
