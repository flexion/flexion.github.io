# Flexion Labs Website — Design Spec

**Status:** Draft, pending review
**Date:** 2026-04-27
**Hosting:** `labs.flexion.us` (GitHub Pages from this repo)

---

## 1. Purpose

A public-facing static site that showcases Flexion's open source portfolio as evidence of technical excellence and civic-tech investment. It serves agency technical evaluators, program managers, CIOs and contracting officers, civic-tech practitioners, and Flexion's own staff and business development. It supersedes `solutions.flexion.us`.

The site has seven jobs, restated from the source brief:

1. Win work through demonstrated capability.
2. Showcase featured labs (Messaging, Forms, Document Extractor).
3. Demonstrate Flexion's open source commitment.
4. Index the public portfolio (~70 repos).
5. Operationalize repo stewardship through public health reporting.
6. Invite engagement without a sales funnel.
7. Support event conversations — give Flexion staff a URL to share at conferences and similar events.

---

## 2. Architecture

### 2.1 Filesystem layout

The top-level layout names the domain — what the site is about — not the tech that renders it. Robert Martin's "Screaming Architecture" principle: a reader learns the intent before seeing framework concerns.

```
/
  README.md
  docs/              # durable behavioral documentation
  notes/             # ephemeral planning notes (including this spec)

  catalog/           # inventory of our open source work
    repos.json       # generated snapshot from the GitHub API
    overrides.yml    # hand-authored metadata (tier, category, featured)
    README.md        # what lives here and why

  content/           # the words we publish
    home.md
    commitment.md
    about.md
    work/            # per-repo markdown overlays (filename = repo slug)
      messaging.md
      forms.md
      document-extractor.md

  standards/         # stewardship rules the health report evaluates
    maintenance-tiers.md
    repo-checks.md

  views/             # what visitors see (routes and page components)
    home.tsx
    commitment.tsx
    about.tsx
    work/
      index.tsx      # the catalog view
      detail.tsx     # one repo's page
      health.tsx     # stewardship report
    layout.tsx       # shared shell
    components/      # shared UI pieces

  styles/            # design tokens, cascade layers, component CSS
  enhancements/      # HTML Web Components (progressive enhancement)
  assets/            # images, icons, favicons

  build/             # SSG entrypoint and helpers
    entry.ts         # Bun + Hono build driver

  tests/             # mirrors source structure; see §7
  .github/workflows/
    deploy.yml
    refresh-catalog.yml
```

**Principle:** data, words, and views are separate top-level concepts. You can change styling without touching catalog, update overrides without touching views, or rewrite the commitment without building anything.

### 2.2 Runtime & stack

- **Bun** as the JavaScript runtime and package manager.
- **TypeScript** with no preprocessing pipeline for CSS or HTML.
- **Hono** with its SSG helper renders every route to static HTML at build time. No server runtime in production — GitHub Pages serves the static output.
- **Hono JSX** for components. HTML-first; no React, no hydration.
- **HTML Web Components** for progressive enhancement of interactivity.
- **Hand-rolled CSS** targeting modern browsers: cascade layers, container queries, custom properties, `clamp()`. No Sass, PostCSS, or Tailwind.
- **Bun's built-in test runner** for unit and behavior tests.

### 2.3 URL map

All paths end with a trailing slash; GitHub Pages serves `index.html` from each directory.

| URL | Purpose |
|---|---|
| `/` | Home: intro, featured labs, quick stats, three audience paths |
| `/work/` | Catalog index: filterable/sortable list of all public repos |
| `/work/<slug>/` | One repo's page: derived data, markdown overlay if present, links out |
| `/work/health/` | Stewardship report: table of repos vs. standards |
| `/commitment/` | Full commitment statement + stewardship tiers |
| `/about/` | Brief on Flexion Labs, how to engage, contact path |

### 2.4 Rendering model

Every page is server-rendered HTML at build time. No client-side routing, no hydration. HTML Web Components wrap existing HTML and decorate it — they are never required for a page to function.

---

## 3. Data model

### 3.1 Source files

Two files in `catalog/` are the source of truth for all repo data:

