import { raw } from 'hono/html'
import { Layout } from '../layout'
import { Badge } from '../components/badge'
import { StandardsList } from '../components/standards-list'
import { evaluateRepo } from '../../standards/repo-checks'
import type { CatalogEntry } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

export function WorkDetail({
  entry,
  now,
  config,
}: {
  entry: CatalogEntry
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
            <Badge variant={`tier-${entry.tier}`}>{entry.tier}</Badge>{' '}
            <Badge variant={`category-${entry.category}`}>{entry.category}</Badge>
          </p>
          <p class="work-detail__links">
            <a href={entry.url} rel="noopener external">View on GitHub</a>
            {entry.homepage ? (
              <>
                {' · '}
                <a href={entry.homepage} rel="noopener external">Homepage</a>
              </>
            ) : null}
          </p>
        </header>

        <div class="work-detail__body">
          {entry.overlay?.body
            ? raw(entry.overlay.body)
            : <p>{renderBody(entry)}</p>}
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
