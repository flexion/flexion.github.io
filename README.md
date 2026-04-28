# Flexion Labs

Source for [labs.flexion.us](https://labs.flexion.us/) — a public-facing site that showcases Flexion's open source portfolio, indexes our public repositories, and publishes our open source commitment.

## Layout

- `src/` — all source code:
  - `src/build/` — the Bun + Hono SSG build driver.
  - `src/catalog/` — catalog domain logic: types, loading, merging, stewardship evaluation, refresh script.
  - `src/web/` — everything the visitor sees:
    - `src/web/common/` — shared templates (layout shell, content page).
    - `src/web/pages/` — route entrypoints (one file per URL path).
    - `src/web/components/` — reusable UI: JSX components and HTML Web Components.
    - `src/web/styles/` — hand-rolled CSS with cascade layers and design tokens.
    - `src/web/assets/` — static files (favicon).
- `data/` — catalog data: generated snapshot (`repos.json`) and hand-authored overrides (`overrides.yml`).
- `content/` — the words we publish, as markdown.
- `docs/` — durable behavioral documentation for contributors and agents.
- `notes/` — ephemeral planning and specs.

## Getting started

```bash
bun install
bun run build      # writes static site to dist/
bun test           # runs the full test suite
```

See `docs/README.md` for the project orientation.
