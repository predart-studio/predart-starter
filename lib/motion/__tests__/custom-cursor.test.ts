import { describe, it, expect } from 'vitest'
import {
  resolveCursorConfig,
  resolveCursorState,
  DEFAULT_CURSOR_CONFIG,
  DEFAULT_FOLLOW_DURATION,
  DEFAULT_HOVER_SCALE,
} from '@/lib/motion/custom-cursor'

describe('resolveCursorConfig', () => {
  it('returns the studied defaults when no overrides are passed', () => {
    const cfg = resolveCursorConfig()
    expect(cfg.followDuration).toBe(DEFAULT_FOLLOW_DURATION)
    expect(cfg.followEase).toBe('expo.out')
    expect(cfg.hoverScale).toBe(DEFAULT_HOVER_SCALE)
    expect(cfg).toEqual(DEFAULT_CURSOR_CONFIG)
  })

  it('merges a partial override onto the defaults', () => {
    const cfg = resolveCursorConfig({ followDuration: 0.4, hoverScale: 3 })
    expect(cfg.followDuration).toBe(0.4)
    expect(cfg.hoverScale).toBe(3)
    // untouched keys keep their defaults
    expect(cfg.followEase).toBe(DEFAULT_CURSOR_CONFIG.followEase)
    expect(cfg.dotSize).toBe(DEFAULT_CURSOR_CONFIG.dotSize)
  })
})

describe('resolveCursorState', () => {
  it('idle when nothing is hovered: scale 1, no label', () => {
    const s = resolveCursorState(null)
    expect(s.mode).toBe('idle')
    expect(s.scale).toBe(1)
    expect(s.text).toBe('')
  })

  it('grows the dot to hoverScale on a labelless interactive target', () => {
    const s = resolveCursorState({ text: null }, DEFAULT_CURSOR_CONFIG)
    expect(s.mode).toBe('hover')
    expect(s.scale).toBe(DEFAULT_CURSOR_CONFIG.hoverScale)
    expect(s.text).toBe('')
  })

  it('enters text mode with label + resolved colours when target carries text', () => {
    const s = resolveCursorState({
      text: 'View Product',
      bg: '#FF4200',
      color: '#0a0a0a',
    })
    expect(s.mode).toBe('text')
    expect(s.scale).toBe(1)
    expect(s.text).toBe('View Product')
    expect(s.bg).toBe('#FF4200')
    expect(s.color).toBe('#0a0a0a')
  })

  it('trims whitespace-only labels back to hover mode', () => {
    const s = resolveCursorState({ text: '   ' })
    expect(s.mode).toBe('hover')
    expect(s.text).toBe('')
  })
})
