import { Layout } from '../../design/common/layout'
import { RepoCard } from '../../design/components/repo-card'
import { Select } from '../../design/components/select'
import type { Catalog, CatalogEntry } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'catalog-filter': { children?: any }
    }
  }
}

export function WorkIndex({
  catalog,
  config,
}: {
  catalog: Catalog
  config: SiteConfig
}) {
  const visible = catalog.filter((e) => !e.hidden)
  const sorted = [...visible].sort(defaultSort)

  return (
    <Layout title="Work" config={config}>
      <h1>Our work</h1>
      <p class="work-index__intro">
        Every public repository Flexion maintains. Active projects are stewarded; as-is
        projects are available without promised maintenance; archived projects are no
        longer updated.
      </p>
      <catalog-filter>
        <form class="catalog-filter" method="get">
          <fieldset>
            <legend>Filter</legend>
            <Select name="tier" label="Tier">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="as-is">As-is</option>
              <option value="archived">Archived</option>
              <option value="unreviewed">Unreviewed</option>
            </Select>
            <Select name="category" label="Category">
              <option value="">All</option>
              <option value="product">Product</option>
              <option value="tool">Tool</option>
              <option value="workshop">Workshop</option>
              <option value="prototype">Prototype</option>
              <option value="fork">Fork</option>
              <option value="uncategorized">Uncategorized</option>
            </Select>
          </fieldset>
        </form>
        <ul class="work-index__list">
          {sorted.map((entry) => (
            <li data-tier={entry.tier} data-category={entry.category}>
              <RepoCard entry={entry} basePath={config.basePath} />
            </li>
          ))}
        </ul>
      </catalog-filter>
    </Layout>
  )
}

function defaultSort(a: CatalogEntry, b: CatalogEntry): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  const tierRank: Record<CatalogEntry['tier'], number> = {
    active: 0,
    'as-is': 1,
    unreviewed: 2,
    archived: 3,
  }
  if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier]
  return b.pushedAt.localeCompare(a.pushedAt)
}
