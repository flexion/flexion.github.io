import { raw } from 'hono/html'
import { marked } from 'marked'
import { Layout } from './layout'
import type { SiteConfig } from '../../build/config'

export function ContentPage({
  title,
  body,
  config,
}: {
  title: string
  body: string
  config: SiteConfig
}) {
  const html = marked.parse(body, { async: false }) as string
  return (
    <Layout title={title} config={config}>
      <article class="content-page">{raw(html)}</article>
    </Layout>
  )
}
