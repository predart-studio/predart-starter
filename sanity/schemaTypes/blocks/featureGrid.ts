import { defineType, defineField, defineArrayMember } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'

export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Feature grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'features',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: 'feature',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'body', type: 'text', rows: 3 }),
            defineField({
              name: 'icon',
              title: 'Phosphor icon name',
              type: 'string',
              description:
                'Optional Phosphor icon name (e.g. "Rocket", "Lightning").',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', features: 'features' },
    prepare({ title, features }) {
      const count = Array.isArray(features) ? features.length : 0
      return {
        title: title || 'Feature grid',
        subtitle: `Feature grid · ${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
