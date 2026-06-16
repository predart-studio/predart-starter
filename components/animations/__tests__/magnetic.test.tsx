import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Magnetic } from '@/components/animations/magnetic'

const originalMatchMedia = window.matchMedia
beforeEach(() => cleanup())
afterEach(() => { window.matchMedia = originalMatchMedia })

describe('Magnetic', () => {
  it('renders its children', () => {
    render(<Magnetic><button>Hire me</button></Magnetic>)
    expect(screen.getByRole('button', { name: 'Hire me' })).toBeInTheDocument()
  })

  it('renders the requested wrapper element with merged classes', () => {
    render(<Magnetic as="div" className="x">hi</Magnetic>)
    const el = screen.getByText('hi')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveClass('x')
    expect(el).toHaveClass('inline-block')
  })

  it('does not throw on pointer events under reduced motion', () => {
    window.matchMedia = (q: string) =>
      ({ matches: true, media: q, onchange: null,
         addEventListener: () => {}, removeEventListener: () => {},
         addListener: () => {}, removeListener: () => {},
         dispatchEvent: () => false }) as unknown as MediaQueryList
    render(<Magnetic><span>x</span></Magnetic>)
    const wrapper = screen.getByText('x').parentElement as HTMLElement
    expect(() => { fireEvent.pointerMove(wrapper); fireEvent.pointerLeave(wrapper) }).not.toThrow()
  })
})
