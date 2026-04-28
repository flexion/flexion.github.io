# Flexion Labs

Source for [labs.flexion.us](https://labs.flexion.us/) — a public-facing site that showcases Flexion's open source portfolio, indexes our public repositories, and publishes our open source commitment.

## Layout

- `src/` — all source code:
  - `src/build/` — the Bun + Hono SSG build driver.
  - `src/catalog/` — catalog domain logic: types, loading, merging, stewardship evaluation, refresh script.
  - `src/design/` — the design system: all stateless UI components, CSS, assets.
    - `src/design/components/` — per-component directories (forms-lab pattern): `tag/`, `button/`, `link/`, `select/`, `card/`, `header/`, `footer/`, `repo-card/`, etc.
    - Each component has `index.tsx` (JSX), `styles.css` (CSS), `examples.tsx` (design system showcase).
    - CSS layers: `reset, tokens, base, compositions, layout, components, utilities`.
  - `src/pages/` — route entrypoints that pass data into design components.
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
