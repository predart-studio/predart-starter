import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import { PageBuilder } from '@/components/sanity/page-builder'

type Params = { slug: string }

/**
 * Catch-all for top-level CMS pages built with the page builder (/about,
 * /services, …). Static routes and folders always take precedence, so this only
 * resolves slugs that aren't otherwise defined. Returns 404 until a matching
 * `page` document exists. Remove this route to make all top-level paths
 * code-defined instead of CMS-driven.
 */
export async function generateStaticParams() {
  if (!isSanityConfigured) return []
  const slugs = await client.fetch(
    PAGE_SLUGS_QUERY,
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
  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug },
    stega: false,
  })
  if (!page) return {}
  return {
    title: page.seo?.metaTitle ?? page.title ?? undefined,
    description: page.seo?.metaDescription ?? undefined,
  }
}

export default async function CmsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!isSanityConfigured) notFound()

  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug } })
  if (!page) notFound()

  return <PageBuilder blocks={page.pageBuilder} />
}
