import { Card } from './index'
import { Tag } from '../tag'

export function CardExamples() {
  return (
    <section id="card">
      <h2>Card</h2>
      <p>A container with tango top-border accent, subtle shadow, and padding. Use for any content that benefits from visual grouping.</p>

      <h3>Default</h3>
      <div style="max-inline-size: 24rem;">
        <Card>
          <h3 style="font-size: var(--step-1);">Project name</h3>
          <p style="color: var(--color-ink-subtle);">A short description of the project and what it does.</p>
          <div class="l-cluster">
            <Tag variant="tier-active">Active</Tag>
            <Tag variant="category-product">Product</Tag>
          </div>
        </Card>
      </div>
    </section>
  )
}
