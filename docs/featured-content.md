# Featured content: design and requirements

This document thinks through how to present Flexion's featured projects — Forms, Messaging (Notify), Document Extractor, and Forms Lab — within the existing site structure.

## Goals

1. **Signal intentionality.** Visitors should immediately understand that these four repos represent Flexion's deliberate, invested product work — not just code that happens to be public.
2. **Stay part of the collection.** Featured projects are *members* of the broader catalog, not a separate silo. They should feel like the "front shelf" of the same library.
3. **Invite exploration.** A visitor drawn in by a featured project should naturally discover the rest of the work index, and vice versa.
4. **Scale gracefully.** The design should work today with 4 featured projects and still work with 6–8 later, without requiring a layout overhaul.

## Current state

- The home page has a "Featured labs" section with a 3-column grid, but no repos are marked `featured: true` in `overrides.yml` yet — so it renders empty.
- The work index already sorts featured repos first.
- `document-extractor` exists in `repos.json`. The others are in various stages of going public:
  - `forms-lab` — now public (will appear in next refresh)
  - `forms` — public access requested, pending
  - `flexion-notify` — will be made public soon
- Rich content overlays exist for `forms`, `messaging`, and `document-extractor` in `content/work/`.
- **Naming mismatch:** The Notify repo is `flexion-notify` on GitHub, but the overlay is `content/work/messaging.md`. It needs to be renamed to `content/work/flexion-notify.md` for the merge logic to attach it.

## Data model gap

The merge logic (`src/catalog/merge.ts`) only produces entries for repos present in `repos.json`. Overlay content for repos not yet in the snapshot is orphaned until they appear.

### Resolution: Approach A (wait for public repos)

All four repos are going public:

| Repo | Status | Action needed |
|------|--------|---------------|
| `document-extractor` | Already in snapshot | None |
| `forms-lab` | Now public | Next daily refresh (or manual dispatch) picks it up |
| `forms` | Public access requested | Wait for approval, then refresh picks it up |
| `flexion-notify` | Will be made public soon | Wait, then refresh picks it up |

No code changes needed for the data pipeline. Once a repo is public, the 09:00 UTC refresh workflow adds it to `repos.json` automatically.

### Content file rename needed

The overlay at `content/work/messaging.md` must be renamed to `content/work/flexion-notify.md` to match the actual GitHub repo name. The merge logic joins on filename slug → repo name.

---

## Layout and presentation

### Home page: featured section

The current `home-featured__grid` (3-column at 48rem+) is appropriate for 3–4 cards. But the standard `RepoCard` — name, one-line summary, tier/category badges — is designed for browsing, not for *selling* a product. Featured projects deserve more presence.

#### Option 1: Enhanced card (recommended)

Keep the grid layout but introduce a `FeaturedCard` variant that provides:

