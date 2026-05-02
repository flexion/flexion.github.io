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
  const multiProject: FeaturedLab = {
    title: 'Forms Lab',
    tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
    order: 1,
    links: [
      { label: 'Live demo', url: 'https://example.com/platform', kind: 'demo', group: 'Forms Platform' },
      { label: 'Repository', url: 'https://github.com/flexion/forms', kind: 'repo', group: 'Forms Platform' },
      { label: 'Live demo', url: 'https://example.com/lab', kind: 'demo', group: 'Forms Lab (experiment)' },
      { label: 'Repository', url: 'https://github.com/flexion/forms-lab', kind: 'repo', group: 'Forms Lab (experiment)' },
    ],
  }

  const singleLink: FeaturedLab = {
    title: 'Messaging Lab',
    tagline: 'Text messaging services.',
    order: 2,
    links: [
      { label: 'Repository', url: 'https://github.com/flexion/flexion-notify', kind: 'repo' },
    ],
  }

  test('renders the title as an h3 with no link', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html).toMatch(/<h3[^>]*class="lab-card__title"[^>]*>Forms Lab<\/h3>/)
    // Title should not be wrapped in an anchor
    expect(html).not.toMatch(/<h3[^>]*>[^<]*<a/)
  })

  test('renders the tagline', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html).toContain('Digitize forms to create modern, accessible experiences')
  })

  test('renders each link as an external anchor with the labeled text', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html).toContain('href="https://example.com/platform"')
    expect(html).toContain('href="https://github.com/flexion/forms"')
    expect(html).toContain('href="https://example.com/lab"')
    expect(html).toContain('href="https://github.com/flexion/forms-lab"')
    // Every anchor carries rel="noopener external"
    expect(html.match(/rel="noopener external"/g)?.length).toBe(4)
  })

  test('groups links under a sub-project heading when group is set', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html).toContain('Forms Platform')
    expect(html).toContain('Forms Lab (experiment)')
    // Two group headings are present in the markup
    expect(html.match(/class="lab-card__group-name"/g)?.length).toBe(2)
  })

  test('omits the group heading when links have no group', async () => {
    const html = await renderToHtml(<LabCard lab={singleLink} />)
    expect(html).not.toContain('lab-card__group-name')
    expect(html).toContain('href="https://github.com/flexion/flexion-notify"')
  })

  test('emits one icon per link, marked aria-hidden', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html.match(/class="lab-card__icon"/g)?.length).toBe(4)
    expect(html.match(/aria-hidden="true"/g)?.length ?? 0).toBeGreaterThanOrEqual(4)
  })
})
