import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header class="site-header">
      <a href={url('/', config.basePath)} class="site-brand">
        Flexion Labs
      </a>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href={url('/work/', config.basePath)}>Work</a>
          </li>
          <li>
            <a href={url('/commitment/', config.basePath)}>Commitment</a>
          </li>
          <li>
            <a href={url('/about/', config.basePath)}>About</a>
          </li>
          <li>
            <a href="https://github.com/flexion" rel="noopener external">
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
