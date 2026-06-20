import type { StructureResolver } from 'sanity/structure'
import { CogIcon } from '@sanity/icons'

/**
 * Studio desk structure. `siteSettings` is pinned as an editable singleton
 * (one fixed document, no list / create-new), everything else uses the default
 * document-type lists.
 */
const SINGLETON_TYPES = new Set(['siteSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      ...S.documentTypeListItems().filter(
        (item) =>
          !SINGLETON_TYPES.has(item.getId() ?? '') &&
          !['page', 'post', 'author', 'category'].includes(item.getId() ?? ''),
      ),
    ])
