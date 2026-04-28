import type { Child } from 'hono/jsx'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
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
        <base href={config.basePath} />
        <title>{documentTitle}</title>
        <link rel="stylesheet" href="styles/index.css" />
        <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
        <script type="module" src="enhancements/register.js" defer></script>
      </head>
      <body>
        <a href="#main" class="skip-link">Skip to main content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer buildTime={config.buildTime} />
      </body>
    </html>
  )
}
