# Styling

Hand-rolled CSS with cascade layers, design tokens, and container queries. No Sass, PostCSS, or utility frameworks.

## Layers

`styles/index.css` declares the layer order:

    @layer reset, tokens, base, layout, components, utilities;

Every rule belongs to one layer. Later layers override earlier ones with predictable precedence; specificity is rarely the tool you need.

## Tokens

Every Flexion brand color is defined in `styles/tokens.css` as a custom property — even colors the v1 design does not use. Semantic tokens (`--color-ink`, `--color-link`, `--color-focus-ring`, `--color-tier-*`, `--color-pass/warn/fail`) compose the palette into meaning. When adding a component, prefer semantic tokens over palette tokens.

## Components

Component CSS lives in `styles/components.css` under `@layer components`. Each component class is prefixed with its name (`.repo-card`, `.repo-card__summary`, etc.). BEM-style naming keeps specificity flat and collisions unlikely.

## Container queries

Components that reflow (catalog cards, featured strip, detail page columns) use `@container` queries rather than viewport queries so they adapt when embedded in a narrower parent.

## Accessibility

- Focus is visible on every interactive element (`:focus-visible` styled in `base.css`).
- Motion respects `prefers-reduced-motion`.
- Color pairings are AAA where feasible; AA minimum. When in doubt, check the Flexion palette PDF for approved combinations.

## Progressive enhancement

HTML Web Components in `enhancements/` decorate existing HTML. CSS uses the `:not(:defined)` pseudo-class to hide bits that only make sense when JS has registered the component (e.g. the copy button).