- `catalog/repos.json` — machine-generated snapshot from the GitHub API. Rewritten by the daily refresh workflow.
- `catalog/overrides.yml` — human-authored, committed via PRs. Fills fields the API can't answer (tier, category, featured).

Per-repo markdown in `content/work/<slug>.md` is optional rich copy that overlays onto a repo's detail page.

### 3.2 Merged catalog entry

```ts
type CatalogEntry = {
  // Derived from the GitHub API
  name: string
  description: string | null
  url: string               // github URL
  homepage: string | null
  language: string | null
  license: string | null
  pushedAt: string          // ISO 8601
  archived: boolean         // GitHub's archive flag
  fork: boolean
  stars: number
  hasReadme: boolean
  hasLicense: boolean       // from the license field OR a LICENSE file check
  hasContributing: boolean  // CONTRIBUTING.md file check

  // From overrides.yml (optional — defaults applied)
  tier: 'active' | 'as-is' | 'archived' | 'unreviewed'
  category: 'product' | 'tool' | 'workshop' | 'prototype' | 'fork' | 'uncategorized'
  featured: boolean         // home-page hero?
  hidden: boolean           // excluded from site entirely (escape hatch)

  // From content/work/<slug>.md (optional)
  overlay: { title?: string; summary?: string; body?: string } | null
}
```

### 3.3 Defaults

When `overrides.yml` has no entry for a repo, defaults are derived per field with `archived` taking precedence over `fork` for tier:

- **Category**: `fork: true` → `'fork'`; otherwise `'uncategorized'`.
- **Tier**: `archived: true` → `'archived'`; else `fork: true` → `'as-is'`; else `'unreviewed'`.

Overrides always win over either rule.

The "unreviewed" tier is publicly visible and honest — it says "a human has not yet classified this repo."

### 3.4 Refresh pipeline

- A GitHub Action (`refresh-catalog.yml`) runs daily at 09:00 UTC and on `workflow_dispatch`.
- It paginates `GET /orgs/flexion/repos`, then per repo checks for README / LICENSE / CONTRIBUTING via the contents API.
- It writes `catalog/repos.json` to a branch named `catalog/refresh-YYYY-MM-DD`.
- If the resulting diff is empty, no PR is opened.
- Otherwise it opens a PR titled `Refresh catalog snapshot — YYYY-MM-DD`.
- If CI passes, the PR auto-merges (`gh pr merge --auto --squash`). Human review is available but not required for routine refreshes.

**Why a committed snapshot:** build determinism (same commit → same output), no rate-limit risk on ordinary push-to-build cycles, and snapshot diffs in PR review surface meaningful changes early.

### 3.5 Out of scope for v1

- Reading per-repo metadata from `FLEXION.yml` files or GitHub topics. All human-authored metadata stays in `overrides.yml` until we learn which fields actually matter.

---

## 4. Information architecture and page behavior

Per-page behavior is documented in depth in `docs/views/*.md` (see §8). The summary here is the intent for each view.

### 4.1 Home (`/`)

Top to bottom:
1. **Hero** — one-sentence value statement in Flexion's voice.
2. **Featured labs** — cards for every repo flagged `featured: true` (v1 targets three: Messaging, Forms, Document Extractor). Each card links to `/work/<slug>/`.
3. **Quick stats** — counts derived from the catalog at build time (e.g., "72 public projects · 14 actively maintained").
4. **Three paths** — explicit links to "Explore our work," "Read our open source commitment," "Get in touch."
5. **Footer**.

### 4.2 Catalog index (`/work/`)

- Server-renders every non-hidden repo. Visible without JavaScript.
- Category and tier presented as filter chips via a `<catalog-filter>` HTML Web Component. Without JS the chips are absent; the full list is visible.
- Default sort: `featured` first, then `tier: active`, then by `pushedAt` descending.
- Sort options (active-first, A–Z, most-starred) offered via the same component.
- Row content: name, one-line description, category badge, tier badge, last-activity hint, link to `/work/<slug>/`.

### 4.3 Repo detail (`/work/<slug>/`)

