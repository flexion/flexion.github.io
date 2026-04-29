import type { CatalogEntry } from '../../../catalog/types'
import { url } from '../../../build/config'
import { raw } from 'hono/html'

/** Extract first <p>…</p> from rendered HTML body */
function firstParagraph(html: string): string | null {
  const match = html.match(/<p>([\s\S]*?)<\/p>/)
  return match ? match[1] : null
}

export function FeaturedCard({ entry, basePath }: { entry: CatalogEntry; basePath: string }) {
  const href = url(`/work/${entry.name}/`, basePath)
  const title = entry.overlay?.title ?? entry.name
  const summary = entry.overlay?.summary ?? entry.description ?? ''
  const highlights = entry.overlay?.highlights
  const excerpt = entry.overlay?.body ? firstParagraph(entry.overlay.body) : null
  const image = entry.overlay?.image
    ? url(entry.overlay.image, basePath)
    : null
  const imageAlt = entry.overlay?.imageAlt ?? ''
  const hasImage = Boolean(image)

  return (
    <article class={`featured-card${hasImage ? ' featured-card--has-image' : ''}`}>
      <div class="featured-card__content">
        <h3 class="featured-card__title">
          <a href={href}>{title}</a>
        </h3>
        <p class="featured-card__summary">{summary}</p>
        {excerpt ? <p class="featured-card__excerpt">{raw(excerpt)}</p> : null}
        {highlights ? (
          <ul class="featured-card__tags">
            {highlights.map((h) => <li>{h}</li>)}
          </ul>
        ) : null}
        <p class="featured-card__cta">
          <a href={href}>Explore {title} &rarr;</a>
        </p>
      </div>
      {image ? (
        <div class="featured-card__image">
          <a href={href} tabindex={-1} aria-hidden="true">
            <img src={image} alt={imageAlt} loading="lazy" />
          </a>
        </div>
      ) : null}
    </article>
  )
}
