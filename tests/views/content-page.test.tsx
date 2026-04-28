import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { ContentPage } from '../../src/web/common/content-page'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('ContentPage', () => {
  test('renders markdown into HTML inside <main>', async () => {
    const html = await renderToHtml(
      <ContentPage
        title="Title"
        body={'# Hello\n\nParagraph text.'}
        config={config}
      />,
    )
    expect(html).toMatch(/<main[^>]*>[\s\S]*<h1>Hello<\/h1>/)
    expect(html).toContain('<p>Paragraph text.</p>')
  })

  test('uses the provided title in the document title', async () => {
    const html = await renderToHtml(
      <ContentPage title="About" body="body" config={config} />,
    )
    expect(html).toMatch(/<title>About — Flexion Labs<\/title>/)
  })
})
