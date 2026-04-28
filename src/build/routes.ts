import type { Catalog } from '../catalog/types'

export type Route = {
  path: string // always starts with "/" and ends with "/"
  view: 'home' | 'work-index' | 'work-detail' | 'health' | 'commitment' | 'about'
  slug?: string
}

export function allRoutes(catalog: Catalog): Route[] {
  const routes: Route[] = [
    { path: '/', view: 'home' },
    { path: '/work/', view: 'work-index' },
    { path: '/work/health/', view: 'health' },
    { path: '/commitment/', view: 'commitment' },
    { path: '/about/', view: 'about' },
  ]
  for (const entry of catalog) {
    if (entry.hidden) continue
    routes.push({ path: `/work/${entry.name}/`, view: 'work-detail', slug: entry.name })
  }
  return routes
}
