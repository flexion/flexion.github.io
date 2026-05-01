import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { Tag } from '../../src/design/components/tag'
import { RepoCard } from '../../src/design/components/repo-card'
import { StandardsList } from '../../src/design/components/standards-list'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'
import { evaluateRepo } from '../../src/catalog/repo-checks'

describe('Tag', () => {
  test('renders label with a data-variant attribute', async () => {
    const html = await renderToHtml(<Tag variant="tier-active">Active</Tag>)
    expect(html).toContain('class="tag"')
    expect(html).toContain('data-variant="tier-active"')
    expect(html).toContain('Active')
  })
})

describe('RepoCard', () => {
  const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!

  test('renders name, description, and category/tier badges', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('messaging')
    expect(html).toContain('Text-based communication')
    expect(html).toContain('data-variant="tier-active"')
    expect(html).toContain('data-variant="category-product"')
  })

  test('uses overlay.summary when present', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('Text-based communication for critical updates.')
  })

  test('falls back to description when there is no overlay', async () => {
    const forms = fixtureCatalog.find((e) => e.name === 'forms')!
    const html = await renderToHtml(<RepoCard entry={forms} basePath="/" />)
    expect(html).toContain('Accessible form experiences')
  })

  test('links to work/<slug>/', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('href="/work/messaging/"')
  })
})

describe('StandardsList', () => {
  test('renders a list item per check with the result class', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const evaluation = evaluateRepo(messaging, fixtureNow)
    const html = await renderToHtml(<StandardsList evaluation={evaluation} />)
    expect(html).toContain('standards-list__item--pass')
    expect(html.match(/standards-list__item/g)!.length).toBe(5)
  })
})

import { LabCard } from '../../src/design/components/lab-card'
import type { FeaturedLab } from '../../src/build/featured'

describe('LabCard', () => {
  const lab: FeaturedLab = {
    title: 'Forms Lab',
    tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
    order: 1,
    links: [
      { label: 'Demo (Forms Platform)', url: 'https://example.com/demo' },
      { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    ],
  }

  test('renders the title as an h3 with no link', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toMatch(/<h3[^>]*class="lab-card__title"[^>]*>Forms Lab<\/h3>/)
    // Title should not be wrapped in an anchor
    expect(html).not.toMatch(/<h3[^>]*>[^<]*<a/)
  })

  test('renders the tagline', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toContain('Digitize forms to create modern, accessible experiences')
  })

  test('renders one link per entry with external treatment', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toContain('href="https://example.com/demo"')
    expect(html).toContain('href="https://github.com/flexion/forms"')
    expect(html).toContain('Demo (Forms Platform)')
    expect(html).toContain('GitHub repository — Forms Platform')
    // Uses the Link component with external variant
    expect(html.match(/data-variant="external"/g)?.length).toBe(2)
  })
})
