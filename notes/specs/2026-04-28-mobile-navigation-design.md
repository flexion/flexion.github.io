# Mobile Navigation Design

## Problem

On iPhone-sized viewports (~375px), the site header's horizontal nav (Work, Commitment, About, GitHub) plus the "Flexion Labs" brand exceed the viewport width, causing:

1. Page width overflows the viewport on first load (requires zoom-out to fit).
2. Nav items overlap the brand text.
3. "Flexion Labs" wraps to two lines.

Root cause: the header is a flex row with `justify-content: space-between` and no collapse behavior. No media queries handle narrow viewports.

## Solution

A responsive hamburger menu using the HTML `popover` API at narrow viewports (below 36rem / 576px). Zero JavaScript required.

## Breakpoint

- **Below 36rem:** Hamburger button visible, nav links inside a popover card.
- **Above 36rem:** Current horizontal nav bar, unchanged.

This uses a `@media` query (not a container query) since the header width tracks the viewport, not a container.

## HTML Structure

```tsx
<header class="site-header">
  <a href="/" class="site-brand">
    <img src="/assets/flexion_tornado.svg" alt="" class="site-brand__logo" width="38" height="38" />
    <span>Flexion Labs</span>
  </a>
  <button
    class="mobile-nav-toggle"
    popovertarget="mobile-nav"
    aria-label="Menu"
  >
    {/* inline SVG: 3-line hamburger icon */}
  </button>
  <nav aria-label="Primary">
    <div id="mobile-nav" popover>
      <ul>
        <li><a href="/work/">Work</a></li>
        <li><a href="/commitment/">Commitment</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="https://github.com/flexion">GitHub</a></li>
      </ul>
    </div>
  </nav>
</header>
```

Key structural decisions:

- The `<button>` sits between the brand and `<nav>` in DOM order.
- The `<ul>` is wrapped in a `<div id="mobile-nav" popover>` inside the existing `<nav>`.
- At desktop, the popover wrapper uses `display: contents` so it's invisible to layout and the `<ul>` flows as a direct flex child.
- At mobile, the wrapper acts as the popover surface (card).

## CSS

All styles go in the `layout` layer, inside `layout.css`.

### Desktop (above 36rem)

```css
@media (min-width: 36rem) {
  .mobile-nav-toggle {
    display: none;
  }
}
```

**Popover at desktop:** The browser UA stylesheet applies `[popover]:not(:popover-open) { display: none }` in the UA origin. Author-origin styles always win over UA-origin for normal declarations, so we override it:

```css
@media (min-width: 36rem) {
  #mobile-nav {
    display: contents;
  }
}
```

This makes the popover wrapper invisible to layout at desktop — the `<ul>` flows as a direct flex child of the header nav.

### Mobile (below 36rem)

```css
@media (max-width: 36rem) {
  .mobile-nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: var(--space-2);
    cursor: pointer;
    color: var(--color-ink);
  }

  .site-header nav ul {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  #mobile-nav {
    position: absolute;
    inset-block-start: anchor(end, var(--space-4));
    inset-inline-end: var(--space-5);
    margin: 0;
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-surface-alt);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
  }
}
```

Note: The `popover` attribute handles showing/hiding. The CSS above styles its appearance when open. If anchor positioning isn't supported, the popover will use its default positioning (centered), so we include a fallback with `position: absolute` + `inset-block-start` / `inset-inline-end` relative to the header.

### Hamburger Icon

Inline SVG in the button, `1.5rem` square:

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <line x1="3" y1="6" x2="21" y2="6" />
  <line x1="3" y1="12" x2="21" y2="12" />
  <line x1="3" y1="18" x2="21" y2="18" />
</svg>
```

## Accessibility

- **Popover API** provides: focus management, Escape to dismiss, light-dismiss (click outside).
- **Button** has `aria-label="Menu"`. The popover API auto-manages `aria-expanded` on the invoking button.
- **Nav** retains `aria-label="Primary"`.
- **Focus order** is logical: brand → menu button → (when open) nav links.

## Visual Spec

| Property | Value |
|----------|-------|
| Popover background | `var(--color-surface)` (white) |
| Popover border | `1px solid var(--color-surface-alt)` |
| Popover radius | `var(--radius-md)` (0.5rem) |
| Popover shadow | `var(--shadow-card)` |
| Popover padding | `var(--space-4)` (1rem) |
| Link gap (stacked) | `var(--space-3)` (0.75rem) |
| Link font size | `var(--step-0)` (default) |
| Button size | `1.5rem` icon, `var(--space-2)` padding |
| Breakpoint | `36rem` (576px) |

## Files to Modify

1. `src/design/components/header/index.tsx` — add button + popover wrapper
2. `src/design/layout.css` — add media queries for mobile/desktop behavior
3. `src/design/components/header/styles.css` — hamburger button styles (optional, could go in layout.css)

## Out of Scope

- Animation/transitions on popover open/close (can add later).
- Changing nav items or adding sub-menus.
- Dark mode considerations (tokens already handle this if added later).
