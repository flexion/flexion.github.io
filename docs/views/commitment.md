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
