# Pare the home page down to three Flexion Solutions offerings

**Date:** 2026-05-01
**Status:** Draft for review
**Branch:** `pare-down-to-solutions-offerings`

## Background

The Flexion Labs site currently presents a full catalog of public repositories with a featured grid on the home page, a `/work/` directory, per-repo detail pages, and a stewardship health page. We don't have time to get approved public copy for everything in the catalog, so this pass removes the directory from the public surface and replaces the home page with curated content for the three Flexion Solutions offerings: **Forms**, **Messaging**, and **Document Extractor**.

A directory of all Flexion GitHub repositories will return in a later pass. Until then, the catalog code, route handlers, tests, and daily refresh workflow all stay in the tree — they simply don't produce HTML.

Source content for the new home page lives in a Google Doc (provided by stakeholders) that positions each offering as a "Lab" with a short tagline and one or more links. The prepared copy is incomplete: Forms actually has two repos (the productized 10x `flexion/forms` and the `flexion/forms-lab` experiment), Messaging's repo (`flexion/flexion-notify`) isn't public yet but will be when this ships, and Document Extractor's case study write-up lives on `flexion.us`.

## Goals

1. Public site shows only three featured offerings — no directory, no detail pages, no health page.
2. Featured content is curated markdown, not catalog-derived. A single offering can have many repos and many links.
3. Code and tests for the hidden directory stay intact, so re-enabling later is a small change.
4. Home page matches the stakeholder-approved Google Doc's content and structure.

## Non-goals

- Not reintroducing per-repo pages.
- Not editing `data/overrides.yml`.
- Not changing the daily catalog refresh workflow.
- Not rewriting `content/commitment.md` or `content/about.md`.
- Not replacing AWS-hostname demo URLs with branded ones (tracked as a risk/follow-up).

## Scope

### In scope

- New `content/featured/` content type (front-matter-only markdown, one file per featured lab).
- New `LabCard` design component.
- New home page layout: hero + subtitle + intro markdown + featured labs + combined "Learn more" row.
- Remove stats strip.
- Remove `/work/`, `/work/health/`, `/work/{slug}/` from produced routes by commenting out lines in `src/build/routes.ts`.
- Nav changes to **Home · Commitment · About · GitHub**.
- Delete `content/work/*.md` overlay files and the `content/work/` directory.

### Out of scope

- Sitemap/robots.txt updates (project generates neither).
- Changes to tests for work-index, work-detail, health — components remain testable directly.
- Any `overrides.yml` edits.

## Design

### Content structure

New directory `content/featured/` with one markdown file per featured lab. Only front-matter is parsed; body is ignored.

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
  - label: Demo (Forms Lab experiment)
    url: https://ec2-34-197-222-16.compute-1.amazonaws.com/
  - label: GitHub repository — Forms Lab (experiment)
    url: https://github.com/flexion/forms-lab
---
```

Three files created:

| File | Title | Tagline (from the Google Doc) | Links |
|------|-------|-------------------------------|-------|
| `content/featured/forms-lab.md` | Forms Lab | Digitize forms to create modern, accessible experiences for public outreach. | Demo (Forms Platform) → `https://pp4cc7kwbf.us-east-1.awsapprunner.com/`; GitHub repository — Forms Platform → `https://github.com/flexion/forms`; Demo (Forms Lab experiment) → `https://ec2-34-197-222-16.compute-1.amazonaws.com/`; GitHub repository — Forms Lab (experiment) → `https://github.com/flexion/forms-lab` |
| `content/featured/messaging-lab.md` | Messaging Lab | Text messaging services to deliver critical updates to the people you serve. | GitHub repository → `https://github.com/flexion/flexion-notify` |
| `content/featured/document-extractor-lab.md` | Document Extractor Lab | Accurately extract data from PDFs and images for faster application processing. | GitHub repository → `https://github.com/flexion/document-extractor`; Case study → `https://flexion.us/case-study/document-extraction-for-faster-processing/` |

