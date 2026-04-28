import { Footer } from './index'
import type { SiteConfig } from '../../../build/config'

export function FooterExamples({ config }: { config: SiteConfig }) {
  return (
    <section id="footer">
      <h2>Footer</h2>
      <p>Site-wide footer with navigation links and build timestamp. Dark background (midnight) with sky-colored links for AAA contrast.</p>
      <div style="border-radius: var(--radius-md); overflow: hidden;">
        <Footer config={config} />
      </div>
    </section>
  )
}