- **Title** (from overlay, e.g. "Forms" not "forms")
- **Tagline/summary** (the overlay's `summary` field, already written to be compelling)
- **2–3 bullet "value props"** — a new optional field in the overlay front-matter, e.g. `highlights: [...]`
- **CTA link** to the detail page

Why: The featured section lives on the home page, which is a marketing surface. The current RepoCard is neutral/informational; a featured card should persuade.

#### Option 2: Hero spotlight + carousel

One project dominates above the fold; others are secondary. More dramatic, but:
- Introduces ordering politics (which one is "first"?)
- Doesn't scale to 6+ without pagination
- Adds JS complexity for carousel behavior

#### Option 3: Keep current RepoCard, just mark them featured

Simplest change (just set `featured: true`), but doesn't visually distinguish featured work from the catalog list below. Misses the goal of signaling intentionality.

**Recommendation:** Option 1 — an enhanced card in the existing grid. It's the minimum change that achieves the "front shelf" feeling without adding interaction complexity.

### Work index: integration between featured and full catalog

The work index currently sorts featured repos to the top, which is good. But there's no visual break between them and the rest. Options:

#### A. Visual separator with section heading (recommended)

Add a lightweight heading ("Featured" or "Highlighted work") above the featured cluster, with a subtle divider before the rest. Featured repos still live *in* the list (same filter/sort controls apply), but they're visually grouped.

- Preserves "part of the same collection" feeling
- Featured repos still respond to tier/category filters (if a user filters to "Tool" and a featured repo is a Tool, it stays; if not, it correctly disappears)
- Low implementation cost

#### B. Separate "pinned" section outside the filter

Featured repos get a fixed section above the filterable list, unaffected by filters.

- Guarantees visibility regardless of filter state
- But breaks the "same collection" mental model — they become a separate thing

#### C. Visual emphasis only (border/background)

Featured repos get a subtle highlight (accent border, background tint) but stay in normal sort flow with no heading.

- Lightest touch
- May be too subtle; visitors won't understand *why* some cards look different

**Recommendation:** Option A — section heading within the list. Featured repos are still part of the filterable collection, but the heading signals "start here." If filtered out by tier/category, the heading hides too, which is correct behavior.

### Detail pages: connecting back

Each featured repo already gets a full detail page from the existing `WorkDetail` template. No structural change needed there. But consider:

- **Cross-linking between featured projects.** If Forms and Forms Lab are related, a "Related projects" section at the bottom of each detail page would help visitors discover the family. This can be driven by a `related: [forms-lab]` field in the overlay front-matter.
- **"Back to featured" breadcrumb vs. "Back to all work."** Since featured repos are *part of* the catalog, the breadcrumb should go to `/work/` (the full index), not to a separate featured page. This reinforces the "same collection" principle.

---

## Content requirements per featured project

Each featured overlay should communicate:

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Human-friendly name | "Forms" |
| `summary` | One-sentence value prop (used on cards) | "Accessible, USWDS-aligned form experiences..." |
| `highlights` (new) | 2–3 bullet differentiators for the featured card | ["WCAG 2.1 AA conformant", "Multi-step with save-and-resume", "Agency-agnostic"] |
| Body `## What it solves` | Problem framing | (already written for 3 of 4) |
| Body `## Who it's for` | Audience | (already written for 3 of 4) |
| Body `## Status` | Maturity signal | (already written for 3 of 4) |
| Body `## Get started` | Entry point for developers | (already written for 3 of 4) |

**Forms Lab** still needs its overlay (`content/work/forms-lab.md`).

---

## What "Forms Lab" is relative to "Forms"

This needs clarification for content purposes:

- If Forms Lab is an **experimental playground** (try components, submit designs), it should be positioned as a companion/sandbox — "where agencies experiment before committing to Forms."
- If it's a **documentation/demo site**, it's more of a resource than a product — maybe not "featured" on its own but linked from the Forms detail page.
- If it's a **separate product** (different use case, different audience), it deserves its own full overlay with distinct positioning.

The layout accommodates any of these — the question is purely content/positioning.

---

## Navigation and discovery flow

```
Home page
├── Featured labs (4 enhanced cards) ──→ /work/{name}/ (detail)
├── "Explore our work" CTA ──────────→ /work/ (full index)
└── Stats section (public projects count, etc.)

Work index (/work/)
├── [Featured heading]
│   ├── Featured repo card ──────────→ /work/{name}/
│   ├── Featured repo card ──────────→ /work/{name}/
│   └── ...
├── [All work heading]
│   ├── Repo card ───────────────────→ /work/{name}/
│   └── ...
└── Filter controls (tier, category)

Detail page (/work/{name}/)
├── Full content (overlay body)
├── Stewardship sidebar
├── "View on GitHub" link
└── Related projects (optional, future)
```

This means:
- Home → featured detail: 1 click
- Home → full catalog: 1 click
- Featured detail → full catalog: 1 click (breadcrumb / header nav)
- Full catalog → featured detail: 0 extra clicks (they're in the list)

No dead ends. Featured content is always reachable from the catalog, and the catalog is always reachable from featured content.

---

## Implementation sequence

1. **Rename:** `content/work/messaging.md` → `content/work/flexion-notify.md` (update title/summary to reflect repo name if needed).
2. **Content:** Write `content/work/forms-lab.md`. Add `highlights` field to all four overlays.
3. **Overrides:** Mark all four repos as `featured: true`, `tier: active`, `category: product` in `overrides.yml`.
4. **Refresh:** Trigger manual catalog refresh (or wait for daily run) once repos are public, to populate `repos.json`.
5. **Component:** Build `FeaturedCard` component (or extend `RepoCard` with a `variant` prop).
6. **Home page:** Wire `FeaturedCard` into the existing `home-featured__grid`.
7. **Work index:** Add section heading logic for featured cluster.
8. **Stretch:** Add `related` field support and render cross-links on detail pages.

---

## Open questions

1. ~~Are the repos going to be public?~~ **Resolved** — yes, all going public. Approach A confirmed.
2. What is Forms Lab's relationship to Forms — companion sandbox, docs site, or independent product?
3. Should the featured section on the home page have its own heading/intro copy, or just the grid?
4. Do we want a cap on featured projects (e.g., max 6) to protect the home page layout?
5. For the `highlights` field — should these be auto-derived from the overlay body, or always hand-authored?
