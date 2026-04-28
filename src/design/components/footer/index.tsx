export function Footer({ buildTime }: { buildTime: string }) {
  return (
    <footer class="site-footer">
      <nav aria-label="Footer">
        <ul>
          <li><a href="work/">Work</a></li>
          <li><a href="commitment/">Commitment</a></li>
          <li><a href="about/">About</a></li>
          <li><a href="design-system/">Design system</a></li>
        </ul>
      </nav>
      <p class="site-footer__meta">
        Built {formatBuildTime(buildTime)}. Content licensed as noted per project.
      </p>
    </footer>
  )
}

function formatBuildTime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}
