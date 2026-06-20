import { defineQuery } from 'next-sanity'

/**
 * GROQ queries. Each is wrapped in `defineQuery` so Sanity TypeGen can generate
 * a matching `<NAME>Result` type into `sanity.types.ts` (run `pnpm typegen`).
 * Query variable names must be unique across the whole codebase.
 */

// Singleton: global site settings (nav, branding, contact, social).
export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  title,
  description,
  logo,
  ogImage,
  footerText,
  contactEmail,
  contactPhone,
  nav[]{
    _key,
    label,
    linkType,
    openInNewTab,
    "href": coalesce(href, "/" + internal->slug.current, "#")
  },
  footerNav[]{
    _key,
    label,
    linkType,
    openInNewTab,
    "href": coalesce(href, "/" + internal->slug.current, "#")
  },
  social[]{ _key, platform, url }
}`)

// Blog index.
export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage,
    "author": author->{ name, "slug": slug.current }
  }`)

// Single blog post.
export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  mainImage,
  body,
  "author": author->{ name, image, bio, "slug": slug.current },
  "categories": categories[]->{ _id, title, "slug": slug.current },
  seo
}`)

export const POSTS_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current
}`)

// CMS-driven page (page builder).
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  pageBuilder[]{
    ...,
    _type == "hero" => {
      ...,
      ctas[]{
        _key,
        label,
        linkType,
        openInNewTab,
        "href": coalesce(href, "/" + internal->slug.current, "#")
      }
    },
    _type == "callToAction" => {
      ...,
      button{
        label,
        linkType,
        openInNewTab,
        "href": coalesce(href, "/" + internal->slug.current, "#")
      }
    }
  },
  seo
}`)

export const PAGE_SLUGS_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)]{
  "slug": slug.current
}`)
