# Screenshot Link Kind Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `screenshot` link kind to featured labs that opens a native `<dialog>` modal with product screenshots, starting with Flexion Messaging.

**Architecture:** Extend the `FeaturedLink` union type to include a `screenshot` variant carrying `images[]` instead of `url`. The LabCard component renders screenshot links as `<button>` elements that open a `<dialog>`. Client-side behavior is a new custom element (`<screenshot-dialog>`) registered through the existing `register.ts` bundle.

**Tech Stack:** TypeScript, Hono JSX (server-rendered), native `<dialog>` API, Bun test runner

---

### Task 1: Update types and parsing in `featured.ts`

**Files:**
- Modify: `src/build/featured.ts`
- Modify: `tests/build/featured.test.ts`

- [ ] **Step 1: Write failing test for screenshot link parsing**

Add to `tests/build/featured.test.ts`:

```typescript
test('Messaging Lab has a screenshot link with images and a repo link', async () => {
  const labs = await loadFeatured(ROOT)
  const messaging = labs.find((l) => l.title === 'Messaging Lab')!
  expect(messaging.links).toHaveLength(2)
  expect(messaging.links[0]).toEqual({
    label: 'Flexion Messaging',
    kind: 'screenshot',
    images: [
      {
        src: '/assets/images/messaging-dashboard.png',
        alt: 'Organization Dashboard showing message allowance and services overview',
      },
      {
        src: '/assets/images/messaging-get-started.png',
        alt: 'Get started guide with steps for using Flexion Messaging',
      },
    ],
  })
  expect(messaging.links[1]).toEqual({
    label: 'flexion/flexion-notify',
    url: 'https://github.com/flexion/flexion-notify',
    kind: 'repo',
  })
})
```

Also update the existing test `'Messaging Lab has a single repo link'` — delete it since the new test above replaces it.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/build/featured.test.ts`
Expected: FAIL — messaging-lab.md doesn't have a screenshot link yet, and the type system doesn't support it.

- [ ] **Step 3: Update content file `content/featured/messaging-lab.md`**

Replace with:

```yaml
---
title: Messaging Lab
tagline: Text messaging services to deliver critical updates to the people you serve.
order: 2
links:
  - label: Flexion Messaging
    kind: screenshot
    images:
      - src: /assets/images/messaging-dashboard.png
        alt: Organization Dashboard showing message allowance and services overview
      - src: /assets/images/messaging-get-started.png
        alt: Get started guide with steps for using Flexion Messaging
  - label: flexion/flexion-notify
    url: https://github.com/flexion/flexion-notify
    kind: repo
---
```

- [ ] **Step 4: Update types and parsing in `src/build/featured.ts`**

Replace the type definitions and update `parseLinks`:

```typescript
export type FeaturedLinkKind = 'demo' | 'repo' | 'case-study' | 'screenshot'

export type ScreenshotImage = {
  src: string
  alt: string
}

export type FeaturedUrlLink = {
  label: string
  url: string
  kind: 'demo' | 'repo' | 'case-study'
}

export type FeaturedScreenshotLink = {
  label: string
  kind: 'screenshot'
  images: ScreenshotImage[]
}

