'use client'

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useId,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { X } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildMorphVars,
  buildBackdropInVars,
  buildBackdropOutVars,
  DEFAULT_MORPH_DURATION,
  DEFAULT_MORPH_EASE,
  DEFAULT_BACKDROP_FADE,
} from '@/lib/motion/morphing-dialog'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

interface MorphingDialogProps {
  /** Compact content shown inside the trigger card (image, title, price, CTA…). */
  card?: ReactNode
  /** Expanded content shown inside the open dialog (full details). */
  details?: ReactNode
  /** Morph duration in seconds. */
  duration?: number
  /** GSAP ease for the layout morph. */
  ease?: string
  /** Accessible label for the dialog. */
  label?: string
  className?: string
}

/**
 * MorphingDialog — GSAP Flip shared-element dialog (component-scoped).
 *
 * A product card that, on click, FLIPs the SAME shared element from its in-card
 * slot into a centered, fixed dialog over a dimmed backdrop, and morphs back on
 * close (Escape / backdrop click / close button). Implemented the canonical way:
 * capture Flip.getState() on the shared card synchronously BEFORE a React state
 * toggle reparents it into the open/closed slot, then Flip.from() in a layout
 * effect tweens the FLIP delta; the backdrop fades alongside. Renders the card
 * server-side (no layout shift, no-JS safe); the morph layers on the client.
 *
 * Respects prefers-reduced-motion: the dialog opens/closes INSTANTLY with no
 * morph (the backdrop still appears), and no Flip tween is created.
 *
 * Do NOT also bind Framer Motion to the shared card's transform — Flip owns it.
 *
 * Clean-room reference: annnimate "MorphingDialog" — behavior only.
 * Implementation is standard GSAP Flip (see gsap-plugins skill).
 */
export function MorphingDialog({
  card,
  details,
  duration = DEFAULT_MORPH_DURATION,
  ease = DEFAULT_MORPH_EASE,
  label = 'Product details',
  className,
}: MorphingDialogProps) {
  const sharedRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const prefersReduced = usePrefersReducedMotion()
  const dialogId = useId()

  useEffect(() => setMounted(true), [])

  // Capture Flip state synchronously BEFORE React commits the reparent/resize.
  if (typeof window !== 'undefined' && !prefersReduced && sharedRef.current) {
    flipStateRef.current = Flip.getState(sharedRef.current)
  }

  // After React moves the shared element into the open/closed slot, play the FLIP
  // from the captured state and fade the backdrop. Layout effect = after DOM
  // mutation, before paint (no flash).
  useLayoutEffect(() => {
    if (prefersReduced) return
    const state = flipStateRef.current
    if (!state) return

    const ctx = gsap.context(() => {
      Flip.from(state, buildMorphVars({ duration, ease }))
      const backdrop = backdropRef.current
      if (backdrop) {
        gsap.to(backdrop, open ? buildBackdropInVars() : buildBackdropOutVars())
      }
    })
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefersReduced, duration, ease])

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // Return focus to the trigger when the dialog closes.
  useEffect(() => {
    if (!open) triggerRef.current?.focus({ preventScroll: true })
  }, [open])

  // Stable Flip id so getState() (closed slot) matches the freshly-mounted node in
  // the portal (open slot) even though React unmounts/remounts the element.
  const flipId = `morphing-dialog-${dialogId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const sharedCard = (
    <div ref={sharedRef} data-flip-id={flipId} className="h-full w-full">
      {card ?? <PlaceholderCard />}
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      {/* CLOSED slot: the trigger button holds the shared card in flow. */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className={cn(
          'block w-[20rem] max-w-full cursor-pointer overflow-hidden rounded-2xl text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
          open && 'pointer-events-none',
        )}
      >
        {/* Reserve the card's footprint so closing the dialog has no layout jump. */}
        <div className="aspect-[320/457] w-full">{!open && sharedCard}</div>
      </button>

      {/* OPEN slot: portal'd backdrop + fixed centered dialog holding the same card. */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              ref={backdropRef}
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className="absolute inset-0 bg-foreground/50"
              style={prefersReduced ? undefined : { opacity: 0 }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className="relative max-h-[90vh] w-[44rem] max-w-full overflow-y-auto rounded-2xl bg-card shadow-2xl"
              >
                {sharedCard}
                {details ? (
                  <div className="px-6 pb-6">{details}</div>
                ) : (
                  <PlaceholderDetails />
                )}
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full',
                    'bg-muted text-foreground transition-colors hover:bg-muted/70',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
                  )}
                >
                  <X weight="bold" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

/** Default trigger card so the lab has something to morph without an asset. */
function PlaceholderCard() {
  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="relative aspect-[320/240] w-full bg-foreground">
        <span className="absolute left-4 top-4 rounded bg-[#ff5722] px-2 py-1 text-xs font-bold uppercase text-foreground">
          New
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl font-bold tracking-tight">Carbon Tempo Trainer</h3>
        <p className="text-sm text-muted-foreground">Daily Training Shoe</p>
        <p className="mt-2 text-lg font-bold">$164</p>
        <span className="mt-3 inline-flex items-center justify-center rounded-full bg-[#ff5722] px-4 py-3 text-sm font-semibold text-foreground">
          View Details
        </span>
      </div>
    </div>
  )
}

/** Default expanded detail block paired with the placeholder card. */
function PlaceholderDetails() {
  return (
    <div className="px-6 pb-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Built for tempo runs and race day. Carbon plate delivers propulsion without
        feeling stiff. Responsive foam returns energy on every stride.
      </p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Key Features
      </p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li>Carbon plate for propulsion without stiffness</li>
        <li>8mm drop balances speed and comfort</li>
        <li>235g weight won&apos;t slow you down</li>
        <li>Durable rubber outsole grips wet pavement</li>
      </ul>
    </div>
  )
}

export { DEFAULT_BACKDROP_FADE }
