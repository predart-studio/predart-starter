'use client'

import {
  useRef,
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildRainbowButtonVars,
  DEFAULT_RAINBOW_PERIOD,
} from '@/lib/motion/rainbow-button'
import { cn } from '@/lib/utils'

interface RainbowButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  /** Seconds for one full gradient sweep. Default 2 (matches the reference). */
  period?: number
  className?: string
}

// The animated CSS var `--rainbow-pos` drives background-position on both the
// gradient border and the blurred glow. Tailwind arbitrary properties register
// the var on the element so GSAP can tween it (gsap can animate registered CSS
// custom properties). The 5 stops + 200% track + 12px glow blur mirror the demo.
const RAINBOW_GRADIENT =
  '[background-image:linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a166ff)]'
const RAINBOW_TRACK = '[background-size:200%_100%]'
const RAINBOW_POS = '[background-position:var(--rainbow-pos)_0%]'

/**
 * RainbowButton — GSAP looping-gradient button (element-scoped).
 *
 * A pill button wrapped in a continuously sliding rainbow gradient border, with
 * a matching blurred gradient glow behind it. The motion is a single CSS var
 * (`--rainbow-pos`) tweened from 0% to the 200% track width on a forever-looping
 * gsap.to() (ease 'none', 2s) — observed always-on, no hover scale, no rotation,
 * no transform. Renders the gradient statically server-side (no layout shift,
 * no-JS safe); the slide layers on the client. Respects prefers-reduced-motion:
 * no tween, the gradient stays put at its initial position.
 *
 * Do NOT also bind Framer Motion to this element's background-position.
 *
 * Clean-room reference: annnimate "RainbowButton" — behavior only.
 * Implementation is standard core GSAP (see gsap-core / gsap-react skills).
 */
export function RainbowButton({
  children,
  period = DEFAULT_RAINBOW_PERIOD,
  className,
  ...rest
}: RainbowButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const vars = buildRainbowButtonVars({ period })
      gsap.set(el, { '--rainbow-pos': '0%' })
      gsap.to(el, vars)
    }, el)

    return () => ctx.revert()
  }, [period, prefersReduced])

  return (
    <button
      ref={ref}
      className={cn(
        'group relative isolate inline-flex items-center justify-center rounded-full p-[2px]',
        '[--rainbow-pos:0%]',
        RAINBOW_GRADIENT,
        RAINBOW_TRACK,
        RAINBOW_POS,
        // blurred glow: same gradient on a ::before, sitting behind the button.
        // Full literal classes (not interpolated) so Tailwind's JIT detects them.
        'before:absolute before:inset-0 before:-z-10 before:rounded-full before:blur-md before:content-[""]',
        'before:[background-image:linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a166ff)]',
        'before:[background-size:200%_100%]',
        'before:[background-position:var(--rainbow-pos)_0%]',
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-medium text-neutral-50">
        {children}
      </span>
    </button>
  )
}
