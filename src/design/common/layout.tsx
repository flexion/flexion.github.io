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
        <link rel="stylesheet" href="design/index.css" />
        <link rel="icon" href="assets/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="assets/favicon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
        <meta name="msapplication-TileImage" content="assets/mstile-270x270.png" />
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
