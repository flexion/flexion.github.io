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