export type FeaturedLink = FeaturedUrlLink | FeaturedScreenshotLink
```

Add `'screenshot'` to the `LINK_KINDS` set.

Update `parseLinks` — after validating the kind, branch on whether it's `'screenshot'`:

```typescript
if (kindRaw === 'screenshot') {
  return {
    label: requireString(file, `links[${i}].label`, o.label),
    kind: 'screenshot' as const,
    images: parseImages(file, i, o.images),
  }
}
return {
  label: requireString(file, `links[${i}].label`, o.label),
  url: requireString(file, `links[${i}].url`, o.url),
  kind: kindRaw as FeaturedUrlLink['kind'],
}
```

Add a `parseImages` helper:

```typescript
function parseImages(file: string, linkIndex: number, value: unknown): ScreenshotImage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(
      `content/featured/${file}: links[${linkIndex}].images must be a non-empty array`,
    )
  }
  return value.map((item, j) => {
    if (!item || typeof item !== 'object') {
      throw new Error(
        `content/featured/${file}: links[${linkIndex}].images[${j}] must be an object`,
      )
    }
    const o = item as Record<string, unknown>
    return {
      src: requireString(file, `links[${linkIndex}].images[${j}].src`, o.src),
      alt: requireString(file, `links[${linkIndex}].images[${j}].alt`, o.alt),
    }
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test tests/build/featured.test.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/build/featured.ts tests/build/featured.test.ts content/featured/messaging-lab.md
git commit -m "Add screenshot link kind to featured labs data model"
```

---

### Task 2: Copy screenshot images to static assets

**Files:**
- Create: `src/design/assets/images/messaging-dashboard.png`
- Create: `src/design/assets/images/messaging-get-started.png`

- [ ] **Step 1: Create the images directory and copy the PNGs**

```bash
mkdir -p src/design/assets/images
cp ~/incoming/flexion-messaging-1.png src/design/assets/images/messaging-dashboard.png
cp ~/incoming/flexion-messaging-2.png src/design/assets/images/messaging-get-started.png
```

- [ ] **Step 2: Verify the build copies them to dist**

Run: `bun run build && ls dist/assets/images/`
Expected: both `messaging-dashboard.png` and `messaging-get-started.png` are listed.

- [ ] **Step 3: Commit**

```bash
git add src/design/assets/images/messaging-dashboard.png src/design/assets/images/messaging-get-started.png
git commit -m "Add Flexion Messaging screenshot images"
```

---

### Task 3: Update LabCard to render screenshot links with a dialog

**Files:**
- Modify: `src/design/components/lab-card/index.tsx`
- Modify: `tests/views/components.test.tsx`

- [ ] **Step 1: Write failing tests for screenshot rendering**

Add to `tests/views/components.test.tsx`, in the `LabCard` describe block. First, add the import for `FeaturedScreenshotLink` (or use inline type). Then add a new fixture and tests:

```typescript
const withScreenshots: FeaturedLab = {
  title: 'Messaging Lab',
  tagline: 'Text messaging services.',
  order: 2,
  links: [
    {
      label: 'Flexion Messaging',
      kind: 'screenshot',
      images: [
        { src: '/assets/images/messaging-dashboard.png', alt: 'Dashboard' },
        { src: '/assets/images/messaging-get-started.png', alt: 'Get started' },
      ],
    },
    {
      label: 'flexion/flexion-notify',
      url: 'https://github.com/flexion/flexion-notify',
      kind: 'repo',
    },
  ],
}

test('screenshot link renders a button instead of an anchor', async () => {
  const html = await renderToHtml(<LabCard lab={withScreenshots} />)
  expect(html).toContain('<button')
  expect(html).toContain('Flexion Messaging')
  // Should NOT have an <a> for the screenshot link
  expect(html).not.toContain('href="/assets/images/')
})

test('screenshot link renders a dialog with images', async () => {
  const html = await renderToHtml(<LabCard lab={withScreenshots} />)
  expect(html).toContain('<dialog')
  expect(html).toContain('src="/assets/images/messaging-dashboard.png"')
  expect(html).toContain('alt="Dashboard"')
  expect(html).toContain('src="/assets/images/messaging-get-started.png"')
  expect(html).toContain('alt="Get started"')
})

test('column order includes Screenshots between Demo and Repository', async () => {
  const html = await renderToHtml(<LabCard lab={withScreenshots} />)
  const screenshotIdx = html.indexOf('>Screenshots<')
  const repoIdx = html.indexOf('>Repository<')
  expect(screenshotIdx).toBeGreaterThan(-1)
  expect(repoIdx).toBeGreaterThan(-1)
  expect(screenshotIdx).toBeLessThan(repoIdx)
})
```

Also update the existing `singleLink` fixture for Messaging Lab — change it to keep using only a repo link (no change needed, it's already a standalone fixture).

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/views/components.test.tsx`
Expected: FAIL — LabCard doesn't render buttons or dialogs yet.

- [ ] **Step 3: Update `src/design/components/lab-card/index.tsx`**

Update `KIND_HEADING` and `KIND_ORDER`:

```typescript
const KIND_HEADING: Record<FeaturedLinkKind, string> = {
  demo: 'Demo',
  screenshot: 'Screenshots',
  repo: 'Repository',
  'case-study': 'Case study',
}

const KIND_ORDER: readonly FeaturedLinkKind[] = ['demo', 'screenshot', 'repo', 'case-study']
```

Add the import for the new types:

```typescript
import type {
  FeaturedLab,
  FeaturedLink,
  FeaturedLinkKind,
  FeaturedScreenshotLink,
} from '../../../build/featured'
```

Add a helper to generate a dialog ID from the lab title and link index:

```typescript
function dialogId(labTitle: string, linkIndex: number): string {
  const slug = labTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `screenshots-${slug}-${linkIndex}`
}
```

In `LabCard`, collect all screenshot links to render dialogs after the card content. Update the render to handle screenshot vs url links:

```tsx
export function LabCard({ lab }: { lab: FeaturedLab }) {
  const columns = groupByKind(lab.links)
  const maxLinks = columns.reduce((n, c) => Math.max(n, c.links.length), 0)
  const style = `--lab-card-rows: ${maxLinks};`

  // Collect screenshot links for dialog rendering
  const screenshotLinks: { link: FeaturedScreenshotLink; id: string }[] = []
  lab.links.forEach((link, i) => {
    if (link.kind === 'screenshot') {
      screenshotLinks.push({ link, id: dialogId(lab.title, i) })
    }
  })

  return (
    <article class="lab-card">
      <div class="lab-card__intro">
        <h3 class="lab-card__title">{lab.title}</h3>
        <p class="lab-card__tagline">{lab.tagline}</p>
      </div>
      <ul class="lab-card__columns" style={style}>
        {columns.map((column) => (
          <li class="lab-card__column">
            <p class="lab-card__column-heading">{KIND_HEADING[column.kind]}</p>
            {column.links.map((link) => {
              if (link.kind === 'screenshot') {
                const id = dialogId(lab.title, lab.links.indexOf(link))
                return (
                  <button
                    class="lab-card__column-link lab-card__column-link--button"
                    data-open-dialog={id}
                    type="button"
                  >
                    <LinkIcon kind="screenshot" />
                    <span>{link.label}</span>
                  </button>
                )
              }
              return (
                <a
                  class="lab-card__column-link"
                  href={link.url}
                  rel="noopener external"
                >
                  <LinkIcon kind={column.kind} />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </li>
        ))}
      </ul>
      {screenshotLinks.map(({ link, id }) => (
        <screenshot-dialog>
          <dialog id={id} class="screenshot-dialog">
            <button class="screenshot-dialog__close" data-close-dialog aria-label="Close" type="button">
              &times;
            </button>
            <div class="screenshot-dialog__images">
              {link.images.map((img) => (
                <img
                  class="screenshot-dialog__img"
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                />
              ))}
            </div>
          </dialog>
        </screenshot-dialog>
      ))}
    </article>
  )
}
```

Add `ScreenshotIcon` to the `LinkIcon` switch and define it:

```typescript
function LinkIcon({ kind }: { kind: FeaturedLinkKind }) {
  switch (kind) {
    case 'demo':
      return <DemoIcon />
    case 'screenshot':
      return <ScreenshotIcon />
    case 'repo':
      return <RepoIcon />
    case 'case-study':
      return <CaseStudyIcon />
  }
}

function ScreenshotIcon() {
  // Image / picture frame — signals "view screenshots"
  return (
    <svg
      class="lab-card__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/views/components.test.tsx`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/design/components/lab-card/index.tsx tests/views/components.test.tsx
git commit -m "Render screenshot links as buttons with dialog in LabCard"
```

---

### Task 4: Add dialog styles

**Files:**
- Modify: `src/design/components/lab-card/styles.css`

- [ ] **Step 1: Add styles for the screenshot button, dialog, and its contents**

Append to `src/design/components/lab-card/styles.css`, inside the existing `@layer components { ... }` block, before the closing `}`:

```css
  /* Screenshot button — match anchor styling */
  .lab-card__column-link--button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }

  /* Screenshot dialog */
  .screenshot-dialog {
    max-inline-size: min(900px, 90vw);
    max-block-size: 90vh;
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-6);
    overflow-y: auto;
    position: relative;
  }

  .screenshot-dialog::backdrop {
    background: rgb(0 0 0 / 0.6);
  }

  .screenshot-dialog__close {
    position: absolute;
    inset-block-start: var(--space-3);
    inset-inline-end: var(--space-3);
    background: none;
    border: none;
    font-size: var(--step-3);
    line-height: 1;
    cursor: pointer;
    color: var(--color-ink-subtle);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }

  .screenshot-dialog__close:hover,
  .screenshot-dialog__close:focus-visible {
    color: var(--color-ink);
    background: var(--color-surface-alt);
  }

  .screenshot-dialog__images {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .screenshot-dialog__img {
    max-inline-size: 100%;
    block-size: auto;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-card);
  }
