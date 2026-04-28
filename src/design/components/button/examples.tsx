import { Button } from './index'

export function ButtonExamples() {
  return (
    <section id="button">
      <h2>Button</h2>
      <p>Actions and form submissions. Renders <code>&lt;button class="btn"&gt;</code> or <code>&lt;a class="btn"&gt;</code> when <code>href</code> is provided.</p>

      <h3>Variants</h3>
      <div class="l-cluster">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="text">Text</Button>
      </div>

      <h3>States</h3>
      <div class="l-cluster">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled secondary</Button>
      </div>

      <h3>As link</h3>
      <div class="l-cluster">
        <Button href="https://github.com/flexion">Visit GitHub</Button>
        <Button href="https://github.com/flexion" variant="secondary">Visit GitHub</Button>
      </div>
    </section>
  )
}
