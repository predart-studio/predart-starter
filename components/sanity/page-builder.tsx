import type { PAGE_QUERY_RESULT } from '@/sanity.types'
import { Button } from '@/components/ui/button'

import { SanityImage } from './sanity-image'
import { PortableTextRenderer } from './portable-text'

/**
 * Renders a `page.pageBuilder` array. Each Sanity section block maps to a
 * token-styled React section below. To add a block: define the schema in
 * sanity/schemaTypes/blocks, register it in pageBuilder.ts, add an interface +
 * a `case` here. Keep these intentionally plain — clients restyle per brand.
 */

/**
 * Block types derived from the generated PAGE_QUERY result, so the renderer
 * always matches the actual GROQ projection (e.g. links already coalesced to a
 * flat `href`). Regenerate with `pnpm typegen` after any query/schema change.
 */
type PageBlock = NonNullable<NonNullable<PAGE_QUERY_RESULT>['pageBuilder']>[number]
type Block<T extends PageBlock['_type']> = Extract<PageBlock, { _type: T }>
type CtaData = NonNullable<Block<'callToAction'>['button']>

function CtaButton({ cta, variant = 'default' }: { cta?: CtaData | null; variant?: 'default' | 'outline' }) {
  if (!cta?.label) return null
  const href = cta.href ?? '#'
  const newTab = Boolean(cta.openInNewTab)
  return (
    <Button asChild variant={variant}>
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noreferrer noopener' : undefined}
      >
        {cta.label}
      </a>
    </Button>
  )
}

function HeroSection(block: Block<'hero'>) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {block.eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {block.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{block.heading}</h1>
          {block.subheading ? (
            <p className="max-w-prose text-lg text-muted-foreground">{block.subheading}</p>
          ) : null}
          {block.ctas?.length ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {block.ctas.map((cta, i) => (
                <CtaButton key={cta._key} cta={cta} variant={i === 0 ? 'default' : 'outline'} />
              ))}
            </div>
          ) : null}
        </div>
        {block.image?.asset ? (
          <SanityImage
            image={block.image}
            width={1200}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-auto w-full rounded-xl"
            priority
          />
        ) : null}
      </div>
    </section>
  )
}

function FeatureGridSection(block: Block<'featureGrid'>) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      <div className="mb-12 flex max-w-prose flex-col gap-4">
        {block.eyebrow ? (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {block.eyebrow}
          </p>
        ) : null}
        {block.heading ? (
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{block.heading}</h2>
        ) : null}
        {block.intro ? <p className="text-muted-foreground">{block.intro}</p> : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.features?.map((feature) => (
          <div
            key={feature._key}
            className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-secondary/30 p-6"
          >
            <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
            {feature.body ? (
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function TestimonialsSection(block: Block<'testimonials'>) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      {block.heading ? (
        <h2 className="mb-12 text-3xl font-semibold tracking-tight md:text-4xl">{block.heading}</h2>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {block.items?.map((item) => (
          <figure
            key={item._key}
            className="flex flex-col gap-4 rounded-xl border border-foreground/10 bg-secondary/30 p-6"
          >
            <blockquote className="text-pretty leading-relaxed">“{item.quote}”</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              {item.avatar?.asset ? (
                <SanityImage
                  image={item.avatar}
                  width={80}
                  height={80}
                  className="size-10 rounded-full object-cover"
                />
              ) : null}
              <span className="text-sm">
                <span className="block font-medium text-foreground">{item.author}</span>
                {item.role ? (
                  <span className="block text-muted-foreground">{item.role}</span>
                ) : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function CallToActionSection(block: Block<'callToAction'>) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-foreground/10 bg-secondary/40 px-6 py-16 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          {block.heading}
        </h2>
        {block.body ? (
          <p className="max-w-prose text-muted-foreground">{block.body}</p>
        ) : null}
        <CtaButton cta={block.button} />
      </div>
    </section>
  )
}

function RichTextSection(block: Block<'richTextBlock'>) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <PortableTextRenderer value={block.content} />
    </section>
  )
}

function renderBlock(block: PageBlock) {
  switch (block._type) {
    case 'hero':
      return <HeroSection key={block._key} {...block} />
    case 'featureGrid':
      return <FeatureGridSection key={block._key} {...block} />
    case 'testimonials':
      return <TestimonialsSection key={block._key} {...block} />
    case 'callToAction':
      return <CallToActionSection key={block._key} {...block} />
    case 'richTextBlock':
      return <RichTextSection key={block._key} {...block} />
    default:
      return null
  }
}

export function PageBuilder({ blocks }: { blocks?: PageBlock[] | null }) {
  if (!blocks?.length) return null
  return <>{blocks.map((block) => renderBlock(block))}</>
}
