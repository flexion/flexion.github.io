import { Layout } from '../design/common/layout'
import type { SiteConfig } from '../build/config'

import { TagExamples } from '../design/components/tag/examples'
import { ButtonExamples } from '../design/components/button/examples'
import { LinkExamples } from '../design/components/link/examples'
import { SelectExamples } from '../design/components/select/examples'
import { CardExamples } from '../design/components/card/examples'
import { HeaderExamples } from '../design/components/header/examples'
import { FooterExamples } from '../design/components/footer/examples'
import { RepoCardExamples } from '../design/components/repo-card/examples'
import { StandardsListExamples } from '../design/components/standards-list/examples'
import { SideNavExamples } from '../design/components/side-nav/examples'
import { CatalogFilterExamples } from '../design/components/catalog-filter/examples'
import { SortableTableExamples } from '../design/components/sortable-table/examples'
import { CopyButtonExamples } from '../design/components/copy-button/examples'

declare module 'hono/jsx' {
  namespace JSX {
    interface IntrinsicElements {
      'side-nav': { children?: any }
    }
  }
}

const NAV_ITEMS = [
  { href: '#tokens', label: 'Tokens' },
  { href: '#typography', label: 'Typography' },
  { href: '#compositions', label: 'Compositions' },
  { href: '#tag', label: 'Tag' },
  { href: '#button', label: 'Button' },
  { href: '#link', label: 'Link' },
  { href: '#select', label: 'Select' },
  { href: '#card', label: 'Card' },
  { href: '#side-nav', label: 'Side nav' },
  { href: '#header', label: 'Header' },
  { href: '#footer', label: 'Footer' },
  { href: '#repo-card', label: 'Repo card' },
  { href: '#standards-list', label: 'Standards list' },
  { href: '#catalog-filter', label: 'Catalog filter' },
  { href: '#sortable-table', label: 'Sortable table' },
  { href: '#copy-button', label: 'Copy button' },
]

export function DesignSystem({ config }: { config: SiteConfig }) {
  return (
    <Layout title="Design system" config={config}>
      <h1>Design system</h1>
      <p>Component library and design tokens for Flexion Labs. This page showcases every component available for building pages.</p>

      <div class="l-sidebar">
        <side-nav>
          <nav class="side-nav" aria-label="Design system">
            <ul class="side-nav__list">
              {NAV_ITEMS.map(({ href, label }) => (
                <li class="side-nav__item">
                  <a class="side-nav__link" href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </side-nav>

        <div class="l-stack" data-space="xl">
          <TokensSection />
          <TypographySection />
          <CompositionsSection />
          <TagExamples />
          <ButtonExamples />
          <LinkExamples />
          <SelectExamples />
          <CardExamples />
          <SideNavExamples />
          <HeaderExamples config={config} />
          <FooterExamples config={config} />
          <RepoCardExamples />
          <StandardsListExamples />
          <CatalogFilterExamples />
          <SortableTableExamples />
          <CopyButtonExamples />
        </div>
      </div>
    </Layout>
  )
}

function TokensSection() {
  const colors = [
    { name: 'Midnight', token: '--color-midnight', hex: '#171717' },
    { name: 'Pewter', token: '--color-pewter', hex: '#595959' },
    { name: 'Platinum', token: '--color-platinum', hex: '#EBEBEB' },
    { name: 'Snow', token: '--color-snow', hex: '#FFFFFF' },
    { name: 'Tango', token: '--color-tango', hex: '#E34E35' },
    { name: 'Brick', token: '--color-brick', hex: '#923120' },
    { name: 'Melon', token: '--color-melon', hex: '#FBB4A7' },
    { name: 'Lapis', token: '--color-lapis', hex: '#025197' },
    { name: 'Ocean', token: '--color-ocean', hex: '#00AAD5' },
    { name: 'Sky', token: '--color-sky', hex: '#BCE7FD' },
    { name: 'Lilac', token: '--color-lilac', hex: '#E0CCF5' },
    { name: 'Eggplant', token: '--color-eggplant', hex: '#442DA4' },
    { name: 'Butter', token: '--color-butter', hex: '#F8E989' },
  ]

  return (
    <section id="tokens">
      <h2>Color tokens</h2>
      <p>The Flexion 2020 brand palette. Every color is available as a CSS custom property.</p>
      <div class="l-cluster" style="gap: var(--space-4);">
        {colors.map(({ name, token, hex }) => (
          <div class="l-stack" data-space="sm" style="align-items: center; min-inline-size: 5rem;">
            <div
              style={`background: var(${token}); inline-size: 3rem; block-size: 3rem; border-radius: var(--radius-md); border: 1px solid var(--color-surface-alt);`}
              aria-hidden="true"
            />
            <strong style="font-size: var(--step--1);">{name}</strong>
            <code style="font-size: var(--step--1); color: var(--color-ink-subtle);">{hex}</code>
          </div>
        ))}
      </div>
    </section>
  )
}

function TypographySection() {
  return (
    <section id="typography">
      <h2>Typography</h2>
      <p>Figtree for headings, Inter for body text, with a major-third (1.25) fluid type scale. Line height 1.5 for body, 1.15 for headings.</p>
      <div class="l-stack">
        <div><span style="font-family: var(--font-display); font-size: var(--step-4); font-weight: 700; line-height: 1.15;">Step 4 — Page title</span></div>
        <div><span style="font-family: var(--font-display); font-size: var(--step-3); font-weight: 700; line-height: 1.15;">Step 3 — Section heading</span></div>
        <div><span style="font-family: var(--font-display); font-size: var(--step-2); font-weight: 700; line-height: 1.15;">Step 2 — Subsection</span></div>
        <div><span style="font-family: var(--font-display); font-size: var(--step-1); font-weight: 700; line-height: 1.15;">Step 1 — Card title</span></div>
        <div><span style="font-size: var(--step-0);">Step 0 — Body text</span></div>
        <div><span style="font-size: var(--step--1);">Step −1 — Small text, labels</span></div>
      </div>
    </section>
  )
}

function CompositionsSection() {
  return (
    <section id="compositions">
      <h2>Compositions</h2>
      <p>Layout utilities that compose into larger patterns. Apply via class names.</p>

      <h3><code>.l-stack</code></h3>
      <p>Vertical flex column with configurable gap via <code>data-space</code> attribute.</p>
      <div style="padding: var(--space-4); border: 1px dashed var(--color-surface-alt); border-radius: var(--radius-md);">
        <div class="l-stack" data-space="sm">
          <div style="padding: var(--space-2); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item 1</div>
          <div style="padding: var(--space-2); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item 2</div>
          <div style="padding: var(--space-2); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item 3</div>
        </div>
      </div>

      <h3><code>.l-cluster</code></h3>
      <p>Horizontal flex-wrap for inline items like tags, buttons, or metadata.</p>
      <div style="padding: var(--space-4); border: 1px dashed var(--color-surface-alt); border-radius: var(--radius-md);">
        <div class="l-cluster">
          <span style="padding: var(--space-2) var(--space-3); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item A</span>
          <span style="padding: var(--space-2) var(--space-3); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item B</span>
          <span style="padding: var(--space-2) var(--space-3); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item C</span>
          <span style="padding: var(--space-2) var(--space-3); background: var(--color-surface-alt); border-radius: var(--radius-sm);">Item D</span>
        </div>
      </div>

      <h3><code>.l-sidebar</code></h3>
      <p>Responsive two-column layout. The first child forms the sidebar (16rem basis), the second takes remaining space. Wraps to single column on narrow containers.</p>
    </section>
  )
}
