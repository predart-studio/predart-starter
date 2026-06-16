import { notFound } from 'next/navigation'
import { getEntry, entrySlugs } from '../../registry'

export function generateStaticParams() {
  return entrySlugs.map((slug) => ({ slug }))
}

/**
 * /lab/<slug>/frame — the bare, isolated render of ONE motion component.
 *
 * Loaded inside the Playground's <iframe>. It is intentionally chrome-free: just
 * the demo in a scrollable document so the component owns the whole viewport.
 * Scroll-driven entries get a lead-in hint + trailing room so they can actually
 * be triggered by scrolling the frame; full-bleed entries render edge-to-edge.
 */
export default async function FramePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) notFound()

  const demo = entry.render()

  if (entry.full) {
    return (
      <main className="min-h-dvh">
        {entry.scroll ? <ScrollHint /> : null}
        {demo}
        {entry.scroll ? <div className="h-[60vh]" aria-hidden /> : null}
      </main>
    )
  }

  if (entry.scroll) {
    return (
      <main className="min-h-dvh">
        <ScrollHint />
        <div className="flex min-h-[70vh] items-center justify-center p-8">{demo}</div>
        <div className="h-[60vh]" aria-hidden />
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-8">{demo}</main>
  )
}

/** The "SCROLL ↓" affordance — a tall lead-in that invites scrolling the frame. */
function ScrollHint() {
  return (
    <div className="flex h-[55vh] flex-col items-center justify-end gap-3 pb-2 text-muted-foreground">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em]">scroll</span>
      <span className="h-16 w-px bg-foreground/30" aria-hidden />
    </div>
  )
}
