import { defineType, defineField, defineArrayMember } from 'sanity'
import { CogIcon } from '@sanity/icons'

/**
 * Global site settings — a singleton (one fixed document, id `siteSettings`,
 * pinned in sanity/structure.ts). Holds branding, navigation, footer, contact,
 * and social links shared across every page.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'social', title: 'Social & contact' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Default description',
      type: 'text',
      rows: 3,
      group: 'general',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      group: 'general',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social share image',
      type: 'image',
      group: 'general',
      options: { hotspot: true },
    }),
    defineField({
      name: 'nav',
      title: 'Header navigation',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({ type: 'link' })],
    }),
    defineField({
      name: 'footerNav',
      title: 'Footer navigation',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({ type: 'link' })],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'text',
      rows: 2,
      group: 'general',
    }),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'array',
      group: 'social',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {
                list: [
                  'twitter',
                  'instagram',
                  'linkedin',
                  'facebook',
                  'youtube',
                  'github',
                  'tiktok',
                ],
              },
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'social',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
      group: 'social',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
