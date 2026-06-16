import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntry, entrySlugs } from '../registry'
import { Playground } from './playground'

export function generateStaticParams() {
  return entrySlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntry(slug)
  return { title: entry ? `${entry.name} · Motion Lab` : 'Motion Lab' }
}

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) notFound()

  return (
    <Playground
      slug={entry.slug}
      name={entry.name}
      category={entry.category}
      hint={entry.hint}
    />
  )
}
