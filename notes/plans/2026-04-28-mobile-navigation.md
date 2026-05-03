# Mobile Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive hamburger menu that collapses the navigation into a popover card below 36rem viewport width, fixing mobile overflow.

**Architecture:** HTML `popover` API for zero-JS toggle. Single `<nav>` with a popover wrapper `<div>` that becomes `display: contents` at desktop. Media query at 36rem breakpoint controls visibility of button vs inline nav.

**Tech Stack:** Hono JSX (TSX), CSS (layers, custom properties, logical properties), HTML popover API.

---

### Task 1: Update Header Component HTML

**Files:**
- Modify: `src/design/components/header/index.tsx`

- [ ] **Step 1: Add hamburger button and popover wrapper to header**

Replace the entire content of `src/design/components/header/index.tsx` with:

```tsx
import { Link } from '../link'
import { url } from '../../../build/config'
import type { SiteConfig } from '../../../build/config'

export function Header({ config }: { config: SiteConfig }) {
  return (
    <header class="site-header">
      <a href={url('/', config.basePath)} class="site-brand">
        <img
          src={url('/assets/flexion_tornado.svg', config.basePath)}
          alt=""
          class="site-brand__logo"
          width="38"
          height="38"
        />
        <span>Flexion Labs</span>
      </a>
      <button
        class="mobile-nav-toggle"
        popovertarget="mobile-nav"
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <nav aria-label="Primary">
        <div id="mobile-nav" popover>
          <ul>
            <li>
              <a href={url('/work/', config.basePath)}>Work</a>
            </li>
            <li>
              <a href={url('/commitment/', config.basePath)}>Commitment</a>
            </li>
            <li>
              <a href={url('/about/', config.basePath)}>About</a>
            </li>
            <li>
              <Link href="https://github.com/flexion" external>
                GitHub
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Run tests to verify no build breakage**

Run: `bun test --filter smoke`
Expected: PASS — the build still produces valid HTML pages.

- [ ] **Step 3: Commit**

```bash
git add src/design/components/header/index.tsx
git commit -m "feat(header): add hamburger button and popover wrapper for mobile nav"
```

---

### Task 2: Add Mobile/Desktop Media Queries to Layout CSS

**Files:**
- Modify: `src/design/layout.css`

- [ ] **Step 1: Add responsive nav rules to layout.css**

At the end of the `@layer layout { ... }` block (before the closing `}`), add:

```css
  /* ---- Responsive navigation ---- */
  @media (min-width: 36rem) {
    .mobile-nav-toggle {
      display: none;
    }
    #mobile-nav {
      display: contents;
    }
  }
  @media (max-width: 36rem) {
    .site-header nav ul {
      flex-direction: column;
      gap: var(--space-3);
    }
    #mobile-nav {
      position: absolute;
      inset-block-start: 100%;
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

Note: The `position: absolute` on `#mobile-nav` positions the popover card relative to the header. The `.site-header` needs `position: relative` added so the popover anchors correctly.

- [ ] **Step 2: Add position relative to .site-header**

In `layout.css`, inside the existing `.site-header` rule block, add `position: relative;`:

Change:
```css
  .site-header {
    inline-size: var(--measure-wide);
    margin-inline: auto;
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
    border-block-end: 1px solid var(--color-surface-alt);
  }
```

To:
```css
  .site-header {
    position: relative;
    inline-size: var(--measure-wide);
    margin-inline: auto;
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
    border-block-end: 1px solid var(--color-surface-alt);
  }
```

- [ ] **Step 3: Run tests**

Run: `bun test --filter smoke`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/design/layout.css
git commit -m "feat(layout): add responsive nav media queries at 36rem breakpoint"
```

---

### Task 3: Style the Hamburger Button

**Files:**
- Modify: `src/design/components/header/styles.css`

- [ ] **Step 1: Add mobile-nav-toggle styles**

Append to `src/design/components/header/styles.css`:

```css
.mobile-nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--color-ink);
  border-radius: var(--radius-sm);
}
.mobile-nav-toggle:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

Note: The `display: none` at desktop is handled by the media query in `layout.css`. These styles define appearance when visible.

- [ ] **Step 2: Run tests**

Run: `bun test --filter smoke`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/design/components/header/styles.css
git commit -m "feat(header): style hamburger menu toggle button"
```

---

### Task 4: Visual Verification

**Files:** None (testing only)

- [ ] **Step 1: Build the site**

Run: `bun run build`

- [ ] **Step 2: Serve and verify in browser**

Run: `bunx serve dist` (or equivalent static server)

Verify at mobile width (375px in DevTools):
1. Hamburger button appears, nav links are hidden.
2. Tapping hamburger opens popover card with stacked links.
3. Pressing Escape or clicking outside closes the popover.
4. "Flexion Labs" brand stays on one line.
5. Page does not overflow the viewport horizontally.

Verify at desktop width (>576px):
1. Hamburger button is hidden.
2. Nav links display horizontally as before.
3. No visual regression from the popover wrapper.

- [ ] **Step 3: Run full test suite**

Run: `bun test`
Expected: 67 pass (the a11y test may still fail due to needing a fresh build — that's pre-existing).

- [ ] **Step 4: Commit any fixes if needed, then final commit**

If all looks good:
```bash
git log --oneline worktree-mobile-menu ^main
```

Expected: 3 commits (header HTML, layout CSS, button styles).
