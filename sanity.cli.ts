import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/**
 * Sanity CLI config — drives `sanity schema extract`, `sanity typegen generate`
 * (run together via `pnpm typegen`) and `sanity schema deploy`. TypeGen scans
 * the globs in `path` for `defineQuery(...)` calls and writes types to
 * ./sanity.types.ts.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  typegen: {
    enabled: true,
    path: './{app,components,sanity,lib,hooks}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: './sanity.types.ts',
    overloadClientMethods: true,
  },
})
