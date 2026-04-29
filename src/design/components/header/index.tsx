import { Link } from '../link'
import { url } from '../../../build/config'
import type { SiteConfig } from '../../../build/config'

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header class="site-header">
      <a href={url('/', config.basePath)} class="site-brand">
        <img
          src={url('/assets/flexion_tornado.svg', config.basePath)}
          alt=""
          class="site-brand__logo"
          width="38"
          height="38"
        />
        <span>Flexion Labs</span>
      </a>
      <button
        class="mobile-nav-toggle"
        popovertarget="mobile-nav"
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <nav aria-label="Primary">
        <div id="mobile-nav" popover>
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
              <Link href="https://github.com/flexion" external>
                GitHub
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
