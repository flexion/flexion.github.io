import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { WorkIndex } from '../../src/pages/work/index'
import { fixtureCatalog } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('WorkIndex', () => {
  test('renders featured repos in a featured section', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('id="featured"')
    expect(html).toContain('featured-card')
    expect(html).toContain('messaging')
    expect(html).toContain('forms')
    expect(html).toContain('document-extractor')
  })

  test('omits hidden repos', async () => {
    const catalog = fixtureCatalog.map((e, i) =>
      i === 0 ? { ...e, hidden: true } : e,
    )
    const html = await renderToHtml(
      <WorkIndex catalog={catalog} config={config} />,
    )
    expect(html).not.toContain('href="/work/messaging/"')
  })

  test('renders a side-nav with section links', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('<side-nav')
    expect(html).toContain('class="side-nav"')
  })

  test('groups non-featured repos into tier sections', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('id="available"')
    expect(html).toContain('id="archived"')
    expect(html).toContain('fork-of-thing')
    expect(html).toContain('archived-thing')
  })

  test('renders compact list items with name and category', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('class="work-list__name"')
    expect(html).toContain('class="work-list__desc"')
  })
})
