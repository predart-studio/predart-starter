import Link from 'next/link'
import type { Metadata } from 'next'

import { sanityFetch } from '@/sanity/lib/live'
import { POSTS_QUERY } from '@/sanity/lib/queries'
import { isSanityConfigured } from '@/sanity/env'
import { SanityImage } from '@/components/sanity/sanity-image'

export const metadata: Metadata = {
  title: 'Blog',
}

/**
 * Blog index — a working example of the Sanity pipeline (live fetch → image →
 * real-time updates). Renders an empty state until a project is connected and
 * posts exist. Delete app/blog if a client site has no blog.
 */
export default async function BlogIndexPage() {
  const posts = isSanityConfigured ? (await sanityFetch({ query: POSTS_QUERY })).data : []

  return (
    <main className="mx-auto max-w-4xl px-6 py-24 md:px-10">
      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Blog</h1>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 px-6 py-12 text-center text-muted-foreground">
          {isSanityConfigured
            ? 'No posts published yet. Add one in the Studio at /studio.'
            : 'Connect a Sanity project to publish posts. See docs/sanity.md.'}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/10">
          {posts.map((post) => (
            <li key={post._id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center"
              >
                {post.mainImage?.asset ? (
                  <SanityImage
                    image={post.mainImage}
                    width={320}
                    height={200}
                    sizes="320px"
                    className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-40"
                  />
                ) : null}
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-muted-foreground">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="line-clamp-2 text-muted-foreground">{post.excerpt}</p>
                  ) : null}
                  <p className="font-mono text-xs uppercase tracking-tight text-muted-foreground/70">
                    {post.author?.name ? `${post.author.name} · ` : ''}
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
