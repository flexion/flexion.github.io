import { url } from '../../../build/config'
import type { SiteConfig } from '../../../build/config'

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer class="site-footer">
      <nav aria-label="Footer">
        <ul>
          <li><a href={url('/', config.basePath)}>Home</a></li>
          <li><a href={url('/commitment/', config.basePath)}>Commitment</a></li>
          <li><a href={url('/design-system/', config.basePath)}>Design system</a></li>
        </ul>
      </nav>
      <p class="site-footer__meta">
        Built {formatBuildTime(config.buildTime)}. Content licensed as noted per project.
      </p>
    </footer>
  )
}

function formatBuildTime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}
