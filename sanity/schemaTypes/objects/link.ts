import { defineType, defineField } from 'sanity'
import { LinkIcon } from '@sanity/icons'

/**
 * Reusable link — either an internal reference (resolved to a slug in GROQ) or
 * an external URL. Used for nav items, buttons, and CTAs.
 */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          { title: 'Internal', value: 'internal' },
          { title: 'External', value: 'external' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'internal',
      title: 'Internal page',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'post' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'href',
      title: 'External URL',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'linkType' },
  },
})
