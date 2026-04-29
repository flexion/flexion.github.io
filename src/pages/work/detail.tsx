import { raw } from 'hono/html'
import { Layout } from '../../design/common/layout'
import { Link } from '../../design/components/link'
import { Tag } from '../../design/components/tag'
import { StandardsList } from '../../design/components/standards-list'
import { evaluateRepo } from '../../catalog/repo-checks'
import type { Catalog, CatalogEntry } from '../../catalog/types'
import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

export function WorkDetail({
  entry,
  catalog,
  now,
  config,
}: {
  entry: CatalogEntry
  catalog: Catalog
  now: Date
  config: SiteConfig
}) {
  const evaluation = evaluateRepo(entry, now)
  const title = entry.overlay?.title ?? entry.name

  return (
    <Layout title={title} config={config}>
      <article class="work-detail">
        <header class="work-detail__header">
          <h1>{title}</h1>
          <p class="work-detail__badges">
            <Tag variant={`tier-${entry.tier}`}>{entry.tier}</Tag>{' '}
            <Tag variant={`category-${entry.category}`}>{entry.category}</Tag>
          </p>
          <p class="work-detail__links">
            <Link href={entry.url} external>View on GitHub</Link>
            {entry.homepage ? (
              <>
                {' · '}
                <Link href={entry.homepage} external>Homepage</Link>
              </>
            ) : null}
          </p>
        </header>

        <div class="work-detail__body">
          {entry.overlay?.body
            ? raw(entry.overlay.body)
            : <p>{renderBody(entry)}</p>}
          <RelatedProjects entry={entry} catalog={catalog} basePath={config.basePath} />
        </div>

        <aside class="work-detail__aside" aria-label="Stewardship">
          <h2>Stewardship</h2>
          <StandardsList evaluation={evaluation} />
          <dl class="work-detail__stats">
            <dt>Language</dt>
            <dd>{entry.language ?? '—'}</dd>
            <dt>License</dt>
            <dd>{entry.license ?? '—'}</dd>
            <dt>Last push</dt>
            <dd>{entry.pushedAt.slice(0, 10)}</dd>
          </dl>
        </aside>
      </article>
    </Layout>
  )
}

function renderBody(entry: CatalogEntry): string {
  if (entry.overlay?.summary) return entry.overlay.summary
  if (entry.description) return entry.description
  return 'No description yet.'
}

function RelatedProjects({
  entry,
  catalog,
  basePath,
}: {
  entry: CatalogEntry
  catalog: Catalog
  basePath: string
}) {
  const relatedNames = entry.overlay?.related
  if (!relatedNames || relatedNames.length === 0) return null

  const related = relatedNames
    .map((name) => catalog.find((e) => e.name === name))
    .filter((e): e is CatalogEntry => e != null && !e.hidden)

  if (related.length === 0) return null

  return (
    <section class="work-detail__related" aria-labelledby="related-heading">
      <h2 id="related-heading">Related projects</h2>
      <ul>
        {related.map((r) => (
          <li>
            <a href={url(`/work/${r.name}/`, basePath)}>
              {r.overlay?.title ?? r.name}
            </a>
            {r.overlay?.summary ? <span> — {r.overlay.summary}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
