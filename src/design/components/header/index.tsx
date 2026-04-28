import { Link } from '../link'

export function Header() {
  return (
    <header class="site-header">
      <a href="./" class="site-brand">
        Flexion Labs
      </a>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href="work/">Work</a>
          </li>
          <li>
            <a href="commitment/">Commitment</a>
          </li>
          <li>
            <a href="about/">About</a>
          </li>
          <li>
            <Link href="https://github.com/flexion" external>
              GitHub
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
