import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import { TextScramble } from '@/components/animations'
import { entries, type LabEntry } from './registry'

/**
 * /lab — launcher for the in-house GSAP motion kit.
 *
 * Every project cloned from predart-starter ships with this gallery: run
 * `pnpm dev` and open /lab. Each tile opens the component in an isolation
 * playground (`/lab/<slug>`) — a device-sized, scrollable viewport where you
 * can poke at it on its own. Remove this route (`rm -rf app/lab`) before
 * launching a client site if you don't want it publicly reachable.
 */
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
          {entries.length} motion components every project inherits. Click any one to open it
          in an isolated, device-sized playground where you can scroll, hover, replay, and
          tweak it on its own. All are prefers-reduced-motion safe.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Tile key={entry.slug} entry={entry} />
        ))}
      </section>

      <p className="mt-16 border-t border-foreground/10 pt-8 text-sm text-muted-foreground">
        Tip: toggle your OS &quot;Reduce Motion&quot; setting and refresh — every component
        should render its final, static state with no animation.
      </p>
    </main>
  )
}

function Tile({ entry }: { entry: LabEntry }) {
  return (
    <Link
      href={`/lab/${entry.slug}`}
      className="group relative flex aspect-[4/3] flex-col overflow-hidden rounded-xl border border-foreground/10 bg-secondary/30 transition-colors hover:border-foreground/25"
    >
      {/* Preview — live mini-demo for tile-friendly components, label for the
          full-bleed ones (which need a real viewport to make sense). */}
      <div className="pointer-events-none flex flex-1 items-center justify-center overflow-hidden p-6">
        {entry.full ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
            {entry.category}
          </span>
        ) : (
          entry.render()
        )}
      </div>

      {entry.hint ? (
        <span className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-tight text-muted-foreground/60">
          {entry.hint}
        </span>
      ) : null}

      <ArrowUpRight
        size={16}
        weight="bold"
        className="absolute right-4 top-4 text-muted-foreground/40 transition-colors group-hover:text-foreground"
      />

      <div className="pointer-events-none flex items-center justify-between border-t border-foreground/10 bg-background/70 px-4 py-3 font-mono text-[11px] uppercase tracking-tight text-muted-foreground backdrop-blur">
        <span className="text-foreground">{entry.name}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
          {entry.category}
        </span>
      </div>
    </Link>
  )
}
