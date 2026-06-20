# Sanity CMS

The starter ships with Sanity built in: an embedded Studio at `/studio`, a
default content model (site settings, pages with a page builder, and a blog),
typed GROQ fetching, real-time Live Content, and Draft Mode / Presentation
preview. It is **project-agnostic** — every client site connects its own Sanity
project. Until one is connected, the CMS stays dormant and the site builds and
runs exactly as before.

## What's included

```
sanity/
├── env.ts                      # projectId/dataset/apiVersion + isSanityConfigured guard
├── lib/
│   ├── client.ts               # createClient (stega-aware)
│   ├── live.ts                 # sanityFetch + <SanityLive/> (Live Content API)
│   ├── image.ts                # urlFor() image builder
│   ├── token.ts                # server read token (optional)
│   └── queries.ts              # GROQ queries (defineQuery → typed)
├── structure.ts                # Studio desk structure (siteSettings singleton)
├── presentation/resolve.ts     # Presentation tool document locations
└── schemaTypes/
    ├── documents/              # siteSettings, page, post, author, category
    ├── objects/                # seo, link, blockContent (portable text)
    └── blocks/                 # hero, featureGrid, testimonials, callToAction, richTextBlock, pageBuilder

sanity.config.ts                # Studio config (embedded, basePath /studio)
sanity.cli.ts                   # CLI + TypeGen config
sanity.types.ts                 # GENERATED types (pnpm typegen)
schema.json                     # GENERATED schema snapshot (pnpm typegen)

app/
├── studio/[[...tool]]/         # embedded Studio (client-boundary mount)
├── api/draft-mode/{enable,disable}/   # preview enter/exit
├── blog/, blog/[slug]/         # working blog example (live fetch + portable text)
└── [slug]/                     # CMS-driven top-level pages (page builder)

components/
├── sanity/{sanity-image,portable-text,page-builder}.tsx   # render layer
└── disable-draft-mode.tsx
```

## Connect a project

1. **Create / pick a project** at <https://www.sanity.io/manage> (or run
   `pnpm dlx sanity@latest init` to create one and link it).
2. **Set env** — run the wizard or copy the example:
   ```bash
   pnpm setup-sanity            # interactive: writes .env.local
   # — or —
   cp .env.example .env.local   # then fill in the values
   ```
   Required: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`.
   Optional: `SANITY_API_READ_TOKEN` (a Viewer token — enables Draft Mode).
3. **Allow the origin (CORS):**
   ```bash
   pnpm dlx sanity@latest cors add http://localhost:3000 --credentials
   ```
4. **Generate types** from the schema:
   ```bash
   pnpm typegen
   ```
5. **Deploy the schema** so the Studio + content tooling see your types:
   ```bash
   pnpm dlx sanity@latest schema deploy
   ```
6. `pnpm dev` → open <http://localhost:3000/studio>, add content, and view it on
   the site.

## The content model

- **Site Settings** — a singleton (branding, header/footer nav, social, contact).
- **Page** — a flexible page built from page-builder blocks. Renders at its
  top-level slug via `app/[slug]/page.tsx` (e.g. a page with slug `about` →
  `/about`). Static routes and folders always win over this catch-all.
- **Post / Author / Category** — a blog, rendered at `/blog` and `/blog/[slug]`.
- **Page-builder blocks** — `hero`, `featureGrid`, `testimonials`,
  `callToAction`, `richTextBlock`. Each maps to a token-styled section in
  `components/sanity/page-builder.tsx`.

## Data fetching

Use the Live Content API everywhere — content updates stream to the page in real
time, and Draft Mode automatically switches to previewing drafts:

```tsx
import { sanityFetch } from '@/sanity/lib/live'
import { POSTS_QUERY } from '@/sanity/lib/queries'

const { data: posts } = await sanityFetch({ query: POSTS_QUERY })
```

`<SanityLive />` is mounted once in the root layout (only when a project is
configured). For `generateStaticParams` use the plain `client` with
`perspective: 'published'` (no drafts at build time) — see the blog/page routes.

Queries live in `sanity/lib/queries.ts`, each wrapped in `defineQuery` so
`pnpm typegen` produces a matching `<NAME>Result` type. **Re-run `pnpm typegen`
after editing a query or the schema** (embedded Studio can't watch-generate).

## Adding a page-builder block

1. Add a schema in `sanity/schemaTypes/blocks/<block>.ts` (`defineType`,
   `type: 'object'`, an icon, a `preview`).
2. Register it in `sanity/schemaTypes/index.ts` and in `blocks/pageBuilder.ts`.
3. Add an interface + a `case` in `components/sanity/page-builder.tsx`.
4. `pnpm typegen`.

## Draft Mode & visual editing

With a read token set, the Studio's **Presentation** tool gives editors a live,
click-to-edit preview. Entering preview hits `/api/draft-mode/enable`; the
floating "Disable draft mode" button (shown only outside Presentation) exits via
`/api/draft-mode/disable`. SEO metadata is fetched with `stega: false` so
content-source-map markers never leak into `<head>`.

## Trade-offs (embedded Studio)

The Studio is embedded (mounted in this Next app) rather than standalone — the
right call for a per-client starter: one repo, one deploy, the CMS travels with
the site. The accepted costs vs a standalone Studio:

- Slower production builds (the Studio compiles through Next).
- No Studio auto-updates — bump `sanity` to upgrade.
- TypeGen isn't on watch — run `pnpm typegen` manually after query/schema edits.
- Reading `draftMode()` in the root layout opts pages into dynamic rendering once
  a project is configured (expected for CMS-driven content; use ISR as needed).

To go standalone instead, move `sanity.config.ts` / `sanity.cli.ts` /
`sanity/schemaTypes` into a separate `studio/` workspace and delete
`app/studio`.

## Removing the CMS from a client site

If a particular client site has no CMS, delete `app/studio`, `app/[slug]`,
`app/blog`, `app/api/draft-mode`, `components/sanity`, `components/disable-draft-mode.tsx`,
and the `sanity/` folder, drop the Sanity blocks from the root layout, and remove
the Sanity dependencies.
