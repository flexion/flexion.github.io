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
      { label: 'Forms Platform', url: 'https://example.com/platform', kind: 'demo' },
      { label: 'flexion/forms', url: 'https://github.com/flexion/forms', kind: 'repo' },
      { label: 'Forms Lab (experiment)', url: 'https://example.com/lab', kind: 'demo' },
      { label: 'flexion/forms-lab', url: 'https://github.com/flexion/forms-lab', kind: 'repo' },
    ],
  }

  const singleLink: FeaturedLab = {
    title: 'Messaging Lab',
    tagline: 'Text messaging services.',
    order: 2,
    links: [
      { label: 'flexion/flexion-notify', url: 'https://github.com/flexion/flexion-notify', kind: 'repo' },
    ],
  }

  const caseStudy: FeaturedLab = {
    title: 'Document Extractor Lab',
    tagline: 'OCR alternative.',
    order: 3,
    links: [
      { label: 'flexion/document-extractor', url: 'https://github.com/flexion/document-extractor', kind: 'repo' },
      { label: 'Flexion case study', url: 'https://flexion.us/case-study/', kind: 'case-study' },
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

  test('renders one column per link with kind heading, icon, and external anchor', async () => {
    const html = await renderToHtml(<LabCard lab={multiProject} />)
    expect(html.match(/class="lab-card__column"/g)?.length).toBe(4)
    expect(html.match(/class="lab-card__column-heading"/g)?.length).toBe(4)
    expect(html.match(/class="lab-card__column-link"/g)?.length).toBe(4)
    expect(html.match(/class="lab-card__icon"/g)?.length).toBe(4)
    expect(html.match(/rel="noopener external"/g)?.length).toBe(4)

    // Kind headings match each link's kind in order: demo, repo, demo, repo
    expect(html).toContain('Demo')
    expect(html).toContain('Repository')

    // Labels come through as the visible link text
    expect(html).toContain('>Forms Platform<')
    expect(html).toContain('>flexion/forms<')
    expect(html).toContain('>Forms Lab (experiment)<')
    expect(html).toContain('>flexion/forms-lab<')
  })

  test('a single-link lab renders a single column', async () => {
    const html = await renderToHtml(<LabCard lab={singleLink} />)
    expect(html.match(/class="lab-card__column"/g)?.length).toBe(1)
    expect(html).toContain('Repository')
    expect(html).toContain('href="https://github.com/flexion/flexion-notify"')
  })

  test('case-study kind renders its own heading', async () => {
    const html = await renderToHtml(<LabCard lab={caseStudy} />)
    expect(html).toContain('Case study')
    expect(html).toContain('href="https://flexion.us/case-study/"')
  })
})
