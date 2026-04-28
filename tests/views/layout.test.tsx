import { describe, test, expect } from 'bun:test'
import { Layout } from '../../src/design/common/layout'
import { renderToHtml } from '../../src/build/render'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('Layout', () => {
  test('renders a full HTML document with landmarks', async () => {
    const html = await renderToHtml(
      <Layout title="Home" config={config}>
        <p>Body</p>
      </Layout>,
    )
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<header')
    expect(html).toContain('<nav')
    expect(html).toContain('<main')
    expect(html).toContain('<footer')
    expect(html).toContain('Flexion Labs')
  })

  test('sets <title> to "<pageTitle> — Flexion Labs"', async () => {
    const html = await renderToHtml(
      <Layout title="About" config={config}>
        <p />
      </Layout>,
    )
    expect(html).toMatch(/<title>About — Flexion Labs<\/title>/)
  })

  test('home page uses the bare site title', async () => {
    const html = await renderToHtml(
      <Layout title={null} config={config}>
        <p />
      </Layout>,
    )
    expect(html).toMatch(/<title>Flexion Labs<\/title>/)
  })

  test('prefixes asset URLs with basePath', async () => {
    const html = await renderToHtml(
      <Layout title={null} config={{ basePath: '/preview/x/', buildTime: '2026-04-27T12:00:00Z' }}>
        <p />
      </Layout>,
    )
    expect(html).toContain('href="/preview/x/design/index.css"')
  })
})
