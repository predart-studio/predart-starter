import { describe, it, expect } from 'vitest'
import { buildDrawVars } from '@/lib/motion/draw'

describe('buildDrawVars', () => {
  it('defaults to drawing from 0% to 100%', () => {
    const v = buildDrawVars()
    expect(v.from.drawSVG).toBe('0%')
    expect(v.to.drawSVG).toBe('100%')
  })

  it('carries duration and ease onto the "to" vars', () => {
    const v = buildDrawVars({ duration: 2, ease: 'none' })
    expect(v.to.duration).toBe(2)
    expect(v.to.ease).toBe('none')
  })

  it('allows custom from/to endpoints (partial draw)', () => {
    const v = buildDrawVars({ from: '20%', to: '80%' })
    expect(v.from.drawSVG).toBe('20%')
    expect(v.to.drawSVG).toBe('80%')
  })
})
