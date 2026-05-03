# Pare Home Page to Flexion Solutions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page with curated content for three Flexion Solutions offerings (Forms, Messaging, Document Extractor) and hide the catalog directory from the public surface.

**Architecture:** A new `content/featured/` content type drives home-page cards via a dedicated loader and a new `LabCard` component. The existing catalog code stays in the tree but its routes are commented out. The home page is rewritten to match stakeholder-approved copy from a Google Doc (hero + subtitle + intro markdown, three featured-labs cards, "Learn more" row teasing `/commitment/` and `/about/`).

**Tech Stack:** Bun + Hono JSX SSG, `marked` for markdown, `yaml` for front-matter parsing. Tests via `bun test`, a11y via axe-core. CSS uses cascade layers with design tokens.

**Spec:** `notes/specs/2026-05-01-homepage-pare-down-design.md`

---

## File Structure

**Created:**
- `content/featured/forms-lab.md` — Forms Lab featured content (front-matter only).
- `content/featured/messaging-lab.md` — Messaging Lab featured content.
- `content/featured/document-extractor-lab.md` — Document Extractor Lab featured content.
- `src/build/featured.ts` — loader for `content/featured/*.md`. Exports `FeaturedLab` type and `loadFeatured(rootDir)`.
- `src/design/components/lab-card/index.tsx` — `<LabCard lab={...} />` component.
- `src/design/components/lab-card/styles.css` — card styling.
- `src/design/components/lab-card/examples.tsx` — design-system showcase.
- `tests/build/featured.test.ts` — loader unit tests.
- `tests/build/routes.test.ts` — route-generation tests.

**Modified:**
- `content/home.md` — front-matter expanded (`title`, `subtitle`, `intro`, `learnMore`).
- `src/build/hero.ts` — `loadHero` returns the expanded shape.
- `src/pages/home.tsx` — new layout using `LabCard` + learn-more row; no stats strip.
- `src/design/components/header/index.tsx` — nav: Home · Commitment · About · GitHub.
- `src/build/routes.ts` — work routes commented out.
- `src/pages/design-system.tsx` — register `LabCard` example in the showcase.
- `src/design/register.ts` (if it imports per-component CSS — verify during task).
- `tests/views/home.test.tsx` — rewritten for new layout.
- `tests/views/components.test.tsx` — extended with LabCard assertions.
- `docs/views/home.md` — updated for new behavior.
- `docs/featured-content.md` — documents the new content type and the directory-disabled state.

**Deleted:**
- `content/work/forms.md`
- `content/work/forms-lab.md`
- `content/work/flexion-notify.md`
- `content/work/document-extractor.md`
- `content/work/` directory (if empty afterward)

---

## Task 1: Add featured-lab content files

**Files:**
- Create: `content/featured/forms-lab.md`
- Create: `content/featured/messaging-lab.md`
- Create: `content/featured/document-extractor-lab.md`

- [ ] **Step 1: Create Forms Lab content file**

Create `content/featured/forms-lab.md`:

```markdown
---
title: Forms Lab
tagline: Digitize forms to create modern, accessible experiences for public outreach.
order: 1
links:
  - label: Demo (Forms Platform)
    url: https://pp4cc7kwbf.us-east-1.awsapprunner.com/
  - label: GitHub repository — Forms Platform
    url: https://github.com/flexion/forms
  - label: Demo (Forms Lab experiment)
    url: https://ec2-34-197-222-16.compute-1.amazonaws.com/
  - label: GitHub repository — Forms Lab (experiment)
    url: https://github.com/flexion/forms-lab
---
```

- [ ] **Step 2: Create Messaging Lab content file**

Create `content/featured/messaging-lab.md`:

```markdown
---
title: Messaging Lab
tagline: Text messaging services to deliver critical updates to the people you serve.
order: 2
links:
  - label: GitHub repository
    url: https://github.com/flexion/flexion-notify
---
```

- [ ] **Step 3: Create Document Extractor Lab content file**

Create `content/featured/document-extractor-lab.md`:

```markdown
---
title: Document Extractor Lab
tagline: Accurately extract data from PDFs and images for faster application processing.
order: 3
links:
  - label: GitHub repository
    url: https://github.com/flexion/document-extractor
  - label: Case study
    url: https://flexion.us/case-study/document-extraction-for-faster-processing/
---
```

- [ ] **Step 4: Verify files exist**

Run: `ls content/featured/`
Expected: `document-extractor-lab.md  forms-lab.md  messaging-lab.md`

- [ ] **Step 5: Commit**

```bash
git add content/featured/
git commit -m "feat(content): add featured labs source files"
```

---

## Task 2: Add FeaturedLab loader with failing test

