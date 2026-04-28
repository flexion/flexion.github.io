export function SideNavExamples() {
  return (
    <section id="side-nav">
      <h2>Side navigation</h2>
      <p>Sticky vertical navigation for long pages. Uses CSS <code>position: sticky</code> with a left border accent on the active item.</p>

      <div style="max-inline-size: 16rem;">
        <nav class="side-nav" aria-label="Example navigation">
          <ul class="side-nav__list">
            <li class="side-nav__item">
              <a class="side-nav__link" href="#side-nav" aria-current="true">Overview</a>
            </li>
            <li class="side-nav__item">
              <a class="side-nav__link" href="#side-nav">Components</a>
            </li>
            <li class="side-nav__item">
              <a class="side-nav__link" href="#side-nav">Tokens</a>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  )
}
