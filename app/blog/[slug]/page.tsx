import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { POST_QUERY, POSTS_SLUGS_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import { SanityImage } from '@/components/sanity/sanity-image'
import { PortableTextRenderer } from '@/components/sanity/portable-text'

type Params = { slug: string }

export async function generateStaticParams() {
  if (!isSanityConfigured) return []
  const slugs = await client.fetch(
    POSTS_SLUGS_QUERY,
    {},
    { perspective: 'published', stega: false },
  )
  return (slugs ?? []).map((s) => ({ slug: s.slug ?? '' }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  if (!isSanityConfigured) return {}
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: { slug },
    stega: false,
  })
  if (!post) return {}
  return {
    title: post.seo?.metaTitle ?? post.title ?? undefined,
    description: post.seo?.metaDescription ?? post.excerpt ?? undefined,
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!isSanityConfigured) notFound()

  const { data: post } = await sanityFetch({ query: POST_QUERY, params: { slug } })
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 md:px-10">
      <Link
        href="/blog"
        className="font-mono text-xs uppercase tracking-tight text-muted-foreground hover:text-foreground"
      >
        ← Blog
      </Link>

      <article className="mt-8">
        <header className="flex flex-col gap-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="font-mono text-xs uppercase tracking-tight text-muted-foreground/70">
            {post.author?.name ? `${post.author.name} · ` : ''}
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
          </p>
        </header>

        {post.mainImage?.asset ? (
          <SanityImage
            image={post.mainImage}
            width={1600}
            sizes="(min-width: 768px) 768px, 100vw"
            className="mt-8 h-auto w-full rounded-xl"
            priority
          />
        ) : null}

        <div className="mt-4">
          <PortableTextRenderer value={post.body} />
        </div>
      </article>
    </main>
  )
}
