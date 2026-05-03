import type { Catalog } from '../catalog/types'

export type Route = {
  path: string // always starts with "/" and ends with "/"
  view: 'home' | 'work-index' | 'work-detail' | 'health' | 'commitment' | 'design-system'
  slug?: string
}

export function allRoutes(catalog: Catalog): Route[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _catalog = catalog
  const routes: Route[] = [
    { path: '/', view: 'home' },
    // Work directory is disabled until approved content is ready.
    // Uncomment to restore the public catalog, detail pages, and health page.
    // { path: '/work/', view: 'work-index' },
    // { path: '/work/health/', view: 'health' },
    { path: '/commitment/', view: 'commitment' },
    { path: '/design-system/', view: 'design-system' },
  ]
  // for (const entry of catalog) {
  //   if (entry.hidden) continue
  //   routes.push({ path: `/work/${entry.name}/`, view: 'work-detail', slug: entry.name })
  // }
  return routes
}
