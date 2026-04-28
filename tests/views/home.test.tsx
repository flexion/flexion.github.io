import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { Home } from '../../src/web/pages/home'
import { fixtureCatalog } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }
const heroContent = {
  hero: 'Public infrastructure, in the open.',
  intro: 'Flexion Labs gathers our open source work in one place.',
}

describe('Home', () => {
  test('renders the hero statement as the h1', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toMatch(/<h1[^>]*>Public infrastructure, in the open\.<\/h1>/)
  })

  test('renders one card per featured entry', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toContain('messaging')
    expect(html).toContain('forms')
    expect(html).toContain('document-extractor')
    expect(html).not.toContain('old-prototype')
  })

  test('renders quick stats reflecting the catalog', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    // 7 total repos in the fixture; 3 active.
    expect(html).toMatch(/7<\/strong>\s*public projects/)
    expect(html).toMatch(/3<\/strong>\s*actively maintained/)
  })

  test('renders the three audience paths', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toContain('href="work/"')
    expect(html).toContain('href="commitment/"')
    expect(html).toContain('href="about/"')
  })
})
