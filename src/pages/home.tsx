import { raw } from 'hono/html'
import { Layout } from '../design/common/layout'
import { LabCard } from '../design/components/lab-card'
import { url } from '../build/config'
import type { FeaturedLab } from '../build/featured'
import type { SiteConfig } from '../build/config'

export type HeroContent = {
  title: string
  subtitle: string
  intro: string // pre-rendered HTML
  learnMore: {
    commitment: string
    about: string
  }
}

export function Home({
  hero,
  featured,
  config,
}: {
  hero: HeroContent
  featured: FeaturedLab[]
  config: SiteConfig
}) {
  return (
    <Layout title={null} config={config}>
      <section class="home-hero">
        <h1>{hero.title}</h1>
        {hero.subtitle ? (
          <p class="home-hero__subtitle">{hero.subtitle}</p>
        ) : null}
        {hero.intro ? (
          <div class="home-intro">{raw(hero.intro)}</div>
        ) : null}
      </section>

      <section class="home-featured" aria-labelledby="featured-heading">
        <div class="home-featured__header">
          <h2 id="featured-heading">Featured labs</h2>
        </div>
        <div class="home-featured__list">
          {featured.map((lab) => (
            <LabCard lab={lab} />
          ))}
        </div>
      </section>

      <section class="home-learn-more" aria-labelledby="learn-more-heading">
        <h2 id="learn-more-heading">Learn more</h2>
        <div class="home-learn-more__grid">
          <article class="home-learn-more__item">
            <h3>Our open source commitment</h3>
            <p>{hero.learnMore.commitment}</p>
            <p>
              <a href={url('/commitment/', config.basePath)}>Read our commitment &rarr;</a>
            </p>
          </article>
          <article class="home-learn-more__item">
            <h3>About Flexion</h3>
            <p>{hero.learnMore.about}</p>
            <p>
              <a href={url('/about/', config.basePath)}>Learn about Flexion &rarr;</a>
            </p>
          </article>
        </div>
      </section>
    </Layout>
  )
}
