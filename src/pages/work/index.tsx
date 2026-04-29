import { Layout } from '../../design/common/layout'
import { FeaturedCard } from '../../design/components/featured-card'
import { Tag } from '../../design/components/tag'
import type { Catalog, CatalogEntry } from '../../catalog/types'
import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'side-nav': { children?: any }
    }
  }
}

const CATEGORY_LABEL: Record<CatalogEntry['category'], string> = {
  product: 'Product',
  tool: 'Tool',
  workshop: 'Workshop',
  prototype: 'Prototype',
  fork: 'Fork',
  uncategorized: 'Uncategorized',
}

type Section = { id: string; label: string; entries: CatalogEntry[]; featured?: boolean }

export function WorkIndex({
  catalog,
  config,
}: {
  catalog: Catalog
  config: SiteConfig
}) {
  const visible = catalog.filter((e) => !e.hidden)
  const featured = visible.filter((e) => e.featured)
  const rest = visible.filter((e) => !e.featured)

  const sections: Section[] = [
    ...(featured.length > 0 ? [{ id: 'featured', label: 'Featured', entries: featured, featured: true }] : []),
    { id: 'active', label: 'Active', entries: rest.filter((e) => e.tier === 'active') },
    { id: 'available', label: 'Available', entries: rest.filter((e) => e.tier === 'unreviewed' || e.tier === 'as-is') },
    { id: 'archived', label: 'Archived', entries: rest.filter((e) => e.tier === 'archived') },
  ].filter((s) => s.entries.length > 0)

  // Sort non-featured entries within each section by pushedAt descending
  for (const section of sections) {
    if (!section.featured) {
      section.entries.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    }
  }

  const navItems = sections.map((s) => ({
    href: `#${s.id}`,
    label: s.featured ? s.label : `${s.label} (${s.entries.length})`,
  }))

  return (
    <Layout title="Work" config={config}>
      <h1>Our work</h1>
      <p class="work-index__intro">
        Flexion's public portfolio — tools we've built, prototypes we've shipped, and
        open-source projects we actively contribute to. See our{' '}
        <a href={url('/work/health/', config.basePath)}>stewardship scorecard</a> for
        how each repo measures up.
      </p>

      <div class="l-sidebar">
        <side-nav>
          <nav class="side-nav" aria-label="Work sections">
            <ul class="side-nav__list">
              {navItems.map(({ href, label }) => (
                <li class="side-nav__item">
                  <a class="side-nav__link" href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </side-nav>

        <div class="l-stack" data-space="xl">
          {sections.map((section) => (
            <section id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}>{section.label}</h2>
              {section.featured ? (
                <div class="work-index__featured-grid">
                  {section.entries.map((entry) => (
                    <FeaturedCard entry={entry} basePath={config.basePath} />
                  ))}
                </div>
              ) : (
                <ul class="work-list">
                  {section.entries.map((entry) => (
                    <li class="work-list__item">
                      <div class="work-list__header">
                        <a class="work-list__name" href={url(`/work/${entry.name}/`, config.basePath)}>
                          {entry.name}
                        </a>
                        <Tag variant={`category-${entry.category}`}>
                          {CATEGORY_LABEL[entry.category]}
                        </Tag>
                      </div>
                      {entry.overlay?.summary || entry.description ? (
                        <p class="work-list__desc">
                          {entry.overlay?.summary ?? entry.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  )
}
