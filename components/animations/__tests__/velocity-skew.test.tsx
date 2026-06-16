import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { VelocitySkew } from '@/components/animations/velocity-skew'

const originalMatchMedia = window.matchMedia
beforeEach(() => cleanup())
afterEach(() => { window.matchMedia = originalMatchMedia })

describe('VelocitySkew', () => {
  it('renders its children', () => {
    render(<VelocitySkew><p>scroll me</p></VelocitySkew>)
    expect(screen.getByText('scroll me')).toBeInTheDocument()
  })

  it('renders the requested wrapper element with merged classes', () => {
    render(<VelocitySkew as="section" className="x">hi</VelocitySkew>)
    const el = screen.getByText('hi')
    expect(el.tagName).toBe('SECTION')
    expect(el).toHaveClass('x')
  })

  it('does not throw under reduced motion', () => {
    window.matchMedia = (q: string) =>
      ({ matches: true, media: q, onchange: null,
         addEventListener: () => {}, removeEventListener: () => {},
         addListener: () => {}, removeListener: () => {},
         dispatchEvent: () => false }) as unknown as MediaQueryList
    expect(() => render(<VelocitySkew><p>x</p></VelocitySkew>)).not.toThrow()
    expect(screen.getByText('x')).toBeInTheDocument()
  })
})
