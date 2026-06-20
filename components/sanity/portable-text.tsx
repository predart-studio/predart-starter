import { PortableText, type PortableTextComponents } from 'next-sanity'

import { SanityImage } from './sanity-image'

/**
 * Token-styled Portable Text renderer. Headings start at H2 (the page owns H1).
 * Pass a `blockContent` array — renders nothing for empty/undefined values.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="my-5 leading-relaxed">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 mb-3 text-xl font-semibold tracking-tight">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 mb-2 text-lg font-semibold tracking-tight">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-foreground/20 pl-5 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="my-5 ml-5 list-disc space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="my-5 ml-5 list-decimal space-y-2">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">{children}</code>
    ),
    link: ({ children, value }) => {
      const href: string = value?.href ?? '#'
      const newTab: boolean = Boolean(value?.openInNewTab)
      return (
        <a
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noreferrer noopener' : undefined}
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        <SanityImage
          image={value}
          alt={value?.alt}
          width={1600}
          sizes="(min-width: 768px) 768px, 100vw"
          className="h-auto w-full rounded-lg"
        />
        {value?.caption ? (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {value.caption}
          </figcaption>
        ) : null}
      </figure>
    ),
  },
}

export function PortableTextRenderer({ value }: { value?: unknown }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components} />
}
