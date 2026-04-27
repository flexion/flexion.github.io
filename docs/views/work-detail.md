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
