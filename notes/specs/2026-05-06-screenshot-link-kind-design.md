# Screenshot Link Kind for Featured Labs

Add a `screenshot` link kind to featured labs that opens a modal dialog
with product screenshots instead of navigating to an external URL.

## Motivation

Flexion Messaging doesn't have a public demo URL. Two screenshots of the
product interface (Organization Dashboard and Get Started guide) should be
viewable directly from the lab card via a modal popup.

## Data model

### New frontmatter shape

Screenshot links carry `images[]` instead of `url`:

```yaml
links:
  - label: Flexion Messaging
    kind: screenshot
    images:
      - src: /assets/images/messaging-dashboard.png
        alt: Organization Dashboard showing message allowance and services overview
      - src: /assets/images/messaging-get-started.png
        alt: Get started guide with steps for using Flexion Messaging
```

### Updated types (`src/build/featured.ts`)

```typescript
type FeaturedLinkKind = 'demo' | 'repo' | 'case-study' | 'screenshot'

type FeaturedUrlLink = {
  label: string
  url: string
  kind: 'demo' | 'repo' | 'case-study'
}

type ScreenshotImage = { src: string; alt: string }

type FeaturedScreenshotLink = {
  label: string
  kind: 'screenshot'
  images: ScreenshotImage[]
}

type FeaturedLink = FeaturedUrlLink | FeaturedScreenshotLink
```

Parsing in `parseLinks` validates: if `kind === 'screenshot'`, require
`images` array with `src` and `alt` strings; otherwise require `url` string.

## Column ordering

`KIND_ORDER`: `['demo', 'screenshot', 'repo', 'case-study']`

Column heading: **"Screenshots"**

## Icon

An image/picture icon (frame with mountain and sun) to distinguish from
the globe (demo) and GitHub mark (repo).

## LabCard rendering changes

- For url-based links: render as `<a>` (no change).
- For screenshot links: render as `<button data-open-dialog="dialog-id">`.
- Each screenshot link gets a `<dialog id="dialog-id">` rendered in the
  card, containing all images stacked vertically with a close button.
- Dialog ID derived from lab title slug and link index.

## Dialog behavior

Uses native `<dialog>` element with `showModal()`:

- Escape key closes (built-in).
- Focus trapping (built-in).
- Focus returns to trigger button on close (built-in).
- Clicking backdrop closes (detected via click on `<dialog>` element itself).
- Close button (X) in top-right corner.

### JavaScript

Inline `<script>` at end of page:

- `[data-open-dialog]` click handler calls
  `document.getElementById(target).showModal()`.
- `[data-close-dialog]` click handler calls `.close()`.
- Backdrop click: if `event.target === dialog`, call `.close()`.

## Styles (`src/design/components/lab-card/styles.css`)

- `dialog::backdrop`: semi-transparent dark overlay.
- Dialog: `max-width: 900px`, centered, padding, border-radius.
- Images: `max-width: 100%`, border-radius, subtle box-shadow.
- Close button: positioned absolute top-right of dialog.
- Images stack vertically with gap between them.

## Static assets

Copy the two PNGs to `src/design/assets/images/`:
- `messaging-dashboard.png`
- `messaging-get-started.png`

These get copied to the output by the existing `copyTree` in `entry.tsx`.

## Files to change

1. **`src/build/featured.ts`** — update types, add `screenshot` to
   `LINK_KINDS`, parse `images` for screenshot links.
2. **`src/design/components/lab-card/index.tsx`** — add `screenshot` to
   `KIND_ORDER`/`KIND_HEADING`, render `<button>` + `<dialog>` for
   screenshot links, add `ScreenshotIcon` component.
3. **`src/design/components/lab-card/styles.css`** — dialog, backdrop,
   image, and close button styles.
4. **`content/featured/messaging-lab.md`** — add screenshot link with
   image references.
5. **`src/design/assets/images/`** — add the two messaging PNGs.
6. **`src/pages/home.tsx`** (or layout) — add inline `<script>` for
   dialog open/close behavior.
