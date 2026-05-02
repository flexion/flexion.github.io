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
  - label: Live demo
    url: https://pp4cc7kwbf.us-east-1.awsapprunner.com/
    kind: demo
    group: Forms Platform
  - label: Repository
    url: https://github.com/flexion/forms
    kind: repo
    group: Forms Platform
---
```

### Fields

- `title` — card heading (string, required)
- `tagline` — one-sentence summary (string, required)
- `order` — display order ascending (integer, required)
- `links` — list of link objects (array, required). Each link has:
  - `label` — visible link text (string, required)
  - `url` — destination URL (string, required)
  - `kind` — one of `demo`, `repo`, or `case-study` (required). Drives the icon shown before the label.
  - `group` — optional sub-project name (string). When multiple links share a `group`, they render together under a small heading; ungrouped links render without one. Use this for a lab that contains more than one distinct project (e.g., a production and an experiment variant).

## Loader

`src/build/featured.ts` exports `loadFeatured(rootDir)` which reads every `.md` file in `content/featured/`, parses front-matter, validates the schema, and returns labs sorted by `order`.

## Rendering

The home page renders one `<LabCard />` per lab. Each card is a horizontal band — title and tagline on the left, grouped link list on the right — that collapses to a stacked layout on narrow viewports via a `@container (min-width: 40rem)` rule. Links are prefixed with an icon (globe for `demo`, GitHub mark for `repo`, document for `case-study`) and grouped under a small heading when a `group` is set. The home page's featured list is constrained to `72rem` to keep the bands at a readable width on wide displays.

## Adding a featured lab

1. Add a new file at `content/featured/<slug>.md` with the required fields.
2. Pick an `order` value that places the lab where you want it.
3. `bun run build` and spot-check the home page.

## Removing or reordering

Delete the file or adjust `order`. No other changes needed.

## Related: the catalog directory

The catalog directory (`/work/` index, per-repo detail pages, `/work/health/` stewardship page) is **temporarily disabled** on the public site. The code, tests, and daily catalog refresh workflow remain intact; only the routes are commented out in `src/build/routes.ts`. See the spec at `notes/specs/2026-05-01-homepage-pare-down-design.md` for the rationale and the plan for restoring the directory.
