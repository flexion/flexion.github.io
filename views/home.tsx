import { Layout } from './layout'
import { RepoCard } from './components/repo-card'
import type { Catalog } from '../catalog/types'
import type { SiteConfig } from '../build/config'
import { url } from '../build/config'

export type HeroContent = { hero: string; intro: string }

export function Home({
  catalog,
  hero,
  config,
}: {
  catalog: Catalog
  hero: HeroContent
  config: SiteConfig
}) {
  const featured = catalog.filter((e) => e.featured && !e.hidden)
  const visible = catalog.filter((e) => !e.hidden)
  const active = visible.filter((e) => e.tier === 'active').length
  const languages = new Set(
    visible.map((e) => e.language).filter((l): l is string => Boolean(l)),
  ).size

  return (
    <Layout title={null} config={config}>
      <section class="home-hero">
        <h1>{hero.hero}</h1>
        <p class="home-hero__intro">{hero.intro}</p>
      </section>

      <section class="home-featured" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Featured labs</h2>
        <div class="home-featured__grid">
          {featured.map((entry) => (
            <RepoCard entry={entry} basePath={config.basePath} />
          ))}
        </div>
      </section>

      <section class="home-stats" aria-labelledby="stats-heading">
        <h2 id="stats-heading">By the numbers</h2>
        <ul class="home-stats__grid">
          <li><strong>{visible.length}</strong> public projects</li>
          <li><strong>{active}</strong> actively maintained</li>
          <li><strong>{languages}</strong> languages</li>
        </ul>
      </section>

      <section class="home-paths" aria-labelledby="paths-heading">
        <h2 id="paths-heading">Where to next</h2>
        <ul>
          <li><a href={url('/work/', config.basePath)}>Explore our work</a></li>
          <li><a href={url('/commitment/', config.basePath)}>Read our open source commitment</a></li>
          <li><a href={url('/about/', config.basePath)}>Get in touch</a></li>
        </ul>
      </section>
    </Layout>
  )
}
