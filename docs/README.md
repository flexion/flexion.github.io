# Flexion Labs — project docs

This directory explains how the site behaves and how to work in it. It is written for humans and for agentic tools equally — both should be able to read a page here and reconstruct the intent of the code without opening the code.

## Structure

- **`views/`** — one file per page describing its behavior; maps to `src/web/pages/` and `tests/views/`.
- **`catalog.md`** — what the catalog is, how it's assembled, and how to change it.
- **`content.md`** — how to author prose: hero, commitment, about, per-repo overlays.
- **`stewardship.md`** — tier definitions and how the health checks are evaluated.
- **`deployment.md`** — branch previews, production, the gh-pages layout, and the CNAME.
- **`testing.md`** — the TDD strategy, where tests live, and how to run each suite.
- **`styling.md`** — design tokens, cascade layers, and component conventions.

## Working in this project

- Source code lives under `src/` with four top-level concerns: `build/` (SSG tooling), `catalog/` (domain logic + stewardship evaluation), `design/` (the design system — all stateless UI components, CSS, assets), and `pages/` (route entrypoints). Data and content stay at the repo root (`data/`, `content/`). Each design component has its own directory with `index.tsx`, `styles.css`, and `examples.tsx`.
- TDD is the norm. Pure logic (catalog, standards) is covered by unit tests; views have behavior tests against a shared fixture catalog; the build has a smoke test; a11y is scanned with axe-core.
- Commits are small and focused. Every task in the implementation plan ends with one.