```

- [ ] **Step 2: Build the site and visually verify**

Run: `bun run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/design/components/lab-card/styles.css
git commit -m "Add dialog styles for screenshot modal"
```

---

### Task 5: Add client-side dialog behavior

**Files:**
- Create: `src/design/components/screenshot-dialog/client.ts`
- Modify: `src/design/register.ts`

- [ ] **Step 1: Create the custom element at `src/design/components/screenshot-dialog/client.ts`**

```typescript
class ScreenshotDialogElement extends HTMLElement {
  private dialog: HTMLDialogElement | null = null

  connectedCallback() {
    this.dialog = this.querySelector('dialog')
    if (!this.dialog) return

    this.addEventListener('click', this.handleClick)
    this.dialog.addEventListener('click', this.handleBackdropClick)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
    this.dialog?.removeEventListener('click', this.handleBackdropClick)
  }

  handleClick = (e: Event) => {
    const target = (e.target as Element).closest('[data-open-dialog]') as HTMLElement | null
    if (target) {
      this.dialog?.showModal()
    }
    const close = (e.target as Element).closest('[data-close-dialog]')
    if (close) {
      this.dialog?.close()
    }
  }

  handleBackdropClick = (e: Event) => {
    // Clicks on the <dialog> element itself (not its children) are backdrop clicks
    if (e.target === this.dialog) {
      this.dialog.close()
    }
  }
}

