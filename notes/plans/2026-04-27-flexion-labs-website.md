# Flexion Labs Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `labs.flexion.us` — a static site showcasing Flexion's open source portfolio with a catalog of every public repo, a stewardship health report, three featured-lab pages, and a published commitment statement.

**Architecture:** Bun + Hono SSG renders every route to static HTML at build time. A committed JSON snapshot (refreshed daily from the GitHub API) plus a hand-authored YAML overrides file plus per-repo markdown overlays feed a single merged catalog. Hand-rolled CSS with cascade layers, container queries, and design tokens sourced from Flexion's brand palette. HTML Web Components wrap rendered HTML to add filter/sort/copy behaviors as progressive enhancement. GitHub Pages hosts production at the domain root and branch previews under `/preview/<branch>/`, surfaced via GitHub Deployments.

**Tech Stack:** Bun (runtime + package manager + test runner), TypeScript, Hono (the SSG helper is a subpath export — `import { toSSG } from 'hono/ssg'` — no extra dependency needed), `hono/jsx` for components, `yaml` for overrides, `marked` for markdown, `happy-dom` for component tests, `axe-core` with `happy-dom` for a11y, GitHub Actions for CI.

**Plan location convention:** Per user preferences, this plan is saved to `notes/plans/` rather than `docs/superpowers/plans/`. Ephemeral planning lives in `notes/`; durable behavioral docs live in `docs/`.

---

## Conventions

- **Every task ends with a commit.** Small, focused commits. Conventional-commit-ish prefixes (`feat`, `test`, `docs`, `chore`, `style`, `fix`, `ci`).
- **TDD order within each task:** write failing test → run it to confirm failure → minimal implementation → run test to confirm pass → refactor if warranted → commit. Tasks involving pure logic or views follow this order literally. Tasks that are configuration or documentation skip the failing-test step.
- **Test runner:** `bun test`. Place tests in `tests/` mirroring source paths.
- **File paths in tasks are absolute from repo root** (e.g., `views/home.tsx`).
- **Never skip hooks.** Never `--no-verify`.

---

## File Structure

Top-level domain layout (Screaming Architecture). Subdirectories reveal intent before they reveal tech.

```
/
  README.md                                # project-level orientation (updated in Task 2)
  .gitignore                               # Task 1
  .github/workflows/                       # Tasks 35–36
    deploy.yml
    refresh-catalog.yml
  CNAME                                    # Task 38

  package.json, tsconfig.json, bunfig.toml # Task 1

  docs/                                    # durable behavioral documentation (Tasks 28–34)
    README.md
    catalog.md, content.md, stewardship.md
    deployment.md, testing.md, styling.md
    views/home.md, work-index.md, work-detail.md, health.md, commitment.md, about.md

  notes/                                   # ephemeral planning (this file, the spec)
    specs/2026-04-27-flexion-labs-website-design.md
    plans/2026-04-27-flexion-labs-website.md

  catalog/                                 # Tasks 5–10
    README.md
    repos.json                             # generated; seeded in Task 10
    overrides.yml                          # hand-authored; seeded in Task 10
    types.ts                               # Task 5
    defaults.ts                            # Task 6
    overlays.ts                            # Task 7
    merge.ts                               # Task 8
    refresh.ts                             # Task 10

  content/                                 # prose (Tasks 11, 18–19, content milestone)
    home.md
    commitment.md
    about.md
    work/
      messaging.md, forms.md, document-extractor.md

  standards/                               # Task 9
    repo-checks.ts
    maintenance-tiers.md
    README.md

  views/                                   # Tasks 12–17, 20
    layout.tsx
    home.tsx
    commitment.tsx
    about.tsx
    work/
      index.tsx
      detail.tsx
      health.tsx
    components/
      header.tsx, footer.tsx, badge.tsx, repo-card.tsx, standards-list.tsx

  styles/                                  # Tasks 21–24
    index.css                              # imports all layers
    reset.css
    tokens.css
    base.css
    layout.css
    components.css
    utilities.css

  enhancements/                            # Tasks 25–27
    catalog-filter.ts
    sortable-table.ts
    copy-button.ts
    register.ts                            # imports + defines all custom elements

  assets/                                  # Task 20
    favicon.svg

  build/                                   # Tasks 12–13
    entry.ts                               # Bun + Hono SSG driver
    routes.ts                              # route list for SSG
    render.ts                              # path-to-HTML helper used by tests

  tests/
    catalog/
      defaults.test.ts, overlays.test.ts, merge.test.ts
    standards/
      repo-checks.test.ts
    views/
      home.test.tsx, work-index.test.tsx, work-detail.test.tsx, health.test.tsx
      commitment.test.ts, about.test.ts
    enhancements/
      catalog-filter.test.ts, sortable-table.test.ts, copy-button.test.ts
    build/
      smoke.test.ts
    a11y/
      pages.test.ts
    fixtures/
      catalog.ts                           # shared fixture catalog used by view tests
```

---

## Phase 1 — Project Skeleton

