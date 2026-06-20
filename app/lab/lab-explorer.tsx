'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react'
import { entries, SOURCE_META, type AnimSource, type LabEntry } from './registry'

type Filter = AnimSource | 'all'

/** Source order in the filter bar + the dot color that brands each provenance. */
const SOURCE_ORDER: AnimSource[] = ['pixelpoint', 'annnimate', 'predart']
const SOURCE_DOT: Record<AnimSource, string> = {
  pixelpoint: 'bg-emerald-400',
  annnimate: 'bg-sky-400',
  predart: 'bg-amber-400',
}

/**
 * Client island for /lab: lets you filter the gallery by where each component
 * came from (pixel-point/animate-text vs annnimate.com vs predart-native), and
 * stamps every tile with a colored source badge so provenance is legible even
 * in the unfiltered "All" view. Filtering is instant client state — no nav, so
 * the in-view animations keep running.
 */
export function LabExplorer() {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: entries.length, pixelpoint: 0, annnimate: 0, predart: 0 }
    for (const e of entries) c[e.source] += 1
    return c
  }, [])

  const visible = filter === 'all' ? entries : entries.filter((e) => e.source === filter)
  const tabs: Filter[] = ['all', ...SOURCE_ORDER]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const active = filter === t
          const label = t === 'all' ? 'All' : SOURCE_META[t].label
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              aria-pressed={active}
              className={[
                'flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-tight transition-colors',
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/15 text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              ].join(' ')}
            >
              {t !== 'all' ? (
                <span className={`size-1.5 rounded-full ${SOURCE_DOT[t]}`} aria-hidden />
              ) : null}
              {label}
              <span className={active ? 'text-background/60' : 'text-muted-foreground/45'}>
                {counts[t]}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mb-10 h-4 font-mono text-[11px] text-muted-foreground/70">
        {filter === 'all' ? 'All sources — each tile is badged by origin.' : SOURCE_META[filter].blurb}
      </p>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => (
          <Tile key={entry.slug} entry={entry} />
        ))}
      </section>
    </>
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
        <span
          className="flex items-center gap-1.5"
          title={`${SOURCE_META[entry.source].label} · ${SOURCE_META[entry.source].blurb} · ${entry.category}`}
        >
          <span className={`size-1.5 rounded-full ${SOURCE_DOT[entry.source]}`} aria-hidden />
          {SOURCE_META[entry.source].label}
        </span>
      </div>
    </Link>
  )
}