**Files:**
- Create: `tests/build/featured.test.ts`
- Create: (next task) `src/build/featured.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/build/featured.test.ts`:

```ts
import { describe, test, expect } from 'bun:test'
import { loadFeatured } from '../../src/build/featured'

const ROOT = import.meta.dir + '/../..'

describe('loadFeatured', () => {
  test('loads every file in content/featured/ and returns them sorted by order', async () => {
    const labs = await loadFeatured(ROOT)
    expect(labs.map((l) => l.title)).toEqual([
      'Forms Lab',
      'Messaging Lab',
      'Document Extractor Lab',
    ])
  })

  test('returns the expected shape for each lab', async () => {
    const labs = await loadFeatured(ROOT)
    const forms = labs.find((l) => l.title === 'Forms Lab')!
    expect(forms.tagline).toBe(
      'Digitize forms to create modern, accessible experiences for public outreach.',
    )
    expect(forms.order).toBe(1)
    expect(forms.links).toHaveLength(4)
    expect(forms.links[0]).toEqual({
      label: 'Demo (Forms Platform)',
      url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/',
    })
  })

  test('Messaging Lab has a single link to flexion-notify', async () => {
    const labs = await loadFeatured(ROOT)
    const messaging = labs.find((l) => l.title === 'Messaging Lab')!
    expect(messaging.links).toEqual([
      { label: 'GitHub repository', url: 'https://github.com/flexion/flexion-notify' },
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/build/featured.test.ts`
Expected: FAIL — "Module not found: ../../src/build/featured"

- [ ] **Step 3: Implement the loader**

Create `src/build/featured.ts`:

```ts
import { parse as parseYaml } from 'yaml'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export type FeaturedLink = {
  label: string
  url: string
}

export type FeaturedLab = {
  title: string
  tagline: string
  order: number
  links: FeaturedLink[]
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadFeatured(rootDir: string): Promise<FeaturedLab[]> {
  const dir = join(rootDir, 'content', 'featured')
  let files: string[]
  try {
    files = await readdir(dir)
  } catch {
    return []
  }

  const labs: FeaturedLab[] = []
  for (const file of files.sort()) {
    if (!file.endsWith('.md')) continue
    const raw = await Bun.file(join(dir, file)).text()
    const match = raw.match(FRONTMATTER_RE)
    if (!match) continue
    const parsed = (parseYaml(match[1]) ?? {}) as Record<string, unknown>
    labs.push(parseLab(file, parsed))
  }
  labs.sort((a, b) => a.order - b.order)
  return labs
}

function parseLab(file: string, raw: Record<string, unknown>): FeaturedLab {
  const title = requireString(file, 'title', raw.title)
  const tagline = requireString(file, 'tagline', raw.tagline)
  const order = typeof raw.order === 'number' ? raw.order : 999
  const links = parseLinks(file, raw.links)
  return { title, tagline, order, links }
}

function parseLinks(file: string, value: unknown): FeaturedLink[] {
  if (!Array.isArray(value)) {
    throw new Error(`content/featured/${file}: "links" must be an array`)
  }
  return value.map((item, i) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`content/featured/${file}: links[${i}] must be an object`)
    }
    const o = item as Record<string, unknown>
    return {
      label: requireString(file, `links[${i}].label`, o.label),
      url: requireString(file, `links[${i}].url`, o.url),
    }
  })
}

function requireString(file: string, field: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`content/featured/${file}: "${field}" is required and must be a string`)
  }
  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/build/featured.test.ts`
Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/build/featured.ts tests/build/featured.test.ts
git commit -m "feat(build): add featured-lab content loader"
```

---

## Task 3: Add LabCard component with failing test

**Files:**
- Modify: `tests/views/components.test.tsx`
- Create: `src/design/components/lab-card/index.tsx`
- Create: `src/design/components/lab-card/styles.css`

- [ ] **Step 1: Write the failing test**

Add to `tests/views/components.test.tsx` (append at end of file, before any trailing empty lines):

```tsx
import { LabCard } from '../../src/design/components/lab-card'
import type { FeaturedLab } from '../../src/build/featured'

