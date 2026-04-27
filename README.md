# Flexion Labs

Source for [labs.flexion.us](https://labs.flexion.us/) — a public-facing site that showcases Flexion's open source portfolio, indexes our public repositories, and publishes our open source commitment.

## Layout

- `catalog/` — the inventory of our open source work (a generated snapshot plus hand-authored overrides).
- `content/` — the words we publish, as markdown.
- `standards/` — the stewardship rules the health report evaluates.
- `views/` — the pages visitors see, rendered at build time.
- `styles/` — hand-rolled CSS with cascade layers and design tokens.
- `enhancements/` — HTML Web Components that decorate rendered HTML.
- `build/` — the Bun + Hono build driver.
- `docs/` — durable behavioral documentation for contributors and agents.
- `notes/` — ephemeral planning and specs.

## Getting started

```bash
bun install
bun run build      # writes static site to dist/
bun test           # runs the full test suite
```

See `docs/README.md` for the project orientation.
