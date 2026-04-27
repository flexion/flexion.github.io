# Testing

Tests live in `tests/` and mirror the source layout. `bun test` runs everything.

## Layers

1. **Unit tests** for pure logic: catalog defaults, merge, overlay loader, standards evaluation, URL helpers, refresh snapshot-building.
2. **View behavior tests** that render each Hono JSX view against `tests/fixtures/catalog.ts` and assert on the DOM.
3. **Build smoke test** that runs the SSG end-to-end against a temp `outDir` and verifies every expected page exists.
4. **Enhancement tests** that exercise each HTML Web Component in a happy-dom environment.
5. **Accessibility scan** that runs axe-core against the rendered `dist/` pages.

## TDD discipline

Every new feature starts with a failing test. The implementation plan (`notes/plans/2026-04-27-flexion-labs-website.md`) lays out the red/green/refactor rhythm task by task. New work should follow the same rhythm.

## Fixtures

- `tests/fixtures/catalog.ts` — shared catalog used by most view tests. Expanding the fixture is welcome; view tests should not invent their own full catalogs.
- `tests/fixtures/overlays/` — on-disk markdown used by `loadOverlay` tests.

## Running a single suite

Use indented code blocks to avoid nested fences:

    bun test tests/catalog            # all catalog unit tests
    bun test tests/views/home.test.tsx
    bun run build && bun test tests/a11y