- Header: name, tier badge, category badge, GitHub link, homepage/demo if present, language, license.
- Body: markdown overlay if present; otherwise a fallback paragraph from the GitHub description with a link to the repo.
- Sidebar (below content on narrow containers): stats (last push, stars, open issues if useful) and a standards checklist (✅ README / ✅ License / ❌ Contributing / ⚠️ inactive > 12 months).

### 4.4 Repo health (`/work/health/`)

- Summary at top: "N of M repos meet the documented standards."
- Table: rows per repo (non-hidden), columns for each standard (README, license, contributing, recent activity, tier assigned). Pass/warn/fail marks.
- Rendered as a real `<table>` with `<caption>` and scopes.
- Per-repo failures visible by default. A single constant `SHOW_PER_REPO_FAILURES` in `standards/` (imported by the view) flips to hide specific failures before launch if leadership decides.

### 4.5 Commitment (`/commitment/`)

- Renders `content/commitment.md`, seeded from the working-draft Google Doc.
- Includes the stewardship tier definitions (active, as-is, archived, unreviewed) so the tiers on repo pages have a canonical reference.

### 4.6 About (`/about/`)

- Brief on Flexion Labs, a link to the main Flexion site, and clear paths for engagement: contribute, adopt, partner. The contact path is not a sales funnel.

### 4.7 Global chrome

- Header: Flexion Labs wordmark, nav (Work, Commitment, About), GitHub link.
- Footer: nav repeat, licensing note, a "last updated" stamp (build date).
- No global sidebar. Text pages use a ~65ch column; catalog and health use the full content width.

---

## 5. Visual design

### 5.1 Posture

Editorial-civic. High typographic hierarchy, generous whitespace, no decorative illustration. The catalog and health views are the signature surfaces and must read as an authoritative index, not a marketing grid.

### 5.2 Color tokens

From the Flexion 2020 Color Palette. Every swatch in the brand palette is defined as a CSS custom property, even if the v1 design does not actively use it — this gives the design room to grow without a return to the spec. All text-on-color choices are drawn from the AAA-passing combinations in the brand sheet; AA is the minimum floor for any incidental pairing.

```css
:root {
  /* Base */
  --color-midnight:  #171717;
  --color-pewter:    #595959;
  --color-platinum:  #EBEBEB;
  --color-snow:      #FFFFFF;

  /* Primary */
  --color-tango:     #E34E35;
  --color-brick:     #923120;
  --color-melon:     #FBB4A7;

  /* Secondary */
  --color-lapis:     #025197;
  --color-ocean:     #00AAD5;
  --color-sky:       #BCE7FD;
  --color-lilac:     #E0CCF5;
  --color-eggplant:  #442DA4;
  --color-butter:    #F8E989;

  /* Semantic roles */
  --color-ink:            var(--color-midnight);
  --color-ink-subtle:     var(--color-pewter);
  --color-surface:        var(--color-snow);
  --color-surface-alt:    var(--color-platinum);
  --color-accent:         var(--color-tango);
  --color-accent-strong:  var(--color-brick);
  --color-link:           var(--color-lapis);
  --color-link-hover:     var(--color-eggplant);
  --color-focus-ring:     var(--color-ocean);

  /* Tiers */
  --color-tier-active:     var(--color-lapis);
  --color-tier-as-is:      var(--color-pewter);
  --color-tier-archived:   var(--color-midnight);
  --color-tier-unreviewed: var(--color-platinum);

  /* Status */
  --color-pass:  var(--color-lapis);
  --color-fail:  var(--color-brick);
  --color-warn:  var(--color-tango);
}
```

### 5.3 Typography

System font stack for body text; a secondary display stack for headings (swappable with a self-hosted font post-launch without structural change). Fluid sizing with `clamp()` driven by `--step-*` tokens (major-third scale). Line-height 1.5 body, 1.15 headings.

### 5.4 Spacing, radii, shadows

A `--space-*` scale on a 4px base; `--radius-sm/md/lg`; a single `--shadow-card`. Kept small — the design doesn't lean on shadows or radii for its voice.

### 5.5 Cascade layers

`styles/index.css` declares layers in order:

```css
@layer reset, tokens, base, layout, components, utilities;
```

Every rule is attributable to a layer; overrides are predictable; low-layer files can be dropped without risk.

