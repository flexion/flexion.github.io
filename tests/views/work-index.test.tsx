import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { WorkIndex } from '../../src/pages/work/index'
import { fixtureCatalog } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('WorkIndex', () => {
  test('renders a row for every non-hidden repo', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    for (const entry of fixtureCatalog) {
      expect(html).toContain(entry.name)
    }
  })

  test('omits hidden repos', async () => {
    const catalog = fixtureCatalog.map((e, i) =>
      i === 0 ? { ...e, hidden: true } : e,
    )
    const html = await renderToHtml(
      <WorkIndex catalog={catalog} config={config} />,
    )
    expect(html).not.toContain('messaging')
  })

  test('wraps the list in a <catalog-filter> web component', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('<catalog-filter')
  })

  test('applies the default sort: featured first, then active, then by pushedAt desc', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    const order = ['messaging', 'forms', 'document-extractor']
    let last = -1
    for (const name of order) {
      const idx = html.indexOf(`href="/work/${name}/"`)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
  })
})
