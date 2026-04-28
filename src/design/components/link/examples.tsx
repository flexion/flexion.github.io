import { Link } from './index'

export function LinkExamples() {
  return (
    <section id="link">
      <h2>Link</h2>
      <p>Navigational anchors. External links automatically add <code>rel="noopener external"</code> and a visual icon indicator.</p>

      <h3>Internal link</h3>
      <p><Link href="work/">View our work</Link></p>

      <h3>External link</h3>
      <p><Link href="https://github.com/flexion" external>Flexion on GitHub</Link></p>
      <p><Link href="https://flexion.us" external>flexion.us</Link></p>
    </section>
  )
}
