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
