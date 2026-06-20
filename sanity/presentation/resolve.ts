import { defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

/**
 * Presentation Tool location resolver — tells the Studio which front-end URL(s)
 * a given document is visible on, so editors get click-to-edit + a live
 * preview. Extend `locations` as you add front-end routes for more types.
 */
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled post',
            href: `/blog/${doc?.slug}`,
          },
          { title: 'Blog index', href: '/blog' },
        ],
      }),
    }),
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled page',
            href: `/${doc?.slug}`,
          },
        ],
      }),
    }),
    siteSettings: defineLocations({
      message: 'Site settings appear across the whole site.',
      tone: 'positive',
      locations: [{ title: 'Home', href: '/' }],
    }),
  },
}