describe('LabCard', () => {
  const lab: FeaturedLab = {
    title: 'Forms Lab',
    tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
    order: 1,
    links: [
      { label: 'Demo (Forms Platform)', url: 'https://example.com/demo' },
      { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    ],
  }

  test('renders the title as an h3 with no link', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toMatch(/<h3[^>]*class="lab-card__title"[^>]*>Forms Lab<\/h3>/)
    // Title should not be wrapped in an anchor
    expect(html).not.toMatch(/<h3[^>]*>[^<]*<a/)
  })

  test('renders the tagline', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toContain('Digitize forms to create modern, accessible experiences')
  })

  test('renders one link per entry with external treatment', async () => {
    const html = await renderToHtml(<LabCard lab={lab} />)
    expect(html).toContain('href="https://example.com/demo"')
    expect(html).toContain('href="https://github.com/flexion/forms"')
    expect(html).toContain('Demo (Forms Platform)')
    expect(html).toContain('GitHub repository — Forms Platform')
    // Uses the Link component with external variant
    expect(html.match(/data-variant="external"/g)?.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/views/components.test.tsx -t LabCard`
Expected: FAIL — "Module not found: ../../src/design/components/lab-card"

- [ ] **Step 3: Implement the component**

Create `src/design/components/lab-card/index.tsx`:

```tsx
import { Link } from '../link'
import type { FeaturedLab } from '../../../build/featured'

export function LabCard({ lab }: { lab: FeaturedLab }) {
  return (
    <article class="lab-card">
      <h3 class="lab-card__title">{lab.title}</h3>
      <p class="lab-card__tagline">{lab.tagline}</p>
      <ul class="lab-card__links">
        {lab.links.map((link) => (
          <li class="lab-card__link">
            <Link href={link.url} external>{link.label}</Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
```

- [ ] **Step 4: Add component styles**

Create `src/design/components/lab-card/styles.css`:

```css
@layer components {
  .lab-card {
    padding: var(--space-6);
    border-inline-start: 3px solid var(--color-accent);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .lab-card__title {
    font-size: var(--step-2);
    line-height: 1.2;
    margin: 0;
    color: var(--color-ink);
  }

  .lab-card__tagline {
    font-size: var(--step-0);
    color: var(--color-ink-subtle);
    max-inline-size: var(--measure-prose);
    margin: 0;
  }

  .lab-card__links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .lab-card__link {
    font-size: var(--step--1);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test tests/views/components.test.tsx -t LabCard`
Expected: PASS — 3 tests

- [ ] **Step 6: Commit**

```bash
git add src/design/components/lab-card/ tests/views/components.test.tsx
git commit -m "feat(design): add LabCard component"
```

---

## Task 4: Register LabCard in the design system showcase

**Files:**
- Create: `src/design/components/lab-card/examples.tsx`
- Modify: `src/pages/design-system.tsx`

- [ ] **Step 1: Create the examples module**

Create `src/design/components/lab-card/examples.tsx`:

```tsx
import { LabCard } from './index'

const example = {
  title: 'Forms Lab',
  tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
  order: 1,
  links: [
    { label: 'Demo (Forms Platform)', url: 'https://example.com/demo' },
    { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    { label: 'GitHub repository — Forms Lab (experiment)', url: 'https://github.com/flexion/forms-lab' },
  ],
}

export function LabCardExamples() {
  return (
    <section id="lab-card">
      <h2>Lab card</h2>
      <p>Featured-lab card on the home page. Title is not a link; each link inside the card is an external link.</p>
      <LabCard lab={example} />
    </section>
  )
}
```

- [ ] **Step 2: Register in design-system page**

Modify `src/pages/design-system.tsx` — add the import alongside the other examples imports (around line 16):

```tsx
import { LabCardExamples } from '../design/components/lab-card/examples'
```

Add a nav item in `NAV_ITEMS` (match the ordering — place near `repo-card`):

```tsx
  { href: '#lab-card', label: 'Lab card' },
  { href: '#repo-card', label: 'Repo card' },
```

Render the examples component inside the `l-stack` near the other card examples:

```tsx
          <LabCardExamples />
          <RepoCardExamples />
```

- [ ] **Step 3: Build the site to verify design system compiles**

Run: `bun run build`
Expected: "Built site to dist/" — no errors.

- [ ] **Step 4: Spot-check that design-system page has the lab-card section**

Run: `grep -c "lab-card" dist/design-system/index.html`
Expected: a positive integer (multiple matches).

- [ ] **Step 5: Commit**

```bash
git add src/design/components/lab-card/examples.tsx src/pages/design-system.tsx
git commit -m "feat(design-system): register LabCard example"
```

---

## Task 5: Expand home content and loader

**Files:**
- Modify: `content/home.md`
- Modify: `src/build/hero.ts`
- Modify: `src/pages/home.tsx` (only the `HeroContent` type export — component body changes in Task 6)

- [ ] **Step 1: Rewrite `content/home.md` front-matter**

Replace `content/home.md` contents with:

```markdown
---
title: Flexion Labs
subtitle: Solutions for the public, in the open
intro: |
  Flexion is committed to excellence in civic technology. We are also
  committed to transparency. As part of that commitment, Flexion Labs
  is featuring some of the tools we've developed.

  These are yours to fork and use. Or [reach out to us](https://flexion.us/contact-us/)
  about an engagement. Instead of starting from zero, we can leverage existing
  Flexion Labs work to allow us to more quickly build what you need.
learnMore:
  commitment: |
    Flexion is open by default. Unless there's a specific reason we can't,
    we develop in the open.
  about: |
    We help organizations stay future-ready by building high-quality, adaptive
    software solutions that are easy to use, modify, and modernize.
---
```

- [ ] **Step 2: Update the HeroContent type**

Modify `src/pages/home.tsx` — replace the `HeroContent` export at the top (lines 6-7) with:

```tsx
export type HeroContent = {
  title: string
  subtitle: string
  intro: string // pre-rendered HTML
  learnMore: {
    commitment: string
    about: string
  }
}
```

The rest of the `Home` component will be rewritten in Task 6. For now, update references only so the file still compiles — temporarily keep the existing JSX but switch `hero.hero` → `hero.title` and `hero.intro` can stay (its use becomes raw markdown in Task 6). If type errors block the build, apply the Task 6 rewrite now instead.

*Note:* if Step 2 creates transient type errors that would fail the build, proceed to Task 6 before running build checks; otherwise commit this step alone first.

- [ ] **Step 3: Update the hero loader**

Replace `src/build/hero.ts` contents with:

```ts
import { parse as parseYaml } from 'yaml'
import { marked } from 'marked'
import { join } from 'node:path'
import type { HeroContent } from '../pages/home'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadHero(rootDir: string): Promise<HeroContent> {
  const file = Bun.file(join(rootDir, 'content', 'home.md'))
  const raw = await file.text()
  const match = raw.match(FRONTMATTER_RE)
  const parsed = match ? ((parseYaml(match[1]) ?? {}) as Record<string, unknown>) : {}

  const title = stringOr(parsed.title, 'Flexion Labs')
  const subtitle = stringOr(parsed.subtitle, '')
  const introMarkdown = stringOr(parsed.intro, '')
  const intro = introMarkdown
    ? (marked.parse(introMarkdown, { async: false }) as string)
    : ''
  const lm = (parsed.learnMore ?? {}) as Record<string, unknown>
  const learnMore = {
    commitment: stringOr(lm.commitment, ''),
    about: stringOr(lm.about, ''),
  }
  return { title, subtitle, intro, learnMore }
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}
```

- [ ] **Step 4: Commit**

If the build is currently broken (pending Task 6), commit anyway — the next task resolves it:

```bash
git add content/home.md src/build/hero.ts src/pages/home.tsx
git commit -m "feat(content): expand home front-matter with subtitle, intro, learn-more"
```

---

## Task 6: Rewrite home page component

**Files:**
- Modify: `src/pages/home.tsx`
- Modify: `src/design/layout.css`

- [ ] **Step 1: Rewrite `src/pages/home.tsx`**

Replace the entire file with:

```tsx
import { raw } from 'hono/html'
import { Layout } from '../design/common/layout'
import { LabCard } from '../design/components/lab-card'
import { url } from '../build/config'
import type { FeaturedLab } from '../build/featured'
import type { SiteConfig } from '../build/config'

export type HeroContent = {
  title: string
  subtitle: string
  intro: string // pre-rendered HTML
  learnMore: {
    commitment: string
    about: string
  }
}

export function Home({
  hero,
  featured,
  config,
}: {
  hero: HeroContent
  featured: FeaturedLab[]
  config: SiteConfig
}) {
  return (
    <Layout title={null} config={config}>
      <section class="home-hero">
        <h1>{hero.title}</h1>
        {hero.subtitle ? (
          <p class="home-hero__subtitle">{hero.subtitle}</p>
        ) : null}
        {hero.intro ? (
          <div class="home-intro">{raw(hero.intro)}</div>
        ) : null}
      </section>

      <section class="home-featured" aria-labelledby="featured-heading">
        <div class="home-featured__header">
          <h2 id="featured-heading">Featured labs</h2>
        </div>
        <div class="home-featured__list">
          {featured.map((lab) => (
            <LabCard lab={lab} />
          ))}
        </div>
      </section>

      <section class="home-learn-more" aria-labelledby="learn-more-heading">
        <h2 id="learn-more-heading">Learn more</h2>
        <div class="home-learn-more__grid">
          <article class="home-learn-more__item">
            <h3>Our open source commitment</h3>
            <p>{hero.learnMore.commitment}</p>
            <p>
              <a href={url('/commitment/', config.basePath)}>Read our commitment &rarr;</a>
            </p>
          </article>
          <article class="home-learn-more__item">
            <h3>About Flexion</h3>
            <p>{hero.learnMore.about}</p>
            <p>
              <a href={url('/about/', config.basePath)}>Learn about Flexion &rarr;</a>
            </p>
          </article>
        </div>
      </section>
    </Layout>
  )
}
```

- [ ] **Step 2: Update build entry to pass featured labs**

Modify `src/build/entry.tsx`. Add an import near the other loader imports (around line 11):

```tsx
import { loadFeatured } from './featured'
```

Modify the destructured loader call (around line 35):

```tsx
  const [catalog, hero, featured] = await Promise.all([
    loadCatalog(rootDir),
    loadHero(rootDir),
    loadFeatured(rootDir),
  ])
```

Modify the `render` function's `home` case (around line 92):

```tsx
    case 'home':
      return renderToHtml(<Home hero={hero} featured={featured} config={config} />)
```

And update the `render` function signature + forwarded args to include `featured`:

```tsx
async function render(
  route: ReturnType<typeof allRoutes>[number],
  catalog: Awaited<ReturnType<typeof loadCatalog>>,
  hero: Awaited<ReturnType<typeof loadHero>>,
  featured: Awaited<ReturnType<typeof loadFeatured>>,
  commitmentBody: string,
  aboutBody: string,
  config: { basePath: string; buildTime: string },
  now: Date,
): Promise<string> {
  // ...
}
```

And pass `featured` in the call-site inside `buildSite` (around line 48):

```tsx
    const html = await render(
      route,
      catalog,
      hero,
      featured,
      commitmentBody,
      aboutBody,
      config,
      now,
    )
```

- [ ] **Step 3: Add home-intro, home-hero__subtitle, and home-learn-more CSS**

Modify `src/design/layout.css`. Replace the existing `.home-hero__intro` block (around lines 58-62) with the following; also add `.home-hero__subtitle`, `.home-intro`, and `.home-learn-more` rules inside the same `@layer` block:

```css
  .home-hero__subtitle {
    font-size: var(--step-1);
    color: var(--color-ink-subtle);
    font-weight: 500;
    max-inline-size: var(--measure-prose);
  }
  .home-intro {
    font-size: var(--step-0);
    color: var(--color-ink);
    max-inline-size: var(--measure-prose);
  }
  .home-intro p {
    margin-block-end: var(--space-3);
  }
  .home-intro p:last-child {
    margin-block-end: 0;
  }
  .home-learn-more__grid {
    display: grid;
    gap: var(--space-5);
    container-type: inline-size;
    margin-block-start: var(--space-4);
  }
  .home-learn-more__item {
    padding: var(--space-5);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-card);
  }
  .home-learn-more__item h3 {
    font-size: var(--step-1);
    margin-block-end: var(--space-2);
  }
  @container (min-width: 48rem) {
    .home-learn-more__grid { grid-template-columns: repeat(2, 1fr); }
  }
```

Then remove the `.home-hero__intro` rule and the `.home-stats` / `.home-stats__grid` rules (unused after Task 6). Leave `.home-featured__header`, `.home-featured__intro`, and `.home-featured__list` as-is.

- [ ] **Step 4: Build to verify**

Run: `bun run build`
Expected: "Built site to dist/" — no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/home.tsx src/build/entry.tsx src/design/layout.css
git commit -m "feat(home): rewrite home page with featured labs and learn-more row"
```

---

## Task 7: Rewrite the home view tests

**Files:**
- Modify: `tests/views/home.test.tsx`
- Modify: `docs/views/home.md`

- [ ] **Step 1: Rewrite `tests/views/home.test.tsx`**

Replace the file's contents with:

```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../src/build/render'
import { Home } from '../../src/pages/home'
import type { FeaturedLab } from '../../src/build/featured'

const config = { basePath: '/', buildTime: '2026-05-01T12:00:00Z' }

const hero = {
  title: 'Flexion Labs',
  subtitle: 'Solutions for the public, in the open',
  intro: '<p>Flexion is committed to <a href="https://flexion.us/contact-us/">reach out to us</a> excellence.</p>',
  learnMore: {
    commitment: 'Flexion is open by default.',
    about: 'We help organizations stay future-ready.',
  },
}

const featured: FeaturedLab[] = [
  {
    title: 'Forms Lab',
    tagline: 'Digitize forms to create modern, accessible experiences for public outreach.',
    order: 1,
    links: [
      { label: 'Demo (Forms Platform)', url: 'https://pp4cc7kwbf.us-east-1.awsapprunner.com/' },
      { label: 'GitHub repository — Forms Platform', url: 'https://github.com/flexion/forms' },
    ],
  },
  {
    title: 'Messaging Lab',
    tagline: 'Text messaging services to deliver critical updates to the people you serve.',
    order: 2,
    links: [
      { label: 'GitHub repository', url: 'https://github.com/flexion/flexion-notify' },
    ],
  },
  {
    title: 'Document Extractor Lab',
    tagline: 'Accurately extract data from PDFs and images for faster application processing.',
    order: 3,
    links: [
      { label: 'GitHub repository', url: 'https://github.com/flexion/document-extractor' },
    ],
  },
]

describe('Home', () => {
  test('renders the site title as the h1', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toMatch(/<h1[^>]*>Flexion Labs<\/h1>/)
  })

  test('renders the subtitle', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('Solutions for the public, in the open')
  })

  test('renders the intro markdown as HTML including the reach-out link', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('href="https://flexion.us/contact-us/"')
  })

  test('renders one LabCard per featured lab in order', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    const indexOf = (s: string) => html.indexOf(s)
    expect(indexOf('Forms Lab')).toBeGreaterThan(-1)
    expect(indexOf('Messaging Lab')).toBeGreaterThan(-1)
    expect(indexOf('Document Extractor Lab')).toBeGreaterThan(-1)
    expect(indexOf('Forms Lab')).toBeLessThan(indexOf('Messaging Lab'))
    expect(indexOf('Messaging Lab')).toBeLessThan(indexOf('Document Extractor Lab'))
  })

  test('renders each labs links inside its card', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('href="https://github.com/flexion/forms"')
    expect(html).toContain('href="https://github.com/flexion/flexion-notify"')
    expect(html).toContain('href="https://github.com/flexion/document-extractor"')
  })

  test('renders the Learn more section with commitment and about teasers', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).toContain('Learn more')
    expect(html).toContain('Our open source commitment')
    expect(html).toContain('About Flexion')
    expect(html).toContain('href="/commitment/"')
    expect(html).toContain('href="/about/"')
  })

  test('does not render the stats strip', async () => {
    const html = await renderToHtml(<Home hero={hero} featured={featured} config={config} />)
    expect(html).not.toContain('home-stats')
    expect(html).not.toContain('public projects')
  })
})
```

- [ ] **Step 2: Run home tests**

Run: `bun test tests/views/home.test.tsx`
Expected: PASS — 7 tests.

- [ ] **Step 3: Update home view doc**

Replace `docs/views/home.md` contents with:

```markdown
# Home (`/`)

## Purpose

First impression for every visitor. Introduces Flexion Labs with a hero, showcases the three Flexion Solutions offerings as featured labs, and hands visitors off to the commitment and about pages.

## Inputs

- `hero` — `{ title, subtitle, intro, learnMore }` read from `content/home.md` front-matter. `intro` is pre-rendered HTML; the others are strings.
- `featured` — array of `FeaturedLab` loaded from `content/featured/*.md` sorted by `order` ascending.
- `config` — base path, build time.

## Behavior

- **When the page loads, then** the hero renders the `title` as `<h1>`, the `subtitle` as a tagline paragraph, and the rendered `intro` HTML as the intro block.
- **When there are featured labs, then** one `LabCard` is rendered per lab in `order` ascending.
- **When the page loads, then** a "Learn more" section renders two teasers linking to `/commitment/` and `/about/` respectively.
- **The stats strip is not rendered.** The catalog directory is disabled in this pass.

## Fallbacks

- If `content/featured/` is empty or missing, the featured section renders its heading with no cards.
- If `subtitle` or `intro` is empty, that element is omitted.

## Tests

`tests/views/home.test.tsx` encodes each behavior above.
```

- [ ] **Step 4: Commit**

```bash
git add tests/views/home.test.tsx docs/views/home.md
git commit -m "test(home): rewrite view tests for new layout"
```

---

## Task 8: Update header navigation

**Files:**
- Modify: `src/design/components/header/index.tsx`

- [ ] **Step 1: Write the failing test for the header nav**

Skip — there is no dedicated header test in the repo. Verify behavior via home-page render in Task 9's build check.

- [ ] **Step 2: Update the header nav**

Replace the `<ul>` contents in `src/design/components/header/index.tsx` (around lines 30-46) with:

```tsx
        <ul>
          <li>
            <a href={url('/', config.basePath)}>Home</a>
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
```

- [ ] **Step 3: Run the full test suite**

Run: `bun test`
Expected: all pre-existing tests still pass (some work-index/work-detail/header-adjacent tests that assert on rendered nav may fail — resolve any that do by updating fixture expectations; the nav link to "Work" no longer exists).

If a test fails because it asserts `href="/work/"` is in the rendered header nav specifically, update that assertion to match the new nav. If a test asserts on the work-index page content, leave it — those components are still tested in isolation.

- [ ] **Step 4: Commit**

```bash
git add src/design/components/header/index.tsx
git commit -m "feat(header): drop Work, add Home to primary nav"
```

---

## Task 9: Comment out work routes and add a routes test

**Files:**
- Create: `tests/build/routes.test.ts`
- Modify: `src/build/routes.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/build/routes.test.ts`:

```ts
import { describe, test, expect } from 'bun:test'
import { allRoutes } from '../../src/build/routes'
import { fixtureCatalog } from '../fixtures/catalog'

describe('allRoutes', () => {
  test('produces the expected public routes', () => {
    const paths = allRoutes(fixtureCatalog).map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/commitment/')
    expect(paths).toContain('/about/')
    expect(paths).toContain('/design-system/')
  })

  test('does not produce any /work/ routes', () => {
    const paths = allRoutes(fixtureCatalog).map((r) => r.path)
    for (const path of paths) {
      expect(path.startsWith('/work/')).toBe(false)
    }
    expect(paths).not.toContain('/work/')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/build/routes.test.ts`
Expected: FAIL — `/work/` paths are currently produced.

- [ ] **Step 3: Comment out the work routes**

Replace `src/build/routes.ts` with:

```ts
import type { Catalog } from '../catalog/types'

export type Route = {
  path: string // always starts with "/" and ends with "/"
  view: 'home' | 'work-index' | 'work-detail' | 'health' | 'commitment' | 'about' | 'design-system'
  slug?: string
}

export function allRoutes(catalog: Catalog): Route[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _catalog = catalog
  const routes: Route[] = [
    { path: '/', view: 'home' },
    // Work directory is disabled until approved content is ready.
    // Uncomment to restore the public catalog, detail pages, and health page.
    // { path: '/work/', view: 'work-index' },
    // { path: '/work/health/', view: 'health' },
    { path: '/commitment/', view: 'commitment' },
    { path: '/about/', view: 'about' },
    { path: '/design-system/', view: 'design-system' },
  ]
  // for (const entry of catalog) {
  //   if (entry.hidden) continue
  //   routes.push({ path: `/work/${entry.name}/`, view: 'work-detail', slug: entry.name })
  // }
  return routes
}
```

*Note:* the `_catalog = catalog` line prevents an "unused parameter" lint warning while we wait for the catalog to be used again. Remove that line if the repo's lint config already tolerates unused parameters.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/build/routes.test.ts`
Expected: PASS — 2 tests.

- [ ] **Step 5: Run the full test suite**

Run: `bun test`
Expected: full suite passes (work-index/work-detail/health component tests still green since they test components directly, not routes).

- [ ] **Step 6: Commit**

```bash
git add src/build/routes.ts tests/build/routes.test.ts
git commit -m "feat(routes): hide /work directory from the public site"
```

---

## Task 10: Delete work overlay content

**Files:**
- Delete: `content/work/forms.md`
- Delete: `content/work/forms-lab.md`
- Delete: `content/work/flexion-notify.md`
- Delete: `content/work/document-extractor.md`

- [ ] **Step 1: Remove the overlay files**

Run:

```bash
git rm content/work/forms.md content/work/forms-lab.md content/work/flexion-notify.md content/work/document-extractor.md
rmdir content/work 2>/dev/null || true
```

- [ ] **Step 2: Run the full test suite**

Run: `bun test`
Expected: full suite passes. `src/catalog/load.ts` `readOverlays` returns an empty map when the directory is missing.

- [ ] **Step 3: Build the site**

Run: `bun run build`
Expected: "Built site to dist/" — no errors.

- [ ] **Step 4: Verify /work paths are not generated**

Run:

```bash
ls dist/work 2>&1 || echo "no /work output (expected)"
```

Expected: "No such file or directory" or "no /work output (expected)".

- [ ] **Step 5: Commit**

```bash
git add -A content/
git commit -m "chore(content): remove work overlay files"
```

---

## Task 11: Update featured-content docs

**Files:**
- Modify: `docs/featured-content.md`

- [ ] **Step 1: Replace `docs/featured-content.md` contents**

Write the following as the full contents of `docs/featured-content.md` (the outer `~~~` fence below is just the plan's delimiter — do NOT include it in the actual file; the file's own fences use triple backticks):

~~~markdown
# Featured content

The home page showcases three Flexion Solutions offerings as "featured labs". Each lab is one markdown file in `content/featured/`, with curated content independent of the repo catalog.

## Content type

Files in `content/featured/*.md` use front-matter only. The body is ignored.

```yaml
---
title: Forms Lab
tagline: Digitize forms to create modern, accessible experiences for public outreach.
order: 1
links:
  - label: Demo (Forms Platform)
    url: https://pp4cc7kwbf.us-east-1.awsapprunner.com/
  - label: GitHub repository — Forms Platform
    url: https://github.com/flexion/forms
---
```

### Fields

- `title` — card heading (string, required)
- `tagline` — one-sentence summary (string, required)
- `order` — display order ascending (integer, required)
- `links` — list of `{ label, url }` pairs rendered as external links (array, required)

## Loader

`src/build/featured.ts` exports `loadFeatured(rootDir)` which reads every `.md` file in `content/featured/`, parses front-matter, validates the schema, and returns labs sorted by `order`.

## Rendering

The home page renders one `<LabCard />` per lab. The card shows the title (not linked), the tagline, and a vertical list of external links. Cards stack on narrow viewports and flow into a grid on wider viewports via the existing `.home-featured__list` composition.

## Adding a featured lab

1. Add a new file at `content/featured/<slug>.md` with the required fields.
2. Pick an `order` value that places the lab where you want it.
3. `bun run build` and spot-check the home page.

## Removing or reordering

Delete the file or adjust `order`. No other changes needed.

## Related: the catalog directory

The catalog directory (`/work/` index, per-repo detail pages, `/work/health/` stewardship page) is **temporarily disabled** on the public site. The code, tests, and daily catalog refresh workflow remain intact; only the routes are commented out in `src/build/routes.ts`. See the spec at `notes/specs/2026-05-01-homepage-pare-down-design.md` for the rationale and the plan for restoring the directory.
~~~

- [ ] **Step 2: Commit**

```bash
git add docs/featured-content.md
git commit -m "docs: update featured-content guide for the new content type"
```

---

## Task 12: Full verification

**Files:** none modified.

- [ ] **Step 1: Full test run**

Run: `bun run build && bun test`
Expected: site builds, all tests pass.

- [ ] **Step 2: Manual spot-checks (preview after PR open)**

Serve `dist/` locally and click through:

```bash
bun x serve dist
```

- Home page renders on desktop and narrow viewport
- Each featured-labs card renders all its links, each link goes to the expected URL
- Nav shows Home · Commitment · About · GitHub; clicking Home loads `/`
- Visiting `/work/`, `/work/health/`, `/work/forms/` returns 404 (they won't exist in `dist/`)
- No console errors

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin pare-down-to-solutions-offerings
gh pr create --title "Pare home page to three Flexion Solutions offerings" --body "$(cat <<'EOF'
## Summary

- Replaces the home page with curated content for Forms Lab, Messaging Lab, and Document Extractor Lab (per the stakeholder Google Doc).
- Introduces a new `content/featured/` content type and `LabCard` component.
- Hides the `/work/` directory, per-repo detail pages, and stewardship health page from the public site — the code, tests, and daily catalog refresh stay intact.
- Drops the stats strip.
- Adjusts primary nav to Home · Commitment · About · GitHub.
- Deletes the unapproved `content/work/*.md` overlay files.

See `notes/specs/2026-05-01-homepage-pare-down-design.md` for design rationale.

## Coordination

**The Messaging Lab card links directly to `github.com/flexion/flexion-notify`.** Merge must be timed with that repo going public to avoid a broken-link window.

## Test plan

- [ ] Home page renders on desktop and narrow viewport
- [ ] Forms Lab card shows both demo and both repo links
- [ ] Messaging Lab card links to `flexion-notify`
- [ ] Document Extractor Lab card shows repo link and case study link
- [ ] Nav: Home · Commitment · About · GitHub
- [ ] `/work/` and `/work/<slug>/` return 404 in preview
- [ ] Axe a11y scan passes on `/`
EOF
)"
```

Expected: PR URL printed.

---

## Self-Review

**Spec coverage:** each spec section maps to at least one task —

- Content structure (spec §Design / Content structure) → Tasks 1, 2, 5
- Loaders (spec §Design / Loaders) → Tasks 2, 5
- Components (spec §Design / Components) → Tasks 3, 4
- Home page layout (spec §Design / Home page) → Tasks 5, 6, 7
- Header nav (spec §Design / Header nav) → Task 8
- Route gating (spec §Design / Route gating) → Task 9
- Deletions (spec §Design / Deletions) → Task 10
- Testing section (spec §Testing) → Tasks 2, 3, 7, 9, 12
- Docs (spec §Deletions / Unchanged) → Tasks 7, 11

**Placeholder scan:** No "TBD"/"TODO" left. Every code step includes a complete code block. Task 8 step 1 is marked "skip — no header-test file in repo" with a concrete fallback (verified through home tests).

**Type consistency:** `FeaturedLab`/`FeaturedLink` types are introduced in Task 2 and referenced consistently in Tasks 3, 5, 6, 7. `HeroContent` shape is defined once in Task 5 and used in Tasks 6, 7. `loadHero`, `loadFeatured`, `LabCard` names are stable across tasks.
