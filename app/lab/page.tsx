import { TextScramble } from '@/components/animations'
import { entries } from './registry'
import { LabExplorer } from './lab-explorer'

/**
 * /lab — launcher for the in-house GSAP motion kit.
 *
 * Every project cloned from predart-starter ships with this gallery: run
 * `pnpm dev` and open /lab. Each tile opens the component in an isolation
 * playground (`/lab/<slug>`) — a device-sized, scrollable viewport where you
 * can poke at it on its own. The grid is filterable by source (which catalog
 * each motion was ported from) via the <LabExplorer> client island. Remove this
 * route (`rm -rf app/lab`) before launching a client site if you don't want it
 * publicly reachable.
 */
export default function MotionLab() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 md:px-10">
      <header className="mb-12 flex flex-col gap-4">
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
          {entries.length} motion components every project inherits, tagged by where they came
          from. Filter by source below, or click any tile to open it in an isolated, device-sized
          playground. All are prefers-reduced-motion safe.
        </p>
      </header>

      <LabExplorer />

      <p className="mt-16 border-t border-foreground/10 pt-8 text-sm text-muted-foreground">
        Tip: toggle your OS &quot;Reduce Motion&quot; setting and refresh — every component
        should render its final, static state with no animation.
      </p>
    </main>
  )
}
