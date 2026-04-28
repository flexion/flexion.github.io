import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { Badge } from '../../src/web/components/badge'
import { RepoCard } from '../../src/web/components/repo-card'
import { StandardsList } from '../../src/web/components/standards-list'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'
import { evaluateRepo } from '../../src/catalog/repo-checks'

describe('Badge', () => {
  test('renders label and a class reflecting the variant', async () => {
    const html = await renderToHtml(<Badge variant="tier-active">Active</Badge>)
    expect(html).toContain('badge')
    expect(html).toContain('badge--tier-active')
    expect(html).toContain('Active')
  })
})

describe('RepoCard', () => {
  const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!

  test('renders name, description, and category/tier badges', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('messaging')
    expect(html).toContain('Text-based communication')
    expect(html).toContain('badge--tier-active')
    expect(html).toContain('badge--category-product')
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

  test('links to /work/<slug>/', async () => {
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
