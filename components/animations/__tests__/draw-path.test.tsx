import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { DrawPath } from '@/components/animations/draw-path'

const originalMatchMedia = window.matchMedia
beforeEach(() => cleanup())
afterEach(() => { window.matchMedia = originalMatchMedia })

describe('DrawPath', () => {
  it('renders the SVG children inside a wrapper', () => {
    render(
      <DrawPath className="x">
        <svg data-testid="svg" viewBox="0 0 100 100">
          <path d="M0 50 L100 50" stroke="black" />
        </svg>
      </DrawPath>,
    )
    expect(screen.getByTestId('svg')).toBeInTheDocument()
  })

  it('renders a wrapper with the merged class', () => {
    render(<DrawPath className="my-wrap"><svg /></DrawPath>)
    expect(document.querySelector('.my-wrap')).toBeTruthy()
  })

  it('does not throw under reduced motion (renders the SVG fully visible)', () => {
    window.matchMedia = (q: string) =>
      ({ matches: true, media: q, onchange: null,
         addEventListener: () => {}, removeEventListener: () => {},
         addListener: () => {}, removeListener: () => {},
         dispatchEvent: () => false }) as unknown as MediaQueryList
    expect(() =>
      render(<DrawPath><svg data-testid="s"><path d="M0 0 L10 10" stroke="black" /></svg></DrawPath>),
    ).not.toThrow()
    expect(screen.getByTestId('s')).toBeInTheDocument()
  })
})
