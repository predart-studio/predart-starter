import type { ReactNode } from 'react'
import {
  TextScramble,
  Magnetic,
  DrawPath,
  VelocitySkew,
  ImageFollowList,
} from '@/components/animations'

/**
 * /lab — live catalog of the in-house GSAP motion kit.
 *
 * Every project cloned from predart-starter ships with this gallery: run
 * `pnpm dev` and open /lab to see each motion component running and decide
 * which to use. Remove this route (`rm -rf app/lab`) before launching a
 * client site if you don't want it publicly reachable.
 */

// Monochrome SVG data-URI placeholder (no network dependency, on-brand).
function ph(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#141414'/><text x='50%' y='50%' fill='#eeeeee' font-family='monospace' font-size='30' letter-spacing='2' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function Card({
  name,
  category,
  hint,
  children,
}: {
  name: string
  category: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30 p-6">
      <div className="flex w-full items-center justify-center">{children}</div>
      {hint ? (
        <span className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-tight text-muted-foreground/60">
          {hint}
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-foreground/10 bg-background/70 px-4 py-3 font-mono text-[11px] uppercase tracking-tight text-muted-foreground backdrop-blur">
        <span className="text-foreground">{name}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
          {category}
        </span>
      </div>
    </div>
  )
}

const followItems = [
  { label: 'Project One', image: ph('ONE') },
  { label: 'Project Two', image: ph('TWO') },
  { label: 'Project Three', image: ph('THREE') },
  { label: 'Project Four', image: ph('FOUR') },
]

export default function MotionLab() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      <header className="mb-16 flex flex-col gap-4">
        <TextScramble
          as="p"
          text="MOTION LIBRARY"
          trigger="load"
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
        />
        <h1 className="font-sans text-5xl font-semibold tracking-tight md:text-6xl">
          In-house GSAP kit
        </h1>
        <p className="max-w-prose text-muted-foreground">
          The motion components every project inherits. Hover, scroll, and
          refresh to feel each one. All are prefers-reduced-motion safe.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card name="Text Scramble" category="text" hint="hover">
          <TextScramble
            text="SCRAMBLE"
            trigger="hover"
            className="cursor-pointer font-mono text-3xl uppercase tracking-tight"
          />
        </Card>

        <Card name="Magnetic" category="pointer" hint="move cursor">
          <Magnetic strength={40}>
            <button className="rounded-full bg-foreground px-7 py-3 font-sans text-sm font-medium text-background">
              Hire me
            </button>
          </Magnetic>
        </Card>

        <Card name="SVG Draw Path" category="svg" hint="refresh">
          <DrawPath trigger="load" className="text-foreground">
            <svg
              width="180"
              height="80"
              viewBox="0 0 180 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8 56 C 40 8, 70 8, 90 40 S 140 72, 172 24" />
            </svg>
          </DrawPath>
        </Card>

        <Card name="Velocity Skew" category="scroll" hint="scroll page">
          <VelocitySkew>
            <span className="font-sans text-4xl font-semibold tracking-tight">
              SKEW
            </span>
          </VelocitySkew>
        </Card>
      </section>

      {/* Full-width feature: Image Follow List (needs room + cursor space) */}
      <section className="mt-5 rounded-xl border border-foreground/10 bg-secondary/30 p-8 md:p-12">
        <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-muted-foreground">
          <span className="text-foreground">Image Follow List</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
            list · hover the rows
          </span>
        </div>
        <ImageFollowList items={followItems} />
      </section>

      <p className="mt-16 border-t border-foreground/10 pt-8 text-sm text-muted-foreground">
        Tip: toggle your OS &quot;Reduce Motion&quot; setting and refresh — every
        component should render its final, static state with no animation.
      </p>
    </main>
  )
}
