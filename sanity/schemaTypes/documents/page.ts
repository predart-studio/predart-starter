import { defineType, defineField } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

/**
 * Flexible marketing page assembled from page-builder section blocks. Render it
 * by wiring an `app/[slug]/page.tsx` route to <PageBuilder /> (see docs/sanity.md).
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page sections',
      type: 'pageBuilder',
      group: 'content',
    }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
