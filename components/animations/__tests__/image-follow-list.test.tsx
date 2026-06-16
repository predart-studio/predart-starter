import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ImageFollowList } from '@/components/animations/image-follow-list'

const items = [
  { label: 'Enigma', image: '/a.jpg' },
  { label: 'Huddle', image: '/b.jpg', href: '/work/huddle' },
]

const originalMatchMedia = window.matchMedia
beforeEach(() => cleanup())
afterEach(() => { window.matchMedia = originalMatchMedia })

describe('ImageFollowList', () => {
  it('renders every item label', () => {
    render(<ImageFollowList items={items} />)
    expect(screen.getByText('Enigma')).toBeInTheDocument()
    expect(screen.getByText('Huddle')).toBeInTheDocument()
  })

  it('renders a link when an item has href', () => {
    render(<ImageFollowList items={items} />)
    const link = screen.getByRole('link', { name: /Huddle/ })
    expect(link).toHaveAttribute('href', '/work/huddle')
  })

  it('does not throw on hover/move under reduced motion', () => {
    window.matchMedia = (q: string) =>
      ({ matches: true, media: q, onchange: null,
         addEventListener: () => {}, removeEventListener: () => {},
         addListener: () => {}, removeListener: () => {},
         dispatchEvent: () => false }) as unknown as MediaQueryList
    render(<ImageFollowList items={items} />)
    const row = screen.getByText('Enigma')
    expect(() => { fireEvent.mouseEnter(row); fireEvent.mouseMove(row); fireEvent.mouseLeave(row) }).not.toThrow()
  })
})
