import { Header } from './index'
import type { SiteConfig } from '../../../build/config'

export function HeaderExamples({ config }: { config: SiteConfig }) {
  return (
    <section id="header">
      <h2>Header</h2>
      <p>Site-wide header with brand wordmark and primary navigation. Renders as a <code>&lt;header&gt;</code> landmark with <code>aria-label="Primary"</code> navigation.</p>
      <div style="border: 1px solid var(--color-surface-alt); border-radius: var(--radius-md); overflow: hidden;">
        <Header config={config} />
      </div>
    </section>
  )
}
