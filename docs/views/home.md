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
