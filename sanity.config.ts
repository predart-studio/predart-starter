/**
 * Sanity Studio configuration (embedded at /studio).
 *
 * Embedded — rather than standalone — is a deliberate choice for this starter:
 * the CMS ships with each cloned client site, one repo, one deploy, no separate
 * Studio hosting. Trade-offs (slower builds, manual `pnpm typegen` after query
 * edits, no Studio auto-updates) are documented in docs/sanity.md.
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'

import { apiVersion, dataset, safeProjectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { resolve } from './sanity/presentation/resolve'

export default defineConfig({
  basePath: '/studio',
  projectId: safeProjectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
