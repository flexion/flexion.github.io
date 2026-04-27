import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { Health } from '../../views/work/health'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('Health', () => {
  test('renders a summary of N of M repos meeting standards', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    expect(html).toMatch(/of\s+<strong>\d+<\/strong>\s+repos meet the documented standards/)
  })

  test('renders a table with one row per non-hidden repo', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    for (const entry of fixtureCatalog.filter((e) => !e.hidden)) {
      expect(html).toContain(`data-repo="${entry.name}"`)
    }
  })

  test('marks a repo without a license as failing', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    expect(html).toMatch(/data-repo="archived-thing"[\s\S]*?license[^<]*fail/i)
  })

  test('when showPerRepo is false, the table is replaced by an aggregate summary', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={false} />,
    )
    expect(html).not.toContain('data-repo=')
    expect(html).toContain('Per-repo breakdown is hidden')
  })
})
