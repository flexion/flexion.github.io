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