### 5.6 Container queries

Components that reflow (catalog cards, featured strip, detail page columns) query their container, not the viewport. A component dropped into a narrower region adapts naturally.

### 5.7 Progressive enhancement

Every HTML Web Component wraps real HTML and decorates it. The rule: HTML first, component only decorates. No component is required for a page to be usable. Components planned for v1:

- `<catalog-filter>` — wraps the rendered list and a `<form>` of filter inputs. Without JS the form submits as a GET with query params (the unfiltered list is already rendered, so the fallback is "you see everything"). With JS it filters in place.
- `<sortable-table>` — wraps the health-report table. Default sort applied server-side. With JS, column headers become buttons that re-sort in place.
- `<copy-button>` — wraps a `<button>` next to a command snippet. Hidden via `:not(:defined)` styling when JS is absent.

### 5.8 Accessibility

- All color pairings AAA where feasible, AA minimum.
- Visible focus ring (`--color-ocean`, 2px, 2px offset) on every interactive element.
- Landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) on every page; a single `<h1>` per page.
- Catalog and health tables are real `<table>` elements with `<caption>` and proper scopes.
- `@media (prefers-reduced-motion: reduce)` disables transitions.
- Verified with axe-core in CI and a manual keyboard / VoiceOver pass before launch.

### 5.9 Mobile

Mobile-first. Catalog collapses to single-column cards below ~600px container width. Featured strip stacks vertically. Navigation becomes a `<details>` disclosure with no JS required.

---

## 6. Deployment

### 6.1 Branch previews

`gh-pages` holds production at the root and previews under `preview/<branch>/`:

```
gh-pages/
  index.html                  # main-branch build (production)
  work/…
  commitment/…
  preview/
    <branch-1>/
      index.html
      work/…
    <branch-2>/
      …
```

Production: `labs.flexion.us/`. Preview: `labs.flexion.us/preview/<branch>/`.

### 6.2 Deploy workflow

`deploy.yml` triggers on push to any branch:

1. Checkout; set up Bun.
2. `bun install`, `bun run build` → `dist/`.
3. Determine publish path:
   - `main` → publish `dist/*` to `gh-pages/` (preserving `preview/`).
   - Any other branch → publish `dist/*` to `gh-pages/preview/<sanitized-branch>/`.
4. Commit to `gh-pages`. Commit message includes the source SHA.
5. Register a GitHub Deployment against an environment:
   - `main` → `production` environment, `environment_url` = `https://labs.flexion.us/`.
   - Any other branch → `preview` environment (or `preview-<branch>` if we want per-branch history), `environment_url` = `https://labs.flexion.us/preview/<branch>/`.

Branch cleanup: on `delete` events, a job removes `gh-pages/preview/<branch>/`.

### 6.3 Base path handling

The SSG builds with a configurable base path (`SITE_BASE_URL`) so previews under `/preview/<branch>/` have correct internal links and asset URLs. Main builds with `/`; preview builds with `/preview/<branch>/`.

### 6.4 Custom domain

A committed `CNAME` file pins `labs.flexion.us` on gh-pages. Preview URLs sit under the same host, so no DNS gymnastics.

### 6.5 Build performance

Target: full build under 10 seconds. Hono SSG + Bun is fast and the catalog is ~80 pages. If we overshoot, split the build (catalog vs. pages) or cache between runs.

### 6.6 Secrets

`GITHUB_TOKEN` (default, auto-provided) covers gh-pages push and catalog refresh. No other secrets required for v1.

---

## 7. Testing

"Excellent TDD" for a content-rendering static site means tests drive the behavior of each view and the logic that feeds them. Tests are written **before** the code that makes them pass.

### 7.1 Test layers

- **Unit tests** (Bun test runner) on pieces with real logic:
  - catalog merge (GitHub snapshot + overrides + overlay);
  - tier and category defaulting rules;
  - health-standards evaluation (has-readme, has-license, recent-activity windows);
  - URL helpers (base path, slug sanitization);
  - filter/sort logic shared with the HTML Web Components.
