import type { Child } from 'hono/jsx'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

export function Layout({
  title,
  config,
  children,
}: {
  title: string | null
  config: SiteConfig
  children: Child
}) {
  const documentTitle = title ? `${title} — Flexion Labs` : 'Flexion Labs'
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{documentTitle}</title>
        <link rel="stylesheet" href={url('/design/index.css', config.basePath)} />
        <link rel="icon" href={url('/assets/favicon-32x32.png', config.basePath)} sizes="32x32" type="image/png" />
        <link rel="icon" href={url('/assets/favicon-192x192.png', config.basePath)} sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href={url('/assets/apple-touch-icon.png', config.basePath)} />
        <meta name="msapplication-TileImage" content={url('/assets/mstile-270x270.png', config.basePath)} />
        <script type="module" src={url('/enhancements/register.js', config.basePath)} defer></script>
      </head>
      <body>
        <a href="#main" class="skip-link">Skip to main content</a>
        <Header config={config} />
        <main id="main">{children}</main>
        <Footer config={config} />
      </body>
    </html>
  )
}
