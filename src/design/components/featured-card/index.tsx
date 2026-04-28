import type { CatalogEntry } from '../../../catalog/types'
import { url } from '../../../build/config'

export function FeaturedCard({ entry, basePath }: { entry: CatalogEntry; basePath: string }) {
  const href = url(`/work/${entry.name}/`, basePath)
  const title = entry.overlay?.title ?? entry.name
  const summary = entry.overlay?.summary ?? entry.description ?? ''
  const highlights = entry.overlay?.highlights

  return (
    <article class="featured-card">
      <h3 class="featured-card__title">
        <a href={href}>{title}</a>
      </h3>
      {summary ? <p class="featured-card__summary">{summary}</p> : null}
      {highlights ? (
        <ul class="featured-card__highlights">
          {highlights.map((h) => <li>{h}</li>)}
        </ul>
      ) : null}
      <p class="featured-card__cta">
        <a href={href}>Learn more &rarr;</a>
      </p>
    </article>
  )
}
