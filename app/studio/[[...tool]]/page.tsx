/**
 * Embedded Sanity Studio, mounted at /studio.
 *
 * Renders the Studio only when a project id is configured; a fresh clone shows
 * a short setup notice instead of crashing with a connection error. Remove this
 * route (`rm -rf app/studio` + the sanity/* files) if a given client site
 * should not carry a CMS.
 */
import { isSanityConfigured } from '@/sanity/env'

import Studio from './Studio'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Sanity Studio
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect a Sanity project
        </h1>
        <p className="text-sm text-muted-foreground">
          No <code className="rounded bg-secondary px-1.5 py-0.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{' '}
          is set yet. Run{' '}
          <code className="rounded bg-secondary px-1.5 py-0.5">pnpm setup-sanity</code>{' '}
          (or copy <code className="rounded bg-secondary px-1.5 py-0.5">.env.example</code> to{' '}
          <code className="rounded bg-secondary px-1.5 py-0.5">.env.local</code> and fill it in),
          then restart the dev server. See{' '}
          <code className="rounded bg-secondary px-1.5 py-0.5">docs/sanity.md</code>.
        </p>
      </div>
    )
  }

  return <Studio />
}