Display order is the `order` integer ascending (Forms Lab = 1, Messaging Lab = 2, Document Extractor Lab = 3); ties broken by filename.

### Home page content

`content/home.md` front-matter expands:

```yaml
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

The `intro` is rendered through the existing marked pipeline (contains a link). `learnMore.commitment` teases `/commitment/`; `learnMore.about` teases `/about/`.

### Loaders

- **New:** `src/build/featured.ts` — exports `loadFeatured(rootDir): Promise<FeaturedLab[]>` sorted by `order`. Uses the same front-matter parsing approach as `hero.ts`. Parses the `links` array and validates each entry has `label` (string) and `url` (string).
- **Modified:** `src/build/hero.ts` — expand return shape of `loadHero` from `{ hero, intro }` to `{ title: string, subtitle: string, intro: string, learnMore: { commitment: string, about: string } }`. The export keeps the name `loadHero` for minimum churn. The `intro` field is pre-rendered HTML (the loader pipes the front-matter markdown through `marked`) because it contains a link; `subtitle` and the two `learnMore` values are plain strings.

### Components

**New:** `src/design/components/lab-card/`
- `index.tsx` — props: `{ lab: FeaturedLab }`. Renders `<article class="lab-card">` containing:
  - `<h3 class="lab-card__title">` — plain text, not a link
  - `<p class="lab-card__tagline">` — short summary
  - `<ul class="lab-card__links">` — each link rendered via the existing `Link` component, `external` where the href is off-site
- `styles.css` — accent border (reuses `--color-accent`), card surface, vertical link stack with subtle arrow glyph. Design-tokens only.
- `examples.tsx` — one fixture lab in the design system showcase.

**Unchanged:** `src/design/components/featured-card/` stays in the tree unused. Returns later when the directory returns.

### Home page (`src/pages/home.tsx`)

New structure:

```
<Layout>
  <section class="home-hero">
    <h1>{title}</h1>
    <p class="home-hero__subtitle">{subtitle}</p>
    <div class="home-intro">{raw(intro)}</div>
  </section>

  <section class="home-featured" aria-labelledby="featured-heading">
    <h2 id="featured-heading">Featured labs</h2>
    <div class="home-featured__list">
      {labs.map(lab => <LabCard lab={lab} />)}
    </div>
  </section>

  <section class="home-learn-more" aria-labelledby="learn-more-heading">
    <h2 id="learn-more-heading">Learn more</h2>
    <div class="home-learn-more__grid">
      <article>
        <h3>Our open source commitment</h3>
        <p>{learnMore.commitment}</p>
        <a href="/commitment/">Read our commitment →</a>
      </article>
      <article>
        <h3>About Flexion</h3>
        <p>{learnMore.about}</p>
        <a href="/about/">Learn about Flexion →</a>
      </article>
    </div>
  </section>
