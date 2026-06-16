import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TextScramble } from '@/components/animations/text-scramble'

// The reduced-motion test overrides the global matchMedia; restore it after
// each test so it can't leak into later tests (order-dependent flake guard).
const originalMatchMedia = window.matchMedia

beforeEach(() => cleanup())
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe('TextScramble', () => {
  it('renders the final text as readable content (SSR / no-JS safe)', () => {
    render(<TextScramble text="PREDART" />)
    expect(screen.getByText('PREDART')).toBeInTheDocument()
  })

  it('renders into the requested element via the `as` prop', () => {
    render(<TextScramble as="h2" text="WORK" className="x" />)
    const el = screen.getByText('WORK')
    expect(el.tagName).toBe('H2')
    expect(el).toHaveClass('x')
  })

  it('still shows the text when prefers-reduced-motion is set', () => {
    window.matchMedia = (q: string) =>
      ({ matches: true, media: q, onchange: null,
         addEventListener: () => {}, removeEventListener: () => {},
         addListener: () => {}, removeListener: () => {},
         dispatchEvent: () => false }) as unknown as MediaQueryList
    expect(() => render(<TextScramble text="SAFE" />)).not.toThrow()
    expect(screen.getByText('SAFE')).toBeInTheDocument()
  })
})