if (!customElements.get('screenshot-dialog')) {
  customElements.define('screenshot-dialog', ScreenshotDialogElement)
}
```

- [ ] **Step 2: Register it in `src/design/register.ts`**

Add the import:

```typescript
import './components/screenshot-dialog/client'
```

- [ ] **Step 3: Build and test manually**

Run: `bun run build`
Expected: Build succeeds. The `dist/enhancements/register.js` bundle now includes the screenshot-dialog custom element.

- [ ] **Step 4: Commit**

```bash
git add src/design/components/screenshot-dialog/client.ts src/design/register.ts
git commit -m "Add screenshot-dialog custom element for modal behavior"
```

---

### Task 6: Visual verification

- [ ] **Step 1: Start the dev server and verify the feature**

Run: `bun run dev`

Open the site in a browser. On the home page, find the Messaging Lab card. Verify:

1. A "Screenshots" column appears with a "Flexion Messaging" button
2. Clicking the button opens a modal dialog with both screenshots stacked vertically
3. The close button (X) closes the dialog
4. Pressing Escape closes the dialog
5. Clicking the dark backdrop closes the dialog
6. The repo link still works normally
7. Other lab cards (Forms Lab, Document Extractor Lab) are unaffected

- [ ] **Step 2: Run the full test suite**

Run: `bun test`
Expected: ALL PASS

- [ ] **Step 3: Final commit if any touch-ups were needed**

Only if adjustments were made during visual verification.