</Layout>
```

- No stats strip.
- `.home-featured__list` grid CSS is reused as-is.
- `.home-learn-more__grid` is new — two-column at medium+ breakpoints, stacked on narrow.

### Header nav (`src/design/components/header/index.tsx`)

Nav items become: **Home** · **Commitment** · **About** · **GitHub**. The "Home" entry links to `url('/', basePath)`. Work entry is removed.

### Route gating (`src/build/routes.ts`)

Comment out the work-route additions. No feature flag:

```ts
export function allRoutes(catalog: Catalog): Route[] {
  const routes: Route[] = [
    { path: '/', view: 'home' },
    // Work directory is disabled until approved content is ready.
    // Uncomment to restore the public catalog, detail pages, and health.
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

Page components, view docs, tests, and overlay loader stay in the tree. Unused imports in `src/build/entry.tsx` are left in place for easy re-enabling.

### Deletions

- `content/work/forms.md`
- `content/work/forms-lab.md`
- `content/work/flexion-notify.md`
- `content/work/document-extractor.md`
- `content/work/` directory (after files are removed)

The overlay loader (`src/catalog/load.ts`) tolerates a missing directory — returns an empty map. Catalog loading continues to work unchanged.

### Unchanged

- `data/overrides.yml` — `featured: true` flags stay. Inert until the directory returns.
- `.github/workflows/*catalog*` — daily refresh keeps running.
- `src/pages/work/*`, `tests/views/work-*.test.tsx`, `tests/views/health.test.tsx`, `docs/views/work-*.md`, `docs/views/health.md` — dormant.
- `src/design/components/featured-card/` — dormant.

## Testing

### New tests

- `tests/build/featured.test.ts` — loader returns labs sorted by `order`; each lab has `title`, `tagline`, `links[]` with required fields; invalid files fail loudly.
- `tests/views/home.test.tsx` — rewritten:
  - `<h1>` is "Flexion Labs"
  - Subtitle renders
  - Intro renders the "reach out to us" link to `https://flexion.us/contact-us/`
  - Exactly three `LabCard` articles render in `order`
  - Forms Lab card contains the four expected link labels and URLs
  - "Learn more" section renders both teasers with links to `/commitment/` and `/about/`
  - No stats strip is present
- `tests/views/components.test.tsx` — extend to include LabCard assertions: renders title, tagline, and every link as a real `<a>` with an href and visible label text.
- `tests/build/routes.test.ts` — created for this change; asserts `allRoutes()` produces `/`, `/commitment/`, `/about/`, `/design-system/` and no path starting with `/work/`.

### Preserved tests

- `tests/views/work-index.test.tsx`, `tests/views/work-detail.test.tsx`, `tests/views/health.test.tsx` — test components directly; stay green.
- `tests/catalog/*.test.ts` — catalog loading works with or without `content/work/`.
- `tests/a11y/*` — axe scan for home page in its new shape.

### Manual preview checklist (documented on the PR)

- [ ] Home page renders on desktop and narrow viewport without layout jank
- [ ] Each featured lab card renders all its links; each link resolves to the expected URL
- [ ] Nav shows Home · Commitment · About · GitHub; Home reloads `/`
- [ ] `/work/`, `/work/health/`, `/work/forms/` return 404 in preview
- [ ] Axe violations: none on `/`

## Risks

- **AWS-hostname demo URLs** (`ec2-34-197-222-16.compute-1.amazonaws.com`, `pp4cc7kwbf.us-east-1.awsapprunner.com`) may look unprofessional and trigger certificate warnings. Not blocking, tracked as a follow-up.
- **"Featured labs" + per-card "Lab" suffix** is the stakeholder-preferred naming per the Google Doc. If it reads redundantly in preview, a one-line rename of the section heading is trivial.
- **Commented-out route code can go stale.** Acceptable for the expected duration (weeks, not months).
- **Messaging Lab repo-public timing** — `flexion/flexion-notify` goes public with this PR. Merge must be coordinated with the repo visibility change to avoid a broken link window.

## Open items for reviewer

1. Exact wording of the two "Learn more" teasers — happy to use the Google Doc verbatim or tighten.
2. Confirm order of featured labs: Forms Lab → Messaging Lab → Document Extractor Lab (doc order).
3. Whether Messaging Lab should render a "coming soon" treatment if the repo-public timing slips at merge time.

## Implementation sequence (for writing-plans)

1. Add featured-lab content type + loader + tests (`content/featured/*.md`, `src/build/featured.ts`, `tests/build/featured.test.ts`).
2. Add `LabCard` component with examples and tests.
3. Expand `content/home.md` front-matter and `src/build/hero.ts` loader to carry the new fields.
4. Rewrite `src/pages/home.tsx` layout. Update `tests/views/home.test.tsx`. Update `docs/views/home.md`.
5. Update `src/design/components/header/index.tsx` — drop Work, add Home.
6. Comment out work routes in `src/build/routes.ts`. Add/extend `tests/build/routes.test.ts`.
7. Delete `content/work/*.md` overlays and the directory.
8. Update `docs/featured-content.md` to document the new content type and the directory-disabled state.
9. Open the PR; coordinate merge with `flexion/flexion-notify` going public.
