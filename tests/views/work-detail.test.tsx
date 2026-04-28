import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { WorkDetail } from '../../src/web/pages/work/detail'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('WorkDetail', () => {
  test('renders the overlay body when present', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('Messaging body copy')
  })

  test('falls back to the GitHub description when no overlay', async () => {
    const forms = fixtureCatalog.find((e) => e.name === 'forms')!
    const html = await renderToHtml(
      <WorkDetail entry={forms} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('Accessible form experiences')
  })

  test('shows an explicit placeholder when no description and no overlay', async () => {
    const unreviewed = fixtureCatalog.find((e) => e.name === 'unreviewed-thing')!
    const html = await renderToHtml(
      <WorkDetail entry={unreviewed} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('No description yet')
  })

  test('renders the standards checklist', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('standards-list')
  })

  test('links to the GitHub repository', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('href="https://github.com/flexion/messaging"')
  })
})