- **View behavior tests** — render each Hono JSX view against a fixture catalog and assert on the DOM. Examples: "home renders three featured cards when three repos are flagged"; "work index renders every non-hidden repo"; "health view marks a repo without a license as failing"; "detail page falls back to description when no overlay exists." Fast, no browser needed.
- **Build smoke test** — the full SSG build completes and produces the expected URLs (`/`, `/work/`, `/work/<slug>/` for each fixture repo, `/work/health/`, `/commitment/`, `/about/`) with non-empty HTML and correct internal links.
- **Accessibility checks** — `axe-core` against rendered HTML for a representative page set in CI.
- **HTML Web Component tests** — each component tested in isolation in a JSDOM-like environment: the "without JS" HTML is untouched; behavior is additive; there is no reliance on internal state not expressible in attributes.

### 7.2 Test layout

`tests/` mirrors source structure. A fixture catalog lives at `tests/fixtures/catalog.ts` and is the shared input for view tests.

### 7.3 CI gates

The deploy workflow runs, in order: `bun test`, accessibility scan, build. Any failure blocks deploy for that branch (previews included).

---

## 8. Behavioral documentation

`docs/` holds durable documentation written for humans and for agents equally. Each view doc describes behavior in a "when/then" voice that maps directly to test cases — an agent reading `docs/views/work-index.md` can reconstruct the page's intended behavior without reading the code.

```
docs/
  README.md                 # orientation for contributors and agents
  catalog.md                # what the catalog is, how it's built, refresh cadence, override model
  content.md                # how pages are authored, markdown conventions, voice notes
  stewardship.md            # tiers, health checks, how standards map to code
  views/
    home.md
    work-index.md
    work-detail.md
    health.md
    commitment.md
    about.md
  deployment.md             # branches, previews, production, CNAME, environments
  testing.md                # TDD strategy, how to add tests, how to run
  styling.md                # tokens, layers, component conventions
```

Each view doc has the same shape: purpose, inputs (catalog, overrides, overlay), behavior (when/then list), fallbacks, and cross-references to the tests that encode each behavior.

**Voice:** plain, professional, active. Consistent with Flexion's brand voice guidelines — clear, humble-not-shy, curious, no jargon. Written to serve agency evaluators and program managers primarily, Flexion's own engineers secondarily, and agents that read the docs to work on the site.

---

## 9. Scope

### 9.1 In scope for v1

- Site design and build per this spec.
- Content for the three featured labs (Messaging, Forms, Document Extractor).
- Catalog indexing all public repos.
- Published commitment statement.
- Repo health reporting.
- Behavioral documentation per §8.
- Deployment with production and branch previews.
- Daily catalog refresh with auto-merge on green CI.

### 9.2 Out of scope for v1

- Automated repo governance tooling beyond the health report.
- Staleness detection and alerting.
- Deeper content development (blog, news, case studies).
- Per-repo `FLEXION.yml` metadata support.
- Search on the catalog.
- Analytics or visitor tracking.
- Contributing workflows for this site repo (issue / PR templates) — add post-launch.
- Dark mode beyond trivial `prefers-color-scheme` respect.
- Open Graph preview images beyond a single static default.
- Authenticated or private-repo surfaces.

---

## 10. Success criteria

- Labs staff can share `labs.flexion.us` at conferences and events with confidence that every page works, every link resolves, every repo page renders.
- An agency technical evaluator can land on any page, understand what Flexion Labs is, and find the three featured labs within two clicks.
- The catalog is the signature surface: comprehensive, scannable, honest about what is maintained and what is not.
- Every branch has a live preview URL surfaced through GitHub Deployments before it merges.
- The `docs/` tree lets a new contributor (human or agent) reconstruct the intended behavior of any page from text alone.

---

## 11. Open questions deferred to implementation

- Exact text of the home hero line and the "three paths" labels — a copy pass during content milestone, informed by the brand voice guidelines.
- Whether per-branch deployments use one shared `preview` environment or per-branch environments — we will pick the one that gives the cleanest "Deployments" UI on a PR.
- The display rule for "recent activity" — likely `pushedAt` within 6 months = active, 6–18 months = warn, >18 months = fail. To be confirmed in `standards/repo-checks.md` with the full standards list.