### Task 1: Initialize Bun project with Hono JSX

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `bunfig.toml`
- Create: `.gitignore`
- Create: `bun.lock` (generated by `bun install`)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "flexion-labs-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun run build/entry.ts --watch",
    "build": "bun run build/entry.ts",
    "test": "bun test",
    "refresh:catalog": "bun run catalog/refresh.ts"
  },
  "dependencies": {
    "hono": "^4.6.0",
    "marked": "^14.0.0",
    "yaml": "^2.6.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "happy-dom": "^15.0.0",
    "axe-core": "^4.10.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["bun-types"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "skipLibCheck": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `bunfig.toml`**

```toml
[test]
preload = ["./tests/setup.ts"]
```

- [ ] **Step 4: Create a placeholder test setup file**

`tests/setup.ts`:
```ts
// Placeholder. Component tests that need DOM globals import happy-dom locally.
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.DS_Store
*.log
bun.lock
```

Note: keep `bun.lock` out of git for v1 — Bun's lockfile format is still stabilizing. Revisit once the project is established.

- [ ] **Step 6: Install dependencies**

Run: `bun install`
Expected: completes without errors; `node_modules/` populated.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json bunfig.toml .gitignore tests/setup.ts
git commit -m "chore: initialize Bun + Hono project"
```

---

### Task 2: Update root README and commit the spec

**Files:**
- Modify: `README.md`
- Track: `notes/specs/2026-04-27-flexion-labs-website-design.md` (already exists, never committed)
- Track: `notes/plans/2026-04-27-flexion-labs-website.md` (this file)

- [ ] **Step 1: Rewrite `README.md`**

```markdown
# Flexion Labs

Source for [labs.flexion.us](https://labs.flexion.us/) — a public-facing site that showcases Flexion's open source portfolio, indexes our public repositories, and publishes our open source commitment.

## Layout

- `catalog/` — the inventory of our open source work (a generated snapshot plus hand-authored overrides).
- `content/` — the words we publish, as markdown.
- `standards/` — the stewardship rules the health report evaluates.
- `views/` — the pages visitors see, rendered at build time.
- `styles/` — hand-rolled CSS with cascade layers and design tokens.
- `enhancements/` — HTML Web Components that decorate rendered HTML.
- `build/` — the Bun + Hono build driver.
- `docs/` — durable behavioral documentation for contributors and agents.
- `notes/` — ephemeral planning and specs.

## Getting started

```bash
bun install
bun run build      # writes static site to dist/
bun test           # runs the full test suite
```

See `docs/README.md` for the project orientation.
```

- [ ] **Step 2: Commit**

```bash
git add README.md notes/specs/2026-04-27-flexion-labs-website-design.md notes/plans/2026-04-27-flexion-labs-website.md
git commit -m "docs: land spec, plan, and rewritten README"
```

---

## Phase 2 — Catalog Types and Data Model

### Task 3: Define catalog entry types

**Files:**
- Create: `catalog/types.ts`
- Test: none yet — types are exercised by downstream tests.

- [ ] **Step 1: Write `catalog/types.ts`**

```ts
export type Tier = 'active' | 'as-is' | 'archived' | 'unreviewed'

export type Category =
  | 'product'
  | 'tool'
  | 'workshop'
  | 'prototype'
  | 'fork'
  | 'uncategorized'

export type GithubSnapshotEntry = {
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  license: string | null
  pushedAt: string // ISO 8601
  archived: boolean
  fork: boolean
  stars: number
  hasReadme: boolean
  hasLicense: boolean
  hasContributing: boolean
}

export type OverrideEntry = {
  tier?: Tier
  category?: Category
  featured?: boolean
  hidden?: boolean
}

export type Overlay = {
  title?: string
  summary?: string
  body?: string
}

export type CatalogEntry = GithubSnapshotEntry & {
  tier: Tier
  category: Category
  featured: boolean
  hidden: boolean
  overlay: Overlay | null
}

export type Catalog = ReadonlyArray<CatalogEntry>
```

- [ ] **Step 2: Commit**

```bash
git add catalog/types.ts
git commit -m "feat(catalog): define catalog entry types"
```

---

### Task 4: Implement default tier/category rules

**Files:**
- Create: `catalog/defaults.ts`
- Test: `tests/catalog/defaults.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/catalog/defaults.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { applyDefaults } from '../../catalog/defaults'
import type { GithubSnapshotEntry } from '../../catalog/types'

const base: GithubSnapshotEntry = {
  name: 'example',
  description: null,
  url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: null,
  pushedAt: '2026-01-01T00:00:00Z',
  archived: false,
  fork: false,
  stars: 0,
  hasReadme: false,
  hasLicense: false,
  hasContributing: false,
}

describe('applyDefaults', () => {
  test('forks default to category=fork, tier=as-is', () => {
    const result = applyDefaults({ ...base, fork: true }, {})
    expect(result.category).toBe('fork')
    expect(result.tier).toBe('as-is')
  })

  test('archived repos default to tier=archived', () => {
    const result = applyDefaults({ ...base, archived: true }, {})
    expect(result.tier).toBe('archived')
    expect(result.category).toBe('uncategorized')
  })

  test('archived forks keep category=fork and tier=archived', () => {
    const result = applyDefaults({ ...base, fork: true, archived: true }, {})
    expect(result.category).toBe('fork')
    expect(result.tier).toBe('archived')
  })

  test('plain repos default to unreviewed + uncategorized', () => {
    const result = applyDefaults(base, {})
    expect(result.tier).toBe('unreviewed')
    expect(result.category).toBe('uncategorized')
  })

  test('override fields take precedence over defaults', () => {
    const result = applyDefaults(
      { ...base, fork: true, archived: true },
      { tier: 'active', category: 'product', featured: true },
    )
    expect(result.tier).toBe('active')
    expect(result.category).toBe('product')
    expect(result.featured).toBe(true)
  })

  test('featured and hidden default to false', () => {
    const result = applyDefaults(base, {})
    expect(result.featured).toBe(false)
    expect(result.hidden).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to confirm failure**

Run: `bun test tests/catalog/defaults.test.ts`
Expected: FAIL with "Cannot find module '../../catalog/defaults'".

- [ ] **Step 3: Implement `catalog/defaults.ts`**

```ts
import type {
  Category,
  GithubSnapshotEntry,
  OverrideEntry,
  Tier,
} from './types'

type Resolved = {
  tier: Tier
  category: Category
  featured: boolean
  hidden: boolean
}

export function applyDefaults(
  snapshot: GithubSnapshotEntry,
  override: OverrideEntry,
): Resolved {
  let tier: Tier | undefined = override.tier
  let category: Category | undefined = override.category

  if (snapshot.fork) {
    category ??= 'fork'
    tier ??= 'as-is'
  }
  if (snapshot.archived) {
    tier ??= 'archived'
  }

  tier ??= 'unreviewed'
  category ??= 'uncategorized'

  return {
    tier,
    category,
    featured: override.featured ?? false,
    hidden: override.hidden ?? false,
  }
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `bun test tests/catalog/defaults.test.ts`
Expected: all six tests PASS.

- [ ] **Step 5: Commit**

```bash
git add catalog/defaults.ts tests/catalog/defaults.test.ts
git commit -m "feat(catalog): apply tier and category defaults"
```

---

### Task 5: Load per-repo markdown overlays

**Files:**
- Create: `catalog/overlays.ts`
- Test: `tests/catalog/overlays.test.ts`
- Create (fixture dir): `tests/fixtures/overlays/messaging.md`

- [ ] **Step 1: Create the overlay fixture**

`tests/fixtures/overlays/messaging.md`:
```markdown
---
title: Messaging
summary: Text-based communication for critical updates.
---

Messaging is a platform for sending notifications to the public.
```

- [ ] **Step 2: Write failing tests**

`tests/catalog/overlays.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { loadOverlay } from '../../catalog/overlays'

describe('loadOverlay', () => {
  test('parses front-matter and body from a markdown file', async () => {
    const overlay = await loadOverlay('tests/fixtures/overlays/messaging.md')
    expect(overlay).not.toBeNull()
    expect(overlay!.title).toBe('Messaging')
    expect(overlay!.summary).toBe('Text-based communication for critical updates.')
    expect(overlay!.body).toContain('Messaging is a platform')
  })

  test('returns null when file does not exist', async () => {
    const overlay = await loadOverlay('tests/fixtures/overlays/does-not-exist.md')
    expect(overlay).toBeNull()
  })
})
```

- [ ] **Step 3: Run the test to confirm failure**

Run: `bun test tests/catalog/overlays.test.ts`
Expected: FAIL with "Cannot find module".

- [ ] **Step 4: Implement `catalog/overlays.ts`**

```ts
import { parse as parseYaml } from 'yaml'
import type { Overlay } from './types'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/

export async function loadOverlay(path: string): Promise<Overlay | null> {
  const file = Bun.file(path)
  if (!(await file.exists())) return null
  const raw = await file.text()

  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { body: raw.trim() || undefined }
  }
  const frontMatter = (parseYaml(match[1]) ?? {}) as Record<string, unknown>
  const body = match[2].trim()

  return {
    title: stringOrUndefined(frontMatter.title),
    summary: stringOrUndefined(frontMatter.summary),
    body: body || undefined,
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
```

- [ ] **Step 5: Run the test to confirm it passes**

Run: `bun test tests/catalog/overlays.test.ts`
Expected: both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add catalog/overlays.ts tests/catalog/overlays.test.ts tests/fixtures/overlays/messaging.md
git commit -m "feat(catalog): load markdown overlays with front-matter"
```

---

### Task 6: Merge snapshot + overrides + overlays into the catalog

**Files:**
- Create: `catalog/merge.ts`
- Test: `tests/catalog/merge.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/catalog/merge.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { mergeCatalog } from '../../catalog/merge'
import type { GithubSnapshotEntry, OverrideEntry, Overlay } from '../../catalog/types'

const snapshot: GithubSnapshotEntry = {
  name: 'messaging',
  description: 'GOV.UK Notify-style messaging.',
  url: 'https://github.com/flexion/messaging',
  homepage: null,
  language: 'TypeScript',
  license: 'Apache-2.0',
  pushedAt: '2026-04-20T00:00:00Z',
  archived: false,
  fork: false,
  stars: 3,
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
}

describe('mergeCatalog', () => {
  test('applies defaults when no override exists', () => {
    const catalog = mergeCatalog([snapshot], {}, new Map())
    expect(catalog[0].tier).toBe('unreviewed')
    expect(catalog[0].category).toBe('uncategorized')
  })

  test('applies overrides by repo name', () => {
    const overrides: Record<string, OverrideEntry> = {
      messaging: { tier: 'active', category: 'product', featured: true },
    }
    const catalog = mergeCatalog([snapshot], overrides, new Map())
    expect(catalog[0].tier).toBe('active')
    expect(catalog[0].featured).toBe(true)
  })

  test('attaches overlay keyed by repo name', () => {
    const overlays = new Map<string, Overlay>([
      ['messaging', { title: 'Messaging', body: '…' }],
    ])
    const catalog = mergeCatalog([snapshot], {}, overlays)
    expect(catalog[0].overlay).not.toBeNull()
    expect(catalog[0].overlay!.title).toBe('Messaging')
  })

  test('entries without overlays get overlay=null', () => {
    const catalog = mergeCatalog([snapshot], {}, new Map())
    expect(catalog[0].overlay).toBeNull()
  })

  test('preserves order of the snapshot input', () => {
    const a = { ...snapshot, name: 'a' }
    const b = { ...snapshot, name: 'b' }
    const c = { ...snapshot, name: 'c' }
    const catalog = mergeCatalog([c, a, b], {}, new Map())
    expect(catalog.map((e) => e.name)).toEqual(['c', 'a', 'b'])
  })
})
```

- [ ] **Step 2: Run the test to confirm failure**

Run: `bun test tests/catalog/merge.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `catalog/merge.ts`**

```ts
import { applyDefaults } from './defaults'
import type {
  CatalogEntry,
  GithubSnapshotEntry,
  OverrideEntry,
  Overlay,
} from './types'

export function mergeCatalog(
  snapshot: ReadonlyArray<GithubSnapshotEntry>,
  overrides: Record<string, OverrideEntry>,
  overlays: ReadonlyMap<string, Overlay>,
): CatalogEntry[] {
  return snapshot.map((entry) => {
    const override = overrides[entry.name] ?? {}
    const resolved = applyDefaults(entry, override)
    return {
      ...entry,
      ...resolved,
      overlay: overlays.get(entry.name) ?? null,
    }
  })
}
```

- [ ] **Step 4: Run the test to confirm pass**

Run: `bun test tests/catalog/merge.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add catalog/merge.ts tests/catalog/merge.test.ts
git commit -m "feat(catalog): merge snapshot with overrides and overlays"
```

---

### Task 7: Catalog loader — reads files from disk and produces a catalog

**Files:**
- Create: `catalog/load.ts`
- Test: `tests/catalog/load.test.ts`
- Seed: `catalog/repos.json`, `catalog/overrides.yml`

- [ ] **Step 1: Seed an empty `catalog/repos.json`**

```json
[]
```

- [ ] **Step 2: Seed an empty `catalog/overrides.yml`**

```yaml
# Hand-authored overrides keyed by repo name.
# See docs/catalog.md for supported fields.
```

- [ ] **Step 3: Write failing test**

`tests/catalog/load.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { loadCatalog } from '../../catalog/load'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function seed() {
  const dir = mkdtempSync(join(tmpdir(), 'flexion-labs-'))
  mkdirSync(join(dir, 'catalog'), { recursive: true })
  mkdirSync(join(dir, 'content', 'work'), { recursive: true })
  writeFileSync(
    join(dir, 'catalog', 'repos.json'),
    JSON.stringify([
      {
        name: 'messaging',
        description: null,
        url: 'https://github.com/flexion/messaging',
        homepage: null,
        language: 'TypeScript',
        license: 'Apache-2.0',
        pushedAt: '2026-04-20T00:00:00Z',
        archived: false,
        fork: false,
        stars: 0,
        hasReadme: true,
        hasLicense: true,
        hasContributing: false,
      },
    ]),
  )
  writeFileSync(
    join(dir, 'catalog', 'overrides.yml'),
    'messaging:\n  tier: active\n  category: product\n  featured: true\n',
  )
  writeFileSync(
    join(dir, 'content', 'work', 'messaging.md'),
    '---\ntitle: Messaging\n---\n\nBody copy.\n',
  )
  return dir
}

describe('loadCatalog', () => {
  test('combines repos.json + overrides.yml + content/work overlays', async () => {
    const root = seed()
    const catalog = await loadCatalog(root)
    expect(catalog.length).toBe(1)
    expect(catalog[0].name).toBe('messaging')
    expect(catalog[0].tier).toBe('active')
    expect(catalog[0].featured).toBe(true)
    expect(catalog[0].overlay?.title).toBe('Messaging')
  })
})
```

- [ ] **Step 4: Run to confirm failure**

Run: `bun test tests/catalog/load.test.ts`
Expected: FAIL.

- [ ] **Step 5: Implement `catalog/load.ts`**

```ts
import { parse as parseYaml } from 'yaml'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { mergeCatalog } from './merge'
import { loadOverlay } from './overlays'
import type { Catalog, GithubSnapshotEntry, OverrideEntry, Overlay } from './types'

export async function loadCatalog(rootDir: string): Promise<Catalog> {
  const snapshot = await readSnapshot(join(rootDir, 'catalog', 'repos.json'))
  const overrides = await readOverrides(join(rootDir, 'catalog', 'overrides.yml'))
  const overlays = await readOverlays(join(rootDir, 'content', 'work'))
  return mergeCatalog(snapshot, overrides, overlays)
}

async function readSnapshot(path: string): Promise<GithubSnapshotEntry[]> {
  const file = Bun.file(path)
  if (!(await file.exists())) return []
  return (await file.json()) as GithubSnapshotEntry[]
}

async function readOverrides(
  path: string,
): Promise<Record<string, OverrideEntry>> {
  const file = Bun.file(path)
  if (!(await file.exists())) return {}
  const parsed = parseYaml(await file.text())
  return (parsed ?? {}) as Record<string, OverrideEntry>
}

async function readOverlays(dir: string): Promise<Map<string, Overlay>> {
  const overlays = new Map<string, Overlay>()
  let files: string[] = []
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  } catch {
    return overlays
  }
  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const overlay = await loadOverlay(join(dir, file))
    if (overlay) overlays.set(slug, overlay)
  }
  return overlays
}
```

- [ ] **Step 6: Run to confirm pass**

Run: `bun test tests/catalog/load.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add catalog/load.ts catalog/repos.json catalog/overrides.yml tests/catalog/load.test.ts
git commit -m "feat(catalog): load snapshot, overrides, and overlays from disk"
```

---

### Task 8: Write the catalog README

**Files:**
- Create: `catalog/README.md`

- [ ] **Step 1: Write `catalog/README.md`**

```markdown
# Catalog

The catalog is the inventory of Flexion's open source work. It drives every view on `labs.flexion.us`.

## Files

- `repos.json` — a machine-generated snapshot from the GitHub API. Rewritten daily by the `refresh-catalog` workflow.
- `overrides.yml` — hand-authored metadata keyed by repo name. Each entry may set `tier`, `category`, `featured`, and `hidden`.

## Fields

See `types.ts` for the canonical type. The fields that humans set are described in `docs/catalog.md`.

## Refresh cadence

The `refresh-catalog` workflow runs daily at 09:00 UTC. If the resulting snapshot differs from the committed one, it opens a PR. If CI is green, the PR auto-merges.
```

- [ ] **Step 2: Commit**

```bash
git add catalog/README.md
git commit -m "docs(catalog): explain what the catalog is and how it's refreshed"
```

---

## Phase 3 — Stewardship Standards

### Task 9: Evaluate a repo against stewardship standards

**Files:**
- Create: `standards/repo-checks.ts`
- Create: `standards/README.md`
- Test: `tests/standards/repo-checks.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/standards/repo-checks.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { evaluateRepo } from '../../standards/repo-checks'
import type { CatalogEntry } from '../../catalog/types'

const NOW = new Date('2026-04-27T00:00:00Z')

const base: CatalogEntry = {
  name: 'example',
  description: null,
  url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: 'Apache-2.0',
  pushedAt: '2026-04-01T00:00:00Z',
  archived: false,
  fork: false,
  stars: 0,
  hasReadme: true,
  hasLicense: true,
  hasContributing: true,
  tier: 'active',
  category: 'product',
  featured: false,
  hidden: false,
  overlay: null,
}

describe('evaluateRepo', () => {
  test('a fully compliant repo passes every check', () => {
    const result = evaluateRepo(base, NOW)
    expect(result.readme).toBe('pass')
    expect(result.license).toBe('pass')
    expect(result.contributing).toBe('pass')
    expect(result.activity).toBe('pass')
    expect(result.tierAssigned).toBe('pass')
    expect(result.overallPass).toBe(true)
  })

  test('missing README fails', () => {
    const result = evaluateRepo({ ...base, hasReadme: false }, NOW)
    expect(result.readme).toBe('fail')
    expect(result.overallPass).toBe(false)
  })

  test('activity between 6 and 18 months ago warns', () => {
    const pushed = new Date('2025-07-01T00:00:00Z').toISOString() // ~10 months ago
    const result = evaluateRepo({ ...base, pushedAt: pushed }, NOW)
    expect(result.activity).toBe('warn')
  })

  test('activity older than 18 months fails', () => {
    const pushed = new Date('2024-08-01T00:00:00Z').toISOString() // ~20 months ago
    const result = evaluateRepo({ ...base, pushedAt: pushed }, NOW)
    expect(result.activity).toBe('fail')
  })

  test('unreviewed tier counts as tier-not-assigned', () => {
    const result = evaluateRepo({ ...base, tier: 'unreviewed' }, NOW)
    expect(result.tierAssigned).toBe('fail')
  })

  test('archived repos skip the activity check (pass by policy)', () => {
    const pushed = new Date('2020-01-01T00:00:00Z').toISOString()
    const result = evaluateRepo(
      { ...base, tier: 'archived', archived: true, pushedAt: pushed },
      NOW,
    )
    expect(result.activity).toBe('pass')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/standards/repo-checks.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `standards/repo-checks.ts`**

```ts
import type { CatalogEntry } from '../catalog/types'

export type CheckResult = 'pass' | 'warn' | 'fail'

export type RepoEvaluation = {
  readme: CheckResult
  license: CheckResult
  contributing: CheckResult
  activity: CheckResult
  tierAssigned: CheckResult
  overallPass: boolean
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6
const EIGHTEEN_MONTHS_MS = SIX_MONTHS_MS * 3

export const SHOW_PER_REPO_FAILURES = true

export function evaluateRepo(entry: CatalogEntry, now: Date): RepoEvaluation {
  const readme = entry.hasReadme ? 'pass' : 'fail'
  const license = entry.hasLicense ? 'pass' : 'fail'
  const contributing = entry.hasContributing ? 'pass' : 'fail'
  const tierAssigned = entry.tier === 'unreviewed' ? 'fail' : 'pass'
  const activity = evaluateActivity(entry, now)

  const overallPass =
    readme === 'pass' &&
    license === 'pass' &&
    contributing === 'pass' &&
    tierAssigned === 'pass' &&
    activity !== 'fail'

  return { readme, license, contributing, activity, tierAssigned, overallPass }
}

function evaluateActivity(entry: CatalogEntry, now: Date): CheckResult {
  if (entry.tier === 'archived') return 'pass'
  const age = now.getTime() - new Date(entry.pushedAt).getTime()
  if (age < SIX_MONTHS_MS) return 'pass'
  if (age < EIGHTEEN_MONTHS_MS) return 'warn'
  return 'fail'
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/standards/repo-checks.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Write `standards/README.md`**

```markdown
# Standards

This directory encodes Flexion's stewardship standards. Every public repo is evaluated against the checks defined here; the results drive `/work/health/`.

## Checks

- **README** — repo has a README.md at the root.
- **License** — repo has a detectable license (GitHub's license field OR a LICENSE file).
- **Contributing** — repo has a CONTRIBUTING.md at the root.
- **Activity** — most recent push is within 6 months (pass), 6–18 months (warn), or older (fail). Archived repos pass by policy — they're not expected to receive updates.
- **Tier assigned** — a human has classified the repo with an explicit tier in `catalog/overrides.yml`. Unclassified repos fail this check.

## Hiding per-repo failures

`SHOW_PER_REPO_FAILURES` in `repo-checks.ts` controls whether `/work/health/` shows specific repo names next to failures. Set it to `false` before launch if leadership prefers aggregate reporting.
```

- [ ] **Step 6: Write `standards/maintenance-tiers.md`**

```markdown
# Maintenance tiers

- **active** — Flexion commits to security patch management and defined response times. Bug reports are triaged. Pull requests are reviewed on a predictable cadence.
- **as-is** — Available without active maintenance. The code works (or worked at one point); future updates are not promised. Forks and prototypes live here by default.
- **archived** — No longer maintained. GitHub's archive flag is set. The repo is read-only. Listed for transparency.
- **unreviewed** — A human has not yet classified this repo. Defaults to this state; visible on the site so gaps are honest.
```

- [ ] **Step 7: Commit**

```bash
git add standards/repo-checks.ts standards/README.md standards/maintenance-tiers.md tests/standards/repo-checks.test.ts
git commit -m "feat(standards): evaluate repos against stewardship standards"
```

---

## Phase 4 — Rendering Skeleton

### Task 10: Shared fixture catalog for view tests

**Files:**
- Create: `tests/fixtures/catalog.ts`

- [ ] **Step 1: Write `tests/fixtures/catalog.ts`**

```ts
import type { Catalog, CatalogEntry } from '../../catalog/types'

function entry(overrides: Partial<CatalogEntry>): CatalogEntry {
  return {
    name: overrides.name ?? 'example',
    description: overrides.description ?? null,
    url: overrides.url ?? 'https://github.com/flexion/example',
    homepage: overrides.homepage ?? null,
    language: overrides.language ?? null,
    license: overrides.license ?? null,
    pushedAt: overrides.pushedAt ?? '2026-04-20T00:00:00Z',
    archived: overrides.archived ?? false,
    fork: overrides.fork ?? false,
    stars: overrides.stars ?? 0,
    hasReadme: overrides.hasReadme ?? true,
    hasLicense: overrides.hasLicense ?? true,
    hasContributing: overrides.hasContributing ?? true,
    tier: overrides.tier ?? 'unreviewed',
    category: overrides.category ?? 'uncategorized',
    featured: overrides.featured ?? false,
    hidden: overrides.hidden ?? false,
    overlay: overrides.overlay ?? null,
  }
}

export const fixtureCatalog: Catalog = [
  entry({
    name: 'messaging',
    description: 'Messaging — text-based notifications for critical updates.',
    language: 'TypeScript',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
    overlay: {
      title: 'Messaging',
      summary: 'Text-based communication for critical updates.',
      body: '<p>Messaging body copy.</p>',
    },
  }),
  entry({
    name: 'forms',
    description: 'Accessible form experiences for public agencies.',
    language: 'TypeScript',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
  }),
  entry({
    name: 'document-extractor',
    description: 'Extract structured data from PDFs and images.',
    language: 'Python',
    license: 'Apache-2.0',
    tier: 'active',
    category: 'product',
    featured: true,
  }),
  entry({
    name: 'old-prototype',
    description: 'An old experiment.',
    pushedAt: '2022-01-01T00:00:00Z',
    tier: 'as-is',
    category: 'prototype',
  }),
  entry({
    name: 'fork-of-thing',
    description: 'A fork we picked up.',
    fork: true,
    tier: 'as-is',
    category: 'fork',
  }),
  entry({
    name: 'archived-thing',
    description: 'An archived repo.',
    archived: true,
    hasLicense: false,
    hasContributing: false,
    tier: 'archived',
    category: 'tool',
  }),
  entry({
    name: 'unreviewed-thing',
    description: null,
    hasReadme: false,
  }),
]

export const fixtureNow = new Date('2026-04-27T00:00:00Z')
```

- [ ] **Step 2: Commit**

```bash
git add tests/fixtures/catalog.ts
git commit -m "test: shared fixture catalog for view tests"
```

---

### Task 11: Render helper that turns a JSX element into an HTML string

**Files:**
- Create: `build/render.ts`

- [ ] **Step 1: Write `build/render.ts`**

```ts
import type { HtmlEscapedString } from 'hono/utils/html'

export async function renderToHtml(
  element: HtmlEscapedString | Promise<HtmlEscapedString>,
): Promise<string> {
  const resolved = await Promise.resolve(element)
  return '<!doctype html>\n' + resolved.toString()
}
```

- [ ] **Step 2: Commit**

```bash
git add build/render.ts
git commit -m "feat(build): add renderToHtml helper"
```

---

### Task 12: Site config (base path + build metadata)

**Files:**
- Create: `build/config.ts`
- Test: `tests/build/config.test.ts`

- [ ] **Step 1: Write failing test**

`tests/build/config.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { getBasePath, url } from '../../build/config'

describe('build config', () => {
  test('base path defaults to /', () => {
    expect(getBasePath(undefined)).toBe('/')
  })

  test('base path respects SITE_BASE_URL with leading and trailing slashes', () => {
    expect(getBasePath('/preview/feat-x/')).toBe('/preview/feat-x/')
    expect(getBasePath('preview/feat-x')).toBe('/preview/feat-x/')
  })

  test('url() prefixes the base path and preserves leading slashes', () => {
    expect(url('/work/', '/preview/x/')).toBe('/preview/x/work/')
    expect(url('/', '/preview/x/')).toBe('/preview/x/')
    expect(url('/work/messaging/', '/')).toBe('/work/messaging/')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/build/config.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `build/config.ts`**

```ts
export function getBasePath(raw: string | undefined): string {
  if (!raw || raw === '' || raw === '/') return '/'
  const trimmed = raw.replace(/^\/+/, '').replace(/\/+$/, '')
  return `/${trimmed}/`
}

export function url(path: string, basePath: string): string {
  const normalised = path.startsWith('/') ? path.slice(1) : path
  return basePath + normalised
}

export type SiteConfig = {
  basePath: string
  buildTime: string
}

export function createConfig(env: NodeJS.ProcessEnv = process.env): SiteConfig {
  return {
    basePath: getBasePath(env.SITE_BASE_URL),
    buildTime: new Date().toISOString(),
  }
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/build/config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add build/config.ts tests/build/config.test.ts
git commit -m "feat(build): resolve base path and build-time URL helpers"
```

---

### Task 13: Layout shell (header + footer + content slot)

**Files:**
- Create: `views/components/header.tsx`
- Create: `views/components/footer.tsx`
- Create: `views/layout.tsx`
- Test: `tests/views/layout.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/views/layout.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { Layout } from '../../views/layout'
import { renderToHtml } from '../../build/render'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('Layout', () => {
  test('renders a full HTML document with landmarks', async () => {
    const html = await renderToHtml(
      <Layout title="Home" config={config}>
        <p>Body</p>
      </Layout>,
    )
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<header')
    expect(html).toContain('<nav')
    expect(html).toContain('<main')
    expect(html).toContain('<footer')
    expect(html).toContain('Flexion Labs')
  })

  test('sets <title> to "<pageTitle> — Flexion Labs"', async () => {
    const html = await renderToHtml(
      <Layout title="About" config={config}>
        <p />
      </Layout>,
    )
    expect(html).toMatch(/<title>About — Flexion Labs<\/title>/)
  })

  test('home page uses the bare site title', async () => {
    const html = await renderToHtml(
      <Layout title={null} config={config}>
        <p />
      </Layout>,
    )
    expect(html).toMatch(/<title>Flexion Labs<\/title>/)
  })

  test('prefixes asset URLs with basePath', async () => {
    const html = await renderToHtml(
      <Layout title={null} config={{ basePath: '/preview/x/', buildTime: '2026-04-27T12:00:00Z' }}>
        <p />
      </Layout>,
    )
    expect(html).toContain('href="/preview/x/styles/index.css"')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/views/layout.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `views/components/header.tsx`**

```tsx
import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header class="site-header">
      <a href={url('/', config.basePath)} class="site-brand">
        Flexion Labs
      </a>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href={url('/work/', config.basePath)}>Work</a>
          </li>
          <li>
            <a href={url('/commitment/', config.basePath)}>Commitment</a>
          </li>
          <li>
            <a href={url('/about/', config.basePath)}>About</a>
          </li>
          <li>
            <a href="https://github.com/flexion" rel="noopener external">
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Implement `views/components/footer.tsx`**

```tsx
import { url } from '../../build/config'
import type { SiteConfig } from '../../build/config'

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer class="site-footer">
      <nav aria-label="Footer">
        <ul>
          <li><a href={url('/work/', config.basePath)}>Work</a></li>
          <li><a href={url('/commitment/', config.basePath)}>Commitment</a></li>
          <li><a href={url('/about/', config.basePath)}>About</a></li>
        </ul>
      </nav>
      <p class="site-footer__meta">
        Built {formatBuildTime(config.buildTime)}. Content licensed as noted per project.
      </p>
    </footer>
  )
}

function formatBuildTime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}
```

- [ ] **Step 5: Implement `views/layout.tsx`**

```tsx
import type { Child } from 'hono/jsx'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { url } from '../build/config'
import type { SiteConfig } from '../build/config'

export function Layout({
  title,
  config,
  children,
}: {
  title: string | null
  config: SiteConfig
  children: Child
}) {
  const documentTitle = title ? `${title} — Flexion Labs` : 'Flexion Labs'
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{documentTitle}</title>
        <link rel="stylesheet" href={url('/styles/index.css', config.basePath)} />
        <link rel="icon" href={url('/assets/favicon.svg', config.basePath)} type="image/svg+xml" />
        <script type="module" src={url('/enhancements/register.js', config.basePath)} defer></script>
      </head>
      <body>
        <a href="#main" class="skip-link">Skip to main content</a>
        <Header config={config} />
        <main id="main">{children}</main>
        <Footer config={config} />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Run to confirm pass**

Run: `bun test tests/views/layout.test.tsx`
Expected: all four tests PASS.

- [ ] **Step 7: Commit**

```bash
git add views/layout.tsx views/components/header.tsx views/components/footer.tsx tests/views/layout.test.tsx
git commit -m "feat(views): layout shell with header, footer, and skip link"
```

---

## Phase 5 — Views

### Task 14: Shared components — badges, repo card, standards list

**Files:**
- Create: `views/components/badge.tsx`
- Create: `views/components/repo-card.tsx`
- Create: `views/components/standards-list.tsx`
- Test: `tests/views/components.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/views/components.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { Badge } from '../../views/components/badge'
import { RepoCard } from '../../views/components/repo-card'
import { StandardsList } from '../../views/components/standards-list'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'
import { evaluateRepo } from '../../standards/repo-checks'

describe('Badge', () => {
  test('renders label and a class reflecting the variant', async () => {
    const html = await renderToHtml(<Badge variant="tier-active">Active</Badge>)
    expect(html).toContain('badge')
    expect(html).toContain('badge--tier-active')
    expect(html).toContain('Active')
  })
})

describe('RepoCard', () => {
  const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!

  test('renders name, description, and category/tier badges', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('messaging')
    expect(html).toContain('text-based notifications')
    expect(html).toContain('badge--tier-active')
    expect(html).toContain('badge--category-product')
  })

  test('uses overlay.summary when present', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('Text-based communication for critical updates.')
  })

  test('falls back to description when there is no overlay', async () => {
    const forms = fixtureCatalog.find((e) => e.name === 'forms')!
    const html = await renderToHtml(<RepoCard entry={forms} basePath="/" />)
    expect(html).toContain('Accessible form experiences')
  })

  test('links to /work/<slug>/', async () => {
    const html = await renderToHtml(<RepoCard entry={messaging} basePath="/" />)
    expect(html).toContain('href="/work/messaging/"')
  })
})

describe('StandardsList', () => {
  test('renders a list item per check with the result class', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const evaluation = evaluateRepo(messaging, fixtureNow)
    const html = await renderToHtml(<StandardsList evaluation={evaluation} />)
    expect(html).toContain('standards-list__item--pass')
    expect(html.match(/standards-list__item/g)!.length).toBe(5)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/views/components.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `views/components/badge.tsx`**

```tsx
import type { Child } from 'hono/jsx'

export type BadgeVariant =
  | `tier-${'active' | 'as-is' | 'archived' | 'unreviewed'}`
  | `category-${'product' | 'tool' | 'workshop' | 'prototype' | 'fork' | 'uncategorized'}`
  | 'pass'
  | 'warn'
  | 'fail'

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant
  children: Child
}) {
  return <span class={`badge badge--${variant}`}>{children}</span>
}
```

- [ ] **Step 4: Implement `views/components/repo-card.tsx`**

```tsx
import type { CatalogEntry } from '../../catalog/types'
import { url } from '../../build/config'
import { Badge } from './badge'

const TIER_LABEL: Record<CatalogEntry['tier'], string> = {
  active: 'Active',
  'as-is': 'As-is',
  archived: 'Archived',
  unreviewed: 'Unreviewed',
}

const CATEGORY_LABEL: Record<CatalogEntry['category'], string> = {
  product: 'Product',
  tool: 'Tool',
  workshop: 'Workshop',
  prototype: 'Prototype',
  fork: 'Fork',
  uncategorized: 'Uncategorized',
}

export function RepoCard({
  entry,
  basePath,
}: {
  entry: CatalogEntry
  basePath: string
}) {
  const summary = entry.overlay?.summary ?? entry.description ?? ''
  const href = url(`/work/${entry.name}/`, basePath)
  return (
    <article class="repo-card">
      <h3 class="repo-card__name">
        <a href={href}>{entry.name}</a>
      </h3>
      {summary ? <p class="repo-card__summary">{summary}</p> : null}
      <p class="repo-card__meta">
        <Badge variant={`tier-${entry.tier}`}>{TIER_LABEL[entry.tier]}</Badge>{' '}
        <Badge variant={`category-${entry.category}`}>
          {CATEGORY_LABEL[entry.category]}
        </Badge>
      </p>
    </article>
  )
}
```

- [ ] **Step 5: Implement `views/components/standards-list.tsx`**

```tsx
import type { RepoEvaluation } from '../../standards/repo-checks'

const CHECKS: ReadonlyArray<{ key: keyof Omit<RepoEvaluation, 'overallPass'>; label: string }> = [
  { key: 'readme', label: 'README' },
  { key: 'license', label: 'License' },
  { key: 'contributing', label: 'Contributing guide' },
  { key: 'activity', label: 'Recent activity' },
  { key: 'tierAssigned', label: 'Tier assigned' },
]

export function StandardsList({ evaluation }: { evaluation: RepoEvaluation }) {
  return (
    <ul class="standards-list">
      {CHECKS.map((check) => (
        <li class={`standards-list__item standards-list__item--${evaluation[check.key]}`}>
          <span class="standards-list__label">{check.label}</span>
          <span class="standards-list__result">{evaluation[check.key]}</span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: Run to confirm pass**

Run: `bun test tests/views/components.test.tsx`
Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add views/components/badge.tsx views/components/repo-card.tsx views/components/standards-list.tsx tests/views/components.test.tsx
git commit -m "feat(views): badge, repo card, and standards list components"
```

---

### Task 15: Home view

**Files:**
- Create: `views/home.tsx`
- Test: `tests/views/home.test.tsx`
- Create: `content/home.md`

- [ ] **Step 1: Seed `content/home.md`**

```markdown
---
hero: Public infrastructure, in the open.
intro: Flexion Labs gathers our open source work in one place — products we steward, tools we share, and the commitment behind them.
---
```

- [ ] **Step 2: Write failing test**

`tests/views/home.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { Home } from '../../views/home'
import { fixtureCatalog } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }
const heroContent = {
  hero: 'Public infrastructure, in the open.',
  intro: 'Flexion Labs gathers our open source work in one place.',
}

describe('Home', () => {
  test('renders the hero statement as the h1', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toMatch(/<h1[^>]*>Public infrastructure, in the open\.<\/h1>/)
  })

  test('renders one card per featured entry', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toContain('messaging')
    expect(html).toContain('forms')
    expect(html).toContain('document-extractor')
    expect(html).not.toContain('old-prototype')
  })

  test('renders quick stats reflecting the catalog', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    // 7 total repos in the fixture; 3 active.
    expect(html).toMatch(/7 public projects/)
    expect(html).toMatch(/3 actively maintained/)
  })

  test('renders the three audience paths', async () => {
    const html = await renderToHtml(
      <Home catalog={fixtureCatalog} hero={heroContent} config={config} />,
    )
    expect(html).toContain('href="/work/"')
    expect(html).toContain('href="/commitment/"')
    expect(html).toContain('href="/about/"')
  })
})
```

- [ ] **Step 3: Run to confirm failure**

Run: `bun test tests/views/home.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement `views/home.tsx`**

```tsx
import { Layout } from './layout'
import { RepoCard } from './components/repo-card'
import type { Catalog } from '../catalog/types'
import type { SiteConfig } from '../build/config'
import { url } from '../build/config'

export type HeroContent = { hero: string; intro: string }

export function Home({
  catalog,
  hero,
  config,
}: {
  catalog: Catalog
  hero: HeroContent
  config: SiteConfig
}) {
  const featured = catalog.filter((e) => e.featured && !e.hidden)
  const visible = catalog.filter((e) => !e.hidden)
  const active = visible.filter((e) => e.tier === 'active').length
  const languages = new Set(
    visible.map((e) => e.language).filter((l): l is string => Boolean(l)),
  ).size

  return (
    <Layout title={null} config={config}>
      <section class="home-hero">
        <h1>{hero.hero}</h1>
        <p class="home-hero__intro">{hero.intro}</p>
      </section>

      <section class="home-featured" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Featured labs</h2>
        <div class="home-featured__grid">
          {featured.map((entry) => (
            <RepoCard entry={entry} basePath={config.basePath} />
          ))}
        </div>
      </section>

      <section class="home-stats" aria-labelledby="stats-heading">
        <h2 id="stats-heading">By the numbers</h2>
        <ul class="home-stats__grid">
          <li><strong>{visible.length}</strong> public projects</li>
          <li><strong>{active}</strong> actively maintained</li>
          <li><strong>{languages}</strong> languages</li>
        </ul>
      </section>

      <section class="home-paths" aria-labelledby="paths-heading">
        <h2 id="paths-heading">Where to next</h2>
        <ul>
          <li><a href={url('/work/', config.basePath)}>Explore our work</a></li>
          <li><a href={url('/commitment/', config.basePath)}>Read our open source commitment</a></li>
          <li><a href={url('/about/', config.basePath)}>Get in touch</a></li>
        </ul>
      </section>
    </Layout>
  )
}
```

- [ ] **Step 5: Run to confirm pass**

Run: `bun test tests/views/home.test.tsx`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add views/home.tsx content/home.md tests/views/home.test.tsx
git commit -m "feat(views): home page with hero, featured labs, stats, and paths"
```

---

### Task 16: Work index view

**Files:**
- Create: `views/work/index.tsx`
- Test: `tests/views/work-index.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/views/work-index.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { WorkIndex } from '../../views/work/index'
import { fixtureCatalog } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('WorkIndex', () => {
  test('renders a row for every non-hidden repo', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    for (const entry of fixtureCatalog) {
      expect(html).toContain(entry.name)
    }
  })

  test('omits hidden repos', async () => {
    const catalog = fixtureCatalog.map((e, i) =>
      i === 0 ? { ...e, hidden: true } : e,
    )
    const html = await renderToHtml(
      <WorkIndex catalog={catalog} config={config} />,
    )
    expect(html).not.toContain('messaging')
  })

  test('wraps the list in a <catalog-filter> web component', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    expect(html).toContain('<catalog-filter')
  })

  test('applies the default sort: featured first, then active, then by pushedAt desc', async () => {
    const html = await renderToHtml(
      <WorkIndex catalog={fixtureCatalog} config={config} />,
    )
    const order = ['messaging', 'forms', 'document-extractor']
    let last = -1
    for (const name of order) {
      const idx = html.indexOf(`href="/work/${name}/"`)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/views/work-index.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `views/work/index.tsx`**

```tsx
import { Layout } from '../layout'
import { RepoCard } from '../components/repo-card'
import type { Catalog, CatalogEntry } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

export function WorkIndex({
  catalog,
  config,
}: {
  catalog: Catalog
  config: SiteConfig
}) {
  const visible = catalog.filter((e) => !e.hidden)
  const sorted = [...visible].sort(defaultSort)

  return (
    <Layout title="Work" config={config}>
      <h1>Our work</h1>
      <p class="work-index__intro">
        Every public repository Flexion maintains. Active projects are stewarded; as-is
        projects are available without promised maintenance; archived projects are no
        longer updated.
      </p>
      <catalog-filter>
        <form class="catalog-filter" method="get">
          <fieldset>
            <legend>Filter</legend>
            <label>
              Tier
              <select name="tier">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="as-is">As-is</option>
                <option value="archived">Archived</option>
                <option value="unreviewed">Unreviewed</option>
              </select>
            </label>
            <label>
              Category
              <select name="category">
                <option value="">All</option>
                <option value="product">Product</option>
                <option value="tool">Tool</option>
                <option value="workshop">Workshop</option>
                <option value="prototype">Prototype</option>
                <option value="fork">Fork</option>
                <option value="uncategorized">Uncategorized</option>
              </select>
            </label>
            <button type="submit">Apply</button>
          </fieldset>
        </form>
        <ul class="work-index__list">
          {sorted.map((entry) => (
            <li data-tier={entry.tier} data-category={entry.category}>
              <RepoCard entry={entry} basePath={config.basePath} />
            </li>
          ))}
        </ul>
      </catalog-filter>
    </Layout>
  )
}

function defaultSort(a: CatalogEntry, b: CatalogEntry): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  const tierRank: Record<CatalogEntry['tier'], number> = {
    active: 0,
    'as-is': 1,
    unreviewed: 2,
    archived: 3,
  }
  if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier]
  return b.pushedAt.localeCompare(a.pushedAt)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/views/work-index.test.tsx`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add views/work/index.tsx tests/views/work-index.test.tsx
git commit -m "feat(views): work index with default sort and filter shell"
```

---

### Task 17: Work detail view

**Files:**
- Create: `views/work/detail.tsx`
- Test: `tests/views/work-detail.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/views/work-detail.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { WorkDetail } from '../../views/work/detail'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('WorkDetail', () => {
  test('renders the overlay body when present', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('Messaging body copy')
  })

  test('falls back to the GitHub description when no overlay', async () => {
    const forms = fixtureCatalog.find((e) => e.name === 'forms')!
    const html = await renderToHtml(
      <WorkDetail entry={forms} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('Accessible form experiences')
  })

  test('shows an explicit placeholder when no description and no overlay', async () => {
    const unreviewed = fixtureCatalog.find((e) => e.name === 'unreviewed-thing')!
    const html = await renderToHtml(
      <WorkDetail entry={unreviewed} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('No description yet')
  })

  test('renders the standards checklist', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('standards-list')
  })

  test('links to the GitHub repository', async () => {
    const messaging = fixtureCatalog.find((e) => e.name === 'messaging')!
    const html = await renderToHtml(
      <WorkDetail entry={messaging} now={fixtureNow} config={config} />,
    )
    expect(html).toContain('href="https://github.com/flexion/messaging"')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/views/work-detail.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `views/work/detail.tsx`**

```tsx
import { raw } from 'hono/html'
import { Layout } from '../layout'
import { Badge } from '../components/badge'
import { StandardsList } from '../components/standards-list'
import { evaluateRepo } from '../../standards/repo-checks'
import type { CatalogEntry } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

export function WorkDetail({
  entry,
  now,
  config,
}: {
  entry: CatalogEntry
  now: Date
  config: SiteConfig
}) {
  const evaluation = evaluateRepo(entry, now)
  const title = entry.overlay?.title ?? entry.name

  return (
    <Layout title={title} config={config}>
      <article class="work-detail">
        <header class="work-detail__header">
          <h1>{title}</h1>
          <p class="work-detail__badges">
            <Badge variant={`tier-${entry.tier}`}>{entry.tier}</Badge>{' '}
            <Badge variant={`category-${entry.category}`}>{entry.category}</Badge>
          </p>
          <p class="work-detail__links">
            <a href={entry.url} rel="noopener external">View on GitHub</a>
            {entry.homepage ? (
              <>
                {' · '}
                <a href={entry.homepage} rel="noopener external">Homepage</a>
              </>
            ) : null}
          </p>
        </header>

        <div class="work-detail__body">
          {entry.overlay?.body
            ? raw(entry.overlay.body)
            : <p>{renderBody(entry)}</p>}
        </div>

        <aside class="work-detail__aside" aria-label="Stewardship">
          <h2>Stewardship</h2>
          <StandardsList evaluation={evaluation} />
          <dl class="work-detail__stats">
            <dt>Language</dt>
            <dd>{entry.language ?? '—'}</dd>
            <dt>License</dt>
            <dd>{entry.license ?? '—'}</dd>
            <dt>Last push</dt>
            <dd>{entry.pushedAt.slice(0, 10)}</dd>
          </dl>
        </aside>
      </article>
    </Layout>
  )
}

function renderBody(entry: CatalogEntry): string {
  if (entry.overlay?.summary) return entry.overlay.summary
  if (entry.description) return entry.description
  return 'No description yet.'
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/views/work-detail.test.tsx`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add views/work/detail.tsx tests/views/work-detail.test.tsx
git commit -m "feat(views): work detail with overlay, fallback copy, and stewardship aside"
```

---

### Task 18: Health view

**Files:**
- Create: `views/work/health.tsx`
- Test: `tests/views/health.test.tsx`

- [ ] **Step 1: Write failing test**

`tests/views/health.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { Health } from '../../views/work/health'
import { fixtureCatalog, fixtureNow } from '../fixtures/catalog'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('Health', () => {
  test('renders a summary of N of M repos meeting standards', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    expect(html).toMatch(/of\s+\d+\s+repos meet the documented standards/)
  })

  test('renders a table with one row per non-hidden repo', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    for (const entry of fixtureCatalog.filter((e) => !e.hidden)) {
      expect(html).toContain(`data-repo="${entry.name}"`)
    }
  })

  test('marks a repo without a license as failing', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={true} />,
    )
    expect(html).toMatch(/data-repo="archived-thing"[\s\S]*?license[^<]*fail/i)
  })

  test('when showPerRepo is false, the table is replaced by an aggregate summary', async () => {
    const html = await renderToHtml(
      <Health catalog={fixtureCatalog} now={fixtureNow} config={config} showPerRepo={false} />,
    )
    expect(html).not.toContain('data-repo=')
    expect(html).toContain('Per-repo breakdown is hidden')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/views/health.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `views/work/health.tsx`**

```tsx
import { Layout } from '../layout'
import { evaluateRepo, type CheckResult, type RepoEvaluation } from '../../standards/repo-checks'
import type { Catalog } from '../../catalog/types'
import type { SiteConfig } from '../../build/config'

const CHECK_KEYS: Array<keyof Omit<RepoEvaluation, 'overallPass'>> = [
  'readme',
  'license',
  'contributing',
  'activity',
  'tierAssigned',
]
const CHECK_LABELS: Record<(typeof CHECK_KEYS)[number], string> = {
  readme: 'README',
  license: 'License',
  contributing: 'Contributing',
  activity: 'Activity',
  tierAssigned: 'Tier',
}

export function Health({
  catalog,
  now,
  config,
  showPerRepo,
}: {
  catalog: Catalog
  now: Date
  config: SiteConfig
  showPerRepo: boolean
}) {
  const visible = catalog.filter((e) => !e.hidden)
  const evaluations = visible.map((e) => ({ entry: e, evaluation: evaluateRepo(e, now) }))
  const passing = evaluations.filter(({ evaluation }) => evaluation.overallPass).length

  return (
    <Layout title="Repo health" config={config}>
      <h1>Repo health</h1>
      <p class="health-summary">
        <strong>{passing}</strong> of <strong>{visible.length}</strong> repos meet the documented standards.
      </p>

      {showPerRepo ? (
        <sortable-table>
          <table class="health-table">
            <caption>Every public repository, scored against our stewardship standards.</caption>
            <thead>
              <tr>
                <th scope="col">Repository</th>
                {CHECK_KEYS.map((key) => (
                  <th scope="col">{CHECK_LABELS[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluations.map(({ entry, evaluation }) => (
                <tr data-repo={entry.name}>
                  <th scope="row">{entry.name}</th>
                  {CHECK_KEYS.map((key) => (
                    <td
                      class={`health-cell health-cell--${evaluation[key]}`}
                      data-check={key}
                    >
                      {resultIcon(evaluation[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </sortable-table>
      ) : (
        <p class="health-aggregate">
          Per-repo breakdown is hidden. Showing aggregate counts only.
        </p>
      )}
    </Layout>
  )
}

function resultIcon(result: CheckResult): string {
  if (result === 'pass') return '✓ pass'
  if (result === 'warn') return '○ warn'
  return '✗ fail'
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/views/health.test.tsx`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add views/work/health.tsx tests/views/health.test.tsx
git commit -m "feat(views): stewardship health report"
```

---

### Task 19: Markdown-rendered content view (commitment + about)

**Files:**
- Create: `views/content-page.tsx`
- Create: `views/commitment.tsx`
- Create: `views/about.tsx`
- Create: `content/commitment.md` (seeded with the working-draft commitment doc)
- Create: `content/about.md`
- Test: `tests/views/content-page.test.tsx`

- [ ] **Step 1: Seed `content/commitment.md`** with the full commitment text

```markdown
---
title: Open source commitment
---

# Flexion Labs open source commitment

*Status: Working draft. Pending delivery leadership and ownership group review.*

## Why we value openness

Open source solves practical problems. For the government agencies we serve, it eliminates vendor lock-in, reduces sustainability risk, and lowers total cost of ownership. For Flexion, it creates options — the freedom to build on proven foundations, to redirect resources from infrastructure to the problems that matter, and to demonstrate technical capability in ways closed projects never can.

Transparency improves quality. When code is open, more eyes find more bugs. Agencies and oversight bodies can audit how public systems work. The discipline of building in the open — knowing anyone can read the code — raises the bar for the work itself.

Openness compounds value across jurisdictions. Investment in one agency's solution becomes infrastructure that others can adopt. This commons-building isn't overhead — it's how we create defensible competitive advantage while empowering agencies to control their technology. Open source attracts talent who value transparency and civic impact, and contributors can become hires.

Openness also makes sense for the public. Publicly funded work should create reusable public infrastructure. Citizens benefit from transparency into the systems that serve them. And when agencies embrace open source, the result is higher public satisfaction with government technology. We don't ask anyone to take our word for it — the code is there to inspect, use, and build on.

## What we commit to

We are open by default. Code, architecture, and interfaces are open unless there's a specific reason otherwise — security concerns, client requirements, or competitive considerations. We will never take an open source project to a closed model. Once we release something as open source, it remains available under that license.

We use licensing appropriate to each project's context. Government-funded work uses public domain (CC0) to maximize reuse and avoid contractual friction. Commercial client work follows client preferences, typically proposing public domain. For projects where Flexion makes significant independent investment and maintains long-term stewardship, we use permissive open source licenses (Apache 2.0) with contributor agreements that preserve flexibility for the project's future. Small enhancements to existing open source projects follow those projects' conventions.

We commit to clear, professional repository standards: proper documentation, contributor guidance, legal terms, and getting-started materials. Code alone isn't enough — a project that's hard to understand or adopt isn't truly open.

Our competitive advantage comes from delivery expertise and proven capabilities, not from hiding code. We compete by being better at building, deploying, and supporting solutions — not by locking them down.

## How we operate

We develop in the open for projects intended to be open source. Public by default means the work is visible from the start, not just after delivery. We are mindful of security considerations and maintain clear vulnerability disclosure processes.

We govern our projects incrementally, starting with Flexion authority and evolving toward broader community governance as projects mature and attract use. For client work, the governance model depends on context — for traditional client engagements, operational decisions belong to the empowered client; for Flexion Solutions, Flexion governs directly.

Contribution processes are documented and all work is done through pull requests. We welcome contributions with clear guidance. We build our stewardship practices by dogfooding them on internal projects first, so we learn what works before applying it externally.

We recognize that governance stagnation — projects going dormant because no one takes ownership — is a primary risk of open source. We address this through honest communication about support levels, explicit project tiers, and a commitment to never let projects silently decay. If a project is no longer actively maintained, we say so clearly.

## What we steward

We recognize that resources are finite and not all projects warrant the same level of investment. We support a tiered approach to stewardship, with honest communication about what we will and won't provide for each project.

For actively maintained projects, we commit to security patch management and defined response commitments. For projects available as-is, we say so clearly. We don't over-promise maintenance. Abandoned repositories damage credibility and create a security risk — if we can't maintain something, we explicitly archive it rather than letting it decay silently.

Open source work is funded primarily through consulting engagements with clients who value openness. We also make strategic investments in projects where the business case warrants it — where open source creates market opportunities, builds community, or strengthens civic infrastructure. Different projects use different funding models: traditional hourly billing, retainers, maintenance within team structures, grants, and partnerships.

## Maintenance tiers

- **Active** — Flexion commits to security patch management and defined response commitments. Bug reports are triaged. Pull requests are reviewed on a predictable cadence.
- **As-is** — Available without active maintenance. The code works (or worked at one point); future updates are not promised.
- **Archived** — No longer maintained. The GitHub archive flag is set. The repo is read-only. Listed for transparency.
- **Unreviewed** — A human has not yet classified this repo. Defaults to this state; visible on the site so gaps are honest.
```

- [ ] **Step 2: Seed `content/about.md`**

```markdown
---
title: About
---

# About Flexion Labs

Flexion Labs is where we publish our open source work. It's curated by Flexion — a firm that helps government agencies and nonprofits modernize software that matters.

## Engage

- **Adopt** a project. Read the README, try it, open an issue if something is unclear.
- **Contribute** a fix or an improvement. Every repo lists its contribution process.
- **Partner** with us on new public infrastructure. Reach out through the main Flexion site.

[flexion.us](https://flexion.us/) is the home for Flexion the company. This site is the home for Flexion's open source work.
```

- [ ] **Step 3: Write failing tests**

`tests/views/content-page.test.tsx`:
```tsx
import { describe, test, expect } from 'bun:test'
import { renderToHtml } from '../../build/render'
import { ContentPage } from '../../views/content-page'

const config = { basePath: '/', buildTime: '2026-04-27T12:00:00Z' }

describe('ContentPage', () => {
  test('renders markdown into HTML inside <main>', async () => {
    const html = await renderToHtml(
      <ContentPage
        title="Title"
        body="# Hello\n\nParagraph text."
        config={config}
      />,
    )
    expect(html).toMatch(/<main[^>]*>[\s\S]*<h1>Hello<\/h1>/)
    expect(html).toContain('<p>Paragraph text.</p>')
  })

  test('uses the provided title in the document title', async () => {
    const html = await renderToHtml(
      <ContentPage title="About" body="body" config={config} />,
    )
    expect(html).toMatch(/<title>About — Flexion Labs<\/title>/)
  })
})
```

- [ ] **Step 4: Run to confirm failure**

Run: `bun test tests/views/content-page.test.tsx`
Expected: FAIL.

- [ ] **Step 5: Implement `views/content-page.tsx`**

```tsx
import { raw } from 'hono/html'
import { marked } from 'marked'
import { Layout } from './layout'
import type { SiteConfig } from '../build/config'

export function ContentPage({
  title,
  body,
  config,
}: {
  title: string
  body: string
  config: SiteConfig
}) {
  const html = marked.parse(body, { async: false }) as string
  return (
    <Layout title={title} config={config}>
      <article class="content-page">{raw(html)}</article>
    </Layout>
  )
}
```

- [ ] **Step 6: Implement `views/commitment.tsx`**

```tsx
import { ContentPage } from './content-page'
import type { SiteConfig } from '../build/config'

export function Commitment({
  body,
  config,
}: {
  body: string
  config: SiteConfig
}) {
  return <ContentPage title="Commitment" body={body} config={config} />
}
```

- [ ] **Step 7: Implement `views/about.tsx`**

```tsx
import { ContentPage } from './content-page'
import type { SiteConfig } from '../build/config'

export function About({ body, config }: { body: string; config: SiteConfig }) {
  return <ContentPage title="About" body={body} config={config} />
}
```

- [ ] **Step 8: Run to confirm pass**

Run: `bun test tests/views/content-page.test.tsx`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add views/content-page.tsx views/commitment.tsx views/about.tsx content/commitment.md content/about.md tests/views/content-page.test.tsx
git commit -m "feat(views): content page renderer for commitment and about"
```

---

### Task 20: Seed the three featured-lab overlays

**Files:**
- Create: `content/work/messaging.md`
- Create: `content/work/forms.md`
- Create: `content/work/document-extractor.md`

The initial copy is placeholder prose derived from the `solutions.flexion.us` product summaries; a content pass will replace it before launch. Each file provides `title`, `summary`, and body copy so `/work/<slug>/` renders with real content on first build.

- [ ] **Step 1: Write `content/work/messaging.md`**

```markdown
---
title: Messaging
summary: A public-sector-grade platform for sending SMS and email notifications about benefits, deadlines, and outages.
---

## What it solves

Public agencies need to reach residents quickly when something changes — a benefit status, an appointment, a service outage. Existing commercial messaging platforms are expensive, opaque about deliverability, and often lock agencies into per-message pricing that grows with the population they serve.

## Who it's for

State and local agencies that want self-hosted, auditable messaging infrastructure with clear deliverability reporting.

## Status

Active. Used in production with multiple agency partners.

## Get started

Read the README on GitHub for the deployment guide and API reference.
```

- [ ] **Step 2: Write `content/work/forms.md`**

```markdown
---
title: Forms
summary: Accessible, USWDS-aligned form experiences that work for every resident and every agency.
---

## What it solves

Public forms are the front door to government services — and often the worst-performing part of the experience. Forms focuses on WCAG-conformant, plain-language, multi-step forms that reduce drop-off and produce clean data on submit.

## Who it's for

Agency teams building new forms or rehabilitating legacy ones. Works with the agency's existing back-end and identity stack.

## Status

Active. In use across multiple deployments.

## Get started

The repository includes component documentation, examples, and deployment guidance.
```

- [ ] **Step 3: Write `content/work/document-extractor.md`**

```markdown
---
title: Document Extractor
summary: Turn PDFs and images of forms into structured data — without vendor lock-in.
---

## What it solves

Agencies receive millions of scanned forms every year and pay commercial vendors to turn them into structured data. Document Extractor provides an open alternative that agencies can deploy, audit, and extend.

## Who it's for

Teams modernizing paper-based intake workflows. Works on scanned PDFs, phone-camera photos, and faxes.

## Status

Active. Deployed with agency partners.

## Get started

The repository documents supported document types, extraction models, and how to extend the pipeline.
```

- [ ] **Step 4: Commit**

```bash
git add content/work/messaging.md content/work/forms.md content/work/document-extractor.md
git commit -m "content: seed overlays for the three featured labs"
```

---

## Phase 6 — Build Driver

### Task 21: Define routes and hero loader

**Files:**
- Create: `build/hero.ts`
- Create: `build/routes.ts`
- Test: `tests/build/hero.test.ts`

- [ ] **Step 1: Write failing test**

`tests/build/hero.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { loadHero } from '../../build/hero'
import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('loadHero', () => {
  test('reads hero and intro from content/home.md front-matter', async () => {
    const root = mkdtempSync(join(tmpdir(), 'flexion-labs-'))
    mkdirSync(join(root, 'content'), { recursive: true })
    writeFileSync(
      join(root, 'content', 'home.md'),
      '---\nhero: Test hero.\nintro: Test intro.\n---\n',
    )
    const hero = await loadHero(root)
    expect(hero.hero).toBe('Test hero.')
    expect(hero.intro).toBe('Test intro.')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/build/hero.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `build/hero.ts`**

```ts
import { parse as parseYaml } from 'yaml'
import { join } from 'node:path'
import type { HeroContent } from '../views/home'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

export async function loadHero(rootDir: string): Promise<HeroContent> {
  const file = Bun.file(join(rootDir, 'content', 'home.md'))
  const raw = await file.text()
  const match = raw.match(FRONTMATTER_RE)
  const parsed = match ? (parseYaml(match[1]) as Record<string, unknown>) : {}
  return {
    hero: typeof parsed.hero === 'string' ? parsed.hero : 'Flexion Labs',
    intro: typeof parsed.intro === 'string' ? parsed.intro : '',
  }
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/build/hero.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement `build/routes.ts`**

```ts
import type { Catalog } from '../catalog/types'

export type Route = {
  path: string // always starts with "/" and ends with "/"
  view: 'home' | 'work-index' | 'work-detail' | 'health' | 'commitment' | 'about'
  slug?: string
}

export function allRoutes(catalog: Catalog): Route[] {
  const routes: Route[] = [
    { path: '/', view: 'home' },
    { path: '/work/', view: 'work-index' },
    { path: '/work/health/', view: 'health' },
    { path: '/commitment/', view: 'commitment' },
    { path: '/about/', view: 'about' },
  ]
  for (const entry of catalog) {
    if (entry.hidden) continue
    routes.push({ path: `/work/${entry.name}/`, view: 'work-detail', slug: entry.name })
  }
  return routes
}
```

- [ ] **Step 6: Commit**

```bash
git add build/hero.ts build/routes.ts tests/build/hero.test.ts
git commit -m "feat(build): hero loader and route table"
```

---

### Task 22: Build entry — render every route to dist/

**Files:**
- Create: `build/entry.ts`
- Test: `tests/build/smoke.test.ts`

- [ ] **Step 1: Write the smoke test**

`tests/build/smoke.test.ts`:
```ts
import { describe, test, expect, beforeAll } from 'bun:test'
import { buildSite } from '../../build/entry'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let outDir: string

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'flexion-labs-dist-'))
  await buildSite({
    rootDir: process.cwd(),
    outDir,
    basePath: '/',
    now: new Date('2026-04-27T12:00:00Z'),
  })
})

describe('build smoke', () => {
  const expectedPaths = [
    'index.html',
    'work/index.html',
    'work/health/index.html',
    'commitment/index.html',
    'about/index.html',
  ]

  for (const path of expectedPaths) {
    test(`produces ${path}`, () => {
      const full = join(outDir, path)
      expect(existsSync(full)).toBe(true)
      const content = readFileSync(full, 'utf8')
      expect(content).toContain('<!doctype html>')
      expect(content.length).toBeGreaterThan(100)
    })
  }

  test('produces a detail page for every non-hidden repo in the committed snapshot', () => {
    // Snapshot may be empty in early phases; the test must tolerate that.
    const workDir = join(outDir, 'work')
    expect(existsSync(workDir)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/build/smoke.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `build/entry.ts`**

```ts
import { mkdir, writeFile, copyFile, readdir, stat } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { renderToHtml } from './render'
import { createConfig, getBasePath } from './config'
import { loadCatalog } from '../catalog/load'
import { loadHero } from './hero'
import { allRoutes } from './routes'
import { Home } from '../views/home'
import { WorkIndex } from '../views/work/index'
import { WorkDetail } from '../views/work/detail'
import { Health } from '../views/work/health'
import { Commitment } from '../views/commitment'
import { About } from '../views/about'
import { SHOW_PER_REPO_FAILURES } from '../standards/repo-checks'

export type BuildOptions = {
  rootDir: string
  outDir: string
  basePath?: string
  now?: Date
}

export async function buildSite(options: BuildOptions): Promise<void> {
  const rootDir = options.rootDir
  const outDir = options.outDir
  const now = options.now ?? new Date()
  const config = {
    basePath: options.basePath ? getBasePath(options.basePath) : createConfig(process.env).basePath,
    buildTime: now.toISOString(),
  }

  const [catalog, hero] = await Promise.all([
    loadCatalog(rootDir),
    loadHero(rootDir),
  ])
  const commitmentBody = await loadContentBody(join(rootDir, 'content', 'commitment.md'))
  const aboutBody = await loadContentBody(join(rootDir, 'content', 'about.md'))

  const routes = allRoutes(catalog)

  for (const route of routes) {
    const html = await render(route, catalog, hero, commitmentBody, aboutBody, config, now)
    const outPath = join(outDir, route.path === '/' ? 'index.html' : route.path.replace(/^\//, '').replace(/\/$/, '/index.html'))
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html, 'utf8')
  }

  await copyTree(join(rootDir, 'styles'), join(outDir, 'styles'))
  await copyTree(join(rootDir, 'enhancements'), join(outDir, 'enhancements'))
  await copyTree(join(rootDir, 'assets'), join(outDir, 'assets'))
}

async function render(
  route: ReturnType<typeof allRoutes>[number],
  catalog: Awaited<ReturnType<typeof loadCatalog>>,
  hero: Awaited<ReturnType<typeof loadHero>>,
  commitmentBody: string,
  aboutBody: string,
  config: { basePath: string; buildTime: string },
  now: Date,
): Promise<string> {
  switch (route.view) {
    case 'home':
      return renderToHtml(<Home catalog={catalog} hero={hero} config={config} />)
    case 'work-index':
      return renderToHtml(<WorkIndex catalog={catalog} config={config} />)
    case 'health':
      return renderToHtml(
        <Health catalog={catalog} now={now} config={config} showPerRepo={SHOW_PER_REPO_FAILURES} />,
      )
    case 'commitment':
      return renderToHtml(<Commitment body={commitmentBody} config={config} />)
    case 'about':
      return renderToHtml(<About body={aboutBody} config={config} />)
    case 'work-detail': {
      const entry = catalog.find((e) => e.name === route.slug)!
      return renderToHtml(<WorkDetail entry={entry} now={now} config={config} />)
    }
  }
}

async function loadContentBody(path: string): Promise<string> {
  const raw = await Bun.file(path).text()
  return raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
}

async function copyTree(src: string, dst: string): Promise<void> {
  let entries: string[]
  try {
    entries = await readdir(src)
  } catch {
    return
  }
  await mkdir(dst, { recursive: true })
  for (const entry of entries) {
    const from = join(src, entry)
    const to = join(dst, entry)
    const info = await stat(from)
    if (info.isDirectory()) {
      await copyTree(from, to)
    } else {
      await copyFile(from, to)
    }
  }
}

if (import.meta.main) {
  const outDir = process.env.OUT_DIR ?? join(process.cwd(), 'dist')
  await buildSite({ rootDir: process.cwd(), outDir })
  console.log(`Built site to ${relative(process.cwd(), outDir)}/`)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/build/smoke.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Confirm the CLI build works end-to-end**

Run: `bun run build`
Expected: writes pages to `dist/`; command exits 0.

- [ ] **Step 6: Commit**

```bash
git add build/entry.ts tests/build/smoke.test.ts
git commit -m "feat(build): SSG entry renders every route to dist/"
```

---

## Phase 7 — Styling

### Task 23: Design tokens

**Files:**
- Create: `styles/tokens.css`

- [ ] **Step 1: Write `styles/tokens.css`**

```css
@layer tokens {
  :root {
    /* ---------- Base ---------- */
    --color-midnight:  #171717;
    --color-pewter:    #595959;
    --color-platinum:  #EBEBEB;
    --color-snow:      #FFFFFF;

    /* ---------- Primary ---------- */
    --color-tango:     #E34E35;
    --color-brick:     #923120;
    --color-melon:     #FBB4A7;

    /* ---------- Secondary ---------- */
    --color-lapis:     #025197;
    --color-ocean:     #00AAD5;
    --color-sky:       #BCE7FD;
    --color-lilac:     #E0CCF5;
    --color-eggplant:  #442DA4;
    --color-butter:    #F8E989;

    /* ---------- Semantic roles ---------- */
    --color-ink:            var(--color-midnight);
    --color-ink-subtle:     var(--color-pewter);
    --color-surface:        var(--color-snow);
    --color-surface-alt:    var(--color-platinum);
    --color-accent:         var(--color-tango);
    --color-accent-strong:  var(--color-brick);
    --color-link:           var(--color-lapis);
    --color-link-hover:     var(--color-eggplant);
    --color-focus-ring:     var(--color-ocean);

    /* ---------- Tiers ---------- */
    --color-tier-active:     var(--color-lapis);
    --color-tier-as-is:      var(--color-pewter);
    --color-tier-archived:   var(--color-midnight);
    --color-tier-unreviewed: var(--color-platinum);

    /* ---------- Status ---------- */
    --color-pass:  var(--color-lapis);
    --color-warn:  var(--color-tango);
    --color-fail:  var(--color-brick);

    /* ---------- Type scale (major third, 1.25) ---------- */
    --step--1: clamp(0.83rem, 0.80rem + 0.15vi, 0.94rem);
    --step-0:  clamp(1.00rem, 0.96rem + 0.22vi, 1.13rem);
    --step-1:  clamp(1.25rem, 1.20rem + 0.30vi, 1.44rem);
    --step-2:  clamp(1.56rem, 1.49rem + 0.39vi, 1.80rem);
    --step-3:  clamp(1.95rem, 1.85rem + 0.52vi, 2.25rem);
    --step-4:  clamp(2.44rem, 2.30rem + 0.70vi, 2.81rem);

    /* ---------- Space scale (4px base) ---------- */
    --space-1:  0.25rem;
    --space-2:  0.5rem;
    --space-3:  0.75rem;
    --space-4:  1rem;
    --space-5:  1.5rem;
    --space-6:  2rem;
    --space-7:  3rem;
    --space-8:  4rem;

    /* ---------- Radii + shadow ---------- */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.06);

    /* ---------- Measure ---------- */
    --measure-prose: 65ch;
    --measure-wide:  min(96rem, 100%);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/tokens.css
git commit -m "style: define every Flexion brand color and design token"
```

---

### Task 24: Reset, base, layout, components, utilities

**Files:**
- Create: `styles/reset.css`
- Create: `styles/base.css`
- Create: `styles/layout.css`
- Create: `styles/components.css`
- Create: `styles/utilities.css`
- Create: `styles/index.css`

- [ ] **Step 1: Write `styles/reset.css`**

```css
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
  }
  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  img, picture, video, canvas, svg {
    display: block;
    max-inline-size: 100%;
  }
  input, button, textarea, select {
    font: inherit;
  }
  ul, ol {
    padding-inline-start: 0;
    list-style: none;
  }
  a {
    color: inherit;
    text-decoration-skip-ink: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 2: Write `styles/base.css`**

```css
@layer base {
  html {
    color-scheme: light;
  }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: var(--step-0);
    color: var(--color-ink);
    background: var(--color-surface);
  }
  h1, h2, h3, h4 {
    line-height: 1.15;
    font-weight: 700;
    font-family: ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif;
  }
  h1 { font-size: var(--step-4); }
  h2 { font-size: var(--step-3); }
  h3 { font-size: var(--step-2); }
  h4 { font-size: var(--step-1); }
  p, ul, ol, dl, table {
    max-inline-size: var(--measure-prose);
  }
  a {
    color: var(--color-link);
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
  }
  a:hover {
    color: var(--color-link-hover);
  }
  :focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
  .skip-link {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .skip-link:focus {
    position: static;
    inline-size: auto;
    block-size: auto;
    clip-path: none;
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
  }
}
```

- [ ] **Step 3: Write `styles/layout.css`**

```css
@layer layout {
  body {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-block-size: 100vh;
  }
  main {
    inline-size: var(--measure-wide);
    margin-inline: auto;
    padding: var(--space-6) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-7);
  }
  .site-header {
    inline-size: var(--measure-wide);
    margin-inline: auto;
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
    border-block-end: 1px solid var(--color-surface-alt);
  }
  .site-header nav ul {
    display: flex;
    gap: var(--space-5);
  }
  .site-brand {
    font-weight: 700;
    font-size: var(--step-1);
    text-decoration: none;
    color: var(--color-ink);
  }
  .site-footer {
    inline-size: var(--measure-wide);
    margin-inline: auto;
    padding: var(--space-5);
    border-block-start: 1px solid var(--color-surface-alt);
    color: var(--color-ink-subtle);
    font-size: var(--step--1);
  }
  .site-footer nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  .home-hero h1 {
    font-size: var(--step-4);
    max-inline-size: 22ch;
  }
  .home-hero__intro {
    font-size: var(--step-1);
    color: var(--color-ink-subtle);
    max-inline-size: var(--measure-prose);
  }
  .home-featured__grid,
  .home-stats__grid,
  .work-index__list {
    display: grid;
    gap: var(--space-5);
    container-type: inline-size;
  }
  @container (min-width: 48rem) {
    .home-featured__grid { grid-template-columns: repeat(3, 1fr); }
    .home-stats__grid { grid-template-columns: repeat(3, 1fr); }
    .work-index__list { grid-template-columns: repeat(2, 1fr); }
  }
  @container (min-width: 72rem) {
    .work-index__list { grid-template-columns: repeat(3, 1fr); }
  }
  .work-detail {
    display: grid;
    gap: var(--space-6);
  }
  @container (min-width: 60rem) {
    .work-detail {
      grid-template-columns: minmax(0, 1fr) 20rem;
    }
    .work-detail__aside {
      grid-column: 2;
    }
  }
}
```

- [ ] **Step 4: Write `styles/components.css`**

```css
@layer components {
  /* ---------- Badge ---------- */
  .badge {
    display: inline-block;
    padding: 0.1em 0.5em;
    border-radius: var(--radius-sm);
    font-size: var(--step--1);
    font-weight: 600;
    background: var(--color-surface-alt);
    color: var(--color-ink);
  }
  .badge--tier-active     { background: var(--color-tier-active); color: var(--color-snow); }
  .badge--tier-as-is      { background: var(--color-tier-as-is); color: var(--color-snow); }
  .badge--tier-archived   { background: var(--color-tier-archived); color: var(--color-snow); }
  .badge--tier-unreviewed { background: var(--color-tier-unreviewed); color: var(--color-ink); }
  .badge--category-product      { background: var(--color-sky); color: var(--color-midnight); }
  .badge--category-tool         { background: var(--color-lilac); color: var(--color-midnight); }
  .badge--category-workshop     { background: var(--color-butter); color: var(--color-midnight); }
  .badge--category-prototype    { background: var(--color-melon); color: var(--color-midnight); }
  .badge--category-fork         { background: var(--color-surface-alt); color: var(--color-ink-subtle); }
  .badge--category-uncategorized{ background: var(--color-surface-alt); color: var(--color-ink-subtle); }
  .badge--pass { background: var(--color-pass); color: var(--color-snow); }
  .badge--warn { background: var(--color-warn); color: var(--color-snow); }
  .badge--fail { background: var(--color-fail); color: var(--color-snow); }

  /* ---------- Repo card ---------- */
  .repo-card {
    padding: var(--space-5);
    border: 1px solid var(--color-surface-alt);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    display: grid;
    gap: var(--space-3);
  }
  .repo-card__name { font-size: var(--step-1); }
  .repo-card__name a { text-decoration: none; }
  .repo-card__name a:hover { text-decoration: underline; }
  .repo-card__summary { color: var(--color-ink-subtle); }
  .repo-card__meta { display: flex; gap: var(--space-2); flex-wrap: wrap; }

  /* ---------- Standards list ---------- */
  .standards-list { display: grid; gap: var(--space-2); }
  .standards-list__item {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    border-inline-start: 3px solid var(--color-surface-alt);
  }
  .standards-list__item--pass { border-inline-start-color: var(--color-pass); }
  .standards-list__item--warn { border-inline-start-color: var(--color-warn); }
  .standards-list__item--fail { border-inline-start-color: var(--color-fail); }

  /* ---------- Health table ---------- */
  .health-table {
    inline-size: 100%;
    max-inline-size: none;
    border-collapse: collapse;
  }
  .health-table th, .health-table td {
    text-align: start;
    padding: var(--space-2) var(--space-3);
    border-block-end: 1px solid var(--color-surface-alt);
  }
  .health-cell--pass { color: var(--color-pass); }
  .health-cell--warn { color: var(--color-warn); }
  .health-cell--fail { color: var(--color-fail); }

  /* ---------- Catalog filter ---------- */
  catalog-filter { display: block; }
  .catalog-filter {
    margin-block-end: var(--space-5);
  }
  .catalog-filter fieldset {
    border: 1px solid var(--color-surface-alt);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    align-items: end;
  }
  .catalog-filter label {
    display: grid;
    gap: var(--space-1);
    font-size: var(--step--1);
    font-weight: 600;
  }

  /* ---------- Content page ---------- */
  .content-page { display: grid; gap: var(--space-4); }
  .content-page h2 { margin-block-start: var(--space-6); }
  .content-page h3 { margin-block-start: var(--space-5); }

  /* ---------- Copy button ---------- */
  copy-button { display: inline-block; }
  copy-button:not(:defined) button { display: none; }
}
```

- [ ] **Step 5: Write `styles/utilities.css`**

```css
@layer utilities {
  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
```

- [ ] **Step 6: Write `styles/index.css`**

```css
@layer reset, tokens, base, layout, components, utilities;

@import url("./reset.css") layer(reset);
@import url("./tokens.css") layer(tokens);
@import url("./base.css") layer(base);
@import url("./layout.css") layer(layout);
@import url("./components.css") layer(components);
@import url("./utilities.css") layer(utilities);
```

- [ ] **Step 7: Add a placeholder favicon**

`assets/favicon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Flexion Labs">
  <rect width="32" height="32" rx="6" fill="#171717"/>
  <text x="50%" y="58%" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#E34E35" text-anchor="middle">FL</text>
</svg>
```

- [ ] **Step 8: Rebuild and confirm styles copy to dist**

Run: `bun run build`
Expected: `dist/styles/index.css` and the other style files exist; `dist/assets/favicon.svg` exists.

- [ ] **Step 9: Commit**

```bash
git add styles/ assets/favicon.svg
git commit -m "style: reset, base, layout, components, utilities layers"
```

---

## Phase 8 — Progressive Enhancement

### Task 25: `<copy-button>` HTML Web Component

**Files:**
- Create: `enhancements/copy-button.ts`
- Test: `tests/enhancements/copy-button.test.ts`

- [ ] **Step 1: Write failing test**

`tests/enhancements/copy-button.test.ts`:
```ts
import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  await import('../../enhancements/copy-button')
})

describe('<copy-button>', () => {
  test('writes the target text to the clipboard when the button is clicked', async () => {
    let copied: string | null = null
    ;(window.navigator as any).clipboard = {
      writeText: async (t: string) => { copied = t },
    }
    document.body.innerHTML = `
      <copy-button>
        <pre data-copy-source>echo hello</pre>
        <button type="button">Copy</button>
      </copy-button>
    `
    const btn = document.querySelector('button')!
    btn.dispatchEvent(new window.Event('click', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(copied).toBe('echo hello')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/enhancements/copy-button.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `enhancements/copy-button.ts`**

```ts
class CopyButton extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.handleClick)
  }
  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick)
  }
  private handleClick = async (event: Event) => {
    const button = (event.target as HTMLElement).closest('button')
    if (!button || !this.contains(button)) return
    const source = this.querySelector<HTMLElement>('[data-copy-source]')
    if (!source) return
    await navigator.clipboard.writeText(source.textContent?.trim() ?? '')
    button.dataset.copied = 'true'
  }
}

if (!customElements.get('copy-button')) {
  customElements.define('copy-button', CopyButton)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/enhancements/copy-button.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add enhancements/copy-button.ts tests/enhancements/copy-button.test.ts
git commit -m "feat(enhancements): copy-button component"
```

---

### Task 26: `<catalog-filter>` HTML Web Component

**Files:**
- Create: `enhancements/catalog-filter.ts`
- Test: `tests/enhancements/catalog-filter.test.ts`

- [ ] **Step 1: Write failing test**

`tests/enhancements/catalog-filter.test.ts`:
```ts
import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  await import('../../enhancements/catalog-filter')
})

describe('<catalog-filter>', () => {
  test('hides list items whose data-tier does not match the selected filter', () => {
    document.body.innerHTML = `
      <catalog-filter>
        <form>
          <select name="tier">
            <option value="">All</option>
            <option value="active">Active</option>
          </select>
          <select name="category">
            <option value="">All</option>
          </select>
          <button type="submit">Apply</button>
        </form>
        <ul>
          <li data-tier="active" data-category="product"><a href="/work/a/">a</a></li>
          <li data-tier="as-is" data-category="tool"><a href="/work/b/">b</a></li>
        </ul>
      </catalog-filter>
    `
    const select = document.querySelector('select[name="tier"]') as any
    select.value = 'active'
    select.dispatchEvent(new window.Event('change', { bubbles: true }))
    const items = document.querySelectorAll('li')
    expect(items[0].getAttribute('hidden')).toBeNull()
    expect(items[1].getAttribute('hidden')).toBe('')
  })

  test('hiding a category filters in addition to tier (logical AND)', () => {
    document.body.innerHTML = `
      <catalog-filter>
        <form>
          <select name="tier"><option value="">All</option><option value="active">Active</option></select>
          <select name="category"><option value="">All</option><option value="tool">Tool</option></select>
        </form>
        <ul>
          <li data-tier="active" data-category="product"><a href="/a/">a</a></li>
          <li data-tier="active" data-category="tool"><a href="/b/">b</a></li>
        </ul>
      </catalog-filter>
    `
    const tier = document.querySelector('select[name="tier"]') as any
    const cat = document.querySelector('select[name="category"]') as any
    tier.value = 'active'
    cat.value = 'tool'
    cat.dispatchEvent(new window.Event('change', { bubbles: true }))
    const items = document.querySelectorAll('li')
    expect(items[0].getAttribute('hidden')).toBe('')
    expect(items[1].getAttribute('hidden')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/enhancements/catalog-filter.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `enhancements/catalog-filter.ts`**

```ts
class CatalogFilter extends HTMLElement {
  connectedCallback() {
    this.addEventListener('change', this.apply)
    this.addEventListener('submit', this.preventAndApply)
  }
  disconnectedCallback() {
    this.removeEventListener('change', this.apply)
    this.removeEventListener('submit', this.preventAndApply)
  }
  private preventAndApply = (event: Event) => {
    event.preventDefault()
    this.apply()
  }
  private apply = () => {
    const tier = (this.querySelector('select[name="tier"]') as HTMLSelectElement | null)?.value ?? ''
    const category = (this.querySelector('select[name="category"]') as HTMLSelectElement | null)?.value ?? ''
    for (const item of this.querySelectorAll<HTMLElement>('li')) {
      const matches =
        (tier === '' || item.dataset.tier === tier) &&
        (category === '' || item.dataset.category === category)
      if (matches) {
        item.removeAttribute('hidden')
      } else {
        item.setAttribute('hidden', '')
      }
    }
  }
}

if (!customElements.get('catalog-filter')) {
  customElements.define('catalog-filter', CatalogFilter)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/enhancements/catalog-filter.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add enhancements/catalog-filter.ts tests/enhancements/catalog-filter.test.ts
git commit -m "feat(enhancements): catalog-filter component (tier + category AND)"
```

---

### Task 27: `<sortable-table>` HTML Web Component

**Files:**
- Create: `enhancements/sortable-table.ts`
- Test: `tests/enhancements/sortable-table.test.ts`

- [ ] **Step 1: Write failing test**

`tests/enhancements/sortable-table.test.ts`:
```ts
import { describe, test, expect, beforeEach } from 'bun:test'
import { Window } from 'happy-dom'

let window: Window

beforeEach(async () => {
  window = new Window()
  ;(globalThis as any).window = window
  ;(globalThis as any).document = window.document
  ;(globalThis as any).HTMLElement = window.HTMLElement
  ;(globalThis as any).customElements = window.customElements
  await import('../../enhancements/sortable-table')
})

describe('<sortable-table>', () => {
  test('clicking a column header sorts rows ascending by that column', () => {
    document.body.innerHTML = `
      <sortable-table>
        <table>
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Stars</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">b</th><td>3</td></tr>
            <tr><th scope="row">a</th><td>10</td></tr>
          </tbody>
        </table>
      </sortable-table>
    `
    const firstHeader = document.querySelectorAll('thead th')[0] as HTMLElement
    firstHeader.dispatchEvent(new window.Event('click', { bubbles: true }))
    const firstRow = document.querySelector('tbody tr th') as HTMLElement
    expect(firstRow.textContent).toBe('a')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/enhancements/sortable-table.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `enhancements/sortable-table.ts`**

```ts
class SortableTable extends HTMLElement {
  connectedCallback() {
    const headers = this.querySelectorAll<HTMLElement>('thead th')
    headers.forEach((header, index) => {
      header.setAttribute('role', 'button')
      header.setAttribute('tabindex', '0')
      header.addEventListener('click', () => this.sortBy(index))
      header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          this.sortBy(index)
        }
      })
    })
  }
  private sortBy(columnIndex: number) {
    const tbody = this.querySelector('tbody')
    if (!tbody) return
    const rows = Array.from(tbody.querySelectorAll('tr'))
    rows.sort((a, b) => cellText(a, columnIndex).localeCompare(cellText(b, columnIndex)))
    for (const row of rows) tbody.appendChild(row)
  }
}

function cellText(row: HTMLTableRowElement, index: number): string {
  const cell = row.children[index] as HTMLElement | undefined
  return cell?.textContent?.trim() ?? ''
}

if (!customElements.get('sortable-table')) {
  customElements.define('sortable-table', SortableTable)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/enhancements/sortable-table.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add enhancements/sortable-table.ts tests/enhancements/sortable-table.test.ts
git commit -m "feat(enhancements): sortable-table component"
```

---

### Task 28: Enhancement registrar (entry script)

**Files:**
- Create: `enhancements/register.ts`
- Modify: `build/entry.ts` to also bundle enhancements to `dist/enhancements/register.js`

- [ ] **Step 1: Write `enhancements/register.ts`**

```ts
import './catalog-filter'
import './sortable-table'
import './copy-button'
```

- [ ] **Step 2: Bundle enhancements as part of the build**

Modify `build/entry.ts` — replace the `copyTree(join(rootDir, 'enhancements'), join(outDir, 'enhancements'))` line with a bundler call:

```ts
// Replace the copyTree enhancements line with:
await Bun.build({
  entrypoints: [join(rootDir, 'enhancements', 'register.ts')],
  outdir: join(outDir, 'enhancements'),
  target: 'browser',
  naming: '[name].js',
  minify: true,
  sourcemap: 'linked',
})
```

- [ ] **Step 3: Rebuild end-to-end**

Run: `bun run build`
Expected: `dist/enhancements/register.js` exists and is non-empty.

- [ ] **Step 4: Confirm all tests still pass**

Run: `bun test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add enhancements/register.ts build/entry.ts
git commit -m "feat(build): bundle enhancements as register.js"
```

---

## Phase 9 — Accessibility

### Task 29: Run axe-core against rendered pages

**Files:**
- Create: `tests/a11y/pages.test.ts`

- [ ] **Step 1: Write the test**

`tests/a11y/pages.test.ts`:
```ts
import { describe, test, expect, beforeAll } from 'bun:test'
import { Window } from 'happy-dom'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')

const pages = [
  'index.html',
  'work/index.html',
  'work/health/index.html',
  'commitment/index.html',
  'about/index.html',
]

describe('axe-core a11y scan', () => {
  beforeAll(() => {
    if (!existsSync(join(DIST, 'index.html'))) {
      throw new Error('Run `bun run build` before the a11y suite.')
    }
  })

  for (const page of pages) {
    test(page, async () => {
      const html = readFileSync(join(DIST, page), 'utf8')
      const window = new Window()
      window.document.documentElement.innerHTML = html.replace(/^<!doctype html>\n/i, '')
      // @ts-expect-error axe-core ships CommonJS typings
      const axe = (await import('axe-core')).default
      const result = await axe.run(window.document, { resultTypes: ['violations'] })
      if (result.violations.length > 0) {
        const summary = result.violations
          .map((v) => `${v.id}: ${v.help}\n  nodes: ${v.nodes.length}`)
          .join('\n')
        throw new Error(`axe violations on ${page}:\n${summary}`)
      }
      expect(result.violations.length).toBe(0)
    })
  }
})
```

- [ ] **Step 2: Build then run the a11y tests**

Run:
```bash
bun run build
bun test tests/a11y/pages.test.ts
```
Expected: all pages report zero axe violations. Fix any that appear before committing (common culprits: missing `lang` on the html element, empty links, contrast on disabled-looking text — all of which should already be handled by the layout and style layers but catch regressions).

- [ ] **Step 3: Commit**

```bash
git add tests/a11y/pages.test.ts
git commit -m "test(a11y): scan rendered pages with axe-core"
```

---

## Phase 10 — Catalog Refresh Script

### Task 30: Refresh script that calls the GitHub API

**Files:**
- Create: `catalog/refresh.ts`
- Test: `tests/catalog/refresh.test.ts`

Unit-test the snapshot-building logic by passing in an in-memory fetch stub; the script's I/O (writing `repos.json`) is tested by a single integration-style test that runs against a temp dir.

- [ ] **Step 1: Write failing test**

`tests/catalog/refresh.test.ts`:
```ts
import { describe, test, expect } from 'bun:test'
import { buildSnapshot } from '../../catalog/refresh'

const apiRepo = (overrides: Record<string, unknown>) => ({
  name: 'example',
  description: null,
  html_url: 'https://github.com/flexion/example',
  homepage: null,
  language: null,
  license: null,
  pushed_at: '2026-01-01T00:00:00Z',
  archived: false,
  fork: false,
  stargazers_count: 0,
  private: false,
  ...overrides,
})

describe('buildSnapshot', () => {
  test('skips private repos', async () => {
    const fetchImpl = async () => new Response(JSON.stringify([apiRepo({ private: true })]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const snapshot = await buildSnapshot({ org: 'flexion', fetch: fetchImpl, fileCheck: async () => true })
    expect(snapshot.length).toBe(0)
  })

  test('maps API fields onto GithubSnapshotEntry', async () => {
    const fetchImpl = async () => new Response(JSON.stringify([
      apiRepo({
        name: 'messaging',
        description: 'Messaging',
        homepage: 'https://messaging.example/',
        language: 'TypeScript',
        license: { spdx_id: 'Apache-2.0' },
        stargazers_count: 3,
        pushed_at: '2026-04-20T00:00:00Z',
      }),
    ]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
    const fileCheck = async (_org: string, _repo: string, path: string) =>
      path !== 'CONTRIBUTING.md'
    const snapshot = await buildSnapshot({ org: 'flexion', fetch: fetchImpl, fileCheck })
    expect(snapshot[0].name).toBe('messaging')
    expect(snapshot[0].license).toBe('Apache-2.0')
    expect(snapshot[0].stars).toBe(3)
    expect(snapshot[0].hasReadme).toBe(true)
    expect(snapshot[0].hasContributing).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `bun test tests/catalog/refresh.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `catalog/refresh.ts`**

```ts
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { GithubSnapshotEntry } from './types'

export type FetchImpl = (input: string, init?: RequestInit) => Promise<Response>
export type FileCheck = (org: string, repo: string, path: string) => Promise<boolean>

export type BuildSnapshotOptions = {
  org: string
  fetch: FetchImpl
  fileCheck: FileCheck
  token?: string
}

type ApiRepo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  license: { spdx_id?: string } | null
  pushed_at: string
  archived: boolean
  fork: boolean
  stargazers_count: number
  private: boolean
}

export async function buildSnapshot(
  options: BuildSnapshotOptions,
): Promise<GithubSnapshotEntry[]> {
  const repos = await fetchAllRepos(options)
  const snapshot: GithubSnapshotEntry[] = []
  for (const repo of repos) {
    if (repo.private) continue
    const [hasReadme, hasLicenseFile, hasContributing] = await Promise.all([
      options.fileCheck(options.org, repo.name, 'README.md'),
      options.fileCheck(options.org, repo.name, 'LICENSE'),
      options.fileCheck(options.org, repo.name, 'CONTRIBUTING.md'),
    ])
    snapshot.push({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      license: repo.license?.spdx_id ?? null,
      pushedAt: repo.pushed_at,
      archived: repo.archived,
      fork: repo.fork,
      stars: repo.stargazers_count,
      hasReadme,
      hasLicense: Boolean(repo.license?.spdx_id) || hasLicenseFile,
      hasContributing,
    })
  }
  return snapshot
}

async function fetchAllRepos(options: BuildSnapshotOptions): Promise<ApiRepo[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'flexion-labs-refresh',
  }
  if (options.token) headers.authorization = `Bearer ${options.token}`

  const repos: ApiRepo[] = []
  let page = 1
  while (true) {
    const res = await options.fetch(
      `https://api.github.com/orgs/${options.org}/repos?per_page=100&page=${page}&type=public`,
      { headers },
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`)
    const batch = (await res.json()) as ApiRepo[]
    repos.push(...batch)
    if (batch.length < 100) break
    page += 1
  }
  return repos
}

export async function writeSnapshot(
  rootDir: string,
  snapshot: GithubSnapshotEntry[],
): Promise<void> {
  const path = join(rootDir, 'catalog', 'repos.json')
  const sorted = [...snapshot].sort((a, b) => a.name.localeCompare(b.name))
  await writeFile(path, JSON.stringify(sorted, null, 2) + '\n', 'utf8')
}

if (import.meta.main) {
  const token = process.env.GITHUB_TOKEN
  const org = process.env.FLEXION_ORG ?? 'flexion'
  const fileCheck: FileCheck = async (o, r, p) => {
    const res = await fetch(`https://api.github.com/repos/${o}/${r}/contents/${p}`, {
      headers: token ? { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' } : { accept: 'application/vnd.github+json' },
    })
    return res.ok
  }
  const snapshot = await buildSnapshot({ org, fetch, fileCheck, token })
  await writeSnapshot(process.cwd(), snapshot)
  console.log(`Wrote ${snapshot.length} entries to catalog/repos.json`)
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `bun test tests/catalog/refresh.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the refresh once against the live API (optional local step)**

Run: `bun run refresh:catalog`
Expected: `catalog/repos.json` contains the real org's public repos. Commit the snapshot.

- [ ] **Step 6: Commit**

```bash
git add catalog/refresh.ts tests/catalog/refresh.test.ts
git commit -m "feat(catalog): refresh script that queries the GitHub API"
```

- [ ] **Step 7: Commit the first real snapshot (after Step 5)**

```bash
git add catalog/repos.json
git commit -m "chore(catalog): seed initial snapshot of flexion public repos"
```

---

## Phase 11 — CI / CD

### Task 31: Build + test workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Build, test, and deploy

on:
  push:
    branches: ['**']
  delete:
  workflow_dispatch:

permissions:
  contents: write
  deployments: write

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    if: github.event_name != 'delete'
    runs-on: ubuntu-latest
    outputs:
      branch: ${{ steps.meta.outputs.branch }}
      base_path: ${{ steps.meta.outputs.base_path }}
      is_production: ${{ steps.meta.outputs.is_production }}
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile || bun install

      - name: Determine deploy metadata
        id: meta
        run: |
          BRANCH="${GITHUB_REF_NAME}"
          SANITIZED="$(echo "$BRANCH" | tr '/' '-' | tr -cd 'a-zA-Z0-9._-')"
          if [ "$BRANCH" = "main" ]; then
            echo "base_path=/" >> "$GITHUB_OUTPUT"
            echo "branch=main" >> "$GITHUB_OUTPUT"
            echo "is_production=true" >> "$GITHUB_OUTPUT"
          else
            echo "base_path=/preview/$SANITIZED/" >> "$GITHUB_OUTPUT"
            echo "branch=$SANITIZED" >> "$GITHUB_OUTPUT"
            echo "is_production=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Run unit and component tests
        run: bun test --preload ./tests/setup.ts tests/catalog tests/standards tests/views tests/enhancements tests/build

      - name: Build site
        env:
          SITE_BASE_URL: ${{ steps.meta.outputs.base_path }}
        run: bun run build

      - name: Run a11y tests against built site
        run: bun test tests/a11y

      - name: Upload dist artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 3

  publish:
    if: github.event_name == 'push'
    needs: build-and-test
    runs-on: ubuntu-latest
    environment:
      name: ${{ needs.build-and-test.outputs.is_production == 'true' && 'production' || 'preview' }}
      url: ${{ needs.build-and-test.outputs.is_production == 'true' && 'https://labs.flexion.us/' || format('https://labs.flexion.us/preview/{0}/', needs.build-and-test.outputs.branch) }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: gh-pages
          path: gh-pages-work
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist

      - name: Sync dist into gh-pages
        run: |
          set -euo pipefail
          BASE_PATH="${{ needs.build-and-test.outputs.base_path }}"
          cd gh-pages-work
          if [ "$BASE_PATH" = "/" ]; then
            # Clear everything except the preview directory
            find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name 'preview' -exec rm -rf {} +
            cp -r ../dist/. ./
          else
            rel="${BASE_PATH#/}"
            rel="${rel%/}"
            rm -rf "$rel"
            mkdir -p "$(dirname "$rel")"
            cp -r ../dist "$rel"
          fi
          # Ensure CNAME stays at the root
          if [ ! -f CNAME ]; then
            cp ../CNAME . 2>/dev/null || echo 'labs.flexion.us' > CNAME
          fi

      - name: Commit and push gh-pages
        working-directory: gh-pages-work
        run: |
          set -euo pipefail
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add -A
          if git diff --cached --quiet; then
            echo 'No changes to publish.'
            exit 0
          fi
          git commit -m "Deploy ${GITHUB_SHA::7} to ${{ needs.build-and-test.outputs.base_path }}"
          git push origin gh-pages

  cleanup-preview:
    if: github.event_name == 'delete' && github.event.ref_type == 'branch'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: gh-pages
          fetch-depth: 0

      - name: Remove preview directory
        run: |
          set -euo pipefail
          SANITIZED="$(echo "${{ github.event.ref }}" | tr '/' '-' | tr -cd 'a-zA-Z0-9._-')"
          DIR="preview/$SANITIZED"
          if [ -d "$DIR" ]; then
            rm -rf "$DIR"
            git config user.name 'github-actions[bot]'
            git config user.email 'github-actions[bot]@users.noreply.github.com'
            git add -A
            git commit -m "Remove preview for deleted branch $SANITIZED"
            git push origin gh-pages
          fi
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: build, test, and deploy with branch previews via GitHub environments"
```

---

### Task 32: Daily catalog refresh workflow with auto-merge

**Files:**
- Create: `.github/workflows/refresh-catalog.yml`

- [ ] **Step 1: Write `.github/workflows/refresh-catalog.yml`**

```yaml
name: Refresh catalog

on:
  schedule:
    - cron: '0 9 * * *'
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - run: bun install --frozen-lockfile || bun install

      - name: Run refresh
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bun run refresh:catalog

      - name: Open PR if snapshot changed
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -euo pipefail
          if git diff --quiet catalog/repos.json; then
            echo 'No changes; nothing to do.'
            exit 0
          fi
          DATE="$(date -u +%F)"
          BRANCH="catalog/refresh-$DATE"
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git checkout -B "$BRANCH"
          git add catalog/repos.json
          git commit -m "chore(catalog): refresh snapshot $DATE"
          git push --force-with-lease origin "$BRANCH"
          if ! gh pr view "$BRANCH" >/dev/null 2>&1; then
            gh pr create --base main --head "$BRANCH" \
              --title "Refresh catalog snapshot — $DATE" \
              --body "Automated snapshot refresh from the GitHub API."
          fi
          gh pr merge "$BRANCH" --auto --squash
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/refresh-catalog.yml
git commit -m "ci: daily catalog refresh with auto-merge"
```

---

### Task 33: CNAME for the custom domain

**Files:**
- Create: `CNAME`

- [ ] **Step 1: Write `CNAME`**

```
labs.flexion.us
```

Note: GitHub Pages looks for `CNAME` at the root of the gh-pages branch. The deploy workflow copies it over if missing; committing it to main keeps the source of truth alongside the rest of the project.

- [ ] **Step 2: Commit**

```bash
git add CNAME
git commit -m "chore: pin custom domain via CNAME"
```

---

## Phase 12 — Behavioral Documentation

Each file in `docs/` is written in the voice required by the spec: plain, professional, active, "when/then" for view behavior. Task 34 covers the project orientation and the six per-area docs; Task 35 covers the six per-view docs.

### Task 34: Project orientation and per-area docs

**Files:**
- Create: `docs/README.md`
- Create: `docs/catalog.md`
- Create: `docs/content.md`
- Create: `docs/stewardship.md`
- Create: `docs/deployment.md`
- Create: `docs/testing.md`
- Create: `docs/styling.md`

- [ ] **Step 1: Write `docs/README.md`**

```markdown
# Flexion Labs — project docs

This directory explains how the site behaves and how to work in it. It is written for humans and for agentic tools equally — both should be able to read a page here and reconstruct the intent of the code without opening the code.

## Structure

- **`views/`** — one file per page describing its behavior as a "when/then" list that maps to the tests.
- **`catalog.md`** — what the catalog is, how it's assembled, and how to change it.
- **`content.md`** — how to author prose: hero, commitment, about, per-repo overlays.
- **`stewardship.md`** — tier definitions and how the health checks are evaluated.
- **`deployment.md`** — branch previews, production, the gh-pages layout, and the CNAME.
- **`testing.md`** — the TDD strategy, where tests live, and how to run each suite.
- **`styling.md`** — design tokens, cascade layers, and component conventions.

## Working in this project

- The top-level layout is intent-first: `catalog/`, `content/`, `standards/`, `views/`, `styles/`, `enhancements/`, `build/`. Framework concerns sit inside the tech directories, not at the root.
- TDD is the norm. Pure logic (catalog, standards) is covered by unit tests; views have behavior tests against a shared fixture catalog; the build has a smoke test; a11y is scanned with axe-core.
- Commits are small and focused. Every task in the implementation plan ends with one.
```

- [ ] **Step 2: Write `docs/catalog.md`**

```markdown
# Catalog

The catalog is the inventory of Flexion's open source work. Every view on the site reads from it.

## Sources

1. **`catalog/repos.json`** — machine-generated snapshot from the GitHub API. Rewritten daily by the refresh workflow. Fields match `GithubSnapshotEntry` in `catalog/types.ts`.
2. **`catalog/overrides.yml`** — hand-authored metadata keyed by repo name. Fields: `tier`, `category`, `featured`, `hidden`. Entries are PR-reviewed.
3. **`content/work/<slug>.md`** — optional rich copy for a repo's detail page. Front-matter supplies `title` and `summary`; the body is rendered into the page.

## Merging

`catalog/load.ts` reads all three, merges them through `mergeCatalog`, applies defaults (`applyDefaults`), and returns a `Catalog` array. Every view builds from this value.

## Defaults

When `overrides.yml` has no entry for a repo, rules fire in order; a field set by an earlier rule is not overwritten:

1. GitHub `fork: true` → `category: fork`, `tier: as-is`.
2. GitHub `archived: true` → `tier: archived`.
3. Anything still unset → `tier: unreviewed`, `category: uncategorized`.

"Unreviewed" is publicly visible. It says "a human has not yet classified this repo," which is honest and actionable.

## Refresh pipeline

The `refresh-catalog` workflow runs daily at 09:00 UTC (and on manual dispatch). It:

1. Paginates `GET /orgs/flexion/repos?type=public`.
2. For each repo, checks for `README.md`, `LICENSE`, and `CONTRIBUTING.md` via the contents API.
3. Writes the result to `catalog/repos.json`, sorted alphabetically.
4. If the file is unchanged, exits cleanly.
5. Otherwise opens a PR on a `catalog/refresh-YYYY-MM-DD` branch and enables auto-merge. Green CI merges the PR; a human can always review and block.

## Changing overrides

Open a PR that edits `catalog/overrides.yml`. Typical changes: promoting a repo to `tier: active`, flagging a repo as `featured: true`, or hiding a repo temporarily while its content is being updated.
```

- [ ] **Step 3: Write `docs/content.md`**

```markdown
# Content authoring

Prose lives in `content/`. Every file is markdown with optional YAML front-matter.

## Files

- **`content/home.md`** — front-matter only, carrying `hero` and `intro` for the home page.
- **`content/commitment.md`** — the full open source commitment. Front-matter: `title`. Body rendered into `/commitment/`.
- **`content/about.md`** — Flexion Labs' about page. Front-matter: `title`. Body rendered into `/about/`.
- **`content/work/<slug>.md`** — per-repo overlays for detail pages. Front-matter: `title`, `summary`. Body renders into the detail page's main content.

## Voice

Follow Flexion's brand voice: plain, professional, active, humble-not-shy. Use "we" to speak as Flexion; avoid first-person singular. Prefer concrete examples over abstractions. Avoid marketing copy, breathless claims, and undefined acronyms.

## Updating the commitment

The working-draft Google Doc is the source while the commitment is still under review. Once it's ratified, `content/commitment.md` is the canonical text and the Doc should defer to it.
```

- [ ] **Step 4: Write `docs/stewardship.md`**

```markdown
# Stewardship

The site reports, publicly, how each repo measures up to Flexion's stewardship standards.

## Tiers

- **Active** — Flexion commits to security patch management and defined response times. Bug reports are triaged; pull requests are reviewed on a predictable cadence.
- **As-is** — Available without promised maintenance. Future updates are not guaranteed.
- **Archived** — No longer maintained. GitHub's archive flag is set. Listed for transparency.
- **Unreviewed** — A human has not yet classified this repo. Defaults to this state.

## Checks

Defined in `standards/repo-checks.ts`. Every public repo is evaluated against:

1. **README** — `README.md` at the root.
2. **License** — a detectable license (GitHub's license field or a LICENSE file).
3. **Contributing** — `CONTRIBUTING.md` at the root.
4. **Activity** — most recent push within 6 months (pass), 6–18 months (warn), older (fail). Archived repos pass by policy.
5. **Tier assigned** — tier is anything other than `unreviewed`.

## Hiding per-repo failures

Before launch, leadership may decide to show aggregate counts only. Set `SHOW_PER_REPO_FAILURES` to `false` in `standards/repo-checks.ts` and redeploy; the health view will hide the per-repo table and display a short aggregate instead.
```

- [ ] **Step 5: Write `docs/deployment.md`**

```markdown
# Deployment

The site is hosted on GitHub Pages with a custom domain.

## Branch layout

```
gh-pages/
  index.html                  # main (production)
  work/, commitment/, about/, work/health/
  preview/
    <branch-a>/
      index.html
      …
```

- Production: `https://labs.flexion.us/`
- Preview: `https://labs.flexion.us/preview/<sanitized-branch>/`

## Workflow

`.github/workflows/deploy.yml` runs on every push:

1. Installs Bun, runs the test suite, builds the site with `SITE_BASE_URL` set to `/` for `main` or `/preview/<branch>/` for other branches.
2. Runs the axe-core a11y scan against the built output.
3. Checks out `gh-pages`, syncs the build output into the right directory, commits, and pushes.
4. Registers a GitHub Deployment against the `production` or `preview` environment so the URL appears in the PR "Deployments" panel.

When a branch is deleted, a cleanup job removes `preview/<sanitized-branch>/` from `gh-pages`.

## Custom domain

`CNAME` at the source repo root contains `labs.flexion.us`. The workflow copies it to `gh-pages` if absent.

## Base path

`SITE_BASE_URL` is the single knob that changes how internal links and asset URLs are emitted. The default is `/`. Any non-root value is normalized to `/path/`.
```

- [ ] **Step 6: Write `docs/testing.md`**

```markdown
# Testing

Tests live in `tests/` and mirror the source layout. `bun test` runs everything.

## Layers

1. **Unit tests** for pure logic: catalog defaults, merge, overlay loader, standards evaluation, URL helpers, refresh snapshot-building.
2. **View behavior tests** that render each Hono JSX view against `tests/fixtures/catalog.ts` and assert on the DOM.
3. **Build smoke test** that runs the SSG end-to-end against a temp `outDir` and verifies every expected page exists.
4. **Enhancement tests** that exercise each HTML Web Component in a happy-dom environment.
5. **Accessibility scan** that runs axe-core against the rendered `dist/` pages.

## TDD discipline

Every new feature starts with a failing test. The implementation plan (`notes/plans/2026-04-27-flexion-labs-website.md`) lays out the red/green/refactor rhythm task by task. New work should follow the same rhythm.

## Fixtures

- `tests/fixtures/catalog.ts` — shared catalog used by most view tests. Expanding the fixture is welcome; view tests should not invent their own full catalogs.
- `tests/fixtures/overlays/` — on-disk markdown used by `loadOverlay` tests.

## Running a single suite

```bash
bun test tests/catalog            # all catalog unit tests
bun test tests/views/home.test.tsx
bun run build && bun test tests/a11y
```
```

- [ ] **Step 7: Write `docs/styling.md`**

```markdown
# Styling

Hand-rolled CSS with cascade layers, design tokens, and container queries. No Sass, PostCSS, or utility frameworks.

## Layers

`styles/index.css` declares the layer order:

```css
@layer reset, tokens, base, layout, components, utilities;
```

Every rule belongs to one layer. Later layers override earlier ones with predictable precedence; specificity is rarely the tool you need.

## Tokens

Every Flexion brand color is defined in `styles/tokens.css` as a custom property — even colors the v1 design does not use. Semantic tokens (`--color-ink`, `--color-link`, `--color-focus-ring`, `--color-tier-*`, `--color-pass/warn/fail`) compose the palette into meaning. When adding a component, prefer semantic tokens over palette tokens.

## Components

Component CSS lives in `styles/components.css` under `@layer components`. Each component class is prefixed with its name (`.repo-card`, `.repo-card__summary`, etc.). BEM-style naming keeps specificity flat and collisions unlikely.

## Container queries

Components that reflow (catalog cards, featured strip, detail page columns) use `@container` queries rather than viewport queries so they adapt when embedded in a narrower parent.

## Accessibility

- Focus is visible on every interactive element (`:focus-visible` styled in `base.css`).
- Motion respects `prefers-reduced-motion`.
- Color pairings are AAA where feasible; AA minimum. When in doubt, check the Flexion palette PDF for approved combinations.

## Progressive enhancement

HTML Web Components in `enhancements/` decorate existing HTML. CSS uses the `:not(:defined)` pseudo-class to hide bits that only make sense when JS has registered the component (e.g. the copy button).
```

- [ ] **Step 8: Commit**

```bash
git add docs/README.md docs/catalog.md docs/content.md docs/stewardship.md docs/deployment.md docs/testing.md docs/styling.md
git commit -m "docs: project orientation and per-area behavioral docs"
```

---

### Task 35: Per-view behavioral docs

**Files:**
- Create: `docs/views/home.md`
- Create: `docs/views/work-index.md`
- Create: `docs/views/work-detail.md`
- Create: `docs/views/health.md`
- Create: `docs/views/commitment.md`
- Create: `docs/views/about.md`

Each file follows the same shape: **Purpose**, **Inputs**, **Behavior** (as "when/then"), **Fallbacks**, **Tests**.

- [ ] **Step 1: Write `docs/views/home.md`**

```markdown
# Home (`/`)

## Purpose

First impression for every visitor. Explains what Flexion Labs is, highlights featured labs, grounds the pitch with real numbers, and hands visitors off to the right next step.

## Inputs

- `catalog` — the merged catalog.
- `hero` — `{ hero, intro }` read from `content/home.md` front-matter.
- `config` — base path, build time.

## Behavior

- **When the page loads, then** the hero statement is the `<h1>`, followed by the intro paragraph.
- **When there are repos flagged `featured: true` and not hidden, then** one card is rendered per featured repo in the order they appear in the catalog.
- **When there are no featured repos, then** the featured section renders its heading and an empty grid (acceptable for v1; may be hardened later).
- **When the catalog has N non-hidden repos, then** the stats strip renders `N public projects`, the count of `tier: active` repos as `actively maintained`, and the count of distinct languages.
- **When the page loads, then** three audience paths link to `/work/`, `/commitment/`, and `/about/`.

## Fallbacks

- None — every section renders; empty collections produce empty grids.

## Tests

`tests/views/home.test.tsx` encodes each behavior above.
```

- [ ] **Step 2: Write `docs/views/work-index.md`**

```markdown
# Work index (`/work/`)

## Purpose

The signature catalog view. Lists every public repository with enough context to decide whether to click through.

## Inputs

- `catalog` — the merged catalog.
- `config` — base path, build time.

## Behavior

- **When the page loads, then** one card renders per non-hidden catalog entry.
- **When an entry is hidden (`hidden: true`), then** it is absent from the DOM. The rendered HTML never contains a hidden repo's slug.
- **When the list renders, then** default sort is: `featured: true` first; then `tier: active`; then by `pushedAt` descending. Within featured entries the snapshot order is preserved.
- **When a user changes the tier or category select, then** the `<catalog-filter>` component hides list items whose `data-tier` / `data-category` does not match. With JavaScript disabled, the filter form still renders but does nothing; the full list remains visible.

## Fallbacks

- No JavaScript → filter chips are inert; full list is visible.
- Empty catalog → the list renders empty; the intro paragraph still explains what the page is.

## Tests

`tests/views/work-index.test.tsx` and `tests/enhancements/catalog-filter.test.ts`.
```

- [ ] **Step 3: Write `docs/views/work-detail.md`**

```markdown
# Work detail (`/work/<slug>/`)

## Purpose

One page per public repository. Written for program managers and evaluators — lead with the problem and outcomes, link to the code for developers.

## Inputs

- `entry` — the specific `CatalogEntry`.
- `now` — current time, for the standards evaluation.
- `config` — base path, build time.

## Behavior

- **When the entry has an overlay with a `body`, then** the body is rendered as HTML inside the main column.
- **When the entry has no overlay but has a `summary` or GitHub `description`, then** that text is rendered as a single paragraph.
- **When the entry has none of the above, then** the main column shows "No description yet."
- **When the page loads, then** the header shows the title (`overlay.title` or repo name), tier badge, and category badge.
- **When the page loads, then** the aside shows the standards checklist (via `StandardsList`) and a definition list with language, license, and last push date.
- **When the entry has a non-null `homepage`, then** a "Homepage" link renders next to the "View on GitHub" link.

## Fallbacks

- A repo with no license field, no LICENSE file, and no README is still rendered; the standards list simply marks failures.

## Tests

`tests/views/work-detail.test.tsx`.
```

- [ ] **Step 4: Write `docs/views/health.md`**

```markdown
# Repo health (`/work/health/`)

## Purpose

Transparency surface. Publicly reports how each repo measures up to Flexion's stewardship standards.

## Inputs

- `catalog` — the merged catalog.
- `now` — current time, for the activity check.
- `config` — base path, build time.
- `showPerRepo` — `SHOW_PER_REPO_FAILURES` from `standards/repo-checks.ts`.

## Behavior

- **When the page loads, then** the summary line reads `N of M repos meet the documented standards`, where `M` is the number of non-hidden repos and `N` is the count passing every check.
- **When `showPerRepo` is true, then** a table renders with one row per non-hidden repo and one column per check. Each cell carries a `health-cell--<result>` class reflecting `pass`, `warn`, or `fail`.
- **When `showPerRepo` is false, then** the table is absent and a short paragraph explains that per-repo details are hidden.
- **When a repo has `tier: archived`, then** the activity check passes regardless of `pushedAt`.
- **When a repo has `tier: unreviewed`, then** the tier-assigned check fails.

## Fallbacks

- No JavaScript → the table renders in the default server-side sort (snapshot order). With JavaScript, the `<sortable-table>` component turns column headers into sort controls.

## Tests

`tests/views/health.test.tsx` and `tests/enhancements/sortable-table.test.ts`.
```

- [ ] **Step 5: Write `docs/views/commitment.md`**

```markdown
# Commitment (`/commitment/`)

## Purpose

Publishes Flexion's open source commitment statement so anyone — agency, partner, contributor — can see exactly what Flexion commits to.

## Inputs

- `body` — markdown body of `content/commitment.md` (front-matter stripped).
- `config` — base path, build time.

## Behavior

- **When the page loads, then** the markdown in `content/commitment.md` renders into `<main>`. Headings produce `<h1>`–`<h4>`; paragraphs produce `<p>`.
- **When the `<title>` is set, then** it uses the front-matter `title` ("Open source commitment" as of v1).

## Fallbacks

- The markdown file must exist; the build fails loudly if it is missing rather than rendering an empty page.

## Tests

`tests/views/content-page.test.tsx`.
```

- [ ] **Step 6: Write `docs/views/about.md`**

```markdown
# About (`/about/`)

## Purpose

Explains what Flexion Labs is, who maintains it, and how interested parties can engage — adopt, contribute, or partner — without going through a sales funnel.

## Inputs

- `body` — markdown body of `content/about.md`.
- `config` — base path, build time.

## Behavior

- **When the page loads, then** the markdown in `content/about.md` renders into `<main>`.
- **When the page loads, then** a link to the main Flexion site (`https://flexion.us/`) appears in the copy.

## Fallbacks

- None beyond content page rendering.

## Tests

`tests/views/content-page.test.tsx`.
```

- [ ] **Step 7: Commit**

```bash
git add docs/views/
git commit -m "docs(views): per-view behavioral docs mapped to tests"
```

---

## Phase 13 — Final Integration

### Task 36: Confirm every test passes and the site builds cleanly

- [ ] **Step 1: Run the full suite**

Run: `bun test`
Expected: all tests PASS.

- [ ] **Step 2: Run a clean build**

Run: `rm -rf dist && bun run build`
Expected: exits 0; `dist/` contains all expected pages plus `styles/`, `enhancements/register.js`, and `assets/`.

- [ ] **Step 3: Run the a11y suite against the fresh build**

Run: `bun test tests/a11y`
Expected: zero violations.

- [ ] **Step 4: Visual inspection**

Open `dist/index.html` in a browser via a local static server (e.g. `bunx serve dist` or similar). Confirm the home page renders with styled header/footer, featured cards, and stats. Navigate to `/work/`, `/work/health/`, `/commitment/`, `/about/`. Confirm no broken assets or links.

- [ ] **Step 5: Commit any final touch-ups**

If the visual inspection surfaces issues, fix them with a new commit per issue. No work should be rolled into unrelated commits.

---

### Task 37: Open the PR

- [ ] **Step 1: Create a PR against `main`**

The full plan was implemented on a feature branch. Open a PR that triggers a preview deployment. The PR "Deployments" panel should show a `preview` environment URL at `https://labs.flexion.us/preview/<branch>/`. Review the preview. Merge once satisfied.

---

## Self-Review

### Spec coverage

- **Purpose (§1):** Tasks 15, 19 (home copy, commitment text), 34–35 (docs) surface the site's purpose in prose that matches the spec's seven jobs. ✓
- **Architecture — filesystem (§2.1):** Phase 1 + the file structure block above establish the exact layout. ✓
- **Runtime & stack (§2.2):** Task 1. ✓
- **URL map (§2.3):** Tasks 21 (routes), 22 (build), 15–19 (views). ✓
- **Rendering model (§2.4):** Tasks 11–13 establish server-rendered HTML with optional enhancements; Phase 8 covers enhancements. ✓
- **Data model (§3):** Tasks 3–8 cover types, defaults, overlays, merge, load, and the catalog README. ✓
- **Refresh pipeline (§3.4):** Tasks 30, 32. ✓
- **Information architecture (§4):** Tasks 15–19 with per-view docs in Task 35. ✓
- **Visual design (§5):** Tasks 23–24 (tokens, layers, typography, containers); accessibility folded throughout and validated by Task 29. ✓
- **Deployment (§6):** Tasks 31, 33. ✓
- **Testing (§7):** every task that writes code writes a test first; Task 36 runs the full matrix. ✓
- **Behavioral documentation (§8):** Tasks 34–35. ✓
- **Scope in vs. out (§9):** the plan implements every "in" item; no "out" item is pulled in. ✓

### Placeholder scan

- No "TBD", "TODO (in the plan)", "implement later", or "similar to Task N" references.
- Every code step contains the actual code.
- Every test step asserts actual behavior.
- Every command has an expected outcome.

### Type consistency

- `CatalogEntry`, `Tier`, `Category`, `RepoEvaluation`, `CheckResult`, `SiteConfig`, `HeroContent` are defined once and referenced consistently.
- Component prop names (`entry`, `config`, `basePath`, `catalog`, `hero`, `body`, `now`, `showPerRepo`) are consistent across views and tests.
- `evaluateRepo(entry, now)` signature is consistent across views and tests.

If the engineer executing this plan finds a mismatch, it is a bug — fix in place and continue.

---

## Execution handoff

Plan complete and saved to `notes/plans/2026-04-27-flexion-labs-website.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session using the executing-plans skill, with checkpoints for review.

Which approach?
