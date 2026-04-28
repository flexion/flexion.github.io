import type { CatalogEntry } from '../../../catalog/types'
import { Tag } from '../tag'
import { url } from '../../../build/config'

const TIER_LABEL: Record<CatalogEntry['tier'], string> = {
  active: 'Active',
  'as-is': 'As-is',
  archived: 'Archived',
  unreviewed: 'Unreviewed',
}

const CATEGORY_LABEL: Record<CatalogEntry['category'], string> = {
  product: 'Product',
  tool: 'Tool',
  workshop: 'Workshop',
  prototype: 'Prototype',
  fork: 'Fork',
  uncategorized: 'Uncategorized',
}

export function RepoCard({ entry, basePath }: { entry: CatalogEntry; basePath: string }) {
  const href = url(`/work/${entry.name}/`, basePath)
  const summary = entry.overlay?.summary ?? entry.description ?? ''
  return (
    <article class="repo-card">
      <h3 class="repo-card__name">
        <a href={href}>{entry.name}</a>
      </h3>
      {summary ? <p class="repo-card__summary">{summary}</p> : null}
      <p class="repo-card__meta">
        <Tag variant={`tier-${entry.tier}`}>{TIER_LABEL[entry.tier]}</Tag>{' '}
        <Tag variant={`category-${entry.category}`}>
          {CATEGORY_LABEL[entry.category]}
        </Tag>
      </p>
    </article>
  )
}
